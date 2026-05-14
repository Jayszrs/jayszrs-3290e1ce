import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  LogOut, Upload, Trash2, Plus, Mail, FileText, Briefcase,
  Award, GraduationCap, Heart, FolderKanban, Home as HomeIcon,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — JAY SZRS" }] }),
  component: AdminPage,
});

const TABLES = [
  { key: "experiences", label: "Experience", icon: Briefcase, fields: ["title", "company", "date_range", "status", "category", "description"] },
  { key: "certifications", label: "Certifications", icon: Award, fields: ["title", "issuer", "year", "category", "description", "verification_url"] },
  { key: "education", label: "Education", icon: GraduationCap, fields: ["institution", "major", "period", "description"] },
  { key: "volunteers", label: "Volunteer", icon: Heart, fields: ["name", "role", "year", "category", "description"] },
  { key: "projects", label: "Projects", icon: FolderKanban, fields: ["title", "category", "year", "description", "demo_url", "github_url"] },
] as const;

function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) checkRole(s.user.id);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) checkRole(data.session.user.id);
      else setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const checkRole = async (uid: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle();
    setIsAdmin(!!data);
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-mono text-neon">$ loading...</div>;
  if (!session) return <AuthForm />;
  if (!isAdmin) return (
    <div className="min-h-screen flex flex-col items-center justify-center font-mono gap-4">
      <div className="text-destructive">$ access denied — not an admin</div>
      <button onClick={() => supabase.auth.signOut()} className="text-neon underline">sign out</button>
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
    const fn = mode === "login"
      ? supabase.auth.signInWithPassword({ email, password: pass })
      : supabase.auth.signUp({ email, password: pass, options: { emailRedirectTo: `${window.location.origin}/admin` } });
    const { error } = await fn;
    setBusy(false);
    if (error) toast.error(error.message);
    else if (mode === "signup") toast.success("Account created. First user becomes admin.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Toaster position="top-center" />
      <form onSubmit={submit} className="glass rounded-2xl p-8 w-full max-w-sm space-y-4">
        <div className="font-mono text-xs text-neon">$ admin.{mode}</div>
        <h1 className="text-2xl font-bold text-neon glow-text">JAY SZRS</h1>
        <p className="text-xs text-muted-foreground font-mono">First account becomes admin automatically.</p>
        <input required type="email" placeholder="email" value={email} onChange={e => setEmail(e.target.value)}
          className="w-full bg-surface/60 border border-border rounded-md px-3 py-2.5 text-sm font-mono outline-none focus:border-neon" />
        <input required type="password" placeholder="password (min 6)" value={pass} onChange={e => setPass(e.target.value)} minLength={6}
          className="w-full bg-surface/60 border border-border rounded-md px-3 py-2.5 text-sm font-mono outline-none focus:border-neon" />
        <button disabled={busy} className="w-full py-3 bg-neon text-primary-foreground font-mono text-sm font-semibold rounded-md glow-neon disabled:opacity-50">
          {busy ? "..." : mode === "login" ? "sign in" : "sign up"}
        </button>
        <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")} className="w-full text-xs text-muted-foreground hover:text-neon">
          {mode === "login" ? "no account? sign up" : "have account? sign in"}
        </button>
        <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-neon">← back to portfolio</Link>
      </form>
    </div>
  );
}

function Dashboard() {
  const [tab, setTab] = useState<string>("overview");

  return (
    <div className="min-h-screen flex bg-background">
      <Toaster position="top-center" />
      <aside className="w-60 glass border-r border-border min-h-screen p-4 hidden md:block">
        <div className="font-mono text-xs text-neon mb-6">$ admin@jay-szrs</div>
        <nav className="space-y-1 text-sm">
          <NavBtn id="overview" tab={tab} setTab={setTab} icon={HomeIcon} label="Overview"/>
          <NavBtn id="profile" tab={tab} setTab={setTab} icon={FileText} label="Profile & CV"/>
          {TABLES.map(t => <NavBtn key={t.key} id={t.key} tab={tab} setTab={setTab} icon={t.icon} label={t.label}/>)}
          <NavBtn id="messages" tab={tab} setTab={setTab} icon={Mail} label="Messages"/>
        </nav>
        <button onClick={() => supabase.auth.signOut()} className="mt-8 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive font-mono">
          <LogOut className="size-3"/> sign out
        </button>
        <Link to="/" className="block mt-3 text-xs text-muted-foreground hover:text-neon font-mono">← view site</Link>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-x-auto">
        <div className="md:hidden mb-4 flex flex-wrap gap-2">
          {["overview","profile",...TABLES.map(t=>t.key),"messages"].map(k=>(
            <button key={k} onClick={()=>setTab(k)} className={`px-3 py-1.5 text-xs font-mono rounded ${tab===k?"bg-neon text-primary-foreground":"glass"}`}>{k}</button>
          ))}
        </div>
        {tab === "overview" && <Overview />}
        {tab === "profile" && <ProfileEditor />}
        {tab === "messages" && <MessagesView />}
        {TABLES.find(t => t.key === tab) && <CrudTable config={TABLES.find(t => t.key === tab)!} />}
      </main>
    </div>
  );
}

function NavBtn({ id, tab, setTab, icon: Icon, label }: any) {
  return (
    <button onClick={() => setTab(id)}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded font-mono text-xs ${tab===id?"bg-neon/10 text-neon border border-neon/30":"text-muted-foreground hover:text-foreground"}`}>
      <Icon className="size-4"/> {label}
    </button>
  );
}

function Overview() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    Promise.all([...TABLES.map(t => t.key), "contact_messages", "skills", "gallery"].map(async (k) => {
      const { count } = await supabase.from(k).select("*", { count: "exact", head: true });
      return [k, count || 0] as const;
    })).then(arr => setCounts(Object.fromEntries(arr)));
  }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 font-mono"><span className="text-neon">#</span> dashboard</h1>
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
    supabase.from("profile_settings").select("*").limit(1).maybeSingle().then(({ data }) => setProfile(data));
  }, []);

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("profile_settings").update(profile).eq("id", profile.id);
    setBusy(false);
    error ? toast.error(error.message) : toast.success("Profile updated");
  };

  const uploadCV = async (file: File) => {
    const path = `cv-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("cv").upload(path, file, { upsert: true });
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from("cv").getPublicUrl(path);
    setProfile({ ...profile, cv_url: data.publicUrl });
    await supabase.from("profile_settings").update({ cv_url: data.publicUrl }).eq("id", profile.id);
    toast.success("CV uploaded — Download CV button now serves this file");
  };

  if (!profile) return <div className="font-mono text-muted-foreground">loading...</div>;

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold font-mono"><span className="text-neon">#</span> profile & cv</h1>
      {["branding_name", "subtitle", "email", "whatsapp", "location", "availability", "github_url", "linkedin_url", "instagram_url"].map(f => (
        <Field key={f} label={f} value={profile[f] || ""} onChange={(v) => setProfile({ ...profile, [f]: v })}/>
      ))}
      <div>
        <label className="text-xs font-mono text-muted-foreground">about</label>
        <textarea rows={4} value={profile.about || ""} onChange={e => setProfile({ ...profile, about: e.target.value })}
          className="w-full bg-surface/60 border border-border rounded px-3 py-2 text-sm font-mono mt-1 focus:border-neon outline-none" />
      </div>
      <div className="glass rounded-lg p-4">
        <div className="font-mono text-xs text-neon mb-2">// CV file</div>
        {profile.cv_url && <a href={profile.cv_url} target="_blank" rel="noopener" className="text-xs text-neon underline break-all">{profile.cv_url}</a>}
        <label className="mt-2 inline-flex items-center gap-2 px-3 py-2 bg-neon text-primary-foreground font-mono text-xs rounded cursor-pointer">
          <Upload className="size-3"/> upload new CV
          <input type="file" accept=".pdf,.doc,.docx" hidden onChange={e => e.target.files?.[0] && uploadCV(e.target.files[0])}/>
        </label>
      </div>
      <button disabled={busy} onClick={save} className="px-5 py-2.5 bg-neon text-primary-foreground font-mono text-sm rounded glow-neon">
        save profile
      </button>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-mono text-muted-foreground">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-surface/60 border border-border rounded px-3 py-2 text-sm font-mono mt-1 focus:border-neon outline-none" />
    </div>
  );
}

function CrudTable({ config }: { config: typeof TABLES[number] }) {
  const [rows, setRows] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);

  const load = async () => {
    const { data } = await supabase.from(config.key).select("*").order("order_index", { ascending: true });
    setRows(data || []);
  };
  useEffect(() => { load(); }, [config.key]);

  const save = async () => {
    const payload = { ...editing };
    delete payload.created_at; delete payload.updated_at;
    const { error } = editing.id
      ? await supabase.from(config.key).update(payload).eq("id", editing.id)
      : await supabase.from(config.key).insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setEditing(null); load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    const { error } = await supabase.from(config.key).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-mono"><span className="text-neon">#</span> {config.label.toLowerCase()}</h1>
        <button onClick={() => setEditing({ order_index: rows.length })} className="inline-flex items-center gap-2 px-3 py-2 bg-neon text-primary-foreground font-mono text-xs rounded">
          <Plus className="size-3"/> add
        </button>
      </div>

      <div className="space-y-2">
        {rows.map(r => (
          <div key={r.id} className="glass rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{r.title || r.name || r.institution}</div>
              <div className="text-xs text-muted-foreground font-mono truncate">{r.company || r.issuer || r.major || r.role || r.category}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(r)} className="text-xs font-mono px-2 py-1 border border-border rounded hover:border-neon">edit</button>
              <button onClick={() => del(r.id)} className="text-xs font-mono p-1 text-destructive"><Trash2 className="size-3"/></button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="glass max-w-lg w-full rounded-2xl p-6 space-y-3 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="font-mono text-xs text-neon">$ {editing.id ? "edit" : "new"} {config.label}</div>
            {config.fields.map(f => (
              <div key={f}>
                <label className="text-xs font-mono text-muted-foreground">{f}</label>
                {f === "description" ? (
                  <textarea rows={3} value={editing[f] || ""} onChange={e => setEditing({ ...editing, [f]: e.target.value })}
                    className="w-full bg-surface/60 border border-border rounded px-3 py-2 text-sm font-mono mt-1 focus:border-neon outline-none"/>
                ) : (
                  <input value={editing[f] || ""} onChange={e => setEditing({ ...editing, [f]: e.target.value })}
                    className="w-full bg-surface/60 border border-border rounded px-3 py-2 text-sm font-mono mt-1 focus:border-neon outline-none"/>
                )}
              </div>
            ))}
            {config.key === "certifications" && <CertFiles editing={editing} setEditing={setEditing}/>}
            <div className="flex gap-2 pt-2">
              <button onClick={save} className="px-4 py-2 bg-neon text-primary-foreground font-mono text-xs rounded glow-neon">save</button>
              <button onClick={() => setEditing(null)} className="px-4 py-2 glass border border-border font-mono text-xs rounded">cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CertFiles({ editing, setEditing }: any) {
  const upload = async (file: File, bucket: "certificates" | "badges", field: "certificate_url" | "badge_url") => {
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    setEditing({ ...editing, [field]: data.publicUrl });
    toast.success(`${bucket} uploaded`);
  };
  return (
    <div className="grid grid-cols-2 gap-2">
      <label className="glass rounded p-2 text-xs font-mono cursor-pointer text-center">
        upload cert <input hidden type="file" accept="image/*,.pdf" onChange={e=>e.target.files?.[0]&&upload(e.target.files[0],"certificates","certificate_url")}/>
      </label>
      <label className="glass rounded p-2 text-xs font-mono cursor-pointer text-center">
        upload badge <input hidden type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&upload(e.target.files[0],"badges","badge_url")}/>
      </label>
    </div>
  );
}

function MessagesView() {
  const [msgs, setMsgs] = useState<any[]>([]);
  const load = () => supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).then(({ data }) => setMsgs(data || []));
  useEffect(() => { load(); }, []);
  const markRead = async (id: string) => { await supabase.from("contact_messages").update({ read: true }).eq("id", id); load(); };
  const del = async (id: string) => { await supabase.from("contact_messages").delete().eq("id", id); load(); };

  return (
    <div>
      <h1 className="text-2xl font-bold font-mono mb-6"><span className="text-neon">#</span> messages ({msgs.filter(m=>!m.read).length} new)</h1>
      <div className="space-y-3">
        {msgs.map(m => (
          <div key={m.id} className={`glass rounded-lg p-4 ${!m.read ? "border-neon/50" : ""}`}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-semibold">{m.name} <span className="text-muted-foreground text-sm">&lt;{m.email}&gt;</span></div>
                <div className="text-xs font-mono text-neon">{m.subject}</div>
              </div>
              <div className="text-xs text-muted-foreground font-mono">{new Date(m.created_at).toLocaleString()}</div>
            </div>
            <p className="mt-3 text-sm whitespace-pre-wrap">{m.message}</p>
            <div className="flex gap-2 mt-3">
              <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`} className="text-xs font-mono text-neon underline">reply via email</a>
              {!m.read && <button onClick={() => markRead(m.id)} className="text-xs font-mono text-muted-foreground hover:text-neon">mark read</button>}
              <button onClick={() => del(m.id)} className="text-xs font-mono text-destructive ml-auto">delete</button>
            </div>
          </div>
        ))}
        {msgs.length === 0 && <div className="font-mono text-muted-foreground text-sm">$ no messages yet</div>}
      </div>
    </div>
  );
}
