import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { MonoMatrixBg } from "@/components/portfolio/MonoMatrixBg";
import { NeonWordmark } from "@/components/portfolio/NeonWordmark";
import cyberSecurityBg from "@/assets/cyber-security-bg.webp";

import {
  listAdminUsersFallback,
  mutateAdminContent,
  mutateAdminProfile,
  removeAdminUserRoleFallback,
  setAdminUserRoleFallback,
  uploadAdminFile,
} from "@/server-functions/admin-content";
import {
  LogOut,
  Upload,
  Trash2,
  Plus,
  Mail,
  FileText,
  Briefcase,
  Award,
  GraduationCap,
  Heart,
  FolderKanban,
  Home as HomeIcon,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — JAY SZRS" }] }),
  component: AdminPage,
});

type AppRole = "admin" | "user";
type AdminUserRow = {
  user_id: string;
  email: string | null;
  role: AppRole;
  created_at: string;
  last_sign_in_at: string | null;
};
type MediaField = {
  name: string;
  label: string;
  bucket: "certificates" | "badges" | "gallery" | "documents";
  accept: string;
};

const TABLES = [
  {
    key: "certifications",
    label: "Certification / Certificate",
    icon: Award,
    fields: [
      { name: "title", label: "Nama Certificate" },
      { name: "issuer", label: "Institusi Certificate" },
      { name: "year", label: "Tahun / Issued" },
      { name: "category", label: "Kategori" },
      { name: "credential_id", label: "Credential Certificate" },
      { name: "verification_url", label: "Credential URL" },
      { name: "description", label: "Deskripsi", type: "textarea" },
    ],
    media: [
      {
        name: "certificate_url",
        label: "PDF / Image Certificate",
        bucket: "certificates",
        accept: ".pdf,.jpg,.jpeg,.png",
      },
      {
        name: "badge_url",
        label: "Badge Certificate",
        bucket: "badges",
        accept: ".jpg,.jpeg,.png",
      },
    ],
  },
  {
    key: "experiences",
    label: "Work",
    icon: Briefcase,
    fields: [
      { name: "title", label: "Role atau Job" },
      { name: "company", label: "Institusi / Company" },
      { name: "employment_type", label: "Employment type" },
      { name: "location", label: "Location" },
      { name: "location_type", label: "Location type" },
      { name: "date_range", label: "Periode kerja" },
      { name: "duration_months", label: "Masa kerja (bulan)", type: "number" },
      { name: "status", label: "Status" },
      { name: "category", label: "Kategori" },
      { name: "description", label: "Deskripsi ngerjain apa aja", type: "textarea" },
    ],
    media: [
      {
        name: "image_url",
        label: "Foto / Screenshot Work",
        bucket: "gallery",
        accept: ".jpg,.jpeg,.png",
      },
      {
        name: "document_url",
        label: "Dokumentasi Work PDF",
        bucket: "documents",
        accept: ".pdf,.jpg,.jpeg,.png",
      },
    ],
  },
  {
    key: "education",
    label: "Education",
    icon: GraduationCap,
    fields: [
      { name: "institution", label: "Sekolah / Kampus" },
      { name: "major", label: "Degree / Jurusan" },
      { name: "field_of_study", label: "Field of study" },
      { name: "period", label: "Periode" },
      { name: "grade", label: "Grade / IPK" },
      { name: "activities", label: "Activities and societies", type: "textarea" },
      { name: "description", label: "Deskripsi", type: "textarea" },
    ],
    media: [
      {
        name: "logo_url",
        label: "Logo / Foto Sekolah",
        bucket: "gallery",
        accept: ".jpg,.jpeg,.png",
      },
      {
        name: "document_url",
        label: "Dokumentasi Education PDF",
        bucket: "documents",
        accept: ".pdf,.jpg,.jpeg,.png",
      },
    ],
  },
  {
    key: "volunteers",
    label: "Volunteer / Organization",
    icon: Heart,
    fields: [
      { name: "name", label: "Nama kegiatan / organisasi" },
      { name: "role", label: "Role" },
      { name: "category", label: "Kategori" },
      { name: "year", label: "Periode" },
      { name: "duration_months", label: "Durasi (bulan)", type: "number" },
      { name: "description", label: "Deskripsi kontribusi", type: "textarea" },
    ],
    media: [
      { name: "image_url", label: "Foto Volunteer", bucket: "gallery", accept: ".jpg,.jpeg,.png" },
      {
        name: "document_url",
        label: "Dokumentasi Volunteer PDF",
        bucket: "documents",
        accept: ".pdf,.jpg,.jpeg,.png",
      },
    ],
  },
  {
    key: "projects",
    label: "Projects",
    icon: FolderKanban,
    fields: [
      { name: "title", label: "Project name" },
      { name: "category", label: "Category" },
      { name: "year", label: "Year" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "demo_url", label: "Demo URL" },
      { name: "github_url", label: "GitHub URL" },
    ],
    media: [
      {
        name: "thumbnail_url",
        label: "Thumbnail Project",
        bucket: "gallery",
        accept: ".jpg,.jpeg,.png",
      },
      {
        name: "documentation_url",
        label: "Dokumentasi Project PDF",
        bucket: "documents",
        accept: ".pdf,.jpg,.jpeg,.png",
      },
    ],
  },
] as const;

function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) checkRole(s);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) checkRole(data.session);
      else setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const checkRole = async (currentSession: NonNullable<typeof session>) => {
    const uid = currentSession.user.id;

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .eq("role", "admin")
      .maybeSingle();

    setIsAdmin(!!data);
    setLoading(false);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-neon">
        $ loading...
      </div>
    );
  if (!session) return <AuthForm />;
  if (!isAdmin)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-mono gap-4">
        <div className="text-destructive">$ access denied — not an admin</div>
        <button onClick={() => supabase.auth.signOut()} className="text-neon underline">
          sign out
        </button>
      </div>
    );
  return <Dashboard />;
}

function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const loginEmail = email.trim();

    let error: { message: string } | null = null;
    let signedIn = false;

    if (mode === "login") {
      const result = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: pass,
      });
      error = result.error;
      signedIn = !result.error;
    } else {
      const result = await supabase.auth.signUp({
        email: loginEmail,
        password: pass,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      error = result.error;
    }
    setBusy(false);
    if (!signedIn && error) {
      toast.error(error.message);
    } else if (mode === "signup") toast.success("Account created. First user becomes admin.");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4">
      <img
        src={cyberSecurityBg}
        alt=""
        aria-hidden
        className="fixed inset-0 z-0 h-screen w-screen object-cover opacity-35"
      />
      <MonoMatrixBg className="opacity-[0.22]" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.12),transparent_30%),linear-gradient(to_bottom,rgba(0,0,0,0.1),rgba(0,0,0,0.9))]" />
      <Toaster position="top-center" />
      <form
        onSubmit={submit}
        className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center py-10"
      >
        <div className="glass relative overflow-hidden rounded-xl p-7 shadow-[0_0_60px_rgba(255,255,255,0.08)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/70 to-transparent" />
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="font-mono text-xs text-neon">admin.{mode}</div>
            <span className="rounded border border-border bg-surface/60 px-2 py-1 font-mono text-[10px] text-muted-foreground">
              secure shell
            </span>
          </div>
          <h1 className="make-w-md" aria-label="JAY SZRS">
            <NeonWordmark size="auth" />
          </h1>
          <p className="mt-2 text-xs text-muted-foreground font-mono">
            Sign in dengan email & password admin yang sudah terdaftar.
          </p>
          <div className="mt-6 space-y-4">
            <input
              required
              type="text"
              placeholder="username or email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface/60 border border-border rounded-md px-3 py-2.5 text-sm font-mono outline-none focus:border-neon"
            />
            <input
              required
              type="password"
              placeholder="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              minLength={6}
              className="w-full bg-surface/60 border border-border rounded-md px-3 py-2.5 text-sm font-mono outline-none focus:border-neon"
            />
            <button
              disabled={busy}
              className="w-full py-3 bg-neon text-primary-foreground font-mono text-sm font-semibold rounded-md glow-neon disabled:opacity-50"
            >
              {busy ? "..." : mode === "login" ? "sign in" : "sign up"}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="w-full text-xs text-muted-foreground hover:text-neon"
          >
            {mode === "login" ? "no account? sign up" : "have account? sign in"}
          </button>
          <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-neon">
            ← back to portfolio
          </Link>
        </div>
      </form>
    </div>
  );
}

function Dashboard() {
  const [tab, setTab] = useState<string>("overview");

  return (
    /* PERUBAHAN UTAMA: Membatasi tinggi screen dashboard terluar agar tidak bablas */
    <div className="relative h-screen max-h-screen overflow-hidden bg-background">
      <img
        src={cyberSecurityBg}
        alt=""
        aria-hidden
        className="fixed inset-0 z-0 h-screen w-screen object-cover opacity-25"
      />
      <MonoMatrixBg className="opacity-[0.12]" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_bottom,rgba(0,0,0,0.15),rgba(0,0,0,0.88))]" />
      <Toaster position="top-center" />

      {/* PERUBAHAN UTAMA: Memaksa tinggi flex pembungkus sidebar & content mengikuti screen */}
      <div className="relative z-10 flex h-screen w-full overflow-hidden">
        <aside className="w-64 glass border-r border-border h-full p-4 hidden md:flex flex-col justify-between overflow-y-auto shrink-0">
          <div>
            <div className="mb-6 flex items-center gap-2 font-mono text-xs">
              <span className="text-muted-foreground">$</span>
              <NeonWordmark size="nav" text="admin@jay-szrs" />
            </div>
            <nav className="space-y-1 text-sm">
              <NavBtn id="overview" tab={tab} setTab={setTab} icon={HomeIcon} label="Overview" />
              <NavBtn
                id="roles"
                tab={tab}
                setTab={setTab}
                icon={ShieldCheck}
                label="Role Management"
              />
              <NavBtn id="profile" tab={tab} setTab={setTab} icon={FileText} label="Profile & CV" />
              {TABLES.map((t) => (
                <NavBtn
                  key={t.key}
                  id={t.key}
                  tab={tab}
                  setTab={setTab}
                  icon={t.icon}
                  label={t.label}
                />
              ))}
              <NavBtn id="messages" tab={tab} setTab={setTab} icon={Mail} label="Messages" />
            </nav>
          </div>
          <div className="pt-4 border-t border-border/30 mt-auto">
            <button
              onClick={() => supabase.auth.signOut()}
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive font-mono w-full text-left"
            >
              <LogOut className="size-3" /> sign out
            </button>
            <Link
              to="/"
              className="block mt-3 text-xs text-muted-foreground hover:text-neon font-mono"
            >
              ← view site
            </Link>
          </div>
        </aside>

        {/* PERUBAHAN UTAMA: Mengaktifkan scroll vertikal penuh khusus pada isi konten tab admin */}
        <main className="flex-1 h-full p-4 md:p-8 overflow-y-auto overflow-x-auto pb-24 md:pb-12">
          <div className="md:hidden mb-4 flex flex-wrap gap-2 sticky top-0 bg-background/80 backdrop-blur-md z-30 p-2 rounded-lg border border-border/40">
            {["overview", "roles", "profile", ...TABLES.map((t) => t.key), "messages"].map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`px-3 py-1.5 text-xs font-mono rounded ${tab === k ? "bg-neon text-primary-foreground" : "glass"}`}
              >
                {k}
              </button>
            ))}
          </div>
          {tab === "overview" && <Overview />}
          {tab === "roles" && <RoleManagement />}
          {tab === "profile" && <ProfileEditor />}
          {tab === "messages" && <MessagesView />}
          {TABLES.find((t) => t.key === tab) && (
            <CrudTable config={TABLES.find((t) => t.key === tab)!} />
          )}
        </main>
      </div>
    </div>
  );

  function NavBtn({ id, tab, setTab, icon: Icon, label }: any) {
    return (
      <button
        onClick={() => setTab(id)}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded font-mono text-xs ${tab === id ? "bg-neon/10 text-neon border border-neon/30" : "text-muted-foreground hover:text-foreground"}`}
      >
        <Icon className="size-4" /> {label}
      </button>
    );
  }

  function RoleManagement() {
    const [users, setUsers] = useState<AdminUserRow[]>([]);
    const [newUserId, setNewUserId] = useState("");
    const [newRole, setNewRole] = useState<AppRole>("user");
    const [busy, setBusy] = useState(false);
    const [roleError, setRoleError] = useState("");

    const load = async () => {
      setBusy(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      try {
        const fallbackUsers = await listAdminUsersFallback({
          data: { accessToken: session?.access_token || "" },
        });
        setRoleError("");
        setUsers(fallbackUsers || []);
      } catch (error) {
        const currentUser = session?.user;
        setUsers(
          currentUser
            ? [
                {
                  user_id: currentUser.id,
                  email: currentUser.email || null,
                  role: "admin",
                  created_at: currentUser.created_at,
                  last_sign_in_at: currentUser.last_sign_in_at || null,
                },
              ]
            : [],
        );
        setRoleError(
          error instanceof Error
            ? `${error.message} Tambahkan SUPABASE_SERVICE_ROLE_KEY di environment Lovable supaya semua user terdaftar bisa tampil.`
            : "Role Management belum bisa membaca semua user.",
        );
      } finally {
        setBusy(false);
      }
    };

    useEffect(() => {
      load();
    }, []);

    const setRole = async (userId: string, role: AppRole) => {
      const token = (await supabase.auth.getSession()).data.session?.access_token || "";

      try {
        await setAdminUserRoleFallback({ data: { accessToken: token, userId, role } });
        toast.success("Role updated");
        load();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Role update failed");
      }
    };

    const removeRole = async (userId: string) => {
      if (!confirm("Remove this user's role?")) return;
      const token = (await supabase.auth.getSession()).data.session?.access_token || "";

      try {
        await removeAdminUserRoleFallback({ data: { accessToken: token, userId } });
        toast.success("Role removed");
        load();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Role remove failed");
      }
    };

    return (
      <div className="max-w-4xl space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold font-mono">
            <span className="text-neon">#</span> role management
          </h1>
          <button
            onClick={load}
            disabled={busy}
            className="inline-flex items-center gap-2 px-3 py-2 glass border border-border rounded font-mono text-xs hover:border-neon"
          >
            <RefreshCw className="size-3" /> refresh
          </button>
        </div>

        {roleError && (
          <div className="glass rounded-lg border-destructive/50 p-4 font-mono text-xs text-destructive">
            {roleError}
          </div>
        )}

        <div className="glass rounded-lg p-4 grid md:grid-cols-[1fr_auto_auto] gap-3">
          <input
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
            placeholder="user_id UUID"
            className="bg-surface/60 border border-border rounded px-3 py-2 text-sm font-mono focus:border-neon outline-none"
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as AppRole)}
            className="bg-surface/60 border border-border rounded px-3 py-2 text-sm font-mono focus:border-neon outline-none"
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
          <button
            onClick={() => newUserId && setRole(newUserId, newRole)}
            className="px-4 py-2 bg-neon text-primary-foreground rounded font-mono text-xs"
          >
            set role
          </button>
        </div>

        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.user_id}
              className="glass rounded-lg p-4 grid md:grid-cols-[1fr_auto_auto] gap-3 items-center"
            >
              <div className="min-w-0">
                <div className="font-semibold truncate">{user.email || user.user_id}</div>
                <div className="text-xs text-muted-foreground font-mono truncate">
                  {user.user_id}
                </div>
              </div>
              <select
                value={user.role}
                onChange={(e) => setRole(user.user_id, e.target.value as AppRole)}
                className="bg-surface/60 border border-border rounded px-3 py-2 text-sm font-mono focus:border-neon outline-none"
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
              <button
                onClick={() => removeRole(user.user_id)}
                className="text-xs font-mono p-2 text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          {users.length === 0 && (
            <div className="font-mono text-muted-foreground text-sm">$ no users found</div>
          )}
        </div>
      </div>
    );
  }

  function Overview() {
    const [counts, setCounts] = useState<Record<string, number>>({});
    useEffect(() => {
      Promise.all(
        [...TABLES.map((t) => t.key), "contact_messages", "skills", "gallery"].map(async (k) => {
          const { count } = await supabase
            .from(k as any)
            .select("*", { count: "exact", head: true });
          return [k, count || 0] as const;
        }),
      ).then((arr) => setCounts(Object.fromEntries(arr)));
    }, []);
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6 font-mono">
          <span className="text-neon">#</span> dashboard
        </h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(counts).map(([k, v]) => (
            <div key={k} className="glass rounded-xl p-5">
              <div className="font-mono text-xs text-muted-foreground">{k}</div>
              <div className="text-3xl font-bold text-neon glow-text">{v}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function ProfileEditor() {
    const [profile, setProfile] = useState<any>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
      supabase
        .from("profile_settings")
        .select("*")
        .limit(1)
        .maybeSingle()
        .then(({ data }) => setProfile(data));
    }, []);

    const save = async () => {
      setBusy(true);
      const { error } = await supabase
        .from("profile_settings")
        .update(profile)
        .eq("id", profile.id);
      setBusy(false);

      if (error) {
        const token = (await supabase.auth.getSession()).data.session?.access_token || "";

        try {
          await mutateAdminProfile({
            data: { accessToken: token, id: profile.id, payload: profile },
          });
        } catch (fallbackError) {
          return toast.error(
            fallbackError instanceof Error ? fallbackError.message : error.message,
          );
        }
      }

      toast.success("Profile updated");
    };

    const uploadCV = async (file: File) => {
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `cv-${Date.now()}-${cleanName}`;
      let publicUrl = "";

      try {
        publicUrl = await uploadFileWithAdminFallback(file, "cv", path);
      } catch (uploadError) {
        return toast.error(uploadError instanceof Error ? uploadError.message : "CV upload failed");
      }

      const nextProfile = { ...profile, cv_url: publicUrl };
      setProfile(nextProfile);
      const { error: updateError } = await supabase
        .from("profile_settings")
        .update({ cv_url: publicUrl })
        .eq("id", profile.id);

      if (updateError) {
        const token = (await supabase.auth.getSession()).data.session?.access_token || "";
        try {
          await mutateAdminProfile({
            data: { accessToken: token, id: profile.id, payload: { cv_url: publicUrl } },
          });
        } catch (fallbackError) {
          return toast.error(
            fallbackError instanceof Error ? fallbackError.message : updateError.message,
          );
        }
      }
      toast.success("CV uploaded — Download CV button now serves this file");
    };

    if (!profile) return <div className="font-mono text-muted-foreground">loading...</div>;

    return (
      <div className="max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold font-mono">
          <span className="text-neon">#</span> profile & cv
        </h1>
        {[
          "branding_name",
          "subtitle",
          "email",
          "whatsapp",
          "location",
          "availability",
          "github_url",
          "linkedin_url",
          "instagram_url",
        ].map((f) => (
          <Field
            key={f}
            label={f}
            value={profile[f] || ""}
            onChange={(v) => setProfile({ ...profile, [f]: v })}
          />
        ))}
        <div>
          <label className="text-xs font-mono text-muted-foreground">about</label>
          <textarea
            rows={4}
            value={profile.about || ""}
            onChange={(e) => setProfile({ ...profile, about: e.target.value })}
            className="w-full bg-surface/60 border border-border rounded px-3 py-2 text-sm font-mono mt-1 focus:border-neon outline-none"
          />
        </div>
        <div className="glass rounded-lg p-4">
          <div className="font-mono text-xs text-neon mb-2">// CV file</div>
          {profile.cv_url && (
            <a
              href={profile.cv_url}
              target="_blank"
              rel="noopener"
              className="text-xs text-neon underline break-all"
            >
              {profile.cv_url}
            </a>
          )}
          <label className="mt-2 inline-flex items-center gap-2 px-3 py-2 bg-neon text-primary-foreground font-mono text-xs rounded cursor-pointer">
            <Upload className="size-3" /> upload new CV
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              hidden
              onChange={(e) => e.target.files?.[0] && uploadCV(e.target.files[0])}
            />
          </label>
        </div>
        <button
          disabled={busy}
          onClick={save}
          className="px-5 py-2.5 bg-neon text-primary-foreground font-mono text-sm rounded glow-neon"
        >
          save profile
        </button>
      </div>
    );
  }

  function Field({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
  }) {
    return (
      <div>
        <label className="text-xs font-mono text-muted-foreground">{label}</label>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-surface/60 border border-border rounded px-3 py-2 text-sm font-mono mt-1 focus:border-neon outline-none"
        />
      </div>
    );
  }

  async function fileToBase64(file: File) {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";

    for (let index = 0; index < bytes.length; index += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
    }

    return btoa(binary);
  }

  async function uploadFileWithAdminFallback(
    file: File,
    bucket: MediaField["bucket"] | "cv",
    path: string,
  ) {
    const direct = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

    if (!direct.error) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    }

    const token = (await supabase.auth.getSession()).data.session?.access_token || "";
    const fallback = await uploadAdminFile({
      data: {
        accessToken: token,
        bucket,
        path,
        contentType: file.type || "application/octet-stream",
        base64: await fileToBase64(file),
      },
    });

    return fallback.publicUrl;
  }

  function CrudTable({ config }: { config: (typeof TABLES)[number] }) {
    const [rows, setRows] = useState<any[]>([]);
    const [editing, setEditing] = useState<any>(null);

    const load = async () => {
      const { data } = await supabase
        .from(config.key)
        .select("*")
        .order("order_index", { ascending: true });
      setRows(data || []);
    };
    useEffect(() => {
      load();
    }, [config.key]);

    const save = async () => {
      const payload = { ...editing };
      delete payload.created_at;
      delete payload.updated_at;
      const { error } = editing.id
        ? await supabase.from(config.key).update(payload).eq("id", editing.id)
        : await supabase.from(config.key).insert(payload);

      if (error) {
        const token = (await supabase.auth.getSession()).data.session?.access_token || "";

        try {
          await mutateAdminContent({
            data: {
              accessToken: token,
              table: config.key,
              action: editing.id ? "update" : "insert",
              id: editing.id,
              payload,
            },
          });
        } catch (fallbackError) {
          return toast.error(
            fallbackError instanceof Error ? fallbackError.message : error.message,
          );
        }
      }

      toast.success("Saved");
      setEditing(null);
      load();
    };

    const del = async (id: string) => {
      if (!confirm("Delete this entry?")) return;
      const { error } = await supabase.from(config.key).delete().eq("id", id);

      if (error) {
        const token = (await supabase.auth.getSession()).data.session?.access_token || "";

        try {
          await mutateAdminContent({
            data: { accessToken: token, table: config.key, action: "delete", id },
          });
        } catch (fallbackError) {
          return toast.error(
            fallbackError instanceof Error ? fallbackError.message : error.message,
          );
        }
      }

      toast.success("Deleted");
      load();
    };

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-mono">
            <span className="text-neon">#</span> {config.label.toLowerCase()}
          </h1>
          <button
            onClick={() => setEditing({ order_index: rows.length })}
            className="inline-flex items-center gap-2 px-3 py-2 bg-neon text-primary-foreground font-mono text-xs rounded"
          >
            <Plus className="size-3" /> add
          </button>
        </div>

        <div className="space-y-2">
          {rows.map((r) => (
            <div
              key={r.id}
              className="glass rounded-lg p-4 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{r.title || r.name || r.institution}</div>
                <div className="text-xs text-muted-foreground font-mono truncate">
                  {r.company || r.issuer || r.major || r.role || r.category}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(r)}
                  className="text-xs font-mono px-2 py-1 border border-border rounded hover:border-neon"
                >
                  edit
                </button>
                <button
                  onClick={() => del(r.id)}
                  className="text-xs font-mono p-1 text-destructive"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {editing && (
          <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 py-6"
            onClick={() => setEditing(null)}
          >
            <div
              className="admin-edit-modal glass max-w-lg w-full rounded-2xl p-6 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="font-mono text-xs text-neon">
                $ {editing.id ? "edit" : "new"} {config.label}
              </div>
              {config.fields.map((field) => {
                const fieldType = "type" in field ? field.type : "text";
                return (
                  <div key={field.name}>
                    <label className="text-xs font-mono text-muted-foreground">{field.label}</label>
                    {fieldType === "textarea" ? (
                      <textarea
                        rows={3}
                        value={editing[field.name] || ""}
                        onChange={(e) => setEditing({ ...editing, [field.name]: e.target.value })}
                        className="w-full bg-surface/60 border border-border rounded px-3 py-2 text-sm font-mono mt-1 focus:border-neon outline-none"
                      />
                    ) : (
                      <input
                        type={fieldType === "number" ? "number" : "text"}
                        value={editing[field.name] || ""}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            [field.name]:
                              fieldType === "number" && e.target.value !== ""
                                ? Number(e.target.value)
                                : e.target.value,
                          })
                        }
                        className="w-full bg-surface/60 border border-border rounded px-3 py-2 text-sm font-mono mt-1 focus:border-neon outline-none"
                      />
                    )}
                  </div>
                );
              })}
              {"media" in config && (
                <MediaFiles
                  tableKey={config.key}
                  media={config.media as readonly MediaField[]}
                  editing={editing}
                  setEditing={setEditing}
                />
              )}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={save}
                  className="px-4 py-2 bg-neon text-primary-foreground font-mono text-xs rounded glow-neon"
                >
                  save
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 glass border border-border font-mono text-xs rounded"
                >
                  cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function MediaFiles({
    tableKey,
    media,
    editing,
    setEditing,
  }: {
    tableKey: string;
    media: readonly MediaField[];
    editing: any;
    setEditing: (value: any) => void;
  }) {
    const upload = async (file: File, item: MediaField) => {
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${tableKey}/${Date.now()}-${cleanName}`;

      let publicUrl = "";

      try {
        publicUrl = await uploadFileWithAdminFallback(file, item.bucket, path);
      } catch (uploadError) {
        return toast.error(
          uploadError instanceof Error ? uploadError.message : `${item.label} upload failed`,
        );
      }

      setEditing({ ...editing, [item.name]: publicUrl });
      toast.success(`${item.label} uploaded`);
    };

    return (
      <div className="space-y-2">
        <div className="font-mono text-xs text-neon">// media upload</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {media.map((item) => {
            const value = editing[item.name] || "";
            const isImage = /\.(png|jpe?g|webp|gif)$/i.test(value);

            return (
              <div key={item.name} className="glass rounded p-3 text-xs font-mono">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">{item.label}</span>
                  {value && (
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neon underline"
                    >
                      open
                    </a>
                  )}
                </div>
                {isImage && (
                  <img
                    src={value}
                    alt=""
                    className="mt-2 h-24 w-full rounded border border-border object-cover"
                  />
                )}
                {value && !isImage && <div className="mt-2 truncate text-neon">file uploaded</div>}
                <label className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded border border-border px-3 py-2 text-center hover:border-neon hover:text-neon">
                  <Upload className="size-3" /> upload PDF/JPG/PNG
                  <input
                    hidden
                    type="file"
                    accept={item.accept}
                    onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], item)}
                  />
                </label>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function MessagesView() {
    const [msgs, setMsgs] = useState<any[]>([]);
    const load = () =>
      supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data }) => setMsgs(data || []));
    useEffect(() => {
      load();
    }, []);
    const markRead = async (id: string) => {
      await supabase.from("contact_messages").update({ read: true }).eq("id", id);
      load();
    };
    const del = async (id: string) => {
      await supabase.from("contact_messages").delete().eq("id", id);
      load();
    };

    return (
      <div>
        <h1 className="text-2xl font-bold font-mono mb-6">
          <span className="text-neon">#</span> messages ({msgs.filter((m) => !m.read).length} new)
        </h1>
        <div className="space-y-3">
          {msgs.map((m) => (
            <div key={m.id} className={`glass rounded-lg p-4 ${!m.read ? "border-neon/50" : ""}`}>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="font-semibold">
                    {m.name}{" "}
                    <span className="text-muted-foreground text-sm">&lt;{m.email}&gt;</span>
                  </div>
                  <div className="text-xs font-mono text-neon">{m.subject}</div>
                </div>
                <div className="text-xs font-mono text-neon">
                  {new Date(m.created_at).toLocaleString()}
                </div>
              </div>
              <p className="mt-3 text-sm whitespace-pre-wrap">{m.message}</p>
              <div className="flex gap-2 mt-3">
                <a
                  href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`}
                  className="text-xs font-mono text-neon underline"
                >
                  reply via email
                </a>
                {!m.read && (
                  <button
                    onClick={() => markRead(m.id)}
                    className="text-xs font-mono text-muted-foreground hover:text-neon"
                  >
                    mark read
                  </button>
                )}
                <button
                  onClick={() => del(m.id)}
                  className="text-xs font-mono text-destructive ml-auto"
                >
                  delete
                </button>
              </div>
            </div>
          ))}
          {msgs.length === 0 && (
            <div className="font-mono text-muted-foreground text-sm">$ no messages yet</div>
          )}
        </div>
      </div>
    );
  }
}
