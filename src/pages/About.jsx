import { useEffect, useState } from "react";
import { getContent } from "../firebase/contentService";
import GarlandDivider from "../components/GarlandDivider";
import "./About.css";

export default function About() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getContent("about");
      setContent(data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="loading-wrap">Loading…</div>;

  const title = content?.title || "Our Story";
  const body = content?.body || "Karka Kasadara Kids School began with a simple idea — that young children learn best when they feel safe, loved, and free to explore. Nestled in Kodumudi, our school has grown into a warm second home for little ones, guided by caring teachers who treat every child like family.";
  const mission = content?.mission || "To nurture every child's natural curiosity through joyful, play-based learning in a safe and caring environment.";
  const vision = content?.vision || "To be Kodumudi's most loved play school — a place where children take their very first confident steps into learning.";
  const values = content?.values?.length ? content.values : [
    { title: "Warmth", desc: "Every child is welcomed like family." },
    { title: "Curiosity", desc: "We follow the child's natural wonder." },
    { title: "Safety", desc: "A clean, secure campus, always supervised." },
    { title: "Community", desc: "Parents and teachers grow together." },
  ];

  return (
    <div>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">About Karka Kasadara</span>
          <h1>{title}</h1>
        </div>
      </section>

      <GarlandDivider bg="var(--white)" />

      <section className="section" style={{ background: "var(--white)" }}>
        <div className="container">
          <p className="about-body">{body}</p>
        </div>
      </section>

      <section className="section">
        <div className="container grid-2">
          <div className="card mv-card">
            <div className="program-icon program-icon-coral" />
            <h3>Our Mission</h3>
            <p style={{ color: "var(--ink-soft)" }}>{mission}</p>
          </div>
          <div className="card mv-card">
            <div className="program-icon program-icon-leaf" />
            <h3>Our Vision</h3>
            <p style={{ color: "var(--ink-soft)" }}>{vision}</p>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--white)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <span className="eyebrow">What we stand for</span>
            <h2>Our Values</h2>
          </div>
          <div className="grid-4 values-grid">
            {values.map((v, i) => (
              <div className="value-item" key={i}>
                <div className="value-dot" />
                <h4>{v.title}</h4>
                <p style={{ color: "var(--ink-soft)", fontSize: "0.92rem" }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
