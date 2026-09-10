import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { SignalMessage } from "@/types/webrtc";
import { LocalMemoryDatabase } from "@/lib/firebase-mock";

export const signalingService = {
  async sendSignal(roomId: string, signal: SignalMessage): Promise<void> {
    if (isFirebaseConfigured && db) {
      const signalsRef = collection(db, "rooms", roomId, "signals");
      await addDoc(signalsRef, signal);
    } else {
      const channel = LocalMemoryDatabase.getChannel(`signal_${roomId}`);
      if (channel) {
        channel.postMessage(signal);
      }
      try {
        await fetch(`/api/rooms/${roomId}/signals`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(signal),
        });
      } catch {}
    }
  },

  subscribeToSignals(
    roomId: string,
    localPeerId: string,
    onSignal: (signal: SignalMessage) => void
  ): () => void {
    if (isFirebaseConfigured && db) {
      const firestore = db;
      const signalsRef = collection(firestore, "rooms", roomId, "signals");
      const q = query(signalsRef, where("receiverId", "==", localPeerId));

      return onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === "added") {
            const data = change.doc.data() as SignalMessage;
            onSignal(data);
            try {
              await deleteDoc(doc(firestore, "rooms", roomId, "signals", change.doc.id));
            } catch {}
          }
        });
      });
    }

    let isSubscribed = true;
    let lastSeenTimestamp = Date.now() - 5000;
    const seenCandidateKeys = new Set<string>();

    const pollSignals = async () => {
      if (!isSubscribed) return;
      try {
        const res = await fetch(
          `/api/rooms/${roomId}/signals?receiverId=${encodeURIComponent(
            localPeerId
          )}&since=${lastSeenTimestamp}`
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.signals) && isSubscribed) {
            for (const s of data.signals as SignalMessage[]) {
              const sigKey = `${s.senderId}_${s.type}_${s.timestamp}_${
                s.candidate?.candidate || ""
              }`;
              if (!seenCandidateKeys.has(sigKey)) {
                seenCandidateKeys.add(sigKey);
                if (s.timestamp && s.timestamp > lastSeenTimestamp) {
                  lastSeenTimestamp = s.timestamp;
                }
                onSignal(s);
              }
            }
          }
        }
      } catch {}
    };

    pollSignals();
    const intervalId = setInterval(pollSignals, 500);

    const channel = LocalMemoryDatabase.getChannel(`signal_${roomId}`);
    let handler: ((event: MessageEvent) => void) | null = null;
    if (channel) {
      handler = (event: MessageEvent) => {
        const signal = event.data as SignalMessage;
        if (signal && signal.receiverId === localPeerId && isSubscribed) {
          const sigKey = `${signal.senderId}_${signal.type}_${signal.timestamp}_${
            signal.candidate?.candidate || ""
          }`;
          if (!seenCandidateKeys.has(sigKey)) {
            seenCandidateKeys.add(sigKey);
            onSignal(signal);
          }
        }
      };
      channel.addEventListener("message", handler);
    }

    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
      if (channel && handler) {
        channel.removeEventListener("message", handler);
      }
    };
  },
};
