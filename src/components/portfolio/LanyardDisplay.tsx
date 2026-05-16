import { FormEvent, useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import jayPhoto from "@/assets/jay-profile.jpg";

type CardData = {
  fullName: string;
  title: string;
  idNumber: string;
  status: string;
  location: string;
  institution: string;
  major: string;
  githubUrl: string;
  instagram: string;
  linkedinUrl: string;
  email: string;
  whatsapp: string;
  profilePhotoUrl: string;
  cvUrl: string;
};

type ToastVariant = "success" | "error" | "info";
type ToastMessage = { id: number; message: string; variant: ToastVariant; exiting?: boolean };

const STORAGE_KEY = "cardData";
const CARD_EDITOR_PASSCODE_SHA256 =
  "bd8e251df2086eb93ba6b712d9ae54d4df5b8951235d1d0b42e3b2ca8050e9e0";

const defaultCardData: CardData = {
  fullName: "Jay SZRS",
  title: "Informatics Student",
  idNumber: "ID-2024-JSZRS",
  status: "Active Student",
  location: "Indonesia",
  institution: "Universitas Bani Saleh",
  major: "Informatics Engineering",
  githubUrl: "https://github.com/Jayszrs",
  instagram: "@jayszrs",
  linkedinUrl: "https://linkedin.com/in/jayszrs",
  email: "jaelanisuryasaputra@gmail.com",
  whatsapp: "+62895330152658",
  profilePhotoUrl: "",
  cvUrl: "",
};

const fieldGroups: Array<{
  title: string;
  fields: Array<{ key: keyof CardData; label: string; type: string; placeholder: string }>;
}> = [
  {
    title: "Identity",
    fields: [
      { key: "fullName", label: "Full Name", type: "text", placeholder: "Jay SZRS" },
      { key: "title", label: "Title / Role", type: "text", placeholder: "Informatics Student" },
      { key: "idNumber", label: "ID Number", type: "text", placeholder: "ID-2024-JSZRS" },
      { key: "status", label: "Status", type: "text", placeholder: "Active Student" },
      { key: "location", label: "Location", type: "text", placeholder: "Indonesia" },
    ],
  },
  {
    title: "Academic",
    fields: [
      {
        key: "institution",
        label: "Institution",
        type: "text",
        placeholder: "Universitas Bani Saleh",
      },
      {
        key: "major",
        label: "Major / Program",
        type: "text",
        placeholder: "Informatics Engineering",
      },
    ],
  },
  {
    title: "Social Links",
    fields: [
      {
        key: "githubUrl",
        label: "GitHub URL",
        type: "url",
        placeholder: "https://github.com/Jayszrs",
      },
      { key: "instagram", label: "Instagram Username", type: "text", placeholder: "@jayszrs" },
      {
        key: "linkedinUrl",
        label: "LinkedIn URL",
        type: "url",
        placeholder: "https://linkedin.com/in/jayszrs",
      },
      {
        key: "email",
        label: "Email Address",
        type: "email",
        placeholder: "jaelanisuryasaputra@gmail.com",
      },
      { key: "whatsapp", label: "WhatsApp Number", type: "tel", placeholder: "+62895330152658" },
    ],
  },
  {
    title: "Media",
    fields: [
      {
        key: "profilePhotoUrl",
        label: "Profile Photo URL",
        type: "url",
        placeholder: "https://... or leave blank",
      },
      {
        key: "cvUrl",
        label: "CV/Resume PDF URL",
        type: "url",
        placeholder: "https://drive.google.com/...",
      },
    ],
  },
];

function loadCardData(): CardData {
  if (typeof window === "undefined") return defaultCardData;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultCardData, ...JSON.parse(stored) } : defaultCardData;
  } catch {
    return defaultCardData;
  }
}

async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function isHttpsUrl(value: string) {
  return value.trim() === "" || value.trim().startsWith("https://");
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: ToastMessage[];
  removeToast: (id: number) => void;
}) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast--${toast.variant} ${toast.exiting ? "toast--exit" : ""}`}
          onAnimationEnd={() => toast.exiting && removeToast(toast.id)}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

function QrPattern() {
  const cells = [
    [0, 0, 3, 3],
    [5, 0, 1, 1],
    [7, 0, 3, 3],
    [0, 5, 1, 1],
    [2, 5, 1, 1],
    [4, 5, 2, 1],
    [7, 5, 1, 1],
    [9, 5, 1, 1],
    [1, 6, 1, 1],
    [3, 6, 1, 1],
    [5, 6, 1, 1],
    [8, 6, 2, 1],
    [0, 7, 3, 3],
    [4, 7, 1, 1],
    [6, 7, 1, 1],
    [8, 7, 1, 1],
    [4, 8, 2, 1],
    [7, 8, 3, 1],
    [3, 9, 1, 1],
    [5, 9, 1, 1],
    [7, 9, 1, 1],
  ];

  return (
    <svg viewBox="0 0 100 100" className="flip-card-qr" aria-hidden="true">
      <rect width="100" height="100" rx="10" fill="rgba(255,69,0,0.08)" />
      {cells.map(([x, y, w, h], i) => (
        <rect key={i} x={x * 9 + 5} y={y * 9 + 5} width={w * 8} height={h * 8} rx="1.2" />
      ))}
      {[0, 7, 70].map((x, i) => (
        <g key={i} transform={`translate(${i === 1 ? 64 : x + 5}, ${i === 2 ? 64 : 5})`}>
          <rect width="26" height="26" rx="2" fill="none" stroke="currentColor" strokeWidth="4" />
          <rect x="8" y="8" width="10" height="10" rx="1" />
        </g>
      ))}
    </svg>
  );
}

function SocialGlyph({ type }: { type: "github" | "instagram" | "linkedin" | "email" }) {
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
  if (type === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function LanyardDisplay() {
  const [cardData, setCardData] = useState<CardData>(defaultCardData);
  const [draft, setDraft] = useState<CardData>(defaultCardData);
  const [flipped, setFlipped] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [successFlash, setSuccessFlash] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const photoSrc = cardData.profilePhotoUrl || jayPhoto;

  const socialRows = useMemo(
    () => [
      {
        type: "github" as const,
        label: "GITHUB",
        value: cardData.githubUrl.replace(/^https?:\/\//, ""),
      },
      { type: "instagram" as const, label: "INSTAGRAM", value: cardData.instagram },
      {
        type: "linkedin" as const,
        label: "LINKEDIN",
        value: cardData.linkedinUrl.replace(/^https?:\/\//, ""),
      },
      { type: "email" as const, label: "EMAIL", value: cardData.email },
    ],
    [cardData],
  );

  const showToast = (message: string, variant: ToastVariant = "info") => {
    const id = Date.now();
    setToasts((current) => [...current, { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((current) =>
        current.map((toast) => (toast.id === id ? { ...toast, exiting: true } : toast)),
      );
    }, 3500);
  };

  const removeToast = (id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    const loaded = loadCardData();
    setCardData(loaded);
    setDraft(loaded);
  }, []);

  useEffect(() => {
    const openAdmin = () => {
      setDraft(loadCardData());
      setAdminOpen(true);
      setUnlocked(false);
      setPassword("");
      setPasswordError(false);
    };

    window.addEventListener("open-card-admin", openAdmin);
    return () => window.removeEventListener("open-card-admin", openAdmin);
  }, []);

  useEffect(() => {
    let taps: number[] = [];
    const zone = document.querySelector<HTMLElement>("[data-admin-tap-zone]");
    const onTap = () => {
      const now = Date.now();
      taps = [...taps.filter((tap) => now - tap < 800), now];
      if (taps.length >= 3) {
        window.dispatchEvent(new Event("open-card-admin"));
        taps = [];
      }
    };

    zone?.addEventListener("touchend", onTap, { passive: true });
    return () => zone?.removeEventListener("touchend", onTap);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        window.dispatchEvent(new Event("open-card-admin"));
      }
      if (event.key === "Escape") setAdminOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = adminOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [adminOpen]);

  const unlock = async (event: FormEvent) => {
    event.preventDefault();
    const candidateHash = await sha256(password);
    if (candidateHash !== CARD_EDITOR_PASSCODE_SHA256) {
      setPasswordError(true);
      showToast("Access denied", "error");
      window.setTimeout(() => setPasswordError(false), 450);
      return;
    }

    setPasswordError(false);
    setSuccessFlash(true);
    window.setTimeout(() => {
      setUnlocked(true);
      setSuccessFlash(false);
    }, 260);
  };

  const save = () => {
    const urlFields: Array<keyof CardData> = [
      "githubUrl",
      "linkedinUrl",
      "profilePhotoUrl",
      "cvUrl",
    ];
    const valid = urlFields.every((key) => isHttpsUrl(String(draft[key])));

    if (!valid) {
      showToast("Save failed", "error");
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      setCardData(draft);
      setAdminOpen(false);
      showToast("Card updated!", "success");
    } catch {
      showToast("Save failed", "error");
    }
  };

  return (
    <>
      <div className="flip-card-shell">
        <button
          type="button"
          className={`flip-card ${flipped ? "flipped" : ""}`}
          onClick={() => setFlipped((value) => !value)}
          aria-label="Flip digital credential card"
        >
          <div className="flip-card-inner">
            <div className="flip-card-face flip-card-front">
              <div className="flip-card-header">
                <img src={photoSrc} alt={cardData.fullName} className="flip-card-photo" />
                <div className="min-w-0 flex-1 text-left">
                  <div className="flip-card-name">JAY SZRS</div>
                  <div className="flip-card-role">{cardData.title}</div>
                </div>
                <div className="flip-card-monogram">JS</div>
              </div>
              <div className="flip-card-body">
                {[
                  ["NAME", cardData.fullName],
                  ["INSTITUTION", cardData.institution],
                  ["MAJOR", cardData.major],
                  ["STATUS", cardData.status],
                  ["LOCATION", cardData.location],
                ].map(([label, value]) => (
                  <div key={label} className="flip-card-row">
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
              <div className="flip-card-bottom">
                <span>{cardData.idNumber}</span>
                <span className="flip-card-verified">
                  <i /> VERIFIED
                </span>
              </div>
            </div>

            <div className="flip-card-face flip-card-back">
              <div className="flip-card-strip" />
              <div className="flip-card-qr-wrap">
                <QrPattern />
                <div>Scan to connect</div>
              </div>
              <div className="flip-card-socials">
                {socialRows.map((row) => (
                  <div key={row.label} className="flip-card-social-row">
                    <SocialGlyph type={row.type} />
                    <span>{row.label}</span>
                    <strong>{row.value}</strong>
                  </div>
                ))}
              </div>
              <div className="flip-card-back-bottom">JAY SZRS - Creative Technologist</div>
            </div>
          </div>
        </button>
        <p className="flip-card-hint">Tap or click to flip &bull; Click to interact</p>
      </div>

      <div data-admin-tap-zone className="admin-tap-zone" aria-hidden="true" />

      {adminOpen && (
        <div className="admin-modal-overlay" onMouseDown={() => setAdminOpen(false)}>
          <div className="admin-modal glass" onMouseDown={(event) => event.stopPropagation()}>
            <button
              className="admin-close"
              type="button"
              onClick={() => setAdminOpen(false)}
              aria-label="Close admin panel"
            >
              <X className="size-4" />
            </button>
            <form onSubmit={unlock}>
              <h3 className="admin-title">Admin Access</h3>
              <p className="admin-subtitle">Enter password to edit card</p>
              <label className="admin-password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  className={`${passwordError ? "is-error is-shaking" : ""} ${successFlash ? "is-success" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </label>
              {passwordError && <div className="admin-error">Access denied - wrong password</div>}
              {!unlocked && (
                <button type="submit" className="admin-unlock liquid-button liquid-button-primary">
                  Unlock
                </button>
              )}
            </form>

            <div className={`admin-edit-form ${unlocked ? "is-open" : ""}`}>
              <h4>Edit Card Content</h4>
              {fieldGroups.map((group, index) => (
                <fieldset key={group.title}>
                  <legend className={index === 0 ? "mt-0" : ""}>{group.title}</legend>
                  {group.fields.map((field) => (
                    <label key={field.key}>
                      <span>{field.label}</span>
                      <input
                        type={field.type}
                        value={draft[field.key]}
                        placeholder={field.placeholder}
                        onChange={(event) =>
                          setDraft((current) => ({ ...current, [field.key]: event.target.value }))
                        }
                      />
                    </label>
                  ))}
                </fieldset>
              ))}
              <div className="admin-actions">
                <button
                  type="button"
                  onClick={save}
                  className="liquid-button liquid-button-primary"
                >
                  Save & Apply
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdminOpen(false);
                    showToast("Changes discarded", "info");
                  }}
                  className="liquid-button"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}
