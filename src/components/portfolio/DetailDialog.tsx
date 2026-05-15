import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function DetailDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-foreground/30 max-w-2xl rounded-2xl">
        <DialogHeader>
          <div className="font-mono text-xs text-muted-foreground">
            $ cat ./{title.toLowerCase().replace(/\s+/g, "_")}.md
          </div>
          <DialogTitle className="section-heading font-display text-2xl">{title}</DialogTitle>
          {subtitle && (
            <DialogDescription className="font-mono text-xs">{subtitle}</DialogDescription>
          )}
        </DialogHeader>
        <div className="text-sm text-foreground/90 space-y-3 pt-2">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
