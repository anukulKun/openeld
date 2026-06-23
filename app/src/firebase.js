import { initializeApp } from 'firebase/app';
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyDSW_qDyoKKtXL-yKODkckzwDe-oGKe2ZM',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'openeld.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'openeld',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'openeld.firebasestorage.app',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '208576408630',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:208576408630:web:2c7ba269aca07533f2fc97',
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  if (!auth || !googleProvider) {
    throw new Error('Firebase is not configured. Set up app/.env first.');
  }
  await signInWithPopup(auth, googleProvider);
}

export async function signInWithEmail(email, password) {
  if (!auth) {
    throw new Error('Firebase is not configured. Set up app/.env first.');
  }
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signUpWithEmail(email, password) {
  if (!auth) {
    throw new Error('Firebase is not configured. Set up app/.env first.');
  }
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}
