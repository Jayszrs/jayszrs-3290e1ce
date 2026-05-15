import { cn } from "@/lib/utils";

type NeonWordmarkProps = {
  className?: string;
  size?: "nav" | "auth" | "hero";
};

export function NeonWordmark({ className, size = "hero" }: NeonWordmarkProps) {
  return (
    <span className={cn("neon-wordmark", `neon-wordmark--${size}`, className)}>
      <span className="neon-wordmark__text" data-text="JAY SZRS">
        JAY SZRS
      </span>
    </span>
  );
}
