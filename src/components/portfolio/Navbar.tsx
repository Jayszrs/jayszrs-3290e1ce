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
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = navItems
      .map((n) => document.getElementById(n.id))
      .filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { threshold: 0.4 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
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
      style={{ display: "flex", justifyContent: "center", width: "100%" }}
    >
      <div className="liquid-navbar glass rounded-full transition-all mx-auto w-fit px-4 sm:px-6">
        <div className="flex items-center justify-center gap-4 sm:gap-6 lg:gap-8 h-12">
          <button
            onClick={() => go("home")}
            className="flex items-center gap-1.5 font-mono text-sm group shrink-0"
          >
            <Terminal className="size-4 text-neon group-hover:rotate-12 transition" />
            <NeonWordmark size="nav" />
            <span className="text-muted-foreground text-xs">:~$</span>
          </button>

          <nav className="hidden lg:flex items-center gap-1 font-mono text-xs shrink-0">
            {navItems.map((n) => (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                className={`px-3 py-1.5 rounded-full transition relative ${
                  active === n.id
                    ? "active text-foreground"
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

          <div className="flex items-center gap-2 shrink-0">
            <A11yToggle />
            <button
              onClick={() => go("contact")}
              className="nav-cta hidden sm:inline-flex items-center rounded-full px-4 py-2 font-mono text-xs font-semibold"
            >
              contact
            </button>
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
            style={{ left: "50%", transform: "translateX(-50%)", right: "auto" }}
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