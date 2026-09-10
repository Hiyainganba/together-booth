"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: "primary" | "secondary" | "glass" | "outline" | "ghost" | "danger" | "glow";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none overflow-hidden active:scale-[0.98]";

    const sizeStyles = {
      sm: "text-xs px-3.5 py-1.5 gap-1.5",
      md: "text-sm px-5 py-2.5 gap-2",
      lg: "text-base px-6 py-3.5 gap-2.5",
      icon: "p-2.5 w-10 h-10 rounded-full",
    };

    const variantStyles = {
      primary:
        "bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:brightness-110",
      secondary:
        "bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-100 border border-zinc-700/60 shadow-sm",
      glass:
        "bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl border border-white/20 shadow-lg shadow-black/20",
      outline:
        "bg-transparent border border-zinc-700 hover:border-zinc-500 text-zinc-200 hover:bg-zinc-800/40",
      ghost:
        "bg-transparent hover:bg-white/10 text-zinc-300 hover:text-white",
      danger:
        "bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30",
      glow:
        "bg-white text-zinc-950 hover:bg-zinc-100 shadow-[0_0_25px_rgba(255,255,255,0.45)] hover:shadow-[0_0_35px_rgba(255,255,255,0.65)]",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>{typeof children === "string" ? children : "Loading..."}</span>
          </div>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
