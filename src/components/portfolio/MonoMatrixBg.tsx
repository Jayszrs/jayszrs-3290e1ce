import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Subtle monochrome "code rain" background.
 * White-on-black, low opacity, slow — premium feel, not noisy.
 */
export function MonoMatrixBg({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const chars = "01{}<>/$_=*+#abcdefABCDEFfunctionreturnconstasyncawait".split("");
    const fontSize = 14;
    let cols = 0;
    let drops: number[] = [];

    const resize = () => {
      c.width = c.offsetWidth;
      c.height = c.offsetHeight;
      cols = Math.floor(c.width / fontSize);
      drops = Array(cols)
        .fill(0)
        .map(() => Math.random() * (c.height / fontSize));
    };
    resize();
    window.addEventListener("resize", resize);

    let last = 0;
    const tick = (t: number) => {
      const interval = reduced ? 240 : 95;
      if (t - last > interval) {
        last = t;
        // soft fade trail
        ctx.fillStyle = "rgba(10, 10, 10, 0.085)";
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.font = `${fontSize}px JetBrains Mono, ui-monospace, monospace`;
        for (let i = 0; i < cols; i++) {
          const ch = chars[Math.floor(Math.random() * chars.length)];
          const x = i * fontSize;
          const y = drops[i] * fontSize;
          // head bright, trail dim — pure white
          ctx.fillStyle = drops[i] < 1.5 ? "rgba(255,255,255,0.78)" : "rgba(255,255,255,0.24)";
          ctx.fillText(ch, x, y);
          if (y > c.height && Math.random() > 0.985) drops[i] = 0;
          drops[i] += 1;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn(
        "fixed inset-0 z-0 h-screen w-screen pointer-events-none opacity-[0.20]",
        "[mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]",
        className,
      )}
    />
  );
}
