import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type NeonWordmarkProps = {
  className?: string;
  size?: "nav" | "auth" | "hero";
  text?: string;
};

export function NeonWordmark({ className, size = "hero", text = "JAY SZRS" }: NeonWordmarkProps) {
  return (
    <span className={cn("neon-wordmark", `neon-wordmark--${size}`, className)}>
      <span
        className="neon-wordmark__text"
        style={{ "--wordmark-characters": text.length } as CSSProperties}
      >
        {text}
      </span>
    </span>
  );
}
