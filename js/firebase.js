// ─── Orb Analytics Firebase ───────────────────────────────────────
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyCvtE91aea6sACryP_sBEKF1mD7zNBlaBs",
  authDomain: "orbanalytics.limited",
  projectId: "orb-analytics-7d212",
  storageBucket: "orb-analytics-7d212.firebasestorage.app",
  messagingSenderId: "1035099165596",
  appId: "1:1035099165596:web:11ab9349e5cc661aa16e59",
  measurementId: "G-FHRKJ4YP4K"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ── Auth helpers ──────────────────────────────────────────────────
export async function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logOut() {
  return signOut(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export function currentUser() {
  return auth.currentUser;
}

// ── Firestore bet helpers ─────────────────────────────────────────
export async function saveBet(bet) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not signed in');
  const ref = doc(db, 'users', user.uid, 'bets', String(bet.id));
  await setDoc(ref, bet);
}

export async function loadBets() {
  const user = auth.currentUser;
  if (!user) return null;
  const q = query(collection(db, 'users', user.uid, 'bets'), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

export async function deleteBet(betId) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not signed in');
  await deleteDoc(doc(db, 'users', user.uid, 'bets', String(betId)));
}

export async function deleteAllBets() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not signed in');
  const snap = await getDocs(collection(db, 'users', user.uid, 'bets'));
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
}