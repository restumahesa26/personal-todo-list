import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
} from "firebase/firestore";

// Cek apakah mode dev/dummy diaktifkan lewat variabel lingkungan
export const isDevMode =
  process.env.NEXT_PUBLIC_IS_DEV === "true" ||
  process.env.NEXT_PUBLIC_DEV_MODE === "true" ||
  process.env.NEXT_PUBLIC_USE_DUMMY_DATA === "true";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

// Hanya inisialisasi Firebase jika bukan dev mode dan kredensial tersedia
if (typeof window !== "undefined" && isFirebaseConfigured && !isDevMode) {
  try {
    if (getApps().length > 0) {
      app = getApp();
      db = getFirestore(app);
    } else {
      app = initializeApp(firebaseConfig);
      try {
        // Gunakan persistentLocalCache (IndexedDB) agar update tidak hilang saat refresh
        db = initializeFirestore(app, {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
          }),
        });
      } catch {
        db = getFirestore(app);
      }
    }
  } catch (error) {
    console.warn("Failed to initialize Firebase:", error);
  }
}

export { app, db };
