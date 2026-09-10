import Peer, { MediaConnection, DataConnection } from "peerjs";
import { RTC_CONFIG } from "./webrtc-mesh";
import { Room, LayoutMode } from "@/types/room";
import { FilterType } from "@/types/filter";

export interface PeerMessagePayload {
  type: string;
  value?: number | null;
  filter?: FilterType;
  background?: string;
  customUrl?: string;
  layout?: LayoutMode;
  room?: Room;
  senderId?: string;
  displayName?: string;
  peerId?: string;
  peers?: string[];
  [key: string]: unknown;
}

export class PeerJSManager {
  private peer: Peer | null = null;
  private localStream: MediaStream | null = null;
  private activeCalls: Map<string, MediaConnection> = new Map();
  private activeConnections: Map<string, DataConnection> = new Map();
  private peerIdToUid: Map<string, string> = new Map();
  private uidToPeerId: Map<string, string> = new Map();
  private peerIdToName: Map<string, string> = new Map();
  private localPeerId: string;
  private cleanRoomId: string;
  private localUid: string;
  private displayName: string;
  private isHost: boolean;
  private isDestroyed = false;
  private retryTimer: NodeJS.Timeout | null = null;

  private onRemoteStream?: (uid: string, stream: MediaStream, displayName?: string) => void;
  private onRemoteStreamRemoved?: (uid: string) => void;
  private onMessage?: (senderId: string, data: PeerMessagePayload) => void;
  private onRoomSync?: (room: Room) => void;

  constructor(
    roomId: string,
    localUid: string,
    displayName: string,
    isHost: boolean,
    onRemoteStream?: (uid: string, stream: MediaStream, displayName?: string) => void,
    onRemoteStreamRemoved?: (uid: string) => void,
    onMessage?: (senderId: string, data: PeerMessagePayload) => void,
    onRoomSync?: (room: Room) => void
  ) {
    this.cleanRoomId = roomId.trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || "DEFAULT";
    this.localUid = localUid;
    this.displayName = displayName || "User";
    this.isHost = isHost;

    const safeUid = localUid.replace(/[^a-zA-Z0-9]/g, "").slice(-4) || "0000";
    const randSuffix = Math.floor(100 + Math.random() * 900);

    this.localPeerId = isHost
      ? `tb_${this.cleanRoomId}_host`
      : `tb_${this.cleanRoomId}_g_${safeUid}_${randSuffix}`;

    this.onRemoteStream = onRemoteStream;
    this.onRemoteStreamRemoved = onRemoteStreamRemoved;
    this.onMessage = onMessage;
    this.onRoomSync = onRoomSync;

    this.initPeer();
  }

  private initPeer() {
    if (typeof window === "undefined" || this.isDestroyed) return;

    try {
      this.peer = new Peer(this.localPeerId, {
        config: RTC_CONFIG,
        debug: 1,
      });

      this.peer.on("open", () => {
        if (!this.isHost) {
          this.connectToHost();
          this.startRetryLoop();
        }
      });

      this.peer.on("call", (call) => {
        const callerPeerId = call.peer;
        this.activeCalls.set(callerPeerId, call);

        if (this.localStream) {
          call.answer(this.localStream);
        } else {
          call.answer();
        }

        call.on("stream", (remoteStream) => {
          const mappedUid = this.peerIdToUid.get(callerPeerId) || callerPeerId;
          const mappedName = this.peerIdToName.get(callerPeerId);
          this.onRemoteStream?.(mappedUid, remoteStream, mappedName);
          if (mappedUid !== callerPeerId) {
            this.onRemoteStream?.(callerPeerId, remoteStream, mappedName);
          }
        });

        call.on("close", () => {
          const mappedUid = this.peerIdToUid.get(callerPeerId) || callerPeerId;
          this.activeCalls.delete(callerPeerId);
          this.onRemoteStreamRemoved?.(mappedUid);
          this.onRemoteStreamRemoved?.(callerPeerId);
        });

        call.on("error", () => {
          const mappedUid = this.peerIdToUid.get(callerPeerId) || callerPeerId;
          this.activeCalls.delete(callerPeerId);
          this.onRemoteStreamRemoved?.(mappedUid);
          this.onRemoteStreamRemoved?.(callerPeerId);
        });
      });

      this.peer.on("connection", (conn) => {
        this.setupDataConnection(conn);
      });

      this.peer.on("error", (err: unknown) => {
        const errType = (err as { type?: string })?.type;
        if (errType === "unavailable-id" && this.isHost) {
          this.isHost = false;
          const safeUid = this.localUid.replace(/[^a-zA-Z0-9]/g, "").slice(-4) || "0000";
          this.localPeerId = `tb_${this.cleanRoomId}_g_${safeUid}_${Math.floor(100 + Math.random() * 900)}`;
          this.initPeer();
        }
      });
    } catch {}
  }

  private startRetryLoop() {
    if (this.retryTimer) clearInterval(this.retryTimer);
    let attempts = 0;
    this.retryTimer = setInterval(() => {
      if (this.isDestroyed || this.activeConnections.size > 0 || attempts > 20) {
        if (this.retryTimer) clearInterval(this.retryTimer);
        this.retryTimer = null;
        return;
      }
      attempts++;
      this.connectToHost();
    }, 2000);
  }

  private connectToHost() {
    const hostPeerId = `tb_${this.cleanRoomId}_host`;
    if (!this.peer || this.peer.destroyed || hostPeerId === this.localPeerId) return;

    if (!this.activeConnections.has(hostPeerId)) {
      const conn = this.peer.connect(hostPeerId, { reliable: true });
      if (conn) {
        this.setupDataConnection(conn);
      }
    }

    if (this.localStream) {
      this.callPeer(hostPeerId);
    }
  }

  callPeer(targetPeerId: string) {
    if (!this.peer || this.peer.destroyed || !this.localStream || targetPeerId === this.localPeerId) return;

    try {
      const call = this.peer.call(targetPeerId, this.localStream);
      if (call) {
        this.activeCalls.set(targetPeerId, call);

        call.on("stream", (remoteStream) => {
          const mappedUid = this.peerIdToUid.get(targetPeerId) || targetPeerId;
          const mappedName = this.peerIdToName.get(targetPeerId);
          this.onRemoteStream?.(mappedUid, remoteStream, mappedName);
          if (mappedUid !== targetPeerId) {
            this.onRemoteStream?.(targetPeerId, remoteStream, mappedName);
          }
        });

        call.on("close", () => {
          const mappedUid = this.peerIdToUid.get(targetPeerId) || targetPeerId;
          this.activeCalls.delete(targetPeerId);
          this.onRemoteStreamRemoved?.(mappedUid);
          this.onRemoteStreamRemoved?.(targetPeerId);
        });

        call.on("error", () => {
          this.activeCalls.delete(targetPeerId);
        });
      }
    } catch {}
  }

  private setupDataConnection(conn: DataConnection) {
    const remoteId = conn.peer;
    this.activeConnections.set(remoteId, conn);

    conn.on("open", () => {
      conn.send({
        type: "join_handshake",
        senderId: this.localUid,
        displayName: this.displayName,
        peerId: this.localPeerId,
      });

      if (this.localStream) {
        this.callPeer(remoteId);
      }
    });

    conn.on("data", (rawData) => {
      if (typeof rawData === "object" && rawData !== null) {
        const data = rawData as PeerMessagePayload;

        if (data.type === "join_handshake" && data.senderId) {
          this.peerIdToUid.set(remoteId, data.senderId);
          this.uidToPeerId.set(data.senderId, remoteId);
          if (data.displayName) {
            this.peerIdToName.set(remoteId, data.displayName);
          }

          if (this.localStream) {
            this.callPeer(remoteId);
          }

          if (this.isHost) {
            const currentConnectedPeers = Array.from(this.activeConnections.keys());
            conn.send({
              type: "peer_list_sync",
              peers: currentConnectedPeers,
            });
          }
        } else if (data.type === "stream_ready" && data.peerId) {
          if (this.localStream) {
            this.callPeer(data.peerId);
          }
        } else if (data.type === "room_state_sync" && data.room) {
          this.onRoomSync?.(data.room);
        } else if (data.type === "peer_list_sync" && Array.isArray(data.peers)) {
          data.peers.forEach((otherPeerId) => {
            if (otherPeerId !== this.localPeerId && !this.activeConnections.has(otherPeerId)) {
              this.connectToPeer(otherPeerId);
            }
          });
        }

        const senderUid = data.senderId || this.peerIdToUid.get(remoteId) || remoteId;
        this.onMessage?.(senderUid, data);
      }
    });

    conn.on("close", () => {
      const mappedUid = this.peerIdToUid.get(remoteId) || remoteId;
      this.activeConnections.delete(remoteId);
      this.peerIdToUid.delete(remoteId);
      this.onRemoteStreamRemoved?.(mappedUid);
      this.onRemoteStreamRemoved?.(remoteId);
    });

    conn.on("error", () => {
      const mappedUid = this.peerIdToUid.get(remoteId) || remoteId;
      this.activeConnections.delete(remoteId);
      this.peerIdToUid.delete(remoteId);
      this.onRemoteStreamRemoved?.(mappedUid);
      this.onRemoteStreamRemoved?.(remoteId);
    });
  }

  private connectToPeer(targetPeerId: string) {
    if (!this.peer || this.peer.destroyed || targetPeerId === this.localPeerId) return;
    if (this.activeConnections.has(targetPeerId)) return;

    try {
      const conn = this.peer.connect(targetPeerId, { reliable: true });
      if (conn) {
        this.setupDataConnection(conn);
      }

      if (this.localStream) {
        this.callPeer(targetPeerId);
      }
    } catch {}
  }

  setLocalStream(stream: MediaStream): void {
    this.localStream = stream;

    for (const [peerId, call] of this.activeCalls.entries()) {
      try {
        const senders = call.peerConnection?.getSenders();
        if (senders && senders.length > 0) {
          stream.getTracks().forEach((track) => {
            const sender = senders.find((s) => s.track?.kind === track.kind);
            if (sender) {
              sender.replaceTrack(track);
            } else if (call.peerConnection) {
              call.peerConnection.addTrack(track, stream);
            }
          });
        }
      } catch {}
    }

    for (const remotePeerId of this.activeConnections.keys()) {
      if (!this.activeCalls.has(remotePeerId)) {
        this.callPeer(remotePeerId);
      }
    }

    if (!this.isHost) {
      const hostPeerId = `tb_${this.cleanRoomId}_host`;
      if (!this.activeCalls.has(hostPeerId)) {
        this.callPeer(hostPeerId);
      }
    }

    this.broadcast({
      type: "stream_ready",
      senderId: this.localUid,
      peerId: this.localPeerId,
    });
  }

  broadcast(message: PeerMessagePayload): void {
    const enrichedMessage = {
      ...message,
      senderId: this.localUid,
    };

    for (const conn of this.activeConnections.values()) {
      try {
        if (conn.open) {
          conn.send(enrichedMessage);
        }
      } catch {}
    }
  }

  destroy(): void {
    this.isDestroyed = true;
    if (this.retryTimer) {
      clearInterval(this.retryTimer);
      this.retryTimer = null;
    }

    for (const call of this.activeCalls.values()) {
      try {
        call.close();
      } catch {}
    }
    for (const conn of this.activeConnections.values()) {
      try {
        conn.close();
      } catch {}
    }
    this.activeCalls.clear();
    this.activeConnections.clear();
    this.peerIdToUid.clear();
    this.uidToPeerId.clear();
    this.peerIdToName.clear();

    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {}
      this.peer = null;
    }
  }
}
