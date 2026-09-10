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
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
  iceCandidatePoolSize: 10,
};

export class WebRTCMeshManager {
  private localStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private dataChannels: Map<string, RTCDataChannel> = new Map();
  private pendingCandidates: Map<string, RTCIceCandidateInit[]> = new Map();
  private localPeerId: string;
  private isDestroyed = false;

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
      try {
        const senders = pc.getSenders();
        stream.getTracks().forEach((track) => {
          const sender = senders.find((s) => s.track?.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track);
          } else {
            pc.addTrack(track, stream);
          }
        });

        if (senders.length === 0 && this.localPeerId < peerId) {
          this.renegotiate(peerId, pc);
        }
      } catch {}
    }
  }

  private async renegotiate(remotePeerId: string, pc: RTCPeerConnection): Promise<void> {
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      if (pc.localDescription) {
        this.sendSignalCallback({
          senderId: this.localPeerId,
          receiverId: remotePeerId,
          type: "offer",
          sdp: pc.localDescription.toJSON(),
          timestamp: Date.now(),
        });
      }
    } catch {}
  }

  ensureConnectionWithPeer(remotePeerId: string): void {
    if (this.isDestroyed || remotePeerId === this.localPeerId) return;

    if (!this.peerConnections.has(remotePeerId)) {
      const isInitiator = this.localPeerId < remotePeerId;
      this.createPeerConnection(remotePeerId, isInitiator);
    }
  }

  createPeerConnection(remotePeerId: string, isInitiator: boolean): RTCPeerConnection {
    const existing = this.peerConnections.get(remotePeerId);
    if (existing && existing.connectionState !== "failed" && existing.connectionState !== "closed") {
      return existing;
    }

    if (existing) {
      existing.close();
      this.peerConnections.delete(remotePeerId);
    }

    const pc = new RTCPeerConnection(RTC_CONFIG);
    this.peerConnections.set(remotePeerId, pc);

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        try {
          pc.addTrack(track, this.localStream!);
        } catch {}
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
      } else if (event.track) {
        const inboundStream = new MediaStream([event.track]);
        this.onRemoteStreamCallback?.(remotePeerId, inboundStream);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        this.onRemoteStreamRemovedCallback?.(remotePeerId);
      }
    };

    if (isInitiator) {
      try {
        const dc = pc.createDataChannel("photobooth_channel");
        this.setupDataChannel(remotePeerId, dc);
      } catch {}

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
    if (this.isDestroyed) return;
    if (signal.receiverId !== this.localPeerId && signal.receiverId !== "all") return;
    if (signal.senderId === this.localPeerId) return;

    const { senderId, type, sdp, candidate } = signal;

    if (type === "offer" && sdp) {
      const pc = this.createPeerConnection(senderId, false);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        
        const queued = this.pendingCandidates.get(senderId) || [];
        for (const c of queued) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(c));
          } catch {}
        }
        this.pendingCandidates.delete(senderId);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        if (pc.localDescription) {
          this.sendSignalCallback({
            senderId: this.localPeerId,
            receiverId: senderId,
            type: "answer",
            sdp: pc.localDescription.toJSON(),
            timestamp: Date.now(),
          });
        }
      } catch {}
    } else if (type === "answer" && sdp) {
      const pc = this.peerConnections.get(senderId);
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          const queued = this.pendingCandidates.get(senderId) || [];
          for (const c of queued) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(c));
            } catch {}
          }
          this.pendingCandidates.delete(senderId);
        } catch {}
      }
    } else if (type === "candidate" && candidate) {
      const pc = this.peerConnections.get(senderId);
      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch {}
      } else {
        const queued = this.pendingCandidates.get(senderId) || [];
        queued.push(candidate);
        this.pendingCandidates.set(senderId, queued);
      }
    } else if (type === "leave") {
      this.removePeer(senderId);
    }
  }

  broadcastData(data: unknown): void {
    const payload = JSON.stringify(data);
    for (const dc of this.dataChannels.values()) {
      try {
        if (dc.readyState === "open") {
          dc.send(payload);
        }
      } catch {}
    }
  }

  removePeer(remotePeerId: string): void {
    const pc = this.peerConnections.get(remotePeerId);
    if (pc) {
      try {
        pc.close();
      } catch {}
      this.peerConnections.delete(remotePeerId);
    }
    const dc = this.dataChannels.get(remotePeerId);
    if (dc) {
      try {
        dc.close();
      } catch {}
      this.dataChannels.delete(remotePeerId);
    }
    this.pendingCandidates.delete(remotePeerId);
    this.onRemoteStreamRemovedCallback?.(remotePeerId);
  }

  destroy(): void {
    this.isDestroyed = true;
    for (const remotePeerId of Array.from(this.peerConnections.keys())) {
      this.removePeer(remotePeerId);
    }
    this.peerConnections.clear();
    this.dataChannels.clear();
    this.pendingCandidates.clear();
  }
}
