import { ReactNode } from "react";

export function TerminalBox({
  title = "terminal",
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass rounded-2xl overflow-hidden font-mono text-sm ${className}`}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-white/5">
        <span className="size-2.5 rounded-full bg-destructive/70" />
        <span className="size-2.5 rounded-full bg-yellow-500/70" />
        <span className="size-2.5 rounded-full bg-neon/80" />
        <span className="ml-2 text-xs text-muted-foreground">— {title} —</span>
      </div>
      <div className="p-4 text-foreground/90 leading-relaxed">{children}</div>
    </div>
  );
}

export function Prompt({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="text-neon shrink-0">$</span>
      <span>{children}</span>
    </div>
  );
}
