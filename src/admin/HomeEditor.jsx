import { useEffect, useState } from "react";
import { getContent, saveContent } from "../firebase/contentService";

const EMPTY_PROGRAM = { title: "", desc: "", color: "marigold" };

const DEFAULTS = {
  heroTitle: "Where little steps begin big journeys",
  heroSubtitle: "Karka Kasadara Kids School is a warm, joyful play school in Kodumudi — where every child learns through play, stories, and love.",
  aboutSnippet: "At Karka Kasadara, we believe learning happens best through play. Our caring teachers create a safe, cheerful space where children explore, question, and grow — one happy day at a time.",
  programs: [
    { title: "Play & Explore", desc: "Hands-on activities that build curiosity through everyday play.", color: "marigold" },
    { title: "Rhymes & Stories", desc: "Tamil and English rhymes, stories, and songs every single day.", color: "coral" },
    { title: "Art & Craft", desc: "Colours, clay, and craft to build little fingers and big imaginations.", color: "leaf" },
    { title: "Care & Safety", desc: "Warm, attentive teachers and a safe, clean campus for every child.", color: "sky" },
  ],
};

export default function HomeEditor() {
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getContent("home");
      if (data) setForm({ ...DEFAULTS, ...data });
      setLoading(false);
    })();
  }, []);

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const updateProgram = (i, field, value) => {
    const programs = [...form.programs];
    programs[i] = { ...programs[i], [field]: value };
    setForm(f => ({ ...f, programs }));
  };

  const addProgram = () => setForm(f => ({ ...f, programs: [...f.programs, { ...EMPTY_PROGRAM }] }));
  const removeProgram = (i) => setForm(f => ({ ...f, programs: f.programs.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await saveContent("home", form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) return <div className="loading-wrap">Loading…</div>;

  return (
    <div>
      <h3>Home Page</h3>
      <p className="admin-panel-sub">Edit the text shown on your website's homepage.</p>

      <label className="form-label">Hero Title</label>
      <input className="form-input" value={form.heroTitle}
        onChange={e => update("heroTitle", e.target.value)}
        placeholder="Where little steps begin big journeys" />

      <label className="form-label">Hero Subtitle</label>
      <textarea className="form-textarea" value={form.heroSubtitle}
        onChange={e => update("heroSubtitle", e.target.value)}
        placeholder="A short welcoming line about your school" />

      <label className="form-label">About Snippet (shown below hero)</label>
      <textarea className="form-textarea" value={form.aboutSnippet}
        onChange={e => update("aboutSnippet", e.target.value)}
        placeholder="A short paragraph about your school" />

      <div style={{ marginTop: 24 }}>
        <label className="form-label" style={{ marginTop: 0 }}>Programs / Highlights</label>
        {form.programs.map((p, i) => (
          <div className="admin-program-item" key={i}>
            <button className="admin-remove-btn" onClick={() => removeProgram(i)} type="button">✕</button>
            <label className="form-label" style={{ marginTop: 0 }}>Title</label>
            <input className="form-input" value={p.title} onChange={e => updateProgram(i, "title", e.target.value)} />
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={p.desc} onChange={e => updateProgram(i, "desc", e.target.value)} />
            <label className="form-label">Color</label>
            <select className="form-input" value={p.color} onChange={e => updateProgram(i, "color", e.target.value)}>
              <option value="marigold">Marigold (Yellow)</option>
              <option value="coral">Coral (Pink-Orange)</option>
              <option value="leaf">Leaf (Green)</option>
              <option value="sky">Sky (Blue)</option>
            </select>
          </div>
        ))}
        <button className="admin-add-btn" onClick={addProgram} type="button">+ Add Program</button>
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
