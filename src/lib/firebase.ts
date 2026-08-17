// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBQvYqPmtyI6767r8hDMO7p89wrT2UZYIs",
  authDomain: "gizify.vercel.app",
  projectId: "giziku-19ded",
  storageBucket: "giziku-19ded.firebasestorage.app",
  messagingSenderId: "840411135689",
  appId: "1:840411135689:web:efea17d39c17e112d31718",
  measurementId: "G-9DRG03SC30"
};

// 2. INISIALISASI FIREBASE (Mencegah error saat Next.js refresh)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 3. EXPORT VARIABEL INI (Ini yang dicari sama halaman Register kamu!)
export const db = getFirestore(app);
export const auth = getAuth(app);