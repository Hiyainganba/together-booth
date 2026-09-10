"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function RoomPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/booth");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0E0C0A] text-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="w-8 h-8 text-[#FF6F61] animate-spin" />
        <p className="text-xs text-zinc-400">Opening studio photobooth...</p>
      </div>
    </div>
  );
}
