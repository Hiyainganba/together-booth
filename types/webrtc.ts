export type SignalType = "offer" | "answer" | "candidate" | "leave";

export interface SignalMessage {
  id?: string;
  senderId: string;
  receiverId: string;
  type: SignalType;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  timestamp: number;
}

export interface PeerStream {
  peerId: string;
  participant: import("./room").Participant;
  stream: MediaStream;
}
