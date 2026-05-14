import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, ShieldX, ExternalLink, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MatrixBg } from "@/components/portfolio/MatrixBg";

export const Route = createFileRoute("/verify/$id")({
  head: () => ({ meta: [{ title: "Verify Certificate — JAY SZRS" }] }),
  component: VerifyPage,
});

function VerifyPage() {
  const { id } = Route.useParams();
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("certifications").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      setCert(data); setLoading(false);
    });
  }, [id]);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      <MatrixBg />
      <div className="relative max-w-xl w-full glass rounded-2xl p-8 glow-neon">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-neon mb-6">
          <ArrowLeft className="size-3"/> back to portfolio
        </Link>
        {loading ? (
          <div className="font-mono text-sm text-muted-foreground">$ verifying credential...</div>
        ) : cert ? (
          <>
            <div className="flex items-center gap-3 text-neon mb-4">
              <ShieldCheck className="size-8 glow-text"/>
              <div>
                <div className="font-mono text-xs uppercase">verified ✓</div>
                <div className="text-lg font-bold text-foreground">Authentic Credential</div>
              </div>
            </div>
            <div className="space-y-3 font-mono text-sm bg-surface/60 p-4 rounded-lg border border-border">
              <Row k="title" v={cert.title}/>
              <Row k="holder" v="JAY SZRS"/>
              <Row k="issuer" v={cert.issuer}/>
              <Row k="year" v={cert.year}/>
              <Row k="category" v={cert.category || "—"}/>
              <Row k="cert.id" v={cert.id.slice(0, 12) + "..."}/>
            </div>
            {cert.verification_url && (
              <a href={cert.verification_url} target="_blank" rel="noopener"
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-neon text-primary-foreground font-mono text-xs rounded-md glow-neon">
                <ExternalLink className="size-4"/> verify with issuer
              </a>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <ShieldX className="size-10 text-destructive mx-auto mb-3"/>
            <div className="font-mono text-sm">$ certificate not found</div>
            <div className="text-xs text-muted-foreground mt-1">id: {id}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-muted-foreground w-20 shrink-0">{k}:</span>
      <span className="text-foreground break-all">{v}</span>
    </div>
  );
}
