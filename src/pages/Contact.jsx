import { useEffect, useState } from "react";
import { getContent } from "../firebase/contentService";
import "./Contact.css";

export default function Contact() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setContent(await getContent("contact"));
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="loading-wrap">Loading…</div>;

  const address = content?.address || "Karka Kasadara Kids School, Kodumudi, Erode District, Tamil Nadu";
  const phone = content?.phone || "+91 00000 00000";
  const email = content?.email || "info@karka-kasadara.example";
  const timings = content?.timings || "Monday – Saturday, 9:00 AM – 1:00 PM";
  const mapLink = content?.mapLink || "https://maps.google.com/?q=Kodumudi+Tamil+Nadu";
  const whatsapp = content?.whatsapp || phone;

  return (
    <div>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Get in touch</span>
          <h1>Come visit us, we'd love to meet you</h1>
        </div>
      </section>

      <section className="section" style={{ background: "var(--white)" }}>
        <div className="container grid-2">
          <div>
            <h2>Admission Enquiry</h2>
            <p style={{ color: "var(--ink-soft)" }}>
              Reach out to us on call or WhatsApp for admission details, fee structure, and to
              schedule a visit to our campus. Our team will be happy to help you.
            </p>

            <div className="contact-info-list">
              <div className="contact-info-item">
                <div className="contact-icon-dot" style={{ background: "var(--coral)" }} />
                <div>
                  <strong>Address</strong>
                  <p>{address}</p>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-icon-dot" style={{ background: "var(--marigold)" }} />
                <div>
                  <strong>Phone</strong>
                  <p>{phone}</p>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-icon-dot" style={{ background: "var(--leaf)" }} />
                <div>
                  <strong>Email</strong>
                  <p>{email}</p>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-icon-dot" style={{ background: "var(--sky)" }} />
                <div>
                  <strong>School Hours</strong>
                  <p>{timings}</p>
                </div>
              </div>
            </div>

            <div className="contact-actions">
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="btn btn-primary">Call Now</a>
              <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="btn btn-outline">WhatsApp Us</a>
            </div>
          </div>

          <div>
            <div className="map-card">
              <a href={mapLink} target="_blank" rel="noreferrer" className="map-placeholder">
                <span>📍 View on Google Maps</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
