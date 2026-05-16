import { createFileRoute } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { ReactNode } from "react";
import {
  Download,
  Mail,
  MessageCircle,
  ArrowRight,
  Github,
  Instagram,
  Linkedin,
  ExternalLink,
  Calendar,
  MapPin,
  CheckCircle2,
  Folder,
  FileCode,
  Award,
  GraduationCap,
  Heart,
  Sparkles,
  ChevronUp,
} from "lucide-react";

import jayPhoto from "@/assets/jay-profile.jpg";
import cyberSecurityBg from "@/assets/cyber-security-bg.webp";
import { Navbar } from "@/components/portfolio/Navbar";
import { TerminalBox, Prompt } from "@/components/portfolio/TerminalBox";
import { Section } from "@/components/portfolio/Section";
import { Typewriter } from "@/components/portfolio/Typewriter";
import { MonoMatrixBg } from "@/components/portfolio/MonoMatrixBg";
import { DetailDialog } from "@/components/portfolio/DetailDialog";
import { NeonWordmark } from "@/components/portfolio/NeonWordmark";
import { LanyardDisplay } from "@/components/portfolio/LanyardDisplay";
import { supabase } from "@/integrations/supabase/client";
import {
  profile as fallbackProfile,
  stats as fallbackStats,
  experiences as fallbackExperiences,
  certifications as fallbackCertifications,
  education as fallbackEducation,
  volunteers as fallbackVolunteers,
  projects as fallbackProjects,
  skills as fallbackSkills,
} from "@/data/portfolio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JAY SZRS — Creative Technologist & Designer Portfolio" },
      {
        name: "description",
        content:
          "Personal portfolio of JAY SZRS — Informatics student, designer, content creator, and IT enthusiast. Explore projects, certifications, and experience.",
      },
      { property: "og:title", content: "JAY SZRS — Neon Digital Portfolio OS" },
      {
        property: "og:description",
        content: "A futuristic terminal-inspired portfolio by JAY SZRS.",
      },
    ],
  }),
  component: Index,
});

const fallbackContent = {
  profile: fallbackProfile,
  stats: fallbackStats,
  experiences: fallbackExperiences,
  certifications: fallbackCertifications,
  education: fallbackEducation,
  volunteers: fallbackVolunteers,
  projects: fallbackProjects,
  skills: fallbackSkills,
};

type PortfolioContent = {
  profile: typeof fallbackProfile;
  stats: typeof fallbackStats;
  experiences: typeof fallbackExperiences;
  certifications: Array<
    (typeof fallbackCertifications)[number] & {
      credentialId?: string;
      certificateUrl?: string;
      badgeUrl?: string;
      verificationUrl?: string;
      description?: string;
    }
  >;
  education: typeof fallbackEducation;
  volunteers: Array<(typeof fallbackVolunteers)[number] & { description?: string }>;
  projects: typeof fallbackProjects;
  skills: Record<string, string[]>;
};

const PortfolioContentContext = createContext<PortfolioContent>(fallbackContent);

function usePortfolioContent() {
  return useContext(PortfolioContentContext);
}

function PortfolioContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<PortfolioContent>(fallbackContent);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [
          profileRes,
          experienceRes,
          certificationRes,
          educationRes,
          volunteerRes,
          projectRes,
          skillRes,
        ] = await Promise.all([
          supabase.from("profile_public").select("*").limit(1).maybeSingle(),
          supabase.from("experiences").select("*").order("order_index", { ascending: true }),
          supabase.from("certifications").select("*").order("order_index", { ascending: true }),
          supabase.from("education").select("*").order("order_index", { ascending: true }),
          supabase.from("volunteers").select("*").order("order_index", { ascending: true }),
          supabase.from("projects").select("*").order("order_index", { ascending: true }),
          supabase.from("skills").select("*").order("order_index", { ascending: true }),
        ]);

        if (!active) return;

        const profileRow = profileRes.data;
        const skillRows = skillRes.data || [];
        const dynamicSkills = skillRows.reduce<Record<string, string[]>>((acc, item) => {
          acc[item.category] = [...(acc[item.category] || []), item.name];
          return acc;
        }, {});

        setContent({
          profile: profileRow
            ? {
                ...fallbackProfile,
                name: profileRow.branding_name ?? fallbackProfile.name,
                fullName: profileRow.full_name ?? fallbackProfile.fullName,
                role: profileRow.subtitle ?? fallbackProfile.role,
                email: fallbackProfile.email,
                whatsapp: fallbackProfile.whatsapp,
                location: profileRow.location ?? fallbackProfile.location,
                status: profileRow.availability ?? fallbackProfile.status,
                typing: profileRow.typing_texts?.length
                  ? profileRow.typing_texts
                  : fallbackProfile.typing,
              }
            : fallbackProfile,
          stats: [
            { label: "Projects", value: projectRes.data?.length || fallbackProjects.length },
            {
              label: "Certificates",
              value: certificationRes.data?.length || fallbackCertifications.length,
            },
            {
              label: "Experience",
              value: experienceRes.data?.length || fallbackExperiences.length,
            },
            { label: "Volunteer", value: volunteerRes.data?.length || fallbackVolunteers.length },
          ],
          experiences: experienceRes.data?.length
            ? experienceRes.data.map((row) => {
                const item = row as typeof row & {
                  duration_months?: number | null;
                  employment_type?: string | null;
                  image_url?: string | null;
                  document_url?: string | null;
                };
                return {
                  title: item.title,
                  company: item.company,
                  date: item.duration_months
                    ? `${item.date_range} (${item.duration_months} bulan)`
                    : item.date_range,
                  status: item.status,
                  description: item.description || "",
                  category: item.category || item.employment_type || "Work",
                  imageUrl: item.image_url || "",
                  documentUrl: item.document_url || "",
                };
              })
            : fallbackExperiences,
          certifications: certificationRes.data?.length
            ? certificationRes.data.map((row) => {
                const item = row as typeof row & { credential_id?: string | null };
                return {
                  title: item.title,
                  issuer: item.issuer,
                  year: item.year,
                  category: item.category || "Certificate",
                  credentialId: item.credential_id || "",
                  certificateUrl: item.certificate_url || "",
                  badgeUrl: item.badge_url || "",
                  verificationUrl: item.verification_url || "",
                  description: item.description || "",
                };
              })
            : fallbackCertifications,
          education: educationRes.data?.length
            ? educationRes.data.map((row) => {
                const item = row as typeof row & {
                  field_of_study?: string | null;
                  activities?: string | null;
                  logo_url?: string | null;
                  document_url?: string | null;
                };
                return {
                  institution: item.institution,
                  major: item.field_of_study
                    ? `${item.major} - ${item.field_of_study}`
                    : item.major,
                  period: item.period,
                  description: item.activities
                    ? `${item.description || ""} ${item.activities}`.trim()
                    : item.description || "",
                  logoUrl: item.logo_url || "",
                  documentUrl: item.document_url || "",
                };
              })
            : fallbackEducation,
          volunteers: volunteerRes.data?.length
            ? volunteerRes.data.map((row) => {
                const item = row as typeof row & {
                  duration_months?: number | null;
                  cause?: string | null;
                  image_url?: string | null;
                  document_url?: string | null;
                };
                return {
                  name: item.name,
                  role: item.role,
                  year: item.duration_months
                    ? `${item.year} (${item.duration_months} bulan)`
                    : item.year,
                  category: item.category || item.cause || "Organization",
                  description: item.description || "",
                  imageUrl: item.image_url || "",
                  documentUrl: item.document_url || "",
                };
              })
            : fallbackVolunteers,
          projects: projectRes.data?.length
            ? projectRes.data.map((row) => {
                const item = row as typeof row & {
                  thumbnail_url?: string | null;
                  demo_url?: string | null;
                  github_url?: string | null;
                  documentation_url?: string | null;
                };
                return {
                  name: item.title,
                  category: item.category,
                  year: item.year,
                  stack: item.tech_stack?.length ? item.tech_stack : ["Portfolio"],
                  description: item.description || "",
                  thumbnailUrl: item.thumbnail_url || "",
                  demoUrl: item.demo_url || "",
                  githubUrl: item.github_url || "",
                  documentationUrl: item.documentation_url || "",
                };
              })
            : fallbackProjects,
          skills: Object.keys(dynamicSkills).length ? dynamicSkills : fallbackSkills,
        });
      } catch (error) {
        console.warn("[portfolio] using fallback content", error);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <PortfolioContentContext.Provider value={content}>{children}</PortfolioContentContext.Provider>
  );
}

function Index() {
  useLiquidGlassEffects();

  return (
    <PortfolioContentProvider>
      <div className="liquid-app relative min-h-screen overflow-hidden">
        <LoadingScreen />
        <CustomCursor />
        <svg aria-hidden="true" className="pointer-events-none fixed size-0">
          <filter id="liquid-distortion">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.024"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="2"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </svg>
        <img
          src={cyberSecurityBg}
          alt=""
          aria-hidden
          className="liquid-background-image fixed inset-0 z-0 h-screen w-screen object-cover opacity-20"
        />
        <MonoMatrixBg className="opacity-[0.045]" />
        <div className="liquid-light-field liquid-light-field--one" />
        <div className="liquid-light-field liquid-light-field--two" />
        <div className="liquid-light-field liquid-light-field--three" />
        <div className="liquid-caustics" />
        <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_bottom,rgba(5,5,8,0.1),rgba(5,5,8,0.72))]" />
        <div className="fixed inset-0 z-0 scanlines pointer-events-none opacity-10" />
        <Navbar />
        <main className="relative z-10">
          <Hero />
          <Lanyard />
          <About />
          <Experience />
          <Certification />
          <Education />
          <Volunteer />
          <Projects />
          <Skills />
          <Contact />
          <Footer />
        </main>
        <BackToTop />
      </div>
    </PortfolioContentProvider>
  );
}

function useLiquidGlassEffects() {
  useEffect(() => {
    let ticking = false;

    const syncScroll = () => {
      document.documentElement.style.setProperty("--liquid-scroll", `${window.scrollY}px`);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(syncScroll);
        ticking = true;
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const target = (event.target as HTMLElement | null)?.closest?.(
        ".glass",
      ) as HTMLElement | null;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      target.style.setProperty("--shine-x", `${Math.max(0, Math.min(100, x))}%`);
      target.style.setProperty("--shine-y", `${Math.max(0, Math.min(100, y))}%`);
      target.style.setProperty("--shine-shift", `${(x - 50) * 0.08}px`);
    };

    syncScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  useEffect(() => {
    const revealItems = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".glass, .glass-badge, .skill-pill, .section-caption, .section-heading",
      ),
    );

    revealItems.forEach((item) => item.classList.add("reveal-on-scroll"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          element.classList.add("is-visible");
          Array.from(element.parentElement?.children || []).forEach((child, index) => {
            if (child instanceof HTMLElement && child.classList.contains("reveal-on-scroll")) {
              child.style.transitionDelay = `${index * 75}ms`;
            }
          });
          observer.unobserve(element);
        });
      },
      { threshold: 0.18 },
    );

    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);
}

function LoadingScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    document.body.classList.add("is-loading");
    const hide = () => {
      setVisible(false);
      document.body.classList.remove("is-loading");
    };
    const timer = window.setTimeout(hide, 1800);
    window.addEventListener("load", hide, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", hide);
      document.body.classList.remove("is-loading");
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="page-loader">
      <div className="page-loader__inner">
        <div className="page-loader__monogram">JS</div>
        <div className="page-loader__track">
          <span />
        </div>
        <div className="page-loader__text">loading portfolio...</div>
      </div>
    </div>
  );
}

function CustomCursor() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const ring = document.createElement("div");
    const dot = document.createElement("div");
    ring.className = "custom-cursor-ring";
    dot.className = "custom-cursor-dot";
    document.body.append(ring, dot);

    let x = 0;
    let y = 0;
    let raf = 0;

    const update = () => {
      ring.style.transform = `translate3d(${x - 14}px, ${y - 14}px, 0)`;
      dot.style.transform = `translate3d(${x - 3}px, ${y - 3}px, 0)`;
      raf = 0;
    };

    const onMove = (event: MouseEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    const onOver = (event: MouseEvent) => {
      const clickable = (event.target as HTMLElement | null)?.closest?.(
        "a, button, [role='button']",
      );
      ring.classList.toggle("is-hovering", Boolean(clickable));
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      if (raf) window.cancelAnimationFrame(raf);
      ring.remove();
      dot.remove();
    };
  }, []);

  return null;
}

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`back-to-top ${visible ? "is-visible" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
    >
      <ChevronUp className="size-5" />
    </button>
  );
}

/* ---------- HERO ---------- */
function Hero() {
  const { profile } = usePortfolioContent();
  const [cvOpen, setCvOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yPhoto = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const yText = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section id="home" ref={ref} className="relative min-h-screen flex items-center pt-28 pb-16">
      <div className="hero-particle hero-particle--1" />
      <div className="hero-particle hero-particle--2" />
      <div className="hero-particle hero-particle--3" />
      <div className="hero-particle hero-particle--4" />
      <div className="hero-particle hero-particle--5" />
      <motion.div
        style={{ opacity }}
        className="relative mx-auto max-w-6xl px-4 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center"
      >
        <motion.div style={{ y: yText }} className="liquid-hero-copy glass space-y-6">
          <div className="font-mono text-xs text-muted-foreground flex items-center gap-2">
            <span
              className="size-2 rounded-full bg-foreground animate-pulse"
              style={{ boxShadow: "0 0 10px var(--foreground)" }}
            />
            system.online — portfolio.v1.0.0
          </div>

          <h1 className="max-w-[920px]" aria-label="JAY SZRS">
            <NeonWordmark size="hero" />
          </h1>

          <p className="text-muted-foreground text-sm md:text-base font-mono">{profile.role}</p>

          <div className="font-mono text-base md:text-lg min-h-[1.5em]">
            <span className="text-neon">&gt; </span>
            <Typewriter words={profile.typing} />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="#projects"
              className="liquid-button liquid-button-primary group inline-flex items-center gap-2 px-5 py-3 font-mono text-sm font-semibold rounded-full"
            >
              Explore Portfolio
              <ArrowRight className="size-4 group-hover:translate-x-1 transition" />
            </a>
            <a
              href="#contact"
              className="liquid-button inline-flex items-center gap-2 px-5 py-3 glass border border-neon/40 text-neon font-mono text-sm rounded-full"
            >
              <Mail className="size-4" /> Contact Me
            </a>
            <button
              className="liquid-button inline-flex items-center gap-2 px-5 py-3 font-mono text-sm text-muted-foreground hover:text-neon transition"
              onClick={() => setCvOpen(true)}
            >
              <Download className="size-4" /> CV
            </button>
          </div>

          <TerminalBox title="jay@szrs:~">
            <Prompt>
              <span className="text-neon">whoami</span>
            </Prompt>
            <p className="pl-4 text-foreground/80 mt-1">
              Jay SZRS — Informatics student, designer, content creator, and IT enthusiast.
            </p>
            <Prompt>
              <span className="text-neon">status</span>
            </Prompt>
            <p className="pl-4 text-foreground/80 mt-1">
              Available for collaboration, internship, freelance, and creative tech projects.
            </p>
            <div className="flex gap-2 pt-2">
              <span className="text-neon">$</span>
              <span className="terminal-cursor"></span>
            </div>
          </TerminalBox>
        </motion.div>

        <motion.div style={{ y: yPhoto }} className="relative mx-auto w-full max-w-sm">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-neon/30 via-transparent to-lime/20 blur-2xl" />
          <div className="relative glass rounded-2xl p-3 border border-neon/40">
            <div className="glass-badge absolute -top-3 left-4 px-2 py-0.5 border border-neon/50 rounded-full font-mono text-[10px] text-neon">
              ./profile.jpg
            </div>
            <div className="glass-badge absolute -bottom-3 right-4 px-2 py-0.5 border border-neon/50 rounded-full font-mono text-[10px] text-neon">
              200×250 · 1:1.25
            </div>
            <img
              src={jayPhoto}
              alt="JAY SZRS portrait"
              width={832}
              height={1024}
              className="w-full h-auto rounded-xl object-cover"
            />
            <div className="absolute inset-3 rounded-xl ring-1 ring-inset ring-neon/30 pointer-events-none" />
          </div>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs text-muted-foreground flex flex-col items-center gap-2">
        <span>scroll</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-neon"
        >
          ▼
        </motion.span>
      </div>
      <CvPreviewModal open={cvOpen} onOpenChange={setCvOpen} />
    </section>
  );
}

function CvPreviewModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  // TODO: Replace CV_PDF_URL with your hosted PDF link.
  // Options: Google Drive (share -> "Anyone with link" -> copy direct link), Dropbox, or any public HTTPS URL.
  // Google Drive format: https://drive.google.com/uc?export=download&id=FILE_ID
  const CV_PDF_URL = "https://drive.google.com/uc?export=download&id=FILE_ID";
  const hasHostedCv = CV_PDF_URL.startsWith("https://") && !CV_PDF_URL.includes("FILE_ID");
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(CV_PDF_URL)}&embedded=true`;

  const close = useCallback(() => {
    setClosing(true);
    window.setTimeout(() => onOpenChange(false), 250);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) return;
    setClosing(false);
    setLoading(hasHostedCv);
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [close, hasHostedCv, open]);

  if (!open) return null;

  return (
    <div className={`cv-overlay ${closing ? "is-closing" : ""}`} onMouseDown={close}>
      <div className="cv-modal glass" onMouseDown={(event) => event.stopPropagation()}>
        <div className="cv-modal__header">
          <h3>Curriculum Vitae</h3>
          <button type="button" onClick={close} aria-label="Close CV preview">
            ×
          </button>
        </div>
        <div className="cv-frame-wrap">
          {hasHostedCv ? (
            <>
              {loading && <div className="cv-skeleton" />}
              <iframe
                src={viewerUrl}
                width="100%"
                height="68vh"
                style={{ border: "none", borderRadius: 14, background: "rgba(0,0,0,0.30)" }}
                title="Jay SZRS - Curriculum Vitae"
                onLoad={() => setLoading(false)}
              />
            </>
          ) : (
            <article className="cv-live-preview" aria-label="Jay SZRS CV preview">
              <header>
                <div>
                  <p>Curriculum Vitae</p>
                  <h4>Jay SZRS</h4>
                  <span>Creative Technologist / Informatics Student</span>
                </div>
                <div className="cv-live-preview__mark">JS</div>
              </header>
              <section>
                <h5>Profile</h5>
                <p>
                  Informatics Engineering student focused on UI/UX, web development, graphic design,
                  video editing, content creation, networking, programming, and cyber security
                  basics.
                </p>
              </section>
              <div className="cv-live-preview__grid">
                <section>
                  <h5>Education</h5>
                  <strong>Universitas Bani Saleh</strong>
                  <p>Informatics Engineering / 2023 - Present</p>
                  <strong>SMAN 71 Jakarta</strong>
                  <p>IPA - Ilmu Pengetahuan Alam / 2020 - 2023</p>
                </section>
                <section>
                  <h5>Contact</h5>
                  <p>Indonesia</p>
                  <p>github.com/Jayszrs</p>
                  <p>linkedin.com/in/jayszrs</p>
                  <p>jaelanisuryasaputra@gmail.com</p>
                </section>
              </div>
              <section>
                <h5>Skills</h5>
                <div className="cv-live-preview__skills">
                  {[
                    "HTML",
                    "CSS",
                    "JavaScript",
                    "React.js",
                    "PHP",
                    "MySQL",
                    "Java",
                    "Figma",
                    "Photoshop",
                    "Networking",
                  ].map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </section>
            </article>
          )}
        </div>
        <div className="cv-modal__footer">
          {hasHostedCv && (
            <a
              href={CV_PDF_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="liquid-button liquid-button-primary"
            >
              Open PDF
            </a>
          )}
          <button type="button" onClick={close} className="liquid-button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function SocialIcon({ type }: { type: "github" | "instagram" | "linkedin" }) {
  if (type === "github") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    );
  }
  if (type === "instagram") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function showPageToast(message: string, variant: "success" | "error" | "info" = "info") {
  const container =
    document.querySelector(".global-toast-container") ||
    (() => {
      const node = document.createElement("div");
      node.className = "global-toast-container toast-container";
      document.body.appendChild(node);
      return node;
    })();
  const toast = document.createElement("div");
  toast.className = `toast toast--${variant}`;
  toast.textContent = message;
  container.appendChild(toast);
  window.setTimeout(() => {
    toast.classList.add("toast--exit");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  }, 3500);
}

/* ---------- LANYARD ---------- */
function Lanyard() {
  return (
    <Section
      id="lanyard"
      command="display.lanyard()"
      title="Digital Credential"
      description="Your personalized ID badge & digital credential"
    >
      <LanyardDisplay />
    </Section>
  );
}

/* ---------- ABOUT ---------- */
function About() {
  const { stats } = usePortfolioContent();
  return (
    <Section
      id="about"
      command="cat about.md"
      title="about"
      description="Personal information block."
    >
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl p-6 md:p-8 relative noise overflow-hidden">
          <div className="font-mono text-xs text-neon mb-4">// bio</div>
          <p className="text-lg leading-relaxed text-foreground/90">
            Hi, I'm <span className="text-neon glow-text font-semibold">Jay SZRS</span>. I'm an
            Informatics Engineering student with strong interest in technology, UI/UX design,
            graphic design, video editing, content creation, networking, programming, and cyber
            security basics.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            I enjoy building digital products, creating visual content, designing user interfaces,
            and learning how technology can solve real problems.
          </p>

          <div className="mt-8 grid sm:grid-cols-2 gap-3 font-mono text-sm">
            {[
              { k: "name", v: "Jay SZRS", icon: Sparkles },
              { k: "field", v: "Informatics Engineering", icon: GraduationCap },
              { k: "location", v: "Indonesia", icon: MapPin },
              { k: "status", v: "Open for opportunities", icon: CheckCircle2 },
            ].map((it) => (
              <div
                key={it.k}
                className="glass-badge flex items-center gap-3 px-4 py-3 rounded-full border border-border"
              >
                <it.icon className="size-4 text-neon shrink-0" />
                <span className="text-muted-foreground">{it.k}:</span>
                <span className="text-foreground">{it.v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-xl p-5 flex items-center justify-between hover:border-neon/60 transition"
            >
              <div>
                <div className="font-mono text-xs text-muted-foreground">
                  ./{s.label.toLowerCase()}
                </div>
                <div className="text-3xl font-display font-bold text-neon glow-text">
                  {s.value}+
                </div>
              </div>
              <div className="size-10 rounded-lg bg-neon/10 border border-neon/30 flex items-center justify-center">
                <Sparkles className="size-5 text-neon" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ---------- EXPERIENCE ---------- */
function Experience() {
  const { experiences } = usePortfolioContent();
  const [open, setOpen] = useState<number | null>(null);
  const active = open !== null ? experiences[open] : null;

  return (
    <Section
      id="experience"
      command="ls -la experience/"
      title="experience"
      description="Timeline of roles, projects, and contributions."
    >
      <div className="relative">
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-neon/60 to-transparent" />
        <div className="space-y-10">
          {experiences.map((e, i) => (
            <motion.button
              type="button"
              onClick={() => setOpen(i)}
              key={i}
              initial={{ opacity: 0, x: i % 2 ? 40 : -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              className={`relative md:grid md:grid-cols-2 md:gap-12 w-full text-left cursor-pointer ${i % 2 ? "md:[&>*:first-child]:col-start-2" : ""}`}
            >
              <div className={`pl-12 md:pl-0 w-full ${i % 2 ? "md:text-left" : "md:text-right"}`}>
                <div className="absolute left-2 md:left-1/2 top-3 -translate-x-1/2 size-4 rounded-full bg-neon glow-neon" />
                <div className="glass rounded-xl p-5 hover:border-neon/60 transition group w-full">
                  <div
                    className={`flex items-center gap-2 font-mono text-xs text-neon ${i % 2 ? "justify-start" : "md:justify-end"}`}
                  >
                    <Calendar className="size-3" /> {e.date}
                    <span
                      className={`glass-badge px-2 py-0.5 rounded-full text-[10px] ${e.status === "Active" ? "text-neon border border-neon/40" : "text-muted-foreground"} ${i % 2 ? "ml-auto md:ml-0" : "ml-auto md:ml-2"}`}
                    >
                      {e.status}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">{e.title}</h3>
                  <div className="text-sm text-neon/90 font-mono">@ {e.company}</div>
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{e.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <DetailDialog
        open={active !== null}
        onOpenChange={(v) => !v && setOpen(null)}
        title={active?.title ?? ""}
        subtitle={active ? `@ ${active.company} · ${active.date}` : ""}
      >
        {active && (
          <div className="space-y-4">
            {active.imageUrl && (
              <div className="w-full rounded-xl overflow-hidden glass p-2 max-h-[300px] flex items-center justify-center">
                <img
                  src={active.imageUrl}
                  alt={active.title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
            <p>{active.description}</p>
            {active.institution === "SMAN 71 Jakarta" && (
              <div className="flex flex-wrap gap-2">
                {["Science", "Jakarta", "2020-2023"].map((tag) => (
                  <span key={tag} className="glass-badge px-2.5 py-1 text-[10px] font-mono">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="glass rounded-md p-3">
                <div className="text-muted-foreground">company</div>
                <div>{active.company}</div>
              </div>
              <div className="glass rounded-md p-3">
                <div className="text-muted-foreground">status</div>
                <div>{active.status}</div>
              </div>
            </div>
            {active.documentUrl && (
              <div className="flex justify-center mt-4">
                <a
                  href={active.documentUrl}
                  target="_blank"
                  rel="noopener"
                  className="liquid-button inline-flex items-center gap-2 px-4 py-2 glass border border-neon/40 text-neon font-mono text-xs rounded-full hover:opacity-90 transition"
                >
                  <Download className="size-4" /> View / Download Document
                </a>
              </div>
            )}
          </div>
        )}
      </DetailDialog>
    </Section>
  );
}

/* ---------- CERTIFICATION ---------- */
function CertificationLogo({ issuer, title }: { issuer: string; title: string }) {
  const normalized = `${issuer} ${title}`.toLowerCase();
  const logo = normalized.includes("dicoding")
    ? "https://www.dicoding.com/images/marketing/dicoding_logo.png"
    : normalized.includes("cisco")
      ? "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Cisco_logo_blue_2016.svg/320px-Cisco_logo_blue_2016.svg.png"
      : normalized.includes("coursera")
        ? "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Coursera-Logo_600x600.svg/320px-Coursera-Logo_600x600.svg.png"
        : normalized.includes("skillshare")
          ? "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Skillshare_logo.svg/320px-Skillshare_logo.svg.png"
          : "";

  if (!logo) {
    return (
      <svg
        className="cert-logo cert-logo--svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#FF4500"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M8 21h8M12 17v4M17 3H7l1 7a4 4 0 0 0 8 0l1-7z" />
        <path d="M5 3H3v4a3 3 0 0 0 3 3M19 3h2v4a3 3 0 0 1-3 3" />
      </svg>
    );
  }

  return <img src={logo} alt={`${issuer} logo`} className="cert-logo" loading="lazy" />;
}

function Certification() {
  const { certifications } = usePortfolioContent();
  const [open, setOpen] = useState<number | null>(null);
  const active = open !== null ? certifications[open] : null;
  return (
    <Section
      id="certification"
      command="find certs/ -type f"
      title="certification & badges"
      description="Verified credentials and achievements."
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {certifications.map((c, i) => (
          <motion.button
            type="button"
            onClick={() => setOpen(i)}
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="group relative glass rounded-xl p-5 text-left hover:border-neon/60 hover:-translate-y-1 transition-all"
          >
            <CertificationLogo issuer={c.issuer} title={c.title} />
            <div className="flex items-start justify-between">
              <div className="size-12 rounded-lg bg-foreground/10 border border-foreground/40 flex items-center justify-center overflow-hidden">
                {c.badgeUrl ? (
                  <img src={c.badgeUrl} alt={c.title} className="w-full h-full object-cover" />
                ) : (
                  <Award className="size-6 text-neon" />
                )}
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-border text-muted-foreground">
                {c.category}
              </span>
            </div>
            <h3 className="mt-4 font-semibold text-foreground leading-snug">{c.title}</h3>
            <div className="mt-1 text-sm text-muted-foreground font-mono">
              {c.issuer} · {c.year}
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-mono text-neon opacity-0 group-hover:opacity-100 transition">
              view <ExternalLink className="size-3" />
            </span>
          </motion.button>
        ))}
      </div>

      <DetailDialog
        open={active !== null}
        onOpenChange={(v) => !v && setOpen(null)}
        title={active?.title ?? ""}
        subtitle={active ? `${active.issuer} · ${active.year} · ${active.category}` : ""}
      >
        {active && (
          <div className="space-y-4">
            {active.badgeUrl && (
              <div className="w-full max-w-[200px] aspect-square rounded-xl overflow-hidden glass p-2 mx-auto">
                <img
                  src={active.badgeUrl}
                  alt={active.title}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <p>
              Sertifikasi <span className="text-neon">{active.title}</span> diterbitkan oleh{" "}
              <span className="text-foreground">{active.issuer}</span> pada tahun {active.year}.
            </p>
            {active.description && <p>{active.description}</p>}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="glass rounded-md p-3">
                <div className="text-muted-foreground">issuer</div>
                <div>{active.issuer}</div>
              </div>
              <div className="glass rounded-md p-3">
                <div className="text-muted-foreground">year</div>
                <div>{active.year}</div>
              </div>
              {active.credentialId && (
                <div className="glass rounded-md p-3 col-span-2">
                  <div className="text-muted-foreground">credential</div>
                  <div>{active.credentialId}</div>
                </div>
              )}
              <div className="glass rounded-md p-3 col-span-2">
                <div className="text-muted-foreground">category</div>
                <div>{active.category}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {active.verificationUrl && (
                <a
                  href={active.verificationUrl}
                  target="_blank"
                  rel="noopener"
                  className="liquid-button liquid-button-primary inline-flex items-center gap-2 px-4 py-2 font-mono text-xs rounded-full hover:opacity-90"
                >
                  <ExternalLink className="size-3" /> Verify Certificate
                </a>
              )}
              {active.certificateUrl && (
                <a
                  href={active.certificateUrl}
                  target="_blank"
                  rel="noopener"
                  className="liquid-button inline-flex items-center gap-2 px-4 py-2 glass border border-neon/40 text-neon font-mono text-xs rounded-full hover:bg-neon hover:text-black transition"
                >
                  <Download className="size-3" /> View / Download Document
                </a>
              )}
            </div>
          </div>
        )}
      </DetailDialog>
    </Section>
  );
}

/* ---------- EDUCATION ---------- */
function Education() {
  const { education } = usePortfolioContent();
  const smanEducation = {
    institution: "SMAN 71 Jakarta",
    major: "IPA - Ilmu Pengetahuan Alam (Science)",
    period: "2020 - 2023",
    description:
      "Focused on sciences with active participation in school's IT club and creative media extracurricular. Built early foundation in digital design, photography, and technology.",
    logoUrl: "",
    documentUrl: "",
  };
  const displayEducation = education.map((ed, index) => (index === 1 ? smanEducation : ed));
  const [open, setOpen] = useState<number | null>(null);
  const active = open !== null ? displayEducation[open] : null;
  return (
    <Section
      id="education"
      command="cat education.json"
      title="education"
      description="Academic journey & focus areas."
    >
      <div className="space-y-4">
        {displayEducation.map((ed, i) => (
          <motion.button
            type="button"
            onClick={() => setOpen(i)}
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full text-left glass rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 hover:border-neon/60 transition overflow-hidden"
          >
            <div className="size-16 rounded-xl bg-foreground/10 border border-foreground/40 flex items-center justify-center shrink-0 overflow-hidden">
              {ed.logoUrl ? (
                <img src={ed.logoUrl} alt={ed.institution} className="w-full h-full object-cover" />
              ) : (
                <GraduationCap className="size-8 text-neon" />
              )}
            </div>
            <div className="flex-1">
              <div className="font-mono text-xs text-neon">{ed.period}</div>
              <h3 className="mt-1 text-xl font-semibold">{ed.institution}</h3>
              <div className="text-sm text-muted-foreground font-mono">{ed.major}</div>
              <p className="mt-3 text-foreground/80 line-clamp-2">{ed.description}</p>
              {i === 1 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Science", "Jakarta", "2020-2023"].map((tag) => (
                    <span key={tag} className="glass-badge px-2.5 py-1 text-[10px] font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      <DetailDialog
        open={active !== null}
        onOpenChange={(v) => !v && setOpen(null)}
        title={active?.institution ?? ""}
        subtitle={active ? `${active.major} · ${active.period}` : ""}
      >
        {active && (
          <div className="space-y-4">
            {active.logoUrl && (
              <div className="w-full max-w-[200px] aspect-square rounded-xl overflow-hidden glass p-2 mx-auto">
                <img
                  src={active.logoUrl}
                  alt={active.institution}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <p>{active.description}</p>
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="glass rounded-md p-3">
                <div className="text-muted-foreground">period</div>
                <div>{active.period}</div>
              </div>
              <div className="glass rounded-md p-3">
                <div className="text-muted-foreground">major</div>
                <div>{active.major}</div>
              </div>
            </div>
            {active.documentUrl && (
              <div className="flex justify-center mt-4">
                <a
                  href={active.documentUrl}
                  target="_blank"
                  rel="noopener"
                  className="liquid-button inline-flex items-center gap-2 px-4 py-2 glass border border-neon/40 text-neon font-mono text-xs rounded-full hover:opacity-90 transition"
                >
                  <Download className="size-4" /> View / Download Document
                </a>
              </div>
            )}
          </div>
        )}
      </DetailDialog>
    </Section>
  );
}

/* ---------- VOLUNTEER ---------- */
function Volunteer() {
  const { volunteers } = usePortfolioContent();
  const [open, setOpen] = useState<number | null>(null);
  const active = open !== null ? volunteers[open] : null;
  return (
    <Section
      id="volunteer"
      command="ls volunteer/"
      title="volunteer & organization"
      description="Communities, events, and roles."
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {volunteers.map((v, i) => (
          <motion.button
            type="button"
            onClick={() => setOpen(i)}
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className="text-left glass rounded-xl overflow-hidden hover:border-neon/60 transition group flex flex-col h-full"
          >
            {v.imageUrl && (
              <div className="w-full h-32 overflow-hidden border-b border-border/50 shrink-0 bg-black/20">
                <img
                  src={v.imageUrl}
                  alt={v.name}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition duration-500"
                />
              </div>
            )}
            <div className="p-5 flex-1 flex flex-col">
              <Heart
                className={`size-5 text-neon mb-3 group-hover:scale-110 transition ${v.imageUrl ? "hidden" : ""}`}
              />
              <div className="font-mono text-[10px] text-muted-foreground">
                {v.category} · {v.year}
              </div>
              <h3 className="mt-1 font-semibold text-foreground">{v.name}</h3>
              <div className="text-sm text-neon/90 font-mono mt-auto pt-2">{v.role}</div>
            </div>
          </motion.button>
        ))}
      </div>

      <DetailDialog
        open={active !== null}
        onOpenChange={(v) => !v && setOpen(null)}
        title={active?.name ?? ""}
        subtitle={active ? `${active.role} · ${active.year}` : ""}
      >
        {active && (
          <div className="space-y-4">
            {active.imageUrl && (
              <div className="w-full rounded-xl overflow-hidden glass p-2 max-h-[300px] flex items-center justify-center">
                <img
                  src={active.imageUrl}
                  alt={active.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
            <p>
              Berkontribusi sebagai <span className="text-neon">{active.role}</span> dalam kegiatan{" "}
              <span className="text-foreground">{active.name}</span> ({active.category},{" "}
              {active.year}).
            </p>
            {active.description && <p>{active.description}</p>}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="glass rounded-md p-3">
                <div className="text-muted-foreground">role</div>
                <div>{active.role}</div>
              </div>
              <div className="glass rounded-md p-3">
                <div className="text-muted-foreground">category</div>
                <div>{active.category}</div>
              </div>
            </div>
            {active.documentUrl && (
              <div className="flex justify-center mt-4">
                <a
                  href={active.documentUrl}
                  target="_blank"
                  rel="noopener"
                  className="liquid-button inline-flex items-center gap-2 px-4 py-2 glass border border-neon/40 text-neon font-mono text-xs rounded-full hover:opacity-90 transition"
                >
                  <Download className="size-4" /> View / Download Document
                </a>
              </div>
            )}
          </div>
        )}
      </DetailDialog>
    </Section>
  );
}

/* ---------- PROJECTS ---------- */
function Projects() {
  const { projects } = usePortfolioContent();
  const [open, setOpen] = useState<number | null>(null);
  const active = open !== null ? projects[open] : null;
  return (
    <Section
      id="projects"
      command="tree projects/"
      title="projects"
      description="Selected works across design, code, and content."
    >
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border font-mono text-xs text-muted-foreground flex items-center gap-2">
          <Folder className="size-3.5 text-neon" /> /home/jay/projects
        </div>
        <div className="divide-y divide-border">
          {projects.map((p, i) => (
            <motion.button
              type="button"
              onClick={() => setOpen(i)}
              key={p.name}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="group w-full text-left grid md:grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4 hover:bg-foreground/5 transition cursor-pointer"
            >
              <div className="flex items-center gap-3 font-mono text-sm">
                <span className="text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                {p.thumbnailUrl ? (
                  <div className="size-8 rounded overflow-hidden shrink-0">
                    <img src={p.thumbnailUrl} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <FileCode className="size-4 text-neon mx-2" />
                )}
                <span className="text-foreground group-hover:text-neon transition">{p.name}</span>
              </div>
              <div className="text-sm text-muted-foreground md:pl-8 line-clamp-1">
                {p.description}
              </div>
              <div className="flex items-center gap-2">
                {p.stack.slice(0, 2).map((s) => (
                  <span
                    key={s}
                    className="glass-badge font-mono text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground"
                  >
                    {s}
                  </span>
                ))}
                <span className="font-mono text-[10px] text-neon">{p.year}</span>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-neon group-hover:translate-x-1 transition" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <DetailDialog
        open={active !== null}
        onOpenChange={(v) => !v && setOpen(null)}
        title={active?.name ?? ""}
        subtitle={active ? `${active.category} · ${active.year}` : ""}
      >
        {active && (
          <div className="space-y-4">
            {active.thumbnailUrl && (
              <div className="w-full rounded-xl overflow-hidden glass p-2 max-h-[300px] flex items-center justify-center">
                <img
                  src={active.thumbnailUrl}
                  alt={active.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
            <p>{active.description}</p>
            <div className="space-y-2">
              <div className="font-mono text-xs text-muted-foreground">// stack</div>
              <div className="flex flex-wrap gap-2">
                {active.stack.map((s) => (
                  <span
                    key={s}
                    className="glass-badge font-mono text-[10px] px-2 py-1 rounded-full border border-border text-foreground/90"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 font-mono text-xs pt-1">
              <div className="glass rounded-md p-3">
                <div className="text-muted-foreground">category</div>
                <div>{active.category}</div>
              </div>
              <div className="glass rounded-md p-3">
                <div className="text-muted-foreground">year</div>
                <div>{active.year}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {active.demoUrl && (
                <a
                  href={active.demoUrl}
                  target="_blank"
                  rel="noopener"
                  className="liquid-button inline-flex items-center gap-2 px-4 py-2 glass border border-neon text-neon font-mono text-xs rounded-full hover:bg-neon hover:text-black transition"
                >
                  <ExternalLink className="size-4" /> Live Demo
                </a>
              )}
              {active.githubUrl && (
                <a
                  href={active.githubUrl}
                  target="_blank"
                  rel="noopener"
                  className="liquid-button inline-flex items-center gap-2 px-4 py-2 glass border border-foreground/40 text-foreground font-mono text-xs rounded-full hover:bg-foreground hover:text-black transition"
                >
                  <Github className="size-4" /> Repository
                </a>
              )}
              {active.documentationUrl && (
                <a
                  href={active.documentationUrl}
                  target="_blank"
                  rel="noopener"
                  className="liquid-button inline-flex items-center gap-2 px-4 py-2 glass border border-orange-500/40 text-orange-400 font-mono text-xs rounded-full hover:bg-orange-500 hover:text-black transition"
                >
                  <Download className="size-4" /> View Docs
                </a>
              )}
            </div>
          </div>
        )}
      </DetailDialog>
    </Section>
  );
}
function SkillIcon({ name }: { name: string }) {
  const deviconBase = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/";
  const normalized = name.toLowerCase();
  const devicons: Record<string, string> = {
    html: "html5/html5-original.svg",
    html5: "html5/html5-original.svg",
    css: "css3/css3-original.svg",
    css3: "css3/css3-original.svg",
    javascript: "javascript/javascript-original.svg",
    "react.js": "react/react-original.svg",
    react: "react/react-original.svg",
    php: "php/php-original.svg",
    mysql: "mysql/mysql-original.svg",
    java: "java/java-original.svg",
    "vs code": "vscode/vscode-original.svg",
    netbeans: "netbeans/netbeans-original.svg",
    figma: "figma/figma-original.svg",
    photoshop: "photoshop/photoshop-original.svg",
    illustrator: "illustrator/illustrator-plain.svg",
    "premiere pro": "premierepro/premierepro-original.svg",
    premiere: "premierepro/premierepro-original.svg",
    github: "github/github-original.svg",
    git: "git/git-original.svg",
  };
  const simpleIcons: Record<string, string> = {
    canva: "https://cdn.simpleicons.org/canva/FF4500",
    "cisco pt": "https://cdn.simpleicons.org/cisco/FF4500",
    cisco: "https://cdn.simpleicons.org/cisco/FF4500",
    tailwind: "https://cdn.simpleicons.org/tailwindcss/FF4500",
  };

  if (normalized === "capcut") {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        color="#FF6A00"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
    );
  }

  if (normalized.includes("networking") || normalized.includes("subnetting")) {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#FF6A00"
        strokeWidth="2"
        aria-hidden="true"
      >
        <rect x="2" y="2" width="6" height="6" rx="1" />
        <rect x="16" y="2" width="6" height="6" rx="1" />
        <rect x="9" y="16" width="6" height="6" rx="1" />
        <path d="M5 8v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" />
        <line x1="12" y1="12" x2="12" y2="16" />
      </svg>
    );
  }

  const src = devicons[normalized]
    ? `${deviconBase}${devicons[normalized]}`
    : simpleIcons[normalized];

  if (src) return <img src={src} alt="" loading="lazy" />;

  return <Sparkles className="size-[18px]" aria-hidden="true" />;
}

function Skills() {
  const { skills } = usePortfolioContent();
  return (
    <Section
      id="skills"
      command="cat skills/*.txt"
      title="skills"
      description="Stacks and tools I work with."
    >
      <div className="grid md:grid-cols-3 gap-4">
        {Object.entries(skills).map(([cat, items], idx) => (
          <motion.div
            key={cat}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="glass rounded-2xl p-5"
          >
            <div className="font-mono text-xs text-neon mb-4">// {cat.toLowerCase()}</div>
            <div className="flex flex-wrap gap-2">
              {items.map((s) => (
                <span
                  key={s}
                  className="skill-pill px-3 py-1.5 rounded-full text-xs font-mono border border-border text-foreground/90 hover:border-neon hover:text-neon transition cursor-default"
                >
                  <SkillIcon name={s} />
                  {s}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ---------- CONTACT ---------- */
function Contact() {
  const { profile } = usePortfolioContent();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const nextErrors: Record<string, string> = {};

    ["name", "email", "subject", "message"].forEach((field) => {
      if (!String(formData.get(field) || "").trim()) nextErrors[field] = "This field is required";
    });

    const email = String(formData.get("email") || "");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Please enter a valid email address";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      showPageToast("Failed to send. Try again.", "error");
      return;
    }

    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      form.reset();
      showPageToast("Message sent!", "success");
    }, 900);
  };

  return (
    <Section
      id="contact"
      command="./contact --jay"
      title="contact"
      description="Let's build something together."
    >
      <div className="grid lg:grid-cols-2 gap-6">
        <TerminalBox title="contact.sh" className="lg:row-span-2">
          <Prompt>
            <span className="text-neon">contact --jay</span>
          </Prompt>
          <div className="mt-3 space-y-2 pl-4 text-sm">
            <div>
              <span className="text-muted-foreground">Email:</span>{" "}
              <a href={`mailto:${profile.email}`} className="text-neon hover:underline">
                {profile.email}
              </a>
            </div>
            <div>
              <span className="text-muted-foreground">WhatsApp:</span>{" "}
              <a
                href={`https://wa.me/${profile.whatsapp}`}
                target="_blank"
                rel="noopener"
                className="text-neon hover:underline"
              >
                +{profile.whatsapp}
              </a>
            </div>
            <div>
              <span className="text-muted-foreground">Location:</span> {profile.location}
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>{" "}
              <span className="text-neon">{profile.status}</span>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href={`https://wa.me/${profile.whatsapp}`}
              target="_blank"
              rel="noopener"
              className="liquid-button liquid-button-primary inline-flex items-center gap-2 px-4 py-2 font-mono text-xs rounded-full"
            >
              <MessageCircle className="size-4" /> WhatsApp
            </a>
            <a
              href={`mailto:${profile.email}`}
              className="liquid-button inline-flex items-center gap-2 px-4 py-2 glass border border-neon/40 text-neon font-mono text-xs rounded-full"
            >
              <Mail className="size-4" /> Email
            </a>
          </div>
          <div className="mt-5 flex gap-3 text-muted-foreground">
            <a
              href="https://github.com/Jayszrs"
              target="_blank"
              rel="noopener noreferrer"
              className="glass social-glass inline-flex size-10 items-center justify-center hover:text-neon transition"
            >
              <SocialIcon type="github" />
            </a>
            <a
              href="https://www.linkedin.com/in/jayszrs/"
              target="_blank"
              rel="noopener noreferrer"
              className="glass social-glass inline-flex size-10 items-center justify-center hover:text-neon transition"
            >
              <SocialIcon type="linkedin" />
            </a>
            <a
              href="https://www.instagram.com/jayszrs/"
              target="_blank"
              rel="noopener noreferrer"
              className="glass social-glass inline-flex size-10 items-center justify-center hover:text-neon transition"
            >
              <SocialIcon type="instagram" />
            </a>
          </div>
        </TerminalBox>

        <form
          onSubmit={submit}
          noValidate
          className="glass rounded-2xl p-6 space-y-4 lg:col-start-2"
        >
          <div className="font-mono text-xs text-neon">// send.message</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="contact-field">
              <input name="name" placeholder="name" className={errors.name ? "is-error" : ""} />
              {errors.name && <span>{errors.name}</span>}
            </label>
            <label className="contact-field">
              <input
                name="email"
                type="email"
                placeholder="email"
                className={errors.email ? "is-error" : ""}
              />
              {errors.email && <span>{errors.email}</span>}
            </label>
          </div>
          <label className="contact-field">
            <input
              name="subject"
              placeholder="subject"
              className={`w-full ${errors.subject ? "is-error" : ""}`}
            />
            {errors.subject && <span>{errors.subject}</span>}
          </label>
          <label className="contact-field">
            <textarea
              name="message"
              rows={5}
              placeholder="message..."
              className={`w-full resize-none ${errors.message ? "is-error" : ""}`}
            />
            {errors.message && <span>{errors.message}</span>}
          </label>
          <button
            type="submit"
            disabled={sending}
            className="liquid-button liquid-button-primary w-full inline-flex items-center justify-center gap-2 px-5 py-3 font-mono text-sm font-semibold rounded-full"
          >
            {sending ? (
              <>
                <span className="form-spinner" /> Sending...
              </>
            ) : (
              <>
                transmit <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </Section>
  );
}

/* ---------- FOOTER ---------- */
function Footer() {
  return (
    <footer className="relative border-t border-border mt-20">
      <div className="footer-watermark">JAY SZRS</div>
      <div className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-2 gap-6 items-center font-mono text-xs">
        <div className="text-muted-foreground">
          © 2026 <span className="text-neon">Jay SZRS</span>. Built with passion, creativity, and
          technology.{" "}
          <button
            type="button"
            className="footer-admin-trigger"
            onClick={() => window.dispatchEvent(new Event("open-card-admin"))}
            aria-label="Open card editor"
          >
            ⚙
          </button>
        </div>
        <div className="md:text-right space-y-1 text-muted-foreground">
          <div>
            system.status: <span className="text-neon">online</span>
          </div>
          <div>
            portfolio.version: <span className="text-neon">1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
