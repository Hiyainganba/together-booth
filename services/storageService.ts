import { ref, uploadString, getDownloadURL, uploadBytes } from "firebase/storage";
import { storage, isFirebaseConfigured } from "@/lib/firebase";

export const storageService = {
  async uploadDataUrl(path: string, dataUrl: string): Promise<string> {
    if (isFirebaseConfigured && storage) {
      const storageRef = ref(storage, path);
      await uploadString(storageRef, dataUrl, "data_url");
      return await getDownloadURL(storageRef);
    }
    return dataUrl;
  },

  async uploadBlob(path: string, blob: Blob): Promise<string> {
    if (isFirebaseConfigured && storage) {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    }
    return URL.createObjectURL(blob);
  },
};
