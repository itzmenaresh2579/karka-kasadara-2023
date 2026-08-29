import { useEffect, useState } from "react";
import { getContent, saveContent } from "../firebase/contentService";

const DEFAULTS = {
  address: "Karka Kasadara Kids School, Kodumudi, Erode District, Tamil Nadu",
  phone: "+91 00000 00000",
  email: "info@karka-kasadara.example",
  timings: "Monday – Saturday, 9:00 AM – 1:00 PM",
  mapLink: "https://maps.google.com/?q=Kodumudi+Tamil+Nadu",
  whatsapp: "+91 00000 00000",
};

export default function ContactEditor() {
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getContent("contact");
      if (data) setForm({ ...DEFAULTS, ...data });
      setLoading(false);
    })();
  }, []);

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await saveContent("contact", form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) return <div className="loading-wrap">Loading…</div>;

  return (
    <div>
      <h3>Contact Info</h3>
      <p className="admin-panel-sub">This appears on the Admission page and site footer.</p>

      <label className="form-label">Address</label>
      <textarea className="form-textarea" value={form.address} onChange={e => update("address", e.target.value)} />

      <div className="admin-field-row">
        <div>
          <label className="form-label">Phone Number</label>
          <input className="form-input" value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+91 90000 00000" />
        </div>
        <div>
          <label className="form-label">WhatsApp Number</label>
          <input className="form-input" value={form.whatsapp} onChange={e => update("whatsapp", e.target.value)} placeholder="+91 90000 00000" />
        </div>
      </div>

      <label className="form-label">Email</label>
      <input className="form-input" value={form.email} onChange={e => update("email", e.target.value)} />

      <label className="form-label">School Hours</label>
      <input className="form-input" value={form.timings} onChange={e => update("timings", e.target.value)} placeholder="Monday – Saturday, 9:00 AM – 1:00 PM" />

      <label className="form-label">Google Maps Link</label>
      <input className="form-input" value={form.mapLink} onChange={e => update("mapLink", e.target.value)} placeholder="https://maps.google.com/?q=..." />

      <div className="admin-save-bar">
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
        {saved && <span className="form-success">Saved successfully!</span>}
      </div>
    </div>
  );
}
