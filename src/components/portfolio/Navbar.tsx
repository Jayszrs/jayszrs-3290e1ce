import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Terminal } from "lucide-react";
import { navItems } from "@/data/portfolio";
import { A11yToggle } from "./A11yToggle";
import { NeonWordmark } from "./NeonWordmark";

export function Navbar() {
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      setCollapsed(currentY > lastScrollY.current && currentY > 80);
      lastScrollY.current = currentY;
      const sections = navItems
        .map((n) => document.getElementById(n.id))
        .filter(Boolean) as HTMLElement[];
      const y = window.scrollY + 120;
      let cur: HTMLElement | undefined;
      for (const s of sections) if (s.offsetTop <= y) cur = s;
      if (cur) setActive(cur.id);
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`liquid-navbar-shell ${collapsed ? "is-collapsed" : ""}`}
    >
      <div className="liquid-navbar glass rounded-full transition-all">
        <div className="flex items-center justify-between h-12">
          <button
            onClick={() => go("home")}
            className="flex items-center gap-2 font-mono text-sm group"
          >
            <Terminal className="size-4 text-neon group-hover:rotate-12 transition" />
            <NeonWordmark size="nav" />
            <span className="text-muted-foreground">:~$</span>
          </button>

          <nav className="hidden lg:flex items-center gap-1 font-mono text-xs">
            {navItems.map((n) => (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                className={`px-3 py-1.5 rounded-full transition relative ${
                  active === n.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {active === n.id && (
                  <motion.span
                    layoutId="navdot"
                    className="absolute inset-0 rounded-full bg-white/12 border border-white/20"
                  />
                )}
                <span className="relative">./{n.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <A11yToggle />
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 text-neon rounded-full hover:bg-white/10"
              aria-label="menu"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="liquid-mobile-menu lg:hidden glass rounded-2xl p-4 font-mono text-sm"
          >
            {navItems.map((n) => (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                className={`block w-full text-left px-3 py-2 rounded ${
                  active === n.id ? "text-foreground bg-white/12" : "text-muted-foreground"
                }`}
              >
                ./{n.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
