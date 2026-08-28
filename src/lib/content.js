import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase.js";

export async function getContentDoc(name, fallback) {
  try {
    const snap = await getDoc(doc(db, "content", name));
    if (snap.exists()) return snap.data();
    return fallback;
  } catch (e) {
    console.error("getContentDoc failed:", name, e);
    return fallback;
  }
}

export async function setContentDoc(name, data) {
  try {
    await setDoc(doc(db, "content", name), data);
    return true;
  } catch (e) {
    console.error("setContentDoc failed:", name, e);
    return false;
  }
}
