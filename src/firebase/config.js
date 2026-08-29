import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB4WeLMAz-rqAfp-L3HF6MhazG_yzJRczY",
  authDomain: "karka-kasadara-23.firebaseapp.com",
  projectId: "karka-kasadara-23",
  storageBucket: "karka-kasadara-23.firebasestorage.app",
  messagingSenderId: "429509689640",
  appId: "1:429509689640:web:e8bc641cf4e62ade5fd01d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
