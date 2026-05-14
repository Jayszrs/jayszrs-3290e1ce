import { useEffect, useRef } from "react";

export function MatrixBg() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    const chars = "01アイウエオカキクケコｱｲｳｴｵabcdef{}<>/$_=*+#".split("");
    let cols = 0;
    let drops: number[] = [];
    const fontSize = 14;

    const resize = () => {
      c.width = c.offsetWidth;
      c.height = c.offsetHeight;
      cols = Math.floor(c.width / fontSize);
      drops = Array(cols).fill(1).map(() => Math.random() * c.height / fontSize);
    };
    resize();
    window.addEventListener("resize", resize);

    let last = 0;
    const tick = (t: number) => {
      if (t - last > 60) {
        last = t;
        ctx.fillStyle = "rgba(3, 8, 5, 0.08)";
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.font = `${fontSize}px JetBrains Mono, monospace`;
        for (let i = 0; i < cols; i++) {
          const ch = chars[Math.floor(Math.random() * chars.length)];
          const x = i * fontSize;
          const y = drops[i] * fontSize;
          ctx.fillStyle = drops[i] < 2 ? "rgba(200, 255, 200, 0.9)" : "rgba(57, 255, 120, 0.55)";
          ctx.fillText(ch, x, y);
          if (y > c.height && Math.random() > 0.975) drops[i] = 0;
          drops[i]++;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none opacity-40" />;
}
