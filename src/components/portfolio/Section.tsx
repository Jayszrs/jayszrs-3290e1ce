import { ReactNode } from "react";
import { motion } from "framer-motion";

export function Section({
  id,
  command,
  title,
  description,
  children,
}: {
  id: string;
  command: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="relative scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="section-caption font-mono mb-2">
            <span className="text-neon">$</span> {command}
          </div>
          <h2 className="section-heading font-display text-3xl md:text-5xl font-bold tracking-tight">
            <span>#</span> {title}
          </h2>
          {description && <p className="mt-3 text-muted-foreground max-w-2xl">{description}</p>}
        </motion.div>
        {children}
      </div>
    </section>
  );
}
