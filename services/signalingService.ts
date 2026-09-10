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

    const channel = LocalMemoryDatabase.getChannel(`signal_${roomId}`);
    if (channel) {
      const handler = (event: MessageEvent) => {
        const signal = event.data as SignalMessage;
        if (signal && signal.receiverId === localPeerId) {
          onSignal(signal);
        }
      };
      channel.addEventListener("message", handler);
      return () => {
        channel.removeEventListener("message", handler);
      };
    }

    return () => {};
  },
};
