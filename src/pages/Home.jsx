import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getContent, getGalleryImages } from "../firebase/contentService";
import GarlandDivider from "../components/GarlandDivider";
import HeroIllustration from "../components/HeroIllustration";
import Reveal from "../components/Reveal";
import { PROGRAM_ICONS } from "../components/ProgramIcons";
import "./Home.css";

const DEFAULT_PROGRAMS = [
  { title: "Play & Explore", desc: "Hands-on activities that build curiosity through everyday play.", color: "marigold" },
  { title: "Rhymes & Stories", desc: "Tamil and English rhymes, stories, and songs every single day.", color: "coral" },
  { title: "Art & Craft", desc: "Colours, clay, and craft to build little fingers and big imaginations.", color: "leaf" },
  { title: "Care & Safety", desc: "Warm, attentive teachers and a safe, clean campus for every child.", color: "sky" },
];

const STATS = [
  { value: "8+", label: "Years of Care" },
  { value: "150+", label: "Happy Children" },
  { value: "12", label: "Loving Teachers" },
  { value: "100%", label: "Parent Trust" },
];

const TESTIMONIALS = [
  { quote: "My daughter runs to school every morning now — she loves her teachers and friends at Karka Kasadara.", name: "Parent, Kodumudi" },
  { quote: "The teachers treat every child like their own. We finally found a school that feels like home.", name: "Parent, Kodumudi" },
  { quote: "From shy to confident in just a few months. Thank you for the wonderful care.", name: "Parent, Kodumudi" },
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

  const titleWords = heroTitle.split(" ");

  return (
    <div className="home-page">
      {/* HERO */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow hero-eyebrow">✨ Welcome to our school</span>
            <h1 className="hero-title">
              {titleWords.map((word, i) => (
                <span key={i} className={i === Math.floor(titleWords.length * 0.62) ? "hero-title-accent" : ""}>
                  {word}{" "}
                </span>
              ))}
            </h1>
            <p className="hero-subtitle">{heroSubtitle}</p>
            <div className="hero-actions">
              <Link to="/contact" className="btn btn-primary btn-lg">Enquire for Admission</Link>
              <Link to="/gallery" className="btn btn-outline btn-lg">See our School</Link>
            </div>
          </div>
          <div className="hero-art">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <Reveal>
        <section className="stats-strip">
          <div className="container stats-grid">
            {STATS.map((s, i) => (
              <div className="stat-item" key={i}>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      <GarlandDivider bg="var(--white)" />

      {/* ABOUT SNIPPET */}
      <section className="section" style={{ background: "var(--white)" }}>
        <div className="container grid-2">
          <Reveal>
            <div className="about-photo-stack">
              <div className="about-photo-block about-photo-1">
                <span className="about-photo-emoji">🎨</span>
              </div>
              <div className="about-photo-block about-photo-2">
                <span className="about-photo-emoji">📚</span>
              </div>
              <div className="about-badge">
                <strong>8+</strong>
                <span>Years in Kodumudi</span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div>
              <span className="eyebrow">About us</span>
              <h2>A joyful place to grow</h2>
              <p style={{ color: "var(--ink-soft)", fontSize: "1.05rem" }}>{aboutSnippet}</p>
              <Link to="/about" className="btn btn-outline" style={{ marginTop: 10 }}>Read our Story</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <GarlandDivider bg="var(--cream)" flip />

      {/* PROGRAMS */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <span className="eyebrow">What we offer</span>
              <h2>A day full of little wonders</h2>
            </div>
          </Reveal>
          <div className="grid-3 programs-grid">
            {programs.map((p, i) => {
              const Icon = PROGRAM_ICONS[p.color] || PROGRAM_ICONS.marigold;
              return (
                <Reveal key={i} delay={i * 90}>
                  <div className="card program-card">
                    <div className="program-icon-wrap"><Icon /></div>
                    <h3>{p.title}</h3>
                    <p style={{ color: "var(--ink-soft)", margin: 0 }}>{p.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      {gallery.length > 0 && (
        <section className="section" style={{ background: "var(--white)" }}>
          <div className="container">
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <span className="eyebrow">Glimpses</span>
                <h2>A peek into our school days</h2>
              </div>
            </Reveal>
            <div className="grid-4 gallery-preview-grid">
              {gallery.map((img, i) => (
                <Reveal key={img.id} delay={i * 80}>
                  <div className="gallery-preview-item">
                    <img src={img.imageUrl || img.imageBase64} alt={img.caption || "School moment"} />
                  </div>
                </Reveal>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <Link to="/gallery" className="btn btn-primary">View Full Gallery</Link>
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      <section className="section testimonial-section">
        <div className="container">
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <span className="eyebrow">Parents love us</span>
              <h2>What families say</h2>
            </div>
          </Reveal>
          <div className="grid-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="card testimonial-card">
                  <div className="testimonial-mark">"</div>
                  <p className="testimonial-quote">{t.quote}</p>
                  <div className="testimonial-name">— {t.name}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <Reveal>
        <section className="cta-band">
          <div className="cta-pattern" />
          <div className="container cta-inner">
            <h2 style={{ color: "#fff", marginBottom: 8 }}>Ready to begin the journey?</h2>
            <p style={{ color: "rgba(255,255,255,0.85)", marginBottom: 24 }}>Book a visit and see why families in Kodumudi love Karka Kasadara.</p>
            <Link to="/contact" className="btn btn-light btn-lg">Contact Us Today</Link>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
