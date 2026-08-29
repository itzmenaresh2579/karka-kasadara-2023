import {
  doc, getDoc, setDoc,
  collection, getDocs, addDoc, deleteDoc, query, orderBy
} from "firebase/firestore";
import { db } from "./config";

// ---- Single-document content (home / about / contact) ----
export async function getContent(key) {
  const ref = doc(db, "content", key);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function saveContent(key, data) {
  const ref = doc(db, "content", key);
  await setDoc(ref, data, { merge: true });
}

// ---- Gallery collection ----
export async function getGalleryImages() {
  const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addGalleryImage({ imageBase64, imageUrl, caption }) {
  await addDoc(collection(db, "gallery"), {
    ...(imageBase64 ? { imageBase64 } : {}),
    ...(imageUrl ? { imageUrl } : {}),
    caption: caption || "",
    createdAt: Date.now()
  });
}

export async function deleteGalleryImage(id) {
  await deleteDoc(doc(db, "gallery", id));
}
