import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase.js";

export async function submitAdmission(record) {
  return addDoc(collection(db, "admissions"), {
    ...record,
    submittedAt: new Date().toISOString(),
  });
}

export async function fetchAdmissions() {
  const snap = await getDocs(collection(db, "admissions"));
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  items.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  return items;
}

export async function deleteAdmission(id) {
  return deleteDoc(doc(db, "admissions", id));
}
