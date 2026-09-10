import Peer, { MediaConnection, DataConnection } from "peerjs";
import { RTC_CONFIG } from "./webrtc-mesh";

export interface PeerMessagePayload {
  type: string;
  value?: number | null;
  projectId?: string;
  senderId?: string;
  displayName?: string;
  [key: string]: unknown;
}

export class PeerJSManager {
  private peer: Peer | null = null;
  private localStream: MediaStream | null = null;
  private activeCall: MediaConnection | null = null;
  private activeConnection: DataConnection | null = null;
  private cleanRoomId: string;
  private localUid: string;
  private displayName: string;
  private isHost: boolean;
  private isDestroyed = false;
  private myPeerId: string = "";
  private partnerPeerId: string = "";
  private connectTimer: NodeJS.Timeout | null = null;

  private onRemoteStreamCallback?: (stream: MediaStream, partnerDisplayName?: string) => void;
  private onRemoteStreamRemovedCallback?: () => void;
  private onMessageCallback?: (senderId: string, data: PeerMessagePayload) => void;
  private onPartnerInfoCallback?: (uid: string, name: string) => void;

  constructor(
    roomId: string,
    localUid: string,
    displayName: string,
    isHost: boolean,
    onRemoteStream?: (stream: MediaStream, partnerDisplayName?: string) => void,
    onRemoteStreamRemoved?: () => void,
    onMessage?: (senderId: string, data: PeerMessagePayload) => void,
    onPartnerInfo?: (uid: string, name: string) => void
  ) {
    this.cleanRoomId = roomId.trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || "ROOM";
    this.localUid = localUid;
    this.displayName = displayName || "Photobooth User";
    this.isHost = isHost;

    this.onRemoteStreamCallback = onRemoteStream;
    this.onRemoteStreamRemovedCallback = onRemoteStreamRemoved;
    this.onMessageCallback = onMessage;
    this.onPartnerInfoCallback = onPartnerInfo;

    const preferredId = isHost ? `tb_${this.cleanRoomId}_1` : `tb_${this.cleanRoomId}_2`;
    this.initPeer(preferredId);
  }

  private initPeer(targetPeerId: string) {
    if (typeof window === "undefined" || this.isDestroyed) return;

    this.myPeerId = targetPeerId;
    this.partnerPeerId = targetPeerId.endsWith("_1")
      ? `tb_${this.cleanRoomId}_2`
      : `tb_${this.cleanRoomId}_1`;

    try {
      if (this.peer) {
        try {
          this.peer.destroy();
        } catch {}
        this.peer = null;
      }

      const peerInstance = new Peer(this.myPeerId, {
        config: RTC_CONFIG,
        debug: 1,
      });

      this.peer = peerInstance;

      peerInstance.on("open", () => {
        if (this.isDestroyed || this.peer !== peerInstance) return;
        this.startReconnectionLoop();
      });

      peerInstance.on("call", (call) => {
        this.handleIncomingCall(call);
      });

      peerInstance.on("connection", (conn) => {
        this.setupDataConnection(conn);
      });

      peerInstance.on("error", (err: unknown) => {
        const errType = (err as { type?: string })?.type;
        if (errType === "unavailable-id") {
          const alternateId = this.myPeerId.endsWith("_1")
            ? `tb_${this.cleanRoomId}_2`
            : `tb_${this.cleanRoomId}_1`;

          if (this.myPeerId !== alternateId) {
            setTimeout(() => {
              if (!this.isDestroyed) {
                this.initPeer(alternateId);
              }
            }, 300);
          }
        }
      });
    } catch {}
  }

  private startReconnectionLoop() {
    if (this.connectTimer) clearInterval(this.connectTimer);

    const checkAndConnect = () => {
      if (this.isDestroyed || !this.peer || this.peer.destroyed) return;

      if (!this.activeConnection || !this.activeConnection.open) {
        try {
          const conn = this.peer.connect(this.partnerPeerId, { reliable: true });
          if (conn) {
            this.setupDataConnection(conn);
          }
        } catch {}
      }

      if (this.localStream && (!this.activeCall || !this.activeCall.open)) {
        this.callPartner();
      }
    };

    checkAndConnect();
    this.connectTimer = setInterval(checkAndConnect, 2000);
  }

  callPartner() {
    if (!this.peer || this.peer.destroyed || !this.localStream || !this.partnerPeerId) return;
    if (this.activeCall && this.activeCall.open) return;

    try {
      const call = this.peer.call(this.partnerPeerId, this.localStream);
      if (call) {
        this.handleCallStream(call);
      }
    } catch {}
  }

  private handleIncomingCall(call: MediaConnection) {
    this.activeCall = call;

    if (this.localStream) {
      call.answer(this.localStream);
    } else {
      call.answer();
    }

    this.handleCallStream(call);
  }

  private handleCallStream(call: MediaConnection) {
    this.activeCall = call;

    call.on("stream", (remoteStream) => {
      this.onRemoteStreamCallback?.(remoteStream);
    });

    call.on("close", () => {
      if (this.activeCall === call) {
        this.activeCall = null;
        this.onRemoteStreamRemovedCallback?.();
      }
    });

    call.on("error", () => {
      if (this.activeCall === call) {
        this.activeCall = null;
        this.onRemoteStreamRemovedCallback?.();
      }
    });
  }

  private setupDataConnection(conn: DataConnection) {
    this.activeConnection = conn;

    conn.on("open", () => {
      conn.send({
        type: "peer_handshake",
        senderId: this.localUid,
        displayName: this.displayName,
      });

      if (this.localStream && (!this.activeCall || !this.activeCall.open)) {
        this.callPartner();
      }
    });

    conn.on("data", (rawData) => {
      if (typeof rawData === "object" && rawData !== null) {
        const data = rawData as PeerMessagePayload;

        if (data.type === "peer_handshake" && data.senderId) {
          const partnerName = data.displayName || "Partner 🧸";
          this.onPartnerInfoCallback?.(data.senderId, partnerName);

          conn.send({
            type: "peer_handshake_ack",
            senderId: this.localUid,
            displayName: this.displayName,
          });

          if (this.localStream && (!this.activeCall || !this.activeCall.open)) {
            this.callPartner();
          }
        } else if (data.type === "peer_handshake_ack" && data.senderId) {
          const partnerName = data.displayName || "Partner 🧸";
          this.onPartnerInfoCallback?.(data.senderId, partnerName);

          if (this.localStream && (!this.activeCall || !this.activeCall.open)) {
            this.callPartner();
          }
        }

        const senderUid = data.senderId || this.partnerPeerId;
        this.onMessageCallback?.(senderUid, data);
      }
    });

    conn.on("close", () => {
      if (this.activeConnection === conn) {
        this.activeConnection = null;
      }
    });

    conn.on("error", () => {
      if (this.activeConnection === conn) {
        this.activeConnection = null;
      }
    });
  }

  setLocalStream(stream: MediaStream): void {
    this.localStream = stream;

    if (this.activeCall && this.activeCall.peerConnection) {
      try {
        const senders = this.activeCall.peerConnection.getSenders();
        stream.getTracks().forEach((track) => {
          const sender = senders.find((s) => s.track?.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track);
          } else if (this.activeCall?.peerConnection) {
            this.activeCall.peerConnection.addTrack(track, stream);
          }
        });
      } catch {}
    } else {
      this.callPartner();
    }
  }

  broadcast(message: PeerMessagePayload): void {
    const enriched = {
      ...message,
      senderId: this.localUid,
    };

    if (this.activeConnection && this.activeConnection.open) {
      try {
        this.activeConnection.send(enriched);
      } catch {}
    }
  }

  destroy(): void {
    this.isDestroyed = true;
    if (this.connectTimer) {
      clearInterval(this.connectTimer);
      this.connectTimer = null;
    }

    if (this.activeCall) {
      try {
        this.activeCall.close();
      } catch {}
      this.activeCall = null;
    }

    if (this.activeConnection) {
      try {
        this.activeConnection.close();
      } catch {}
      this.activeConnection = null;
    }

    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {}
      this.peer = null;
    }
  }
}
