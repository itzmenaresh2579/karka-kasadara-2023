import { useEffect, useState, useRef } from "react";
import { getGalleryImages, addGalleryImage, deleteGalleryImage } from "../firebase/contentService";
import { fileToCompressedBase64 } from "../utils/imageUtils";

export default function GalleryManager() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("url"); // "url" | "upload"
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const load = async () => {
    setImages(await getGalleryImages());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const isValidImageUrl = (val) => {
    try {
      const u = new URL(val);
      return /^https?:$/.test(u.protocol);
    } catch {
      return false;
    }
  };

  const handleAddUrl = async (e) => {
    e.preventDefault();
    setError("");
    if (!isValidImageUrl(url)) {
      setError("Please paste a valid direct image link (starts with https://).");
      return;
    }
    setUploading(true);
    try {
      await addGalleryImage({ imageUrl: url.trim(), caption });
      setUrl("");
      setCaption("");
      await load();
    } catch (err) {
      setError("Couldn't add this image. Please check the link and try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const base64 = await fileToCompressedBase64(file);
      await addGalleryImage({ imageBase64: base64, caption });
      setCaption("");
      if (fileRef.current) fileRef.current.value = "";
      await load();
    } catch (err) {
      setError("Upload failed. Please try a different photo.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this photo?")) return;
    await deleteGalleryImage(id);
    await load();
  };

  return (
    <div>
      <h3>Gallery</h3>
      <p className="admin-panel-sub">
        Recommended: upload your photo to <strong>imgbb.com</strong>, copy the
        <strong> direct image link</strong> it gives you, and paste it below. This keeps your
        website fast and the link stays permanent.
      </p>

      <div className="gallery-mode-toggle">
        <button
          type="button"
          className={`gallery-mode-btn ${mode === "url" ? "is-active" : ""}`}
          onClick={() => setMode("url")}
        >
          Paste Image Link
        </button>
        <button
          type="button"
          className={`gallery-mode-btn ${mode === "upload" ? "is-active" : ""}`}
          onClick={() => setMode("upload")}
        >
          Upload from Phone
        </button>
      </div>

      {mode === "url" ? (
        <form onSubmit={handleAddUrl}>
          <label className="form-label" style={{ marginTop: 0 }}>ImgBB Direct Image Link</label>
          <input
            className="form-input"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://i.ibb.co/xxxxxxx/photo.jpg"
          />
          <label className="form-label">Caption (optional)</label>
          <input className="form-input" value={caption} onChange={e => setCaption(e.target.value)} placeholder="E.g. Art & Craft Day" />
          <button className="btn btn-primary" style={{ marginTop: 14 }} disabled={uploading || !url}>
            {uploading ? "Adding…" : "Add Photo"}
          </button>
        </form>
      ) : (
        <div>
          <label className="form-label" style={{ marginTop: 0 }}>Caption (optional)</label>
          <input className="form-input" value={caption} onChange={e => setCaption(e.target.value)} placeholder="E.g. Art & Craft Day" />
          <div className="admin-upload-box" style={{ marginTop: 16 }}>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleUploadFile}
              disabled={uploading}
              style={{ marginBottom: 10 }}
            />
            <p style={{ margin: 0, fontSize: "0.85rem" }}>
              {uploading ? "Uploading…" : "Tap to choose or take a photo"}
            </p>
          </div>
        </div>
      )}

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <div className="loading-wrap">Loading…</div>
      ) : (
        <div className="admin-gallery-grid">
          {images.map(img => (
            <div className="admin-gallery-item" key={img.id}>
              <img src={img.imageUrl || img.imageBase64} alt={img.caption || ""} />
              <button className="admin-gallery-delete" onClick={() => handleDelete(img.id)} type="button">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
