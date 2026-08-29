import { useEffect, useState } from "react";
import { getContent, saveContent } from "../firebase/contentService";

const EMPTY_VALUE = { title: "", desc: "" };

const DEFAULTS = {
  title: "Our Story",
  body: "Karka Kasadara Kids School began with a simple idea — that young children learn best when they feel safe, loved, and free to explore. Nestled in Kodumudi, our school has grown into a warm second home for little ones, guided by caring teachers who treat every child like family.",
  mission: "To nurture every child's natural curiosity through joyful, play-based learning in a safe and caring environment.",
  vision: "To be Kodumudi's most loved play school — a place where children take their very first confident steps into learning.",
  values: [
    { title: "Warmth", desc: "Every child is welcomed like family." },
    { title: "Curiosity", desc: "We follow the child's natural wonder." },
    { title: "Safety", desc: "A clean, secure campus, always supervised." },
    { title: "Community", desc: "Parents and teachers grow together." },
  ],
};

export default function AboutEditor() {
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getContent("about");
      if (data) setForm({ ...DEFAULTS, ...data });
      setLoading(false);
    })();
  }, []);

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const updateValue = (i, field, value) => {
    const values = [...form.values];
    values[i] = { ...values[i], [field]: value };
    setForm(f => ({ ...f, values }));
  };
  const addValue = () => setForm(f => ({ ...f, values: [...f.values, { ...EMPTY_VALUE }] }));
  const removeValue = (i) => setForm(f => ({ ...f, values: f.values.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await saveContent("about", form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) return <div className="loading-wrap">Loading…</div>;

  return (
    <div>
      <h3>About Page</h3>
      <p className="admin-panel-sub">Edit your school's story, mission, vision, and values.</p>

      <label className="form-label">Page Title</label>
      <input className="form-input" value={form.title} onChange={e => update("title", e.target.value)} placeholder="Our Story" />

      <label className="form-label">Story / About Body</label>
      <textarea className="form-textarea" rows={5} value={form.body} onChange={e => update("body", e.target.value)} />

      <div className="admin-field-row">
        <div>
          <label className="form-label">Mission</label>
          <textarea className="form-textarea" value={form.mission} onChange={e => update("mission", e.target.value)} />
        </div>
        <div>
          <label className="form-label">Vision</label>
          <textarea className="form-textarea" value={form.vision} onChange={e => update("vision", e.target.value)} />
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <label className="form-label" style={{ marginTop: 0 }}>Our Values</label>
        {form.values.map((v, i) => (
          <div className="admin-program-item" key={i}>
            <button className="admin-remove-btn" onClick={() => removeValue(i)} type="button">✕</button>
            <label className="form-label" style={{ marginTop: 0 }}>Title</label>
            <input className="form-input" value={v.title} onChange={e => updateValue(i, "title", e.target.value)} />
            <label className="form-label">Description</label>
            <input className="form-input" value={v.desc} onChange={e => updateValue(i, "desc", e.target.value)} />
          </div>
        ))}
        <button className="admin-add-btn" onClick={addValue} type="button">+ Add Value</button>
      </div>

      <div className="admin-save-bar">
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
        {saved && <span className="form-success">Saved successfully!</span>}
      </div>
    </div>
  );
}
