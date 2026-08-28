import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase.js";

export async function fetchGalleryPhotos() {
  const snap = await getDocs(collection(db, "gallery_photos"));
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  items.sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));
  return items;
}

export async function addGalleryPhoto(record) {
  return addDoc(collection(db, "gallery_photos"), {
    ...record,
    createdAt: new Date().toISOString(),
  });
}

export async function updateGalleryPhoto(id, record) {
  return updateDoc(doc(db, "gallery_photos", id), record);
}

export async function deleteGalleryPhoto(id) {
  return deleteDoc(doc(db, "gallery_photos", id));
}
