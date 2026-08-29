import { useEffect, useState } from "react";
import { getGalleryImages } from "../firebase/contentService";
import "./Gallery.css";

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);

  useEffect(() => {
    (async () => {
      setImages(await getGalleryImages());
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Our Gallery</span>
          <h1>Little moments, big smiles</h1>
        </div>
      </section>

      <section className="section" style={{ background: "var(--white)" }}>
        <div className="container">
          {loading && <div className="loading-wrap">Loading…</div>}
          {!loading && images.length === 0 && (
            <p style={{ textAlign: "center", color: "var(--ink-soft)" }}>Photos will appear here soon. Please check back!</p>
          )}
          <div className="gallery-masonry">
            {images.map(img => (
              <div className="gallery-tile" key={img.id} onClick={() => setActive(img)}>
                <img src={img.imageUrl || img.imageBase64} alt={img.caption || "School moment"} />
                {img.caption && <div className="gallery-caption">{img.caption}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {active && (
        <div className="lightbox" onClick={() => setActive(null)}>
          <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
            <img src={active.imageUrl || active.imageBase64} alt={active.caption || ""} />
            {active.caption && <p className="lightbox-caption">{active.caption}</p>}
            <button className="lightbox-close" onClick={() => setActive(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
