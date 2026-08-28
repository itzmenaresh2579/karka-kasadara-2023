import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import { getContentDoc, setContentDoc } from "./lib/content.js";
import { submitAdmission, fetchAdmissions, deleteAdmission } from "./lib/admissions.js";
import { fetchGalleryPhotos, addGalleryPhoto, updateGalleryPhoto, deleteGalleryPhoto } from "./lib/gallery.js";
import { loginAdmin, logoutAdmin, watchAuth, changeOwnPassword } from "./lib/auth.js";

/* ---------------------------------------------------------
   GOOGLE DRIVE LINK HELPER
   Staff often paste a Google Drive "share" link (from the Drive
   app/website) instead of a direct image URL. Those links don't
   work as an <img src> as-is, so we detect them and rewrite them
   into a direct-viewable image URL automatically.
--------------------------------------------------------- */
function extractDriveFileId(url) {
  if (!url) return null;
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,   // .../file/d/FILE_ID/view
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,   // .../open?id=FILE_ID
    /drive\.google\.com\/uc\?(?:export=[a-z]+&)?id=([a-zA-Z0-9_-]+)/, // .../uc?id=FILE_ID
    /[?&]id=([a-zA-Z0-9_-]+)/,                          // fallback: any ?id=FILE_ID
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

function toDirectImageUrl(url) {
  if (!url) return url;
  const trimmed = url.trim();
  if (!trimmed.includes("drive.google.com")) return trimmed;
  const id = extractDriveFileId(trimmed);
  if (!id) return trimmed;
  // lh3.googleusercontent.com serves the file's image bytes directly and
  // works for publicly-shared ("Anyone with the link") Drive files.
  return `https://lh3.googleusercontent.com/d/${id}`;
}

function isDriveLink(url) {
  return !!url && url.includes("drive.google.com");
}

/* ---------------------------------------------------------
   DESIGN TOKENS
--------------------------------------------------------- */
const T = {
  navy: "var(--kk-navy)",
  navyDeep: "var(--kk-navy-deep)",
  maroon: "var(--kk-maroon)",
  maroonDeep: "var(--kk-maroon-deep)",
  gold: "var(--kk-gold)",
  cream: "var(--kk-cream)",
  ink: "#232323",
  inkSoft: "#5B5B5B",
  line: "#E2DCCC",
  sage: "#4B6455",
  bgSection:
    "radial-gradient(circle at 15% 0%, rgba(198,161,91,0.08), transparent 42%), radial-gradient(circle at 100% 15%, rgba(110,42,51,0.05), transparent 45%), radial-gradient(circle at 50% 100%, rgba(22,35,63,0.04), transparent 55%), var(--kk-cream)",
};

const DEFAULT_THEME = {
  navy: "#16233F",
  navyDeep: "#0E1830",
  maroon: "#6E2A33",
  maroonDeep: "#551F27",
  gold: "#C6A15B",
  cream: "#F7F4EC",
};

const THEME_VAR_MAP = {
  navy: "--kk-navy",
  navyDeep: "--kk-navy-deep",
  maroon: "--kk-maroon",
  maroonDeep: "--kk-maroon-deep",
  gold: "--kk-gold",
  cream: "--kk-cream",
};

function applyTheme(theme) {
  const root = document.documentElement;
  Object.entries(THEME_VAR_MAP).forEach(([key, cssVar]) => {
    root.style.setProperty(cssVar, (theme && theme[key]) || DEFAULT_THEME[key]);
  });
}

const FONT_LINK_ID = "kk-school-fonts";
function useFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);
}

/* ---------------------------------------------------------
   DEFAULT CONTENT
--------------------------------------------------------- */
const DEFAULT_SCHOOL = {
  name: "Karka Kasadara Kids School",
  tagline: "Guiding Minds, Building Character",
  established: "1978",
  board: "State Board (Matric)",
  address: "Roja Nagar, Kodumudi, Tamil Nadu",
  phone: "+91 98765 43210",
  email: "info@karkakasadaraschool.edu.in",
  correspondent: "Mr. S. Ganesan",
  logoUrl: "data:image/jpeg;base64,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",
  mapLat: "11.0698",
  mapLng: "77.6768",
  missionText: "To provide a nurturing, disciplined environment where every child can discover and develop their full academic and personal potential.",
  visionText: "To be recognised as a school that produces confident, capable and grounded young people, ready for the next stage of their lives.",
  aboutText: "has grown into an institution known for disciplined, values-based education.",
  heroSubtext: "A place where academic rigour, discipline and character grow together.",
  eligibility: "Children must meet the minimum age requirement for the class applied (as per State Board norms). Admission is subject to seat availability. Please carry the child's birth certificate, immunization record, transfer certificate (if any), progress report (if any), passport-size photos, and any medical reports at the time of admission.",
};

const DEFAULT_FACULTY = [
  { id: "f1", name: "Dr. R. Meenakshi", role: "Principal", dept: "Administration" },
  { id: "f2", name: "Mr. K. Sivakumar", role: "Vice Principal", dept: "Administration" },
  { id: "f3", name: "Mrs. Latha Narayanan", role: "Head of Department", dept: "Mathematics" },
];

const DEFAULT_ACADEMICS = [
  { id: "ac1", title: "Playgroup", desc: "Sensory play, simple songs and rhymes, and gentle routines to help toddlers settle into a school environment." },
  { id: "ac2", title: "Nursery", desc: "Story-based learning, colours, shapes and early motor-skill activities through play." },
  { id: "ac3", title: "Junior KG", desc: "Letter and number recognition, group activities, and building early social and language skills." },
  { id: "ac4", title: "Senior KG", desc: "School-readiness focus - reading, writing, numeracy basics, and creative and physical activities." },
];

const DEFAULT_ACTIVITIES = [
  { id: "a1", title: "Bharatanatyam & Folk Dance", desc: "Weekly classes for grades 1-8, performances at the Annual Day." },
  { id: "a2", title: "Karate & Physical Training", desc: "Belt-graded karate club plus daily PT for all grades." },
  { id: "a3", title: "Art & Craft Club", desc: "Drawing, painting and craft sessions every Friday afternoon." },
];

const DEFAULT_ACHIEVEMENTS = [
  { id: "ac1", title: "State-level Abacus Championship - 1st Place", date: "2026-02-10", desc: "Grade 4 student won gold at the state abacus competition." },
  { id: "ac2", title: "100% Pass - Board Exams 2025-26", date: "2026-05-20", desc: "All Grade 10 students cleared the board exam." },
];

const DEFAULT_GALLERY = [
  { id: "g1", title: "Campus", imageUrl: "" },
  { id: "g2", title: "Sports Day", imageUrl: "" },
  { id: "g3", title: "Annual Day", imageUrl: "" },
];

const CLASSES = ["Playgroup", "Nursery", "Junior KG", "Senior KG"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const NAV = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "academics", label: "Academics" },
  { id: "activities", label: "Activities" },
  { id: "faculty", label: "Faculty" },
  { id: "achievements", label: "Achievements" },
  { id: "gallery", label: "Gallery" },
  { id: "admissions", label: "Admissions" },
  { id: "contact", label: "Contact" },
];

/* ---------------------------------------------------------
   SITE CONTEXT
--------------------------------------------------------- */
const SiteContext = createContext(null);
const useSite = () => useContext(SiteContext);

function SiteProvider({ children }) {
  const [school, setSchool] = useState(DEFAULT_SCHOOL);
  const [faculty, setFaculty] = useState(DEFAULT_FACULTY);
  const [academics, setAcademics] = useState(DEFAULT_ACADEMICS);
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [achievements, setAchievements] = useState(DEFAULT_ACHIEVEMENTS);
  const [gallery, setGallery] = useState([]);
  const [galleryLoaded, setGalleryLoaded] = useState(false);
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [s, f, ac, a, ach, th] = await Promise.all([
      getContentDoc("school", DEFAULT_SCHOOL),
      getContentDoc("faculty", { list: DEFAULT_FACULTY }),
      getContentDoc("academics", { list: DEFAULT_ACADEMICS }),
      getContentDoc("activities", { list: DEFAULT_ACTIVITIES }),
      getContentDoc("achievements", { list: DEFAULT_ACHIEVEMENTS }),
      getContentDoc("theme", DEFAULT_THEME),
    ]);
    setSchool({ ...DEFAULT_SCHOOL, ...s });
    setFaculty((f && f.list) || DEFAULT_FACULTY);
    setAcademics((ac && ac.list) || DEFAULT_ACADEMICS);
    setActivities((a && a.list) || DEFAULT_ACTIVITIES);
    setAchievements((ach && ach.list) || DEFAULT_ACHIEVEMENTS);
    setTheme(th || DEFAULT_THEME);
    applyTheme(th || DEFAULT_THEME);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
    const unsub = watchAuth((u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, [loadAll]);

  const saveSchool = async (next) => { setSchool(next); await setContentDoc("school", next); };
  const saveFaculty = async (next) => { setFaculty(next); await setContentDoc("faculty", { list: next }); };
  const saveAcademics = async (next) => { setAcademics(next); await setContentDoc("academics", { list: next }); };
  const saveActivities = async (next) => { setActivities(next); await setContentDoc("activities", { list: next }); };
  const saveAchievements = async (next) => { setAchievements(next); await setContentDoc("achievements", { list: next }); };
  const loadGallery = useCallback(async () => {
    const g = await fetchGalleryPhotos();
    setGallery(g);
    setGalleryLoaded(true);
  }, []);

  const addPhoto = async (record) => { const ref = await addGalleryPhoto(record); setGallery((g) => [...g, { id: ref.id, ...record }]); };
  const editPhoto = async (id, record) => { await updateGalleryPhoto(id, record); setGallery((g) => g.map((p) => (p.id === id ? { ...p, ...record } : p))); };
  const removePhoto = async (id) => { await deleteGalleryPhoto(id); setGallery((g) => g.filter((p) => p.id !== id)); };
  const saveTheme = async (next) => { setTheme(next); applyTheme(next); await setContentDoc("theme", next); };

  const value = {
    school, faculty, academics, activities, achievements, gallery, galleryLoaded, loadGallery, theme,
    loading, user, authReady, isAdmin: !!user,
    saveSchool, saveFaculty, saveAcademics, saveActivities, saveAchievements, saveTheme,
    addPhoto, editPhoto, removePhoto,
    reload: loadAll,
  };
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

/* ---------------------------------------------------------
   UI PRIMITIVES
--------------------------------------------------------- */
function Crest({ size = 56, logoUrl, initials = "KK" }) {
  if (logoUrl) {
    return (
      <div style={{ width: size, height: size, borderRadius: size > 50 ? 12 : 8, background: "#fff", border: `2px solid ${T.gold}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
        <img src={logoUrl} alt="School logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <path d="M50 4 L92 20 V52 C92 76 74 92 50 98 C26 92 8 76 8 52 V20 Z" fill={T.navy} stroke={T.gold} strokeWidth="2.5" />
      <text x="50" y="60" textAnchor="middle" fontFamily="Lora, serif" fontWeight="700" fontSize="30" fill={T.gold}>{initials}</text>
    </svg>
  );
}

function Eyebrow({ children }) {
  return <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.maroon, marginBottom: 10 }}>{children}</div>;
}

function SectionTitle({ eyebrow, title, sub }) {
  return (
    <div style={{ marginBottom: 40, maxWidth: 640 }}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 style={{ fontFamily: "Lora, serif", fontWeight: 700, fontSize: "clamp(26px,3.4vw,38px)", color: T.navy, margin: 0, lineHeight: 1.2 }}>{title}</h2>
      {sub && <p style={{ fontFamily: "Inter, sans-serif", color: T.inkSoft, fontSize: 16, marginTop: 12, lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );
}

function Card({ children, style }) {
  return <div style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 10, padding: 24, boxShadow: "0 1px 2px rgba(22,35,63,0.04)", ...style }}>{children}</div>;
}

function Button({ children, onClick, variant = "primary", type = "button", style, disabled }) {
  const base = { fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 14, padding: "12px 24px", borderRadius: 6, cursor: disabled ? "not-allowed" : "pointer", border: "1px solid transparent", transition: "transform 0.1s ease", opacity: disabled ? 0.6 : 1 };
  const variants = {
    primary: { background: T.maroon, color: "#fff" },
    gold: { background: T.gold, color: T.navyDeep },
    outline: { background: "transparent", color: T.cream, borderColor: "rgba(247,244,236,0.5)" },
    outlineDark: { background: "transparent", color: T.navy, borderColor: T.navy },
    ghost: { background: "transparent", color: T.navy, borderColor: "transparent", textDecoration: "underline" },
    danger: { background: "#fff", color: T.maroon, borderColor: T.maroon },
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick} style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.transform = "translateY(-1px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}>
      {children}
    </button>
  );
}

function Field({ label, children, required }) {
  return (
    <label style={{ display: "block", marginBottom: 18 }}>
      <span style={{ display: "block", fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600, color: T.navy, marginBottom: 6 }}>{label} {required && <span style={{ color: T.maroon }}>*</span>}</span>
      {children}
    </label>
  );
}

// Firestore documents have a hard 1MB limit. Base64 text adds ~33% overhead
// on top of the raw image bytes, so we keep the encoded string safely under
// that ceiling and shrink quality/dimensions automatically until it fits.
const MAX_DATA_URL_LENGTH = 700_000; // ~700KB of base64 text, well under 1MB

function resizeImageFile(file, maxDim = 1000, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not load image"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Try shrinking quality first, then dimensions, until it fits.
        let q = quality;
        let dataUrl = canvas.toDataURL("image/jpeg", q);

        while (dataUrl.length > MAX_DATA_URL_LENGTH && q > 0.3) {
          q -= 0.1;
          dataUrl = canvas.toDataURL("image/jpeg", q);
        }

        if (dataUrl.length > MAX_DATA_URL_LENGTH) {
          // Still too big — shrink the canvas itself and re-encode.
          const scale = Math.sqrt(MAX_DATA_URL_LENGTH / dataUrl.length);
          const smallCanvas = document.createElement("canvas");
          smallCanvas.width = Math.max(200, Math.round(width * scale));
          smallCanvas.height = Math.max(200, Math.round(height * scale));
          const sctx = smallCanvas.getContext("2d");
          sctx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);
          dataUrl = smallCanvas.toDataURL("image/jpeg", 0.6);
        }

        if (dataUrl.length > MAX_DATA_URL_LENGTH) {
          reject(new Error("This photo is too large even after compression. Try a different photo."));
          return;
        }

        resolve(dataUrl);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}


function PhotoPicker({ value, onChange, label = "Choose photo" }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const handleFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setErr(""); setBusy(true);
    try {
      const dataUrl = await resizeImageFile(file);
      onChange(dataUrl);
    } catch (ex) {
      console.error(ex);
      setErr("Couldn't load that photo. Try a different one.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 13, padding: "10px 16px", borderRadius: 6, background: T.navy, color: T.gold, cursor: "pointer" }}>
          {busy ? "Uploading..." : label}
          <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} disabled={busy} />
        </label>
        {value && (
          <div style={{ width: 56, height: 56, borderRadius: 8, overflow: "hidden", border: `1px solid ${T.line}`, flexShrink: 0 }}>
            <img src={value} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
      </div>
      {err && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: T.maroon, marginTop: 6 }}>{err}</p>}
    </div>
  );
}

const inputStyle = { width: "100%", boxSizing: "border-box", fontFamily: "Inter, sans-serif", fontSize: 14, padding: "11px 13px", borderRadius: 6, border: `1px solid ${T.line}`, background: "#fff", color: T.ink, outline: "none" };

function ErrText({ children }) {
  return <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: T.maroon, marginTop: -12, marginBottom: 14 }}>{children}</div>;
}

function PasswordField({ label, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label} required>
      <div style={{ position: "relative" }}>
        <input type={show ? "text" : "password"} style={{ ...inputStyle, paddingRight: 60 }} value={value} onChange={onChange} autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false} />
        <button type="button" onClick={() => setShow((s) => !s)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600, color: T.maroon, padding: "4px 6px" }}>{show ? "Hide" : "Show"}</button>
      </div>
    </Field>
  );
}

/* ---------------------------------------------------------
   NAV / FOOTER
--------------------------------------------------------- */
function Nav({ page, setPage }) {
  const { school, isAdmin } = useSite();
  const [open, setOpen] = useState(false);
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 40, background: T.navy, borderBottom: "1px solid rgba(198,161,91,0.3)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => setPage("home")} style={{ display: "flex", alignItems: "center", gap: 12, background: "none", border: "none", cursor: "pointer" }}>
          <Crest size={40} logoUrl={school.logoUrl} />
          <span style={{ fontFamily: "Lora, serif", fontWeight: 700, color: T.cream, fontSize: 17, textAlign: "left", lineHeight: 1.15 }}>{school.name}</span>
        </button>
        <nav style={{ display: "none" }} className="desktop-nav">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: 13.5, fontWeight: 600, color: page === n.id ? T.gold : "#D9D4C6", padding: "8px 10px" }}>{n.label}</button>
          ))}
          <button onClick={() => setPage(isAdmin ? "admin" : "login")} style={{ background: "none", border: `1px solid ${T.gold}`, borderRadius: 5, cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700, color: T.gold, padding: "7px 14px", marginLeft: 6 }}>{isAdmin ? "Admin Panel" : "Staff Login"}</button>
        </nav>
        <button onClick={() => setOpen((o) => !o)} className="mobile-toggle" style={{ background: "none", border: "none", color: T.cream, cursor: "pointer" }} aria-label="Menu">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
        </button>
      </div>
      {open && (
        <div style={{ background: T.navyDeep, padding: "8px 20px 16px" }}>
          {NAV.map((n) => (
            <button key={n.id} onClick={() => { setPage(n.id); setOpen(false); }} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: 15, fontWeight: 600, color: page === n.id ? T.gold : "#D9D4C6", padding: "10px 4px" }}>{n.label}</button>
          ))}
          <button onClick={() => { setPage(isAdmin ? "admin" : "login"); setOpen(false); }} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: 15, fontWeight: 700, color: T.gold, padding: "10px 4px" }}>{isAdmin ? "Admin Panel" : "Staff Login"}</button>
        </div>
      )}
      <style>{`
        @media (min-width: 900px) { .desktop-nav { display: flex !important; align-items: center; gap: 2px; } .mobile-toggle { display: none !important; } }
      `}</style>
    </header>
  );
}

function Footer({ setPage }) {
  const { school } = useSite();
  return (
    <footer style={{ background: T.navyDeep, color: "#B9B4A6", padding: "44px 20px 26px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: 32 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}><Crest size={32} logoUrl={school.logoUrl} /><span style={{ fontFamily: "Lora, serif", fontWeight: 700, color: T.cream, fontSize: 15 }}>{school.name}</span></div>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, lineHeight: 1.7, maxWidth: 320 }}>{school.tagline}. Established {school.established}, affiliated to {school.board}.</p>
        </div>
        <div>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: T.gold, marginBottom: 12 }}>Quick Links</div>
          {["about", "admissions", "achievements", "contact"].map((id) => (
            <button key={id} onClick={() => setPage(id)} style={{ display: "block", background: "none", border: "none", color: "#B9B4A6", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: 13, padding: "4px 0" }}>{NAV.find((n) => n.id === id)?.label}</button>
          ))}
        </div>
        <div>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: T.gold, marginBottom: 12 }}>Contact</div>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, lineHeight: 1.8 }}>{school.address}<br />{school.phone}<br />{school.email}</p>
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: 34, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.08)", fontFamily: "Inter, sans-serif", fontSize: 12 }}>© {new Date().getFullYear()} {school.name}. All rights reserved.</div>
    </footer>
  );
}

/* ---------------------------------------------------------
   PUBLIC PAGES
--------------------------------------------------------- */
function Home({ setPage }) {
  const { school, achievements } = useSite();
  return (
    <>
      <section style={{ background: `linear-gradient(180deg, ${T.navy}, ${T.navyDeep})`, padding: "84px 20px 90px", textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}><Crest size={76} logoUrl={school.logoUrl} /></div>
          <Eyebrow><span style={{ color: T.gold }}>Est. {school.established} &nbsp;-&nbsp; {school.board}</span></Eyebrow>
          <h1 style={{ fontFamily: "Lora, serif", fontWeight: 700, fontSize: "clamp(32px,5.5vw,52px)", color: T.cream, margin: "0 0 16px", lineHeight: 1.15 }}>{school.name}</h1>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 17, color: "#D9D4C6", lineHeight: 1.7, marginBottom: 34 }}>{school.tagline}. {school.heroSubtext}</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Button variant="gold" onClick={() => setPage("admissions")}>Apply for Admission</Button>
            <Button variant="outline" onClick={() => setPage("about")}>Learn More</Button>
          </div>
        </div>
      </section>
      <section style={{ padding: "20px 20px 90px", background: T.bgSection }}>
        <div style={{ maxWidth: 1180, margin: "60px auto 0" }}>
          <SectionTitle eyebrow="Proud Moments" title="Recent achievements" sub="A quick look at what our students and school have recently earned." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 18 }}>
            {achievements.slice(0, 3).map((a) => (
              <Card key={a.id}>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, color: T.gold, background: T.navy, display: "inline-block", padding: "4px 10px", borderRadius: 4, marginBottom: 12 }}>{a.date ? new Date(a.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}</div>
                <h3 style={{ fontFamily: "Lora, serif", fontSize: 18, color: T.navy, margin: "0 0 8px" }}>{a.title}</h3>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: T.inkSoft, lineHeight: 1.6, margin: 0 }}>{a.desc}</p>
              </Card>
            ))}
          </div>
          <div style={{ marginTop: 24 }}><Button variant="ghost" onClick={() => setPage("achievements")}>View all achievements →</Button></div>
        </div>
      </section>
    </>
  );
}

function About() {
  const { school } = useSite();
  return (
    <section style={{ padding: "70px 20px", background: T.bgSection, minHeight: "60vh" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <SectionTitle eyebrow="Our Story" title="About the school" />
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15.5, color: T.inkSoft, lineHeight: 1.8, marginBottom: 18 }}>Founded in {school.established}, {school.name} {school.aboutText} We are affiliated to the {school.board}.</p>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15.5, color: T.inkSoft, lineHeight: 1.8, marginBottom: 40 }}>Correspondent: <strong style={{ color: T.navy }}>{school.correspondent}</strong>. Our faculty work closely with parents to track each child's progress through the year.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 18 }}>
          {[["Our Mission", school.missionText], ["Our Vision", school.visionText]].map(([t, d]) => (
            <Card key={t}><h3 style={{ fontFamily: "Lora, serif", color: T.maroon, fontSize: 18, margin: "0 0 10px" }}>{t}</h3><p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: T.inkSoft, lineHeight: 1.7, margin: 0 }}>{d}</p></Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Academics() {
  const { school, academics } = useSite();
  return (
    <section style={{ padding: "70px 20px", background: T.bgSection, minHeight: "60vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SectionTitle eyebrow="Curriculum" title="Academics" sub={`Affiliated to the ${school.board}, with a curriculum reviewed every year against current guidelines.`} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 18 }}>
          {academics.map((s) => (
            <Card key={s.id}><div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, color: T.gold, background: T.navy, display: "inline-block", padding: "4px 10px", borderRadius: 4, marginBottom: 12 }}>{s.title}</div><p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: T.inkSoft, lineHeight: 1.7, margin: 0 }}>{s.desc}</p></Card>
          ))}
          {academics.length === 0 && <p style={{ fontFamily: "Inter, sans-serif", color: T.inkSoft }}>No academics info added yet.</p>}
        </div>
      </div>
    </section>
  );
}

function ActivitiesPage() {
  const { activities } = useSite();
  return (
    <section style={{ padding: "70px 20px", background: T.bgSection, minHeight: "60vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SectionTitle eyebrow="Beyond the Classroom" title="Extra-curricular activities" sub="Clubs and activities that run alongside regular academics." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 18 }}>
          {activities.map((a) => (<Card key={a.id}><h3 style={{ fontFamily: "Lora, serif", fontSize: 17, color: T.navy, margin: "0 0 8px" }}>{a.title}</h3><p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: T.inkSoft, lineHeight: 1.6, margin: 0 }}>{a.desc}</p></Card>))}
          {activities.length === 0 && <p style={{ fontFamily: "Inter, sans-serif", color: T.inkSoft }}>No activities listed yet.</p>}
        </div>
      </div>
    </section>
  );
}

function Faculty() {
  const { faculty, school } = useSite();
  return (
    <section style={{ padding: "70px 20px", background: T.bgSection, minHeight: "60vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SectionTitle eyebrow="Our Team" title="Faculty & leadership" sub={`Correspondent: ${school.correspondent}. Meet the department heads and administrators guiding the school.`} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 18 }}>
          {faculty.map((f) => (
            <Card key={f.id} style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: T.navy, color: T.gold, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Lora, serif", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{f.name.split(" ").filter(Boolean).slice(-2).map((w) => w[0]).join("")}</div>
              <div><div style={{ fontFamily: "Lora, serif", fontWeight: 600, fontSize: 15.5, color: T.navy }}>{f.name}</div><div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: T.maroon, fontWeight: 600 }}>{f.role}</div><div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: T.inkSoft }}>{f.dept}</div></div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function AchievementsPage() {
  const { achievements } = useSite();
  return (
    <section style={{ padding: "70px 20px", background: T.bgSection, minHeight: "60vh" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <SectionTitle eyebrow="Proud Moments" title="Achievements" sub="Recognitions our students and school have earned." />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {achievements.map((a) => (
            <Card key={a.id} style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: T.gold, color: T.navyDeep, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🏆</div>
              <div><h3 style={{ fontFamily: "Lora, serif", fontSize: 17, color: T.navy, margin: "0 0 6px" }}>{a.title}</h3>{a.date && <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: T.maroon, fontWeight: 600, marginBottom: 6 }}>{new Date(a.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>}<p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: T.inkSoft, lineHeight: 1.6, margin: 0 }}>{a.desc}</p></div>
            </Card>
          ))}
          {achievements.length === 0 && <p style={{ fontFamily: "Inter, sans-serif", color: T.inkSoft }}>No achievements listed yet.</p>}
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  const { gallery, galleryLoaded, loadGallery } = useSite();
  const [loading, setLoading] = useState(!galleryLoaded);
  useEffect(() => {
    if (!galleryLoaded) {
      setLoading(true);
      loadGallery().finally(() => setLoading(false));
    }
  }, [galleryLoaded, loadGallery]);
  return (
    <section style={{ padding: "70px 20px", background: T.bgSection, minHeight: "60vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SectionTitle eyebrow="Around Campus" title="Gallery" sub="Photos from around the school and past events." />
        {loading ? (
          <p style={{ fontFamily: "Inter, sans-serif", color: T.inkSoft }}>Loading photos...</p>
        ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 18 }}>
          {gallery.map((g, i) => (
            <div key={g.id} style={{ aspectRatio: "4/3", borderRadius: 10, overflow: "hidden", position: "relative", border: `1px solid ${T.line}`, background: i % 2 === 0 ? `linear-gradient(135deg, ${T.navy}, ${T.maroonDeep})` : `linear-gradient(135deg, ${T.maroon}, ${T.navyDeep})` }}>
              {g.imageUrl && <img src={g.imageUrl} alt={g.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 16, background: g.imageUrl ? "linear-gradient(180deg, transparent, rgba(14,24,48,0.75))" : "none" }}><span style={{ fontFamily: "Lora, serif", color: T.cream, fontWeight: 600, fontSize: 16 }}>{g.title}</span></div>
            </div>
          ))}
          {gallery.length === 0 && <p style={{ fontFamily: "Inter, sans-serif", color: T.inkSoft }}>No photos added yet.</p>}
        </div>
        )}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   ADMISSIONS FORM - matches the school's paper admission form
--------------------------------------------------------- */
const BLANK_ADMISSION = {
  academicYear: "", classApplying: "", studentName: "", dob: "", gender: "", bloodGroup: "",
  religion: "", community: "", nationality: "Indian", motherTongue: "", aadharNo: "",
  fatherName: "", fatherOccupation: "", fatherMobile: "",
  motherName: "", motherOccupation: "", motherMobile: "",
  email: "", address: "",
  previousSchool: "", previousClass: "",
  emergencyContactName: "", emergencyContactNumber: "",
  message: "",
};

function Admissions() {
  const { school } = useSite();
  const [form, setForm] = useState(BLANK_ADMISSION);
  const [status, setStatus] = useState("idle");
  const [errors, setErrors] = useState({});
  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.studentName.trim()) errs.studentName = "Required";
    if (!form.dob) errs.dob = "Required";
    if (!form.gender) errs.gender = "Required";
    if (!form.classApplying) errs.classApplying = "Required";
    if (!form.fatherName.trim() && !form.motherName.trim()) errs.parent = "Enter at least one parent's name";
    if (!form.fatherMobile.trim() && !form.motherMobile.trim()) errs.mobile = "Enter at least one contact number";
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = "Enter a valid email";
    if (!form.address.trim()) errs.address = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setStatus("saving");
    try {
      await submitAdmission(form);
      setStatus("done");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <section style={{ padding: "90px 20px", background: T.bgSection, minHeight: "60vh", display: "flex", justifyContent: "center" }}>
        <Card style={{ maxWidth: 480, textAlign: "center", padding: 40 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.sage, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontSize: 26 }}>✓</div>
          <h2 style={{ fontFamily: "Lora, serif", color: T.navy, fontSize: 22, margin: "0 0 10px" }}>Application received</h2>
          <p style={{ fontFamily: "Inter, sans-serif", color: T.inkSoft, fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>Thank you. We've recorded {form.studentName}'s application for {form.classApplying}. Our admissions office will contact you shortly.</p>
          <Button variant="primary" onClick={() => { setForm(BLANK_ADMISSION); setStatus("idle"); }}>Submit another application</Button>
        </Card>
      </section>
    );
  }

  return (
    <section style={{ padding: "70px 20px", background: T.bgSection, minHeight: "60vh" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <SectionTitle eyebrow="Admissions" title="Admission application form" sub="Fill in the details below. Fields marked * are required." />
        <Card style={{ marginBottom: 24 }}>
          <Eyebrow>Eligibility & Documents Checklist</Eyebrow>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: T.inkSoft, lineHeight: 1.7, margin: 0 }}>{school.eligibility}</p>
        </Card>
        <Card>
          <div onKeyDown={(e) => { if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") e.preventDefault(); }}>
            <h3 style={{ fontFamily: "Lora, serif", color: T.navy, fontSize: 16, margin: "0 0 14px" }}>Student Details</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Academic year"><input style={inputStyle} value={form.academicYear} onChange={update("academicYear")} placeholder="2026-2027" /></Field>
              <Field label="Class applying for" required>
                <select style={inputStyle} value={form.classApplying} onChange={update("classApplying")}>
                  <option value="">Select class</option>
                  {CLASSES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Student's full name" required><input style={inputStyle} value={form.studentName} onChange={update("studentName")} /></Field>
            {errors.studentName && <ErrText>{errors.studentName}</ErrText>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Date of birth" required><input type="date" style={inputStyle} value={form.dob} onChange={update("dob")} /></Field>
              <Field label="Gender" required>
                <select style={inputStyle} value={form.gender} onChange={update("gender")}>
                  <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
                </select>
              </Field>
            </div>
            {(errors.dob || errors.gender) && <ErrText>{errors.dob || errors.gender}</ErrText>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Blood group">
                <select style={inputStyle} value={form.bloodGroup} onChange={update("bloodGroup")}>
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map((b) => <option key={b}>{b}</option>)}
                </select>
              </Field>
              <Field label="Mother tongue"><input style={inputStyle} value={form.motherTongue} onChange={update("motherTongue")} /></Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Religion"><input style={inputStyle} value={form.religion} onChange={update("religion")} /></Field>
              <Field label="Community / Caste"><input style={inputStyle} value={form.community} onChange={update("community")} /></Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Nationality"><input style={inputStyle} value={form.nationality} onChange={update("nationality")} /></Field>
              <Field label="Aadhar number"><input style={inputStyle} value={form.aadharNo} onChange={update("aadharNo")} /></Field>
            </div>

            <h3 style={{ fontFamily: "Lora, serif", color: T.navy, fontSize: 16, margin: "24px 0 14px" }}>Father's Details</h3>
            <Field label="Father's name"><input style={inputStyle} value={form.fatherName} onChange={update("fatherName")} /></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Occupation"><input style={inputStyle} value={form.fatherOccupation} onChange={update("fatherOccupation")} /></Field>
              <Field label="Mobile number"><input style={inputStyle} value={form.fatherMobile} onChange={update("fatherMobile")} /></Field>
            </div>

            <h3 style={{ fontFamily: "Lora, serif", color: T.navy, fontSize: 16, margin: "24px 0 14px" }}>Mother's Details</h3>
            <Field label="Mother's name"><input style={inputStyle} value={form.motherName} onChange={update("motherName")} /></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Occupation"><input style={inputStyle} value={form.motherOccupation} onChange={update("motherOccupation")} /></Field>
              <Field label="Mobile number"><input style={inputStyle} value={form.motherMobile} onChange={update("motherMobile")} /></Field>
            </div>
            {(errors.parent || errors.mobile) && <ErrText>{errors.parent || errors.mobile}</ErrText>}

            <h3 style={{ fontFamily: "Lora, serif", color: T.navy, fontSize: 16, margin: "24px 0 14px" }}>Contact & Address</h3>
            <Field label="Email" required><input type="email" style={inputStyle} value={form.email} onChange={update("email")} /></Field>
            {errors.email && <ErrText>{errors.email}</ErrText>}
            <Field label="Residential address" required><textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={form.address} onChange={update("address")} /></Field>
            {errors.address && <ErrText>{errors.address}</ErrText>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Emergency contact name"><input style={inputStyle} value={form.emergencyContactName} onChange={update("emergencyContactName")} /></Field>
              <Field label="Emergency contact number"><input style={inputStyle} value={form.emergencyContactNumber} onChange={update("emergencyContactNumber")} /></Field>
            </div>

            <h3 style={{ fontFamily: "Lora, serif", color: T.navy, fontSize: 16, margin: "24px 0 14px" }}>Previous School (if any)</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="School name"><input style={inputStyle} value={form.previousSchool} onChange={update("previousSchool")} /></Field>
              <Field label="Class studied"><input style={inputStyle} value={form.previousClass} onChange={update("previousClass")} /></Field>
            </div>
            <Field label="Message / anything else you'd like us to know"><textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={form.message} onChange={update("message")} /></Field>

            {status === "error" && <ErrText>Something went wrong saving your application. Please try again.</ErrText>}
            <Button variant="primary" disabled={status === "saving"} onClick={submit} style={{ width: "100%", marginTop: 8 }}>{status === "saving" ? "Submitting..." : "Submit application"}</Button>
          </div>
        </Card>
      </div>
    </section>
  );
}

function Contact() {
  const { school } = useSite();
  const mapSrc = `https://maps.google.com/maps?q=${school.mapLat},${school.mapLng}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  return (
    <section style={{ padding: "70px 20px", background: T.bgSection, minHeight: "60vh" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <SectionTitle eyebrow="Get in Touch" title="Contact us" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 18, marginBottom: 30 }}>
          <Card><div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: T.maroon, marginBottom: 8 }}>Address</div><p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: T.ink, lineHeight: 1.6, margin: 0 }}>{school.address}</p></Card>
          <Card><div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: T.maroon, marginBottom: 8 }}>Phone</div><p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: T.ink, margin: 0 }}>{school.phone}</p></Card>
          <Card><div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: T.maroon, marginBottom: 8 }}>Email</div><p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: T.ink, margin: 0 }}>{school.email}</p></Card>
          <Card><div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: T.maroon, marginBottom: 8 }}>Correspondent</div><p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: T.ink, margin: 0 }}>{school.correspondent}</p></Card>
        </div>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <iframe title="School location" src={mapSrc} width="100%" height="360" style={{ border: 0, display: "block" }} loading="lazy" />
        </Card>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   ADMIN LOGIN (Firebase Auth: email + password)
--------------------------------------------------------- */
function AdminLogin({ setPage }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setErr("");
    if (!email.trim() || !pw) { setErr("Enter email and password."); return; }
    setBusy(true);
    try {
      await loginAdmin(email.trim(), pw);
      setPage("admin");
    } catch (e) {
      setErr("Login failed. Check your email and password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section style={{ padding: "90px 20px", background: T.bgSection, minHeight: "60vh", display: "flex", justifyContent: "center" }}>
      <Card style={{ maxWidth: 380, width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><Crest size={44} /></div>
        <h2 style={{ fontFamily: "Lora, serif", color: T.navy, fontSize: 20, textAlign: "center", margin: "0 0 4px" }}>Staff login</h2>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: T.inkSoft, textAlign: "center", marginBottom: 22 }}>Sign in with your staff email and password.</p>
        <div onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } }}>
          <Field label="Email" required><input type="email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} autoCapitalize="off" autoCorrect="off" autoFocus /></Field>
          <Field label="Password" required>
            <div style={{ position: "relative" }}>
              <input type={show ? "text" : "password"} style={{ ...inputStyle, paddingRight: 60 }} value={pw} onChange={(e) => setPw(e.target.value)} autoCapitalize="off" autoCorrect="off" spellCheck={false} />
              <button type="button" onClick={() => setShow((s) => !s)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, color: T.maroon }}>{show ? "Hide" : "Show"}</button>
            </div>
          </Field>
          {err && <ErrText>{err}</ErrText>}
          <Button variant="primary" onClick={submit} disabled={busy} style={{ width: "100%" }}>{busy ? "Signing in..." : "Log in"}</Button>
          <div style={{ textAlign: "center", marginTop: 14 }}><Button variant="ghost" onClick={() => setPage("home")}>← Back to site</Button></div>
        </div>
      </Card>
    </section>
  );
}

/* ---------------------------------------------------------
   ADMIN DASHBOARD
--------------------------------------------------------- */
const TABS = [
  { id: "applications", label: "Applications" },
  { id: "school", label: "School Info" },
  { id: "contact", label: "Contact" },
  { id: "academics", label: "Academics" },
  { id: "activities", label: "Activities" },
  { id: "faculty", label: "Faculty" },
  { id: "achievements", label: "Achievements" },
  { id: "gallery", label: "Gallery" },
  { id: "appearance", label: "Appearance" },
  { id: "settings", label: "Settings" },
];

function AdminDashboard({ setPage }) {
  const [tab, setTab] = useState("applications");
  const logout = async () => { await logoutAdmin(); setPage("home"); };
  return (
    <section style={{ padding: "40px 20px 90px", background: T.bgSection, minHeight: "70vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
          <div><Eyebrow>Admin</Eyebrow><h1 style={{ fontFamily: "Lora, serif", fontWeight: 700, fontSize: 28, color: T.navy, margin: 0 }}>Site management</h1></div>
          <Button variant="primary" onClick={logout}>Log out</Button>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 26, borderBottom: `1px solid ${T.line}`, paddingBottom: 10 }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, fontWeight: 600, padding: "8px 16px", borderRadius: 6, cursor: "pointer", border: "none", background: tab === t.id ? T.navy : "transparent", color: tab === t.id ? T.gold : T.inkSoft }}>{t.label}</button>
          ))}
        </div>
        {tab === "applications" && <ApplicationsTab />}
        {tab === "school" && <SchoolInfoTab />}
        {tab === "contact" && <ContactTab />}
        {tab === "activities" && <ListEditorTab kind="activities" />}
        {tab === "academics" && <ListEditorTab kind="academics" />}
        {tab === "faculty" && <ListEditorTab kind="faculty" />}
        {tab === "achievements" && <ListEditorTab kind="achievements" />}
        {tab === "gallery" && <GalleryTab />}
        {tab === "appearance" && <AppearanceTab />}
        {tab === "settings" && <SettingsTab />}
      </div>
    </section>
  );
}

function ApplicationsTab() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setLoadError(false);
    try {
      const items = await fetchAdmissions();
      setRecords(items);
    } catch (e) { console.error(e); setLoadError(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const removeApp = async (id) => {
    if (!window.confirm("Delete this application permanently?")) return;
    await deleteAdmission(id);
    setRecords((r) => r.filter((x) => x.id !== id));
    setSelected(null);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: T.inkSoft, margin: 0 }}>{loading ? "Loading..." : `${records.length} application${records.length === 1 ? "" : "s"} received`}</p>
        <Button variant="outlineDark" onClick={load}>Refresh</Button>
      </div>
      {loadError && <Card style={{ marginBottom: 20 }}><p style={{ fontFamily: "Inter, sans-serif", color: T.maroon, margin: 0 }}>Couldn't load applications. Try refreshing.</p></Card>}
      {!loading && records.length === 0 && !loadError && <Card><p style={{ fontFamily: "Inter, sans-serif", color: T.inkSoft, margin: 0 }}>No applications submitted yet.</p></Card>}
      {records.length > 0 && (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter, sans-serif", fontSize: 13.5 }}>
              <thead><tr style={{ background: T.navy }}>{["Student", "Class", "Father / Mother", "Contact", "Submitted", ""].map((h) => (<th key={h} style={{ textAlign: "left", padding: "12px 16px", color: T.gold, fontWeight: 700, fontSize: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={r.id} style={{ borderTop: `1px solid ${T.line}`, background: i % 2 ? "#FBFAF6" : "#fff" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: T.navy }}>{r.studentName}</td>
                    <td style={{ padding: "12px 16px" }}>{r.classApplying}</td>
                    <td style={{ padding: "12px 16px" }}>{r.fatherName || r.motherName || "-"}</td>
                    <td style={{ padding: "12px 16px" }}>{r.fatherMobile || r.motherMobile || "-"}</td>
                    <td style={{ padding: "12px 16px", color: T.inkSoft }}>{new Date(r.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td style={{ padding: "12px 16px", display: "flex", gap: 8 }}><Button variant="ghost" onClick={() => setSelected(r)}>View</Button><Button variant="danger" onClick={() => removeApp(r.id)}>Delete</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, background: "rgba(14,24,48,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 60 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 10, maxWidth: 480, width: "100%", padding: 28, maxHeight: "85vh", overflowY: "auto" }}>
            <h3 style={{ fontFamily: "Lora, serif", color: T.navy, fontSize: 20, margin: "0 0 16px" }}>{selected.studentName}</h3>
            {[
              ["Academic year", selected.academicYear], ["Class applying for", selected.classApplying],
              ["Date of birth", selected.dob], ["Gender", selected.gender], ["Blood group", selected.bloodGroup],
              ["Religion", selected.religion], ["Community", selected.community], ["Nationality", selected.nationality],
              ["Mother tongue", selected.motherTongue], ["Aadhar No.", selected.aadharNo],
              ["Father's name", selected.fatherName], ["Father's occupation", selected.fatherOccupation], ["Father's mobile", selected.fatherMobile],
              ["Mother's name", selected.motherName], ["Mother's occupation", selected.motherOccupation], ["Mother's mobile", selected.motherMobile],
              ["Email", selected.email], ["Address", selected.address],
              ["Emergency contact", `${selected.emergencyContactName || "-"} (${selected.emergencyContactNumber || "-"})`],
              ["Previous school", selected.previousSchool], ["Previous class", selected.previousClass],
              ["Message", selected.message || "-"],
              ["Submitted", new Date(selected.submittedAt).toLocaleString("en-IN")],
            ].map(([label, val]) => val ? (
              <div key={label} style={{ marginBottom: 12 }}>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: T.maroon }}>{label}</div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: T.ink, marginTop: 2, whiteSpace: "pre-wrap" }}>{val}</div>
              </div>
            ) : null)}
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <Button variant="primary" onClick={() => setSelected(null)} style={{ flex: 1 }}>Close</Button>
              <Button variant="danger" onClick={() => removeApp(selected.id)} style={{ flex: 1 }}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SchoolInfoTab() {
  const { school, saveSchool } = useSite();
  const [form, setForm] = useState(school);
  const [saved, setSaved] = useState(false);
  useEffect(() => setForm(school), [school]);
  const update = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setSaved(false); };
  const submit = async () => { await saveSchool(form); setSaved(true); };

  return (
    <Card style={{ maxWidth: 640 }}>
      <div>
        <Field label="School name"><input style={inputStyle} value={form.name} onChange={update("name")} /></Field>
        <Field label="Tagline"><input style={inputStyle} value={form.tagline} onChange={update("tagline")} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Established year"><input style={inputStyle} value={form.established} onChange={update("established")} /></Field>
          <Field label="Board"><input style={inputStyle} value={form.board} onChange={update("board")} /></Field>
        </div>
        <Field label="Admissions eligibility & documents"><textarea style={{ ...inputStyle, minHeight: 80 }} value={form.eligibility} onChange={update("eligibility")} /></Field>
        <Field label="Home page hero subtext"><textarea style={{ ...inputStyle, minHeight: 60 }} value={form.heroSubtext} onChange={update("heroSubtext")} /></Field>
        <Field label="About page intro (after school name)"><textarea style={{ ...inputStyle, minHeight: 60 }} value={form.aboutText} onChange={update("aboutText")} /></Field>
        <Field label="Our Mission"><textarea style={{ ...inputStyle, minHeight: 70 }} value={form.missionText} onChange={update("missionText")} /></Field>
        <Field label="Our Vision"><textarea style={{ ...inputStyle, minHeight: 70 }} value={form.visionText} onChange={update("visionText")} /></Field>
        <Field label="School logo">
          <PhotoPicker value={form.logoUrl} onChange={(dataUrl) => { setForm((f) => ({ ...f, logoUrl: dataUrl })); setSaved(false); }} label="Choose logo photo" />
        </Field>
        {saved && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: T.sage, marginTop: -8, marginBottom: 14 }}>Saved.</p>}
        <Button variant="primary" onClick={submit}>Save changes</Button>
      </div>
    </Card>
  );
}

function ContactTab() {
  const { school, saveSchool } = useSite();
  const [form, setForm] = useState(school);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => setForm(school), [school]);
  const update = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setSaved(false); };
  const submit = async () => {
    setBusy(true);
    setErr("");
    try {
      await saveSchool(form);
      setSaved(true);
    } catch (e) {
      console.error(e);
      setErr("Couldn't save. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card style={{ maxWidth: 640 }}>
      <div>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: T.inkSoft, marginTop: 0, marginBottom: 18 }}>
          This is what shows up on the public "Contact us" page.
        </p>
        <Field label="Address"><textarea style={{ ...inputStyle, minHeight: 60 }} value={form.address} onChange={update("address")} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Phone"><input style={inputStyle} value={form.phone} onChange={update("phone")} /></Field>
          <Field label="Email"><input style={inputStyle} value={form.email} onChange={update("email")} /></Field>
        </div>
        <Field label="Correspondent name"><input style={inputStyle} value={form.correspondent} onChange={update("correspondent")} /></Field>
        <Field label="Map pin location (latitude, longitude)">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input style={inputStyle} value={form.mapLat} onChange={update("mapLat")} placeholder="Latitude" />
            <input style={inputStyle} value={form.mapLng} onChange={update("mapLng")} placeholder="Longitude" />
          </div>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: T.inkSoft, marginTop: 6 }}>Right-click your school on Google Maps to copy exact coordinates.</p>
        </Field>
        {err && <ErrText>{err}</ErrText>}
        {saved && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: T.sage, marginTop: -8, marginBottom: 14 }}>Saved.</p>}
        <Button variant="primary" onClick={submit} disabled={busy}>{busy ? "Saving..." : "Save changes"}</Button>
      </div>
    </Card>
  );
}

const KIND_META = {
  activities: { title: "Activity", fields: [{ key: "title", label: "Title" }, { key: "desc", label: "Description", type: "textarea" }] },
  faculty: { title: "Faculty member", fields: [{ key: "name", label: "Name" }, { key: "role", label: "Role" }, { key: "dept", label: "Department" }] },
  academics: { title: "Class / Stage", fields: [{ key: "title", label: "Class name" }, { key: "desc", label: "Description", type: "textarea" }] },
  achievements: { title: "Achievement", fields: [{ key: "title", label: "Title" }, { key: "date", label: "Date", type: "date" }, { key: "desc", label: "Description", type: "textarea" }] },
};

function ListEditorTab({ kind }) {
  const site = useSite();
  const meta = KIND_META[kind];
  const list = site[kind];
  const save = site[`save${kind[0].toUpperCase()}${kind.slice(1)}`];
  const [editing, setEditing] = useState(null);
  const blank = Object.fromEntries(meta.fields.map((f) => [f.key, ""]));

  const startNew = () => setEditing({ ...blank, id: `${kind[0]}${Date.now()}` });
  const startEdit = (item) => setEditing({ ...item });
  const remove = async (id) => { await save(list.filter((i) => i.id !== id)); };
  const submit = async () => {
    const exists = list.some((i) => i.id === editing.id);
    const next = exists ? list.map((i) => (i.id === editing.id ? editing : i)) : [...list, editing];
    await save(next);
    setEditing(null);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: T.inkSoft, margin: 0 }}>{list.length} {meta.title.toLowerCase()}{list.length === 1 ? "" : "s"}</p>
        <Button variant="primary" onClick={startNew}>+ Add {meta.title.toLowerCase()}</Button>
      </div>
      {editing && (
        <Card style={{ marginBottom: 20 }}>
          <div>
            {meta.fields.map((f) => (
              <Field key={f.key} label={f.label}>
                {f.key === "imageUrl" ? (
                  <PhotoPicker value={editing[f.key]} onChange={(dataUrl) => setEditing((x) => ({ ...x, [f.key]: dataUrl }))} />
                ) : f.type === "textarea" ? (
                  <textarea style={{ ...inputStyle, minHeight: 70 }} value={editing[f.key] || ""} onChange={(e) => setEditing((x) => ({ ...x, [f.key]: e.target.value }))} />
                ) : (
                  <input type={f.type || "text"} style={inputStyle} value={editing[f.key] || ""} onChange={(e) => setEditing((x) => ({ ...x, [f.key]: e.target.value }))} />
                )}
              </Field>
            ))}
            <div style={{ display: "flex", gap: 10 }}>
              <Button variant="primary" onClick={submit}>Save</Button>
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {list.map((item) => (
          <Card key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
            <div><div style={{ fontFamily: "Lora, serif", fontWeight: 600, fontSize: 15, color: T.navy }}>{item.title || item.name}</div><div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: T.inkSoft }}>{item.desc || item.role || item.date}</div></div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}><Button variant="ghost" onClick={() => startEdit(item)}>Edit</Button><Button variant="danger" onClick={() => remove(item.id)}>Delete</Button></div>
          </Card>
        ))}
        {list.length === 0 && <p style={{ fontFamily: "Inter, sans-serif", color: T.inkSoft }}>Nothing here yet - add the first one above.</p>}
      </div>
    </div>
  );
}

function GalleryTab() {
  const { gallery, galleryLoaded, loadGallery, addPhoto, editPhoto, removePhoto } = useSite();
  const [editing, setEditing] = useState(null); // {id?, title, imageUrl}
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [loadingList, setLoadingList] = useState(!galleryLoaded);

  useEffect(() => {
    if (!galleryLoaded) {
      setLoadingList(true);
      loadGallery().finally(() => setLoadingList(false));
    }
  }, [galleryLoaded, loadGallery]);

  const startNew = () => setEditing({ title: "", imageUrl: "" });
  const startEdit = (item) => setEditing({ ...item });

  const submit = async () => {
    if (!editing.imageUrl || !editing.imageUrl.trim()) {
      setSaveError("Paste an image link before saving.");
      return;
    }
    setBusy(true);
    setSaveError("");
    try {
      const finalUrl = toDirectImageUrl(editing.imageUrl.trim());
      if (editing.id) await editPhoto(editing.id, { title: editing.title, imageUrl: finalUrl });
      else await addPhoto({ title: editing.title, imageUrl: finalUrl });
      setEditing(null);
    } catch (e) {
      console.error(e);
      setSaveError(e && e.message ? e.message : "Couldn't save this photo. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this photo?")) return;
    await removePhoto(id);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: T.inkSoft, margin: 0 }}>{gallery.length} photo{gallery.length === 1 ? "" : "s"} - no limit on how many you can add</p>
        <Button variant="primary" onClick={startNew}>+ Add photo</Button>
      </div>

      {editing && (
        <Card style={{ marginBottom: 20 }}>
          <Field label="Caption">
            <input style={inputStyle} value={editing.title} onChange={(e) => setEditing((x) => ({ ...x, title: e.target.value }))} />
          </Field>

          <Field label="Image link">
            <input
              style={inputStyle}
              placeholder="Paste a Google Drive share link or any image URL"
              value={editing.imageUrl}
              onChange={(e) => setEditing((x) => ({ ...x, imageUrl: e.target.value }))}
            />
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: T.inkSoft, marginTop: 6 }}>
              Tip: for a Google Drive link, open the file in Drive → Share → "Anyone with the link", then paste the link here. It'll be converted automatically.
            </p>
          </Field>

          {editing.imageUrl && (
            <div style={{ width: 100, height: 100, borderRadius: 8, overflow: "hidden", border: `1px solid ${T.line}`, marginBottom: 14, background: T.line }}>
              <img
                src={toDirectImageUrl(editing.imageUrl)}
                alt="Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          )}
          {isDriveLink(editing.imageUrl) && (
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: T.sage, marginTop: -10, marginBottom: 10 }}>
              Google Drive link detected — it'll be saved as a direct image link.
            </p>
          )}

          {saveError && (
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: T.maroon, marginBottom: 10 }}>
              {saveError}
            </p>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="primary" onClick={submit} disabled={busy}>{busy ? "Saving..." : "Save"}</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
        {gallery.map((item) => (
          <div key={item.id} style={{ border: `1px solid ${T.line}`, borderRadius: 8, overflow: "hidden", background: "#fff" }}>
            <div style={{ aspectRatio: "4/3", background: T.line, overflow: "hidden" }}>
              {item.imageUrl && <img src={item.imageUrl} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            </div>
            <div style={{ padding: 8 }}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, fontWeight: 600, color: T.navy, marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title || "Untitled"}</div>
              <div style={{ display: "flex", gap: 6 }}>
                <Button variant="ghost" onClick={() => startEdit(item)} style={{ padding: "4px 8px", fontSize: 12 }}>Edit</Button>
                <Button variant="danger" onClick={() => remove(item.id)} style={{ padding: "4px 8px", fontSize: 12 }}>Delete</Button>
              </div>
            </div>
          </div>
        ))}
        {gallery.length === 0 && <p style={{ fontFamily: "Inter, sans-serif", color: T.inkSoft, gridColumn: "1 / -1" }}>No photos added yet.</p>}
      </div>
    </div>
  );
}

const THEME_FIELDS = [
  { key: "navy", label: "Primary dark (navy)" }, { key: "navyDeep", label: "Primary darker" },
  { key: "maroon", label: "Accent (maroon)" }, { key: "maroonDeep", label: "Accent darker" },
  { key: "gold", label: "Highlight (gold)" }, { key: "cream", label: "Background (cream)" },
];

function AppearanceTab() {
  const { theme, saveTheme } = useSite();
  const [form, setForm] = useState(theme);
  const [saved, setSaved] = useState(false);
  useEffect(() => setForm(theme), [theme]);
  const update = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setSaved(false); };
  const submit = async () => { await saveTheme(form); setSaved(true); };
  const resetDefaults = async () => { await saveTheme(DEFAULT_THEME); setForm(DEFAULT_THEME); setSaved(true); };

  return (
    <Card style={{ maxWidth: 480 }}>
      <h3 style={{ fontFamily: "Lora, serif", color: T.navy, fontSize: 18, margin: "0 0 16px" }}>Site colors</h3>
      <div>
        {THEME_FIELDS.map((f) => (
          <Field key={f.key} label={f.label}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input type="color" value={form[f.key]} onChange={update(f.key)} style={{ width: 44, height: 38, padding: 2, border: `1px solid ${T.line}`, borderRadius: 6, cursor: "pointer" }} />
              <input style={inputStyle} value={form[f.key]} onChange={update(f.key)} />
            </div>
          </Field>
        ))}
        {saved && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: T.sage, marginTop: -8, marginBottom: 14 }}>Colors updated.</p>}
        <div style={{ display: "flex", gap: 10 }}><Button variant="primary" onClick={submit}>Save colors</Button><Button variant="ghost" onClick={resetDefaults}>Reset to default</Button></div>
      </div>
    </Card>
  );
}

function SettingsTab() {
  const { user } = useSite();
  const [current, setCurrent] = useState("");
  const [next1, setNext1] = useState("");
  const [next2, setNext2] = useState("");
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setOk(false); setMsg("");
    if (next1.length < 6) return setMsg("New password must be at least 6 characters.");
    if (next1 !== next2) return setMsg("New passwords don't match.");
    setBusy(true);
    try {
      await changeOwnPassword(current, next1);
      setMsg("Password updated.");
      setOk(true);
      setCurrent(""); setNext1(""); setNext2("");
    } catch (e) {
      setMsg("Current password is incorrect, or the change failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card style={{ maxWidth: 420 }}>
      <h3 style={{ fontFamily: "Lora, serif", color: T.navy, fontSize: 18, margin: "0 0 6px" }}>Change your password</h3>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: T.inkSoft, marginBottom: 16 }}>Logged in as {user && user.email}</p>
      <div onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } }}>
        <PasswordField label="Current password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        <PasswordField label="New password" value={next1} onChange={(e) => setNext1(e.target.value)} />
        <PasswordField label="Confirm new password" value={next2} onChange={(e) => setNext2(e.target.value)} />
        {msg && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: ok ? T.sage : T.maroon, marginTop: -8, marginBottom: 14 }}>{msg}</p>}
        <Button variant="primary" onClick={submit} disabled={busy}>{busy ? "Updating..." : "Update password"}</Button>
      </div>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: T.inkSoft, marginTop: 18, lineHeight: 1.6 }}>To add or remove staff accounts, use the Firebase Console → Authentication → Users tab.</p>
    </Card>
  );
}

/* ---------------------------------------------------------
   INTRO ANIMATION + APP ROOT
--------------------------------------------------------- */
function IntroAnimation({ onDone, ready }) {
  const { school } = useSite();
  const [minTimeDone, setMinTimeDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMinTimeDone(true), 700);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (ready && minTimeDone) {
      const t = setTimeout(onDone, 350); // small buffer for the fade-out animation
      return () => clearTimeout(t);
    }
  }, [ready, minTimeDone, onDone]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: `linear-gradient(180deg, ${T.navy}, ${T.navyDeep})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: ready && minTimeDone ? 0 : 1, visibility: ready && minTimeDone ? "hidden" : "visible", transition: "opacity 0.35s ease" }}>
      <div style={{ animation: "kkPopIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards" }}><Crest size={84} logoUrl={school.logoUrl} /></div>
      <div style={{ marginTop: 18, opacity: 0, animation: "kkFadeUp 0.5s ease 0.25s forwards" }}>
        <div style={{ fontFamily: "Lora, serif", fontWeight: 700, fontSize: 20, color: T.cream, textAlign: "center" }}>{school.name}</div>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: T.gold, textAlign: "center", marginTop: 6 }}>{school.tagline}</div>
      </div>
      <style>{`
        @keyframes kkPopIn { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
        @keyframes kkFadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

function SiteBody() {
  const [page, setPage] = useState("home");
  const [showIntro, setShowIntro] = useState(true);
  const { isAdmin, loading, authReady } = useSite();
  const dataReady = !loading && authReady;

  const renderPage = () => {
    switch (page) {
      case "home": return <Home setPage={setPage} />;
      case "about": return <About />;
      case "academics": return <Academics />;
      case "activities": return <ActivitiesPage />;
      case "faculty": return <Faculty />;
      case "achievements": return <AchievementsPage />;
      case "gallery": return <Gallery />;
      case "admissions": return <Admissions />;
      case "contact": return <Contact />;
      case "login": return <AdminLogin setPage={setPage} />;
      case "admin": return isAdmin ? <AdminDashboard setPage={setPage} /> : <AdminLogin setPage={setPage} />;
      default: return <Home setPage={setPage} />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: T.bgSection }}>
      {showIntro && <IntroAnimation ready={dataReady} onDone={() => setShowIntro(false)} />}
      <Nav page={page} setPage={setPage} />
      <div style={{ flex: 1 }}>{renderPage()}</div>
      <Footer setPage={setPage} />
    </div>
  );
}

export default function App() {
  useFonts();
  applyTheme(DEFAULT_THEME);
  return (
    <SiteProvider>
      <SiteBody />
    </SiteProvider>
  );
}
