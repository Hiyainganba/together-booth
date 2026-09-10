import { SignalMessage } from "@/types/webrtc";

export const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
    { urls: "stun:stun.services.mozilla.com" },
  ],
  iceCandidatePoolSize: 10,
};

export class WebRTCMeshManager {
  private localStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private dataChannels: Map<string, RTCDataChannel> = new Map();
  private localPeerId: string;
  private onRemoteStreamCallback?: (peerId: string, stream: MediaStream) => void;
  private onRemoteStreamRemovedCallback?: (peerId: string) => void;
  private onDataMessageCallback?: (peerId: string, data: unknown) => void;
  private sendSignalCallback: (signal: SignalMessage) => void;

  constructor(
    localPeerId: string,
    sendSignal: (signal: SignalMessage) => void,
    onRemoteStream?: (peerId: string, stream: MediaStream) => void,
    onRemoteStreamRemoved?: (peerId: string) => void,
    onDataMessage?: (peerId: string, data: unknown) => void
  ) {
    this.localPeerId = localPeerId;
    this.sendSignalCallback = sendSignal;
    this.onRemoteStreamCallback = onRemoteStream;
    this.onRemoteStreamRemovedCallback = onRemoteStreamRemoved;
    this.onDataMessageCallback = onDataMessage;
  }

  setLocalStream(stream: MediaStream): void {
    this.localStream = stream;
    for (const [peerId, pc] of this.peerConnections.entries()) {
      const senders = pc.getSenders();
      stream.getTracks().forEach((track) => {
        const sender = senders.find((s) => s.track?.kind === track.kind);
        if (sender) {
          sender.replaceTrack(track);
        } else {
          pc.addTrack(track, stream);
        }
      });
    }
  }

  createPeerConnection(remotePeerId: string, isInitiator: boolean): RTCPeerConnection {
    if (this.peerConnections.has(remotePeerId)) {
      return this.peerConnections.get(remotePeerId)!;
    }

    const pc = new RTCPeerConnection(RTC_CONFIG);
    this.peerConnections.set(remotePeerId, pc);

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalCallback({
          senderId: this.localPeerId,
          receiverId: remotePeerId,
          type: "candidate",
          candidate: event.candidate.toJSON(),
          timestamp: Date.now(),
        });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.onRemoteStreamCallback?.(remotePeerId, event.streams[0]);
      }
    };

    pc.onconnectionstatechange = () => {
      if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed" ||
        pc.connectionState === "closed"
      ) {
        this.removePeer(remotePeerId);
      }
    };

    if (isInitiator) {
      const dc = pc.createDataChannel("photobooth-sync");
      this.setupDataChannel(remotePeerId, dc);

      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          if (pc.localDescription) {
            this.sendSignalCallback({
              senderId: this.localPeerId,
              receiverId: remotePeerId,
              type: "offer",
              sdp: pc.localDescription.toJSON(),
              timestamp: Date.now(),
            });
          }
        })
        .catch(() => {});
    } else {
      pc.ondatachannel = (event) => {
        this.setupDataChannel(remotePeerId, event.channel);
      };
    }

    return pc;
  }

  private setupDataChannel(remotePeerId: string, dc: RTCDataChannel): void {
    this.dataChannels.set(remotePeerId, dc);
    dc.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        this.onDataMessageCallback?.(remotePeerId, parsed);
      } catch {
        this.onDataMessageCallback?.(remotePeerId, event.data);
      }
    };
    dc.onclose = () => {
      this.dataChannels.delete(remotePeerId);
    };
  }

  async handleSignal(signal: SignalMessage): Promise<void> {
    if (signal.receiverId !== this.localPeerId) return;

    const { senderId, type, sdp, candidate } = signal;

    if (type === "offer" && sdp) {
      const pc = this.createPeerConnection(senderId, false);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      this.sendSignalCallback({
        senderId: this.localPeerId,
        receiverId: senderId,
        type: "answer",
        sdp: pc.localDescription?.toJSON(),
        timestamp: Date.now(),
      });
    } else if (type === "answer" && sdp) {
      const pc = this.peerConnections.get(senderId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      }
    } else if (type === "candidate" && candidate) {
      const pc = this.peerConnections.get(senderId);
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch {}
      }
    } else if (type === "leave") {
      this.removePeer(senderId);
    }
  }

  broadcastData(data: unknown): void {
    const payload = JSON.stringify(data);
    for (const dc of this.dataChannels.values()) {
      if (dc.readyState === "open") {
        dc.send(payload);
      }
    }
  }

  removePeer(remotePeerId: string): void {
    const pc = this.peerConnections.get(remotePeerId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(remotePeerId);
    }
    const dc = this.dataChannels.get(remotePeerId);
    if (dc) {
      dc.close();
      this.dataChannels.delete(remotePeerId);
    }
    this.onRemoteStreamRemovedCallback?.(remotePeerId);
  }

  destroy(): void {
    for (const remotePeerId of Array.from(this.peerConnections.keys())) {
      this.removePeer(remotePeerId);
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
  }
}
