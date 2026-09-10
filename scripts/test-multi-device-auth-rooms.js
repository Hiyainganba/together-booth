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

  console.log("1. Device A (Laptop) -> Registering User 1: Sophia (Email + Phone)...");
  const sophiaUid = "usr_laptop_" + Date.now();
  const regRes1 = await request("/api/auth", "POST", {
    action: "register",
    user: {
      uid: sophiaUid,
      displayName: "Sophia Clark",
      email: "sophia.laptop@example.com",
      phoneNumber: "+15551112222",
      password: "Password123",
      photoURL: "https://api.dicebear.com/7.x/bottts/svg?seed=Sophia",
      bio: "Hosting from laptop 💻",
      isAnonymous: false,
      createdAt: Date.now(),
    },
  });
  assert(regRes1.status === 200, "Registration on Device A failed: " + JSON.stringify(regRes1.data));
  console.log("✓ User 1 registered on server:", regRes1.data.user.displayName);

  console.log("2. Device A (Laptop) -> Creating Room TOG-LAP-01...");
  const roomRes = await request("/api/rooms", "POST", {
    room: {
      id: "TOG-LAP-01",
      code: "TOG-LAP-01",
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

  console.log("3. Device B (Phone) -> Registering User 2: Liam (Mobile Phone OTP)...");
  const liamUid = "usr_phone_" + Date.now();
  const regRes2 = await request("/api/auth", "POST", {
    action: "register",
    user: {
      uid: liamUid,
      displayName: "Liam Vance",
      phoneNumber: "+15553334444",
      photoURL: "https://api.dicebear.com/7.x/bottts/svg?seed=Liam",
      bio: "Joining from mobile phone 📱",
      isAnonymous: false,
      createdAt: Date.now(),
    },
  });
  assert(regRes2.status === 200, "Registration on Device B failed");
  console.log("✓ User 2 registered on server:", regRes2.data.user.displayName);

  console.log("4. Device B (Phone) -> Fetching Room TOG-LAP-01 by Code...");
  const getRoomRes = await request("/api/rooms?code=TOG-LAP-01");
  assert(getRoomRes.status === 200, "Device B failed to discover room by code");
  assert(getRoomRes.data.room.name === "Couple Memory Booth");
  console.log("✓ Device B discovered room by code:", getRoomRes.data.room.name);

  console.log("5. Device B (Phone) -> Joining Room TOG-LAP-01...");
  const joinRes = await request("/api/rooms/TOG-LAP-01/join", "POST", {
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
    email: "sophia.laptop@example.com",
    password: "Password123",
  });
  assert(loginRes.status === 200, "Cross-device login failed");
  assert(loginRes.data.user.uid === sophiaUid);
  assert(loginRes.data.user.displayName === "Sophia Clark");
  console.log("✓ Real-time cross-device login verified: Sophia logged into Device B successfully!");

  console.log("7. Device A -> Syncing countdown trigger...");
  const patchRes = await request("/api/rooms/TOG-LAP-01", "PATCH", {
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
