import { createFileRoute } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { createContext, useContext, useEffect, useRef, useState } from "react";
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
} from "lucide-react";

import jayPhoto from "@/assets/jay-profile.jpg";
import { Navbar } from "@/components/portfolio/Navbar";
import { TerminalBox, Prompt } from "@/components/portfolio/TerminalBox";
import { Section } from "@/components/portfolio/Section";
import { Typewriter } from "@/components/portfolio/Typewriter";
import { MonoMatrixBg } from "@/components/portfolio/MonoMatrixBg";
import { GlitchTitle } from "@/components/portfolio/GlitchTitle";
import { DetailDialog } from "@/components/portfolio/DetailDialog";
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
                name: profileRow.branding_name,
                fullName: profileRow.full_name,
                role: profileRow.subtitle,
                email: fallbackProfile.email,
                whatsapp: fallbackProfile.whatsapp,
                location: profileRow.location,
                status: profileRow.availability,
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
            ? experienceRes.data.map((item) => ({
                title: item.title,
                company: item.company,
                date: item.duration_months
                  ? `${item.date_range} (${item.duration_months} bulan)`
                  : item.date_range,
                status: item.status,
                description: item.description || "",
                category: item.category || item.employment_type || "Work",
              }))
            : fallbackExperiences,
          certifications: certificationRes.data?.length
            ? certificationRes.data.map((item) => ({
                title: item.title,
                issuer: item.issuer,
                year: item.year,
                category: item.category || "Certificate",
                credentialId: item.credential_id || "",
                certificateUrl: item.certificate_url || "",
                badgeUrl: item.badge_url || "",
                verificationUrl: item.verification_url || "",
                description: item.description || "",
              }))
            : fallbackCertifications,
          education: educationRes.data?.length
            ? educationRes.data.map((item) => ({
                institution: item.institution,
                major: item.field_of_study ? `${item.major} - ${item.field_of_study}` : item.major,
                period: item.period,
                description: item.activities
                  ? `${item.description || ""} ${item.activities}`.trim()
                  : item.description || "",
              }))
            : fallbackEducation,
          volunteers: volunteerRes.data?.length
            ? volunteerRes.data.map((item) => ({
                name: item.name,
                role: item.role,
                year: item.duration_months
                  ? `${item.year} (${item.duration_months} bulan)`
                  : item.year,
                category: item.category || item.cause || "Organization",
                description: item.description || "",
              }))
            : fallbackVolunteers,
          projects: projectRes.data?.length
            ? projectRes.data.map((item) => ({
                name: item.title,
                category: item.category,
                year: item.year,
                stack: item.tech_stack?.length ? item.tech_stack : ["Portfolio"],
                description: item.description || "",
              }))
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
  return (
    <PortfolioContentProvider>
      <div className="relative min-h-screen overflow-hidden">
        <Navbar />
        <Hero />
        <About />
        <Experience />
        <Certification />
        <Education />
        <Volunteer />
        <Projects />
        <Skills />
        <Contact />
        <Footer />
      </div>
    </PortfolioContentProvider>
  );
}

/* ---------- HERO ---------- */
function Hero() {
  const { profile } = usePortfolioContent();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yPhoto = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const yText = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section id="home" ref={ref} className="relative min-h-screen flex items-center pt-28 pb-16">
      <MonoMatrixBg />
      <div className="absolute inset-0 scanlines pointer-events-none opacity-20" />

      <motion.div
        style={{ opacity }}
        className="relative mx-auto max-w-6xl px-4 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center"
      >
        <motion.div style={{ y: yText }} className="space-y-6">
          <div className="font-mono text-xs text-muted-foreground flex items-center gap-2">
            <span
              className="size-2 rounded-full bg-foreground animate-pulse"
              style={{ boxShadow: "0 0 10px var(--foreground)" }}
            />
            system.online — portfolio.v1.0.0
          </div>

          <h1 className="font-display font-black tracking-tighter text-6xl md:text-8xl lg:text-9xl leading-[0.85]">
            <span className="block">
              <GlitchTitle text="JAY" />
            </span>
            <span className="block">
              <GlitchTitle text="SZRS" />
              <span className="text-muted-foreground">.</span>
            </span>
          </h1>

          <p className="text-muted-foreground text-sm md:text-base font-mono">{profile.role}</p>

          <div className="font-mono text-base md:text-lg min-h-[1.5em]">
            <span className="text-neon">&gt; </span>
            <Typewriter words={profile.typing} />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="#projects"
              className="group inline-flex items-center gap-2 px-5 py-3 bg-neon text-primary-foreground font-mono text-sm font-semibold rounded-md glow-neon hover:scale-105 transition"
            >
              Explore Portfolio
              <ArrowRight className="size-4 group-hover:translate-x-1 transition" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-5 py-3 glass border border-neon/40 text-neon font-mono text-sm rounded-md hover:bg-neon/10 transition"
            >
              <Mail className="size-4" /> Contact Me
            </a>
            <button
              className="inline-flex items-center gap-2 px-5 py-3 font-mono text-sm text-muted-foreground hover:text-neon transition"
              onClick={() => alert("CV upload tersedia di /admin (next iteration)")}
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
            <div className="absolute -top-3 left-4 px-2 py-0.5 bg-background border border-neon/50 rounded font-mono text-[10px] text-neon">
              ./profile.jpg
            </div>
            <div className="absolute -bottom-3 right-4 px-2 py-0.5 bg-background border border-neon/50 rounded font-mono text-[10px] text-neon">
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
    </section>
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
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-surface/60 border border-border"
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
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 ? 40 : -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              className={`relative md:grid md:grid-cols-2 md:gap-12 ${i % 2 ? "md:[&>*:first-child]:col-start-2" : ""}`}
            >
              <div className={`pl-12 md:pl-0 ${i % 2 ? "md:text-left" : "md:text-right"}`}>
                <div className="absolute left-2 md:left-1/2 top-3 -translate-x-1/2 size-4 rounded-full bg-neon glow-neon" />
                <div className="glass rounded-xl p-5 hover:border-neon/60 transition group">
                  <div className="flex items-center gap-2 font-mono text-xs text-neon">
                    <Calendar className="size-3" /> {e.date}
                    <span
                      className={`ml-auto px-2 py-0.5 rounded text-[10px] ${e.status === "Active" ? "bg-neon/20 text-neon border border-neon/40" : "bg-muted text-muted-foreground"}`}
                    >
                      {e.status}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">{e.title}</h3>
                  <div className="text-sm text-neon/90 font-mono">@ {e.company}</div>
                  <p className="mt-3 text-sm text-muted-foreground">{e.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ---------- CERTIFICATION ---------- */
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
            <div className="flex items-start justify-between">
              <div className="size-12 rounded-lg bg-foreground/10 border border-foreground/40 flex items-center justify-center">
                <Award className="size-6 text-neon" />
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
          <>
            <p>
              Sertifikasi <span className="text-neon">{active.title}</span> diterbitkan oleh{" "}
              <span className="text-foreground">{active.issuer}</span> pada tahun {active.year}.
            </p>
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
            <div className="flex flex-wrap gap-2">
              {active.verificationUrl && (
                <a
                  href={active.verificationUrl}
                  target="_blank"
                  rel="noopener"
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background font-mono text-xs rounded-md hover:opacity-90"
                >
                  <ExternalLink className="size-3" /> Verify Certificate
                </a>
              )}
              {active.certificateUrl && (
                <a
                  href={active.certificateUrl}
                  target="_blank"
                  rel="noopener"
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 glass border border-neon/40 text-neon font-mono text-xs rounded-md"
                >
                  <Download className="size-3" /> PDF Certificate
                </a>
              )}
            </div>
          </>
        )}
      </DetailDialog>
    </Section>
  );
}

/* ---------- EDUCATION ---------- */
function Education() {
  const { education } = usePortfolioContent();
  const [open, setOpen] = useState<number | null>(null);
  const active = open !== null ? education[open] : null;
  return (
    <Section
      id="education"
      command="cat education.json"
      title="education"
      description="Academic journey & focus areas."
    >
      <div className="space-y-4">
        {education.map((ed, i) => (
          <motion.button
            type="button"
            onClick={() => setOpen(i)}
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full text-left glass rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 hover:border-neon/60 transition"
          >
            <div className="size-16 rounded-xl bg-foreground/10 border border-foreground/40 flex items-center justify-center shrink-0">
              <GraduationCap className="size-8 text-neon" />
            </div>
            <div className="flex-1">
              <div className="font-mono text-xs text-neon">{ed.period}</div>
              <h3 className="mt-1 text-xl font-semibold">{ed.institution}</h3>
              <div className="text-sm text-muted-foreground font-mono">{ed.major}</div>
              <p className="mt-3 text-foreground/80">{ed.description}</p>
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
          <>
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
          </>
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
            className="text-left glass rounded-xl p-5 hover:border-neon/60 transition group"
          >
            <Heart className="size-5 text-neon mb-3 group-hover:scale-110 transition" />
            <div className="font-mono text-[10px] text-muted-foreground">
              {v.category} · {v.year}
            </div>
            <h3 className="mt-1 font-semibold text-foreground">{v.name}</h3>
            <div className="text-sm text-neon/90 font-mono">{v.role}</div>
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
          <>
            <p>
              Berkontribusi sebagai <span className="text-neon">{active.role}</span> dalam kegiatan{" "}
              <span className="text-foreground">{active.name}</span> ({active.category},{" "}
              {active.year}).
            </p>
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
          </>
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
                <FileCode className="size-4 text-neon" />
                <span className="text-foreground group-hover:text-neon transition">{p.name}</span>
              </div>
              <div className="text-sm text-muted-foreground md:pl-8">{p.description}</div>
              <div className="flex items-center gap-2">
                {p.stack.slice(0, 2).map((s) => (
                  <span
                    key={s}
                    className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface border border-border text-muted-foreground"
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
          <>
            <p>{active.description}</p>
            <div className="space-y-2">
              <div className="font-mono text-xs text-muted-foreground">// stack</div>
              <div className="flex flex-wrap gap-2">
                {active.stack.map((s) => (
                  <span
                    key={s}
                    className="font-mono text-[10px] px-2 py-1 rounded border border-border bg-surface text-foreground/90"
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
          </>
        )}
      </DetailDialog>
    </Section>
  );
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
                  className="px-3 py-1.5 rounded-md text-xs font-mono bg-surface border border-border text-foreground/90 hover:border-neon hover:text-neon hover:shadow-[0_0_12px_rgba(57,255,120,0.3)] transition cursor-default"
                >
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-neon text-primary-foreground font-mono text-xs rounded-md glow-neon"
            >
              <MessageCircle className="size-4" /> WhatsApp
            </a>
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-2 px-4 py-2 glass border border-neon/40 text-neon font-mono text-xs rounded-md"
            >
              <Mail className="size-4" /> Email
            </a>
          </div>
          <div className="mt-5 flex gap-3 text-muted-foreground">
            <a href="#" className="hover:text-neon transition">
              <Github className="size-5" />
            </a>
            <a href="#" className="hover:text-neon transition">
              <Linkedin className="size-5" />
            </a>
            <a href="#" className="hover:text-neon transition">
              <Instagram className="size-5" />
            </a>
          </div>
        </TerminalBox>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert("Message form akan tersimpan ke database setelah backend admin aktif.");
          }}
          className="glass rounded-2xl p-6 space-y-4 lg:col-start-2"
        >
          <div className="font-mono text-xs text-neon">// send.message</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              required
              placeholder="name"
              className="bg-surface/60 border border-border rounded-md px-3 py-2.5 text-sm font-mono outline-none focus:border-neon transition"
            />
            <input
              required
              type="email"
              placeholder="email"
              className="bg-surface/60 border border-border rounded-md px-3 py-2.5 text-sm font-mono outline-none focus:border-neon transition"
            />
          </div>
          <input
            required
            placeholder="subject"
            className="w-full bg-surface/60 border border-border rounded-md px-3 py-2.5 text-sm font-mono outline-none focus:border-neon transition"
          />
          <textarea
            required
            rows={5}
            placeholder="message..."
            className="w-full bg-surface/60 border border-border rounded-md px-3 py-2.5 text-sm font-mono outline-none focus:border-neon transition resize-none"
          />
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-neon text-primary-foreground font-mono text-sm font-semibold rounded-md glow-neon hover:scale-[1.02] transition"
          >
            transmit <ArrowRight className="size-4" />
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
      <div className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-2 gap-6 items-center font-mono text-xs">
        <div className="text-muted-foreground">
          © 2026 <span className="text-neon">Jay SZRS</span>. Built with passion, creativity, and
          technology.
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
