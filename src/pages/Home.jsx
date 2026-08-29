import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getContent, getGalleryImages } from "../firebase/contentService";
import GarlandDivider from "../components/GarlandDivider";
import "./Home.css";

const DEFAULT_PROGRAMS = [
  { title: "Play & Explore", desc: "Hands-on activities that build curiosity through everyday play.", color: "marigold" },
  { title: "Rhymes & Stories", desc: "Tamil and English rhymes, stories, and songs every single day.", color: "coral" },
  { title: "Art & Craft", desc: "Colours, clay, and craft to build little fingers and big imaginations.", color: "leaf" },
  { title: "Care & Safety", desc: "Warm, attentive teachers and a safe, clean campus for every child.", color: "sky" },
];

export default function Home() {
  const [content, setContent] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [home, imgs] = await Promise.all([getContent("home"), getGalleryImages()]);
      setContent(home);
      setGallery(imgs.slice(0, 4));
      setLoading(false);
    })();
  }, []);

  const heroTitle = content?.heroTitle || "Where little steps begin big journeys";
  const heroSubtitle = content?.heroSubtitle || "Karka Kasadara Kids School is a warm, joyful play school in Kodumudi — where every child learns through play, stories, and love.";
  const aboutSnippet = content?.aboutSnippet || "At Karka Kasadara, we believe learning happens best through play. Our caring teachers create a safe, cheerful space where children explore, question, and grow — one happy day at a time.";
  const programs = content?.programs?.length ? content.programs : DEFAULT_PROGRAMS;

  if (loading) return <div className="loading-wrap">Loading…</div>;

  return (
    <div>
      {/* HERO */}
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <span className="eyebrow">Welcome to our school</span>
            <h1 className="hero-title">{heroTitle}</h1>
            <p className="hero-subtitle">{heroSubtitle}</p>
            <div className="hero-actions">
              <Link to="/contact" className="btn btn-primary">Enquire for Admission</Link>
              <Link to="/gallery" className="btn btn-outline">See our School</Link>
            </div>
          </div>
          <div className="hero-art">
            <div className="hero-blob" />
            <div className="hero-circle hero-circle-1" />
            <div className="hero-circle hero-circle-2" />
            <div className="hero-circle hero-circle-3" />
          </div>
        </div>
      </section>

      <GarlandDivider bg="var(--white)" />

      {/* ABOUT SNIPPET */}
      <section className="section" style={{ background: "var(--white)" }}>
        <div className="container grid-2">
          <div className="about-photo-stack">
            <div className="about-photo-block about-photo-1" />
            <div className="about-photo-block about-photo-2" />
          </div>
          <div>
            <span className="eyebrow">About us</span>
            <h2>A joyful place to grow</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: "1.05rem" }}>{aboutSnippet}</p>
            <Link to="/about" className="btn btn-outline" style={{ marginTop: 10 }}>Read our Story</Link>
          </div>
        </div>
      </section>

      <GarlandDivider bg="var(--cream)" flip />

      {/* PROGRAMS */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <span className="eyebrow">What we offer</span>
            <h2>A day full of little wonders</h2>
          </div>
          <div className="grid-3 programs-grid">
            {programs.map((p, i) => (
              <div className="card program-card" key={i}>
                <div className={`program-icon program-icon-${p.color || "marigold"}`} />
                <h3>{p.title}</h3>
                <p style={{ color: "var(--ink-soft)", margin: 0 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      {gallery.length > 0 && (
        <section className="section" style={{ background: "var(--white)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <span className="eyebrow">Glimpses</span>
              <h2>A peek into our school days</h2>
            </div>
            <div className="grid-4 gallery-preview-grid">
              {gallery.map(img => (
                <div className="gallery-preview-item" key={img.id}>
                  <img src={img.imageUrl || img.imageBase64} alt={img.caption || "School moment"} />
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <Link to="/gallery" className="btn btn-primary">View Full Gallery</Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="cta-band">
        <div className="container cta-inner">
          <h2 style={{ color: "#fff", marginBottom: 8 }}>Ready to begin the journey?</h2>
          <p style={{ color: "rgba(255,255,255,0.85)", marginBottom: 24 }}>Book a visit and see why families in Kodumudi love Karka Kasadara.</p>
          <Link to="/contact" className="btn btn-light">Contact Us Today</Link>
        </div>
      </section>
    </div>
  );
}
