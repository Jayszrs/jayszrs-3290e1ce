import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Download, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";

export type CertItem = {
  id: string;
  title: string;
  issuer: string;
  year: string;
  category?: string | null;
  description?: string | null;
  badge_url?: string | null;
  certificate_url?: string | null;
  verification_url?: string | null;
};

export function CertModal({ cert, onClose }: { cert: CertItem | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {cert && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="glass max-w-2xl w-full rounded-2xl overflow-hidden glow-neon"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-border font-mono text-xs">
              <span className="text-neon">./certificate/{cert.id.slice(0,8)}</span>
              <button onClick={onClose} className="text-muted-foreground hover:text-neon"><X className="size-4"/></button>
            </div>
            <div className="p-6 space-y-4">
              {cert.certificate_url ? (
                <img src={cert.certificate_url} alt={cert.title} className="w-full rounded-lg border border-border" />
              ) : cert.badge_url ? (
                <img src={cert.badge_url} alt={cert.title} className="w-40 mx-auto rounded-lg" />
              ) : (
                <div className="aspect-video rounded-lg bg-surface flex items-center justify-center font-mono text-muted-foreground">
                  no preview file uploaded
                </div>
              )}
              <div>
                <div className="text-xs font-mono text-muted-foreground">{cert.category} · {cert.year}</div>
                <h3 className="text-2xl font-bold mt-1">{cert.title}</h3>
                <div className="text-neon font-mono text-sm">@ {cert.issuer}</div>
                {cert.description && <p className="mt-3 text-muted-foreground text-sm">{cert.description}</p>}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Link
                  to="/verify/$id" params={{ id: cert.id }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-neon text-primary-foreground font-mono text-xs rounded-md glow-neon"
                >
                  <ShieldCheck className="size-4"/> verify
                </Link>
                {cert.certificate_url && (
                  <a href={cert.certificate_url} download className="inline-flex items-center gap-2 px-4 py-2 glass border border-neon/40 text-neon font-mono text-xs rounded-md">
                    <Download className="size-4"/> download
                  </a>
                )}
                {cert.verification_url && (
                  <a href={cert.verification_url} target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-4 py-2 glass border border-border font-mono text-xs rounded-md">
                    <ExternalLink className="size-4"/> issuer link
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
