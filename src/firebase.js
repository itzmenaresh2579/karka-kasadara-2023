import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAUM7Ia62UQBaCLbFaPQG714Ld8970bTkw",
  authDomain: "karka-kasadara-2023.firebaseapp.com",
  projectId: "karka-kasadara-2023",
  storageBucket: "karka-kasadara-2023.firebasestorage.app",
  messagingSenderId: "198784306756",
  appId: "1:198784306756:web:8691631e08cae5e0447611",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
