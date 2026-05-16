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
    <section id="home" ref={ref} className="relative min-h-screen flex items-center pt-24 pb-16">
      <div className="hero-particle hero-particle--1" />
      <div className="hero-particle hero-particle--2" />
      <div className="hero-particle hero-particle--3" />
      <div className="hero-particle hero-particle--4" />
      <div className="hero-particle hero-particle--5" />
      <motion.div
        style={{ opacity }}
        className="relative w-full max-w-full px-6 md:pl-16 lg:pl-20 xl:pl-32 grid lg:grid-cols-[1.3fr_1fr] gap-12 items-center"
      >
        <motion.div style={{ y: yText }} className="liquid-hero-copy glass space-y-6 w-full">
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