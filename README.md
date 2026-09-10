# Together Booth — Virtual Photobooth for Long-Distance Connection

Together Booth is a luxury, production-ready virtual photobooth designed for long-distance couples, friends, and squads to capture memories together in real-time.

## Features

- **Authentication**: Google OAuth and instant Guest mode with custom avatars.
- **WebRTC Shutter Synchronization**: Zero-latency peer-to-peer live camera sync with simultaneous multi-shot captures.
- **Room System**: Solo mode (1 user), Couple mode (2 users), Group mode (3–8 users) with unique 6-character room codes (`TOG-XXXX`).
- **8 Visual Film Shaders**: Natural, Vintage 1970, Polaroid SX-70, 35mm Cinema, Noir B&W, Golden Hour, Nordic Frost, Pastel Dream, and Cyber Y2K.
- **Photostrip Customization Studio**:
  - Classic 3-cut vertical strips, 4-cut vertical strips, 2x2 square grids, couple split frames, and polaroids.
  - Interactive draggable and scalable emoji stickers, doodles, retro stamps, and washi tape.
  - Custom typography and handwriting overlays.
  - Borders and luxury material themes (Polaroid White, Onyx Black, Sakura Blush, Cyber Chrome, Vintage Sepia).
- **Export Formats**:
  - High-DPI Lossless PNG.
  - High-DPI JPG.
  - Industry-standard 2x6" & 4x6" PDF Photo Strips ready for physical printing.
  - Direct QR code and Web Share API links.
- **Memories Cloud Vault**: Public community galleries, shared room albums, and private personal vaults.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Firebase Authentication, Firestore, and Storage
- WebRTC (Mesh topology)
- Framer Motion
- jsPDF & HTML5 Canvas Supersampling Engine
- Zustand

## Deployment

Deploy directly to Vercel:

1. Push this repository to GitHub.
2. Import the repository into your Vercel dashboard.
3. Configure the Firebase environment variables in your Vercel Project Settings:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
