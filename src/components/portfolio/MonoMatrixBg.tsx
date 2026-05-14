import { useEffect, useRef } from "react";

/**
 * Subtle monochrome "code rain" background.
 * White-on-black, low opacity, slow — premium feel, not noisy.
 */
export function MonoMatrixBg() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const chars = "01{}<>/$_=*+#abcdefABCDEF".split("");
    const fontSize = 14;
    let cols = 0;
    let drops: number[] = [];

    const resize = () => {
      c.width = c.offsetWidth;
      c.height = c.offsetHeight;
      cols = Math.floor(c.width / fontSize);
      drops = Array(cols).fill(0).map(() => Math.random() * (c.height / fontSize));
    };
    resize();
    window.addEventListener("resize", resize);

    let last = 0;
    const tick = (t: number) => {
      const interval = reduced ? 240 : 95;
      if (t - last > interval) {
        last = t;
        // soft fade trail
        ctx.fillStyle = "rgba(10, 10, 10, 0.10)";
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.font = `${fontSize}px JetBrains Mono, ui-monospace, monospace`;
        for (let i = 0; i < cols; i++) {
          const ch = chars[Math.floor(Math.random() * chars.length)];
          const x = i * fontSize;
          const y = drops[i] * fontSize;
          // head bright, trail dim — pure white
          ctx.fillStyle =
            drops[i] < 1.5
              ? "rgba(255,255,255,0.85)"
              : "rgba(255,255,255,0.28)";
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
      className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.18] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_85%)]"
    />
  );
}
