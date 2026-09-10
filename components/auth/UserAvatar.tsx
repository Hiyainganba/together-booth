"use client";

import React from "react";
import Image from "next/image";
import { UserProfile } from "@/types/auth";
import { getAvatarColor, getInitials, cn } from "@/lib/utils";

interface UserAvatarProps {
  user?: UserProfile | { displayName: string; photoURL?: string | null } | null;
  size?: "sm" | "md" | "lg" | "xl";
  showStatus?: boolean;
  isOnline?: boolean;
  className?: string;
}

export function UserAvatar({
  user,
  size = "md",
  showStatus = false,
  isOnline = true,
  className,
}: UserAvatarProps) {
  const name = user?.displayName || "Guest";
  const photo = user?.photoURL;

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
    xl: "w-20 h-20 text-xl",
  };

  const statusSize = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-4 h-4",
    xl: "w-5 h-5",
  };

  return (
    <div className={cn("relative inline-block select-none", className)}>
      <div
        className={cn(
          "relative rounded-full flex items-center justify-center font-bold text-white shadow-md overflow-hidden ring-2 ring-white/10",
          sizeClasses[size],
          !photo && `bg-gradient-to-tr ${getAvatarColor(name)}`
        )}
      >
        {photo ? (
          <img
            src={photo}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      {showStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-2 ring-zinc-950",
            statusSize[size],
            isOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-zinc-500"
          )}
        />
      )}
    </div>
  );
}
