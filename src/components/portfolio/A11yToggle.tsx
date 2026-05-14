import { useEffect, useState } from "react";
import { Eye, Type } from "lucide-react";

/**
 * Accessibility toggles: high contrast + larger typography.
 * Persists in localStorage and applies classes to <html>.
 */
export function A11yToggle() {
  const [contrast, setContrast] = useState(false);
  const [large, setLarge] = useState(false);

  useEffect(() => {
    const c = localStorage.getItem("a11y-contrast") === "1";
    const l = localStorage.getItem("a11y-large") === "1";
    setContrast(c);
    setLarge(l);
    document.documentElement.classList.toggle("a11y-contrast", c);
    document.documentElement.classList.toggle("a11y-large", l);
  }, []);

  const apply = (key: "a11y-contrast" | "a11y-large", val: boolean) => {
    localStorage.setItem(key, val ? "1" : "0");
    document.documentElement.classList.toggle(key, val);
  };

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-pressed={contrast}
        title="High contrast"
        onClick={() => {
          const v = !contrast;
          setContrast(v);
          apply("a11y-contrast", v);
        }}
        className={`p-2 rounded-md border font-mono text-xs transition ${
          contrast
            ? "bg-foreground text-background border-foreground"
            : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/60"
        }`}
      >
        <Eye className="size-4" />
      </button>
      <button
        type="button"
        aria-pressed={large}
        title="Larger text"
        onClick={() => {
          const v = !large;
          setLarge(v);
          apply("a11y-large", v);
        }}
        className={`p-2 rounded-md border font-mono text-xs transition ${
          large
            ? "bg-foreground text-background border-foreground"
            : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/60"
        }`}
      >
        <Type className="size-4" />
      </button>
    </div>
  );
}
