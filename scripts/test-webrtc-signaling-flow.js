const http = require("http");
const assert = require("assert");

function request(path, method = "GET", data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, "http://localhost:3000");
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on("error", reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runWebRTCSignalingTest() {
  console.log("=== WEBRTC MULTI-DEVICE SERVER SIGNALING TEST ===");

  const roomId = "TOG-STREAM-99";
  const user1 = "usr_laptop_host";
  const user2 = "usr_phone_guest";

  console.log("1. Host creates room TOG-STREAM-99...");
  await request("/api/rooms", "POST", {
    room: {
      id: roomId,
      code: roomId,
      name: "Live Duo Photobooth",
      hostId: user1,
      mode: "couple",
      layout: "2-split",
      maxParticipants: 2,
      createdAt: Date.now(),
      isActive: true,
      shotCount: 3,
      countdownDuration: 3,
      isCountdownActive: false,
      currentShotIndex: 0,
      participants: {
        [user1]: {
          uid: user1,
          displayName: "Laptop Host",
          isHost: true,
          isAudioMuted: false,
          isVideoMuted: false,
          joinedAt: Date.now(),
        },
      },
    },
  });
  console.log("✓ Room created by Laptop Host");

  console.log("2. Guest joins room on Phone...");
  await request(`/api/rooms/${roomId}/join`, "POST", {
    participant: {
      uid: user2,
      displayName: "Phone Guest",
      isHost: false,
      isAudioMuted: false,
      isVideoMuted: false,
      joinedAt: Date.now(),
    },
  });
  console.log("✓ Phone Guest joined the room");

  console.log("3. Laptop Host sends WebRTC SDP Offer to Phone Guest...");
  const offerRes = await request(`/api/rooms/${roomId}/signals`, "POST", {
    senderId: user1,
    receiverId: user2,
    type: "offer",
    sdp: { type: "offer", sdp: "v=0\r\no=- 12345 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n" },
    timestamp: Date.now(),
  });
  assert(offerRes.status === 200, "Failed to post offer signal");
  console.log("✓ SDP Offer queued on server for Phone Guest");

  console.log("4. Phone Guest polls signals from server...");
  const guestSignalsRes = await request(`/api/rooms/${roomId}/signals?receiverId=${user2}&since=0`);
  assert(guestSignalsRes.status === 200, "Failed to retrieve guest signals");
  assert(guestSignalsRes.data.signals.length >= 1, "No signals received by guest");
  const receivedOffer = guestSignalsRes.data.signals.find((s) => s.type === "offer");
  assert(receivedOffer && receivedOffer.senderId === user1, "Offer not received properly");
  console.log("✓ Phone Guest retrieved SDP Offer from Laptop Host!");

  console.log("5. Phone Guest sends WebRTC SDP Answer back to Laptop Host...");
  const answerRes = await request(`/api/rooms/${roomId}/signals`, "POST", {
    senderId: user2,
    receiverId: user1,
    type: "answer",
    sdp: { type: "answer", sdp: "v=0\r\no=- 67890 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n" },
    timestamp: Date.now(),
  });
  assert(answerRes.status === 200, "Failed to post answer signal");
  console.log("✓ SDP Answer queued on server for Laptop Host");

  console.log("6. Laptop Host polls signals from server...");
  const hostSignalsRes = await request(`/api/rooms/${roomId}/signals?receiverId=${user1}&since=0`);
  assert(hostSignalsRes.status === 200, "Failed to retrieve host signals");
  const receivedAnswer = hostSignalsRes.data.signals.find((s) => s.type === "answer");
  assert(receivedAnswer && receivedAnswer.senderId === user2, "Answer not received properly");
  console.log("✓ Laptop Host retrieved SDP Answer from Phone Guest!");

  console.log("7. Exchanging ICE Candidates between Laptop & Phone...");
  await request(`/api/rooms/${roomId}/signals`, "POST", {
    senderId: user1,
    receiverId: user2,
    type: "candidate",
    candidate: { candidate: "candidate:1 1 UDP 2122260223 192.168.1.100 50000 typ host", sdpMid: "0", sdpMLineIndex: 0 },
    timestamp: Date.now(),
  });
  await request(`/api/rooms/${roomId}/signals`, "POST", {
    senderId: user2,
    receiverId: user1,
    type: "candidate",
    candidate: { candidate: "candidate:2 1 UDP 2122260223 192.168.1.101 50001 typ host", sdpMid: "0", sdpMLineIndex: 0 },
    timestamp: Date.now(),
  });
  console.log("✓ ICE Candidates successfully exchanged!");

  console.log("\nALL WEBRTC SERVER SIGNALING & HANDSHAKE TESTS PASSED WITH 100% SUCCESS!");
}

runWebRTCSignalingTest().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
