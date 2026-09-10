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
  private peerIdToName: Map<string, string> = new Map();
  private cleanRoomId: string;
  private localUid: string;
  private displayName: string;
  private isDestroyed = false;
  private currentSlotIndex = 1;
  private maxSlots = 6;
  private heartbeatTimer: NodeJS.Timeout | null = null;

  private onRemoteStream?: (uid: string, stream: MediaStream, displayName?: string) => void;
  private onRemoteStreamRemoved?: (uid: string) => void;
  private onMessage?: (senderId: string, data: PeerMessagePayload) => void;
  private onRoomSync?: (room: Room) => void;
  private onPeerHandshake?: (uid: string, displayName: string, peerId: string) => void;

  constructor(
    roomId: string,
    localUid: string,
    displayName: string,
    isHost: boolean = false,
    onRemoteStream?: (uid: string, stream: MediaStream, displayName?: string) => void,
    onRemoteStreamRemoved?: (uid: string) => void,
    onMessage?: (senderId: string, data: PeerMessagePayload) => void,
    onRoomSync?: (room: Room) => void,
    onPeerHandshake?: (uid: string, displayName: string, peerId: string) => void
  ) {
    this.cleanRoomId = roomId.trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || "ROOM";
    this.localUid = localUid;
    this.displayName = displayName || "Photobooth User";

    this.onRemoteStream = onRemoteStream;
    this.onRemoteStreamRemoved = onRemoteStreamRemoved;
    this.onMessage = onMessage;
    this.onRoomSync = onRoomSync;
    this.onPeerHandshake = onPeerHandshake;

    const initialSlot = isHost ? 1 : 2;
    this.initSlot(initialSlot);
  }

  private getSlotId(slot: number): string {
    return `tb26_${this.cleanRoomId}_p${slot}`;
  }

  private get localPeerId(): string {
    return this.getSlotId(this.currentSlotIndex);
  }

  private initSlot(slot: number) {
    if (typeof window === "undefined" || this.isDestroyed) return;

    this.currentSlotIndex = slot;
    const slotId = this.getSlotId(slot);

    try {
      if (this.peer) {
        try {
          this.peer.destroy();
        } catch {}
        this.peer = null;
      }

      const peerInstance = new Peer(slotId, {
        config: RTC_CONFIG,
        debug: 1,
      });

      this.peer = peerInstance;

      peerInstance.on("open", () => {
        if (this.isDestroyed || this.peer !== peerInstance) return;
        this.startMeshHeartbeat();
      });

      peerInstance.on("call", (call) => {
        const callerPeerId = call.peer;
        this.activeCalls.set(callerPeerId, call);

        if (this.localStream) {
          call.answer(this.localStream);
        } else {
          call.answer();
        }

        call.on("stream", (remoteStream) => {
          const mappedUid = this.peerIdToUid.get(callerPeerId) || callerPeerId;
          const mappedName = this.peerIdToName.get(callerPeerId) || "Partner 🧸";
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

      peerInstance.on("connection", (conn) => {
        this.setupDataConnection(conn);
      });

      peerInstance.on("error", (err: unknown) => {
        const errType = (err as { type?: string })?.type;
        if (errType === "unavailable-id") {
          const nextSlot = this.currentSlotIndex === 1 ? 2 : this.currentSlotIndex === 2 ? 3 : this.currentSlotIndex + 1;
          if (nextSlot <= this.maxSlots) {
            setTimeout(() => {
              if (!this.isDestroyed) {
                this.initSlot(nextSlot);
              }
            }, 200);
          } else {
            const randSuffix = Math.floor(1000 + Math.random() * 9000);
            this.currentSlotIndex = 99;
            const fallbackId = `tb26_${this.cleanRoomId}_alt_${randSuffix}`;
            setTimeout(() => {
              if (this.isDestroyed) return;
              try {
                this.peer = new Peer(fallbackId, { config: RTC_CONFIG, debug: 1 });
                this.peer.on("open", () => this.startMeshHeartbeat());
                this.peer.on("call", (call) => {
                  this.activeCalls.set(call.peer, call);
                  if (this.localStream) call.answer(this.localStream);
                  else call.answer();
                  call.on("stream", (stream) => {
                    const mappedUid = this.peerIdToUid.get(call.peer) || call.peer;
                    const mappedName = this.peerIdToName.get(call.peer) || "Partner 🧸";
                    this.onRemoteStream?.(mappedUid, stream, mappedName);
                  });
                });
                this.peer.on("connection", (c) => this.setupDataConnection(c));
              } catch {}
            }, 200);
          }
        }
      });
    } catch {}
  }

  private startMeshHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);

    const tryConnectAllSlots = () => {
      if (this.isDestroyed || !this.peer || this.peer.destroyed) return;

      for (let s = 1; s <= this.maxSlots; s++) {
        if (s === this.currentSlotIndex) continue;
        const targetId = this.getSlotId(s);

        if (!this.activeConnections.has(targetId)) {
          try {
            const conn = this.peer.connect(targetId, { reliable: true });
            if (conn) {
              this.setupDataConnection(conn);
            }
          } catch {}
        }

        if (this.localStream) {
          this.callPeer(targetId);
        }
      }
    };

    tryConnectAllSlots();
    this.heartbeatTimer = setInterval(tryConnectAllSlots, 1200);
  }

  callPeer(targetPeerId: string) {
    if (!this.peer || this.peer.destroyed || !this.localStream || targetPeerId === this.localPeerId) return;

    try {
      const call = this.peer.call(targetPeerId, this.localStream);
      if (call) {
        this.activeCalls.set(targetPeerId, call);

        call.on("stream", (remoteStream) => {
          const mappedUid = this.peerIdToUid.get(targetPeerId) || targetPeerId;
          const mappedName = this.peerIdToName.get(targetPeerId) || "Partner 🧸";
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
          const mappedUid = this.peerIdToUid.get(targetPeerId) || targetPeerId;
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
        type: "peer_handshake",
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

        if (data.type === "peer_handshake" && data.senderId) {
          const senderDisplayName = data.displayName || "Partner 🧸";
          this.peerIdToUid.set(remoteId, data.senderId);
          this.peerIdToName.set(remoteId, senderDisplayName);
          this.onPeerHandshake?.(data.senderId, senderDisplayName, remoteId);

          conn.send({
            type: "peer_handshake_ack",
            senderId: this.localUid,
            displayName: this.displayName,
            peerId: this.localPeerId,
          });

          if (this.localStream) {
            this.callPeer(remoteId);
          }
        } else if (data.type === "peer_handshake_ack" && data.senderId) {
          const senderDisplayName = data.displayName || "Partner 🧸";
          this.peerIdToUid.set(remoteId, data.senderId);
          this.peerIdToName.set(remoteId, senderDisplayName);
          this.onPeerHandshake?.(data.senderId, senderDisplayName, remoteId);

          if (this.localStream) {
            this.callPeer(remoteId);
          }
        } else if (data.type === "stream_ready" && data.peerId) {
          if (this.localStream) {
            this.callPeer(data.peerId);
          }
        } else if (data.type === "room_state_sync" && data.room) {
          this.onRoomSync?.(data.room);
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

  setLocalStream(stream: MediaStream): void {
    this.localStream = stream;

    for (const [, call] of this.activeCalls.entries()) {
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

    for (let s = 1; s <= this.maxSlots; s++) {
      if (s === this.currentSlotIndex) continue;
      this.callPeer(this.getSlotId(s));
    }

    for (const remotePeerId of this.activeConnections.keys()) {
      this.callPeer(remotePeerId);
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
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
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
    this.peerIdToName.clear();

    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {}
      this.peer = null;
    }
  }
}
