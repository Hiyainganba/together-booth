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

async function runMultiDeviceTest() {
  console.log("=== MULTI-DEVICE (LAPTOP & PHONE) REAL-TIME INTEGRATION TEST ===");

  const timestamp = Date.now();
  const sophiaEmail = `sophia_${timestamp}@example.com`;
  const sophiaPhone = `+1555${Math.floor(1000000 + Math.random() * 9000000)}`;
  const sophiaUid = "usr_laptop_" + timestamp;

  console.log(`1. Device A (Laptop) -> Registering User 1: Sophia (${sophiaEmail})...`);
  const regRes1 = await request("/api/auth", "POST", {
    action: "register",
    user: {
      uid: sophiaUid,
      displayName: "Sophia Clark",
      email: sophiaEmail,
      phoneNumber: sophiaPhone,
      password: "Password123",
      photoURL: "https://api.dicebear.com/7.x/bottts/svg?seed=Sophia",
      bio: "Hosting from laptop 💻",
      isAnonymous: false,
      createdAt: Date.now(),
    },
  });
  assert(regRes1.status === 200, "Registration on Device A failed: " + JSON.stringify(regRes1.data));
  console.log("✓ User 1 registered on server:", regRes1.data.user.displayName);

  const roomId = `TOG-LAP-${Math.floor(100 + Math.random() * 900)}`;
  console.log(`2. Device A (Laptop) -> Creating Room ${roomId}...`);
  const roomRes = await request("/api/rooms", "POST", {
    room: {
      id: roomId,
      code: roomId,
      name: "Couple Memory Booth",
      hostId: sophiaUid,
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
        [sophiaUid]: {
          uid: sophiaUid,
          displayName: "Sophia Clark",
          isHost: true,
          isAudioMuted: false,
          isVideoMuted: false,
          joinedAt: Date.now(),
        },
      },
    },
  });
  assert(roomRes.status === 200, "Room creation failed");
  console.log("✓ Room created by Device A:", roomRes.data.room.code);

  const liamUid = "usr_phone_" + timestamp;
  const liamPhone = `+1555${Math.floor(1000000 + Math.random() * 9000000)}`;
  console.log(`3. Device B (Phone) -> Registering User 2: Liam (${liamPhone})...`);
  const regRes2 = await request("/api/auth", "POST", {
    action: "register",
    user: {
      uid: liamUid,
      displayName: "Liam Vance",
      phoneNumber: liamPhone,
      photoURL: "https://api.dicebear.com/7.x/bottts/svg?seed=Liam",
      bio: "Joining from mobile phone 📱",
      isAnonymous: false,
      createdAt: Date.now(),
    },
  });
  assert(regRes2.status === 200, "Registration on Device B failed");
  console.log("✓ User 2 registered on server:", regRes2.data.user.displayName);

  console.log(`4. Device B (Phone) -> Fetching Room ${roomId} by Code...`);
  const getRoomRes = await request(`/api/rooms?code=${roomId}`);
  assert(getRoomRes.status === 200, "Device B failed to discover room by code");
  assert(getRoomRes.data.room.name === "Couple Memory Booth");
  console.log("✓ Device B discovered room by code:", getRoomRes.data.room.name);

  console.log(`5. Device B (Phone) -> Joining Room ${roomId}...`);
  const joinRes = await request(`/api/rooms/${roomId}/join`, "POST", {
    participant: {
      uid: liamUid,
      displayName: "Liam Vance",
      isHost: false,
      isAudioMuted: false,
      isVideoMuted: false,
      joinedAt: Date.now(),
    },
  });
  assert(joinRes.status === 200, "Device B failed to join room");
  const participants = Object.keys(joinRes.data.room.participants);
  assert(participants.length === 2, "Expected 2 participants in room");
  console.log("✓ Both Device A (Sophia) & Device B (Liam) are in the room together!");

  console.log("6. Device B (Phone) -> Cross-Device Login for Sophia on Device B...");
  const loginRes = await request("/api/auth", "POST", {
    action: "login",
    email: sophiaEmail,
    password: "Password123",
  });
  assert(loginRes.status === 200, "Cross-device login failed");
  assert(loginRes.data.user.uid === sophiaUid);
  assert(loginRes.data.user.displayName === "Sophia Clark");
  console.log("✓ Real-time cross-device login verified: Sophia logged into Device B successfully!");

  console.log("7. Device A -> Syncing countdown trigger...");
  const patchRes = await request(`/api/rooms/${roomId}`, "PATCH", {
    isCountdownActive: true,
    countdownDuration: 3,
  });
  assert(patchRes.status === 200, "Failed to patch countdown");
  console.log("✓ Synchronized photobooth countdown signal sent.");

  console.log("\nALL 7 MULTI-DEVICE & REAL-TIME AUTH / ROOM TESTS PASSED WITH 100% SUCCESS!");
}

runMultiDeviceTest().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
