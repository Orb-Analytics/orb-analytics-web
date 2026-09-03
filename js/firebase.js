// ─── Orb Analytics Firebase ───────────────────────────────────────
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js';

const firebaseConfig = {
  apiKey: "AIzaSyCvtE91aea6sACryP_sBEKF1mD7zNBlaBs",
  authDomain: "orbanalytics.limited",
  projectId: "orb-analytics-7d212",
  storageBucket: "orb-analytics-7d212.firebasestorage.app",
  messagingSenderId: "1035099165596",
  appId: "1:1035099165596:web:11ab9349e5cc661aa16e59",
  measurementId: "G-FHRKJ4YP4K"
};

const app            = initializeApp(firebaseConfig);
const auth           = getAuth(app);
const db             = getFirestore(app);
const analytics      = getAnalytics(app);
const googleProvider = new GoogleAuthProvider();

// ── Auth event logger ─────────────────────────────────────────────
async function logAuthEvent(user, eventType) {
  try {
    const ref = doc(db, 'users', user.uid, 'auth_events', String(Date.now()));
    await setDoc(ref, {
      event:      eventType,
      email:      user.email,
      uid:        user.uid,
      timestamp:  new Date().toISOString(),
      user_agent: navigator.userAgent
    });
  } catch(e) {
    console.warn('Auth event log failed:', e);
  }
}

// ── Auth helpers ──────────────────────────────────────────────────
export async function signUp(email, password) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await logAuthEvent(result.user, 'sign_up');
  return result;
}

export async function signIn(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  await logAuthEvent(result.user, 'sign_in');
  return result;
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  // Log whether this was a new signup or an existing sign in
  const isNew = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
  await logAuthEvent(result.user, isNew ? 'sign_up_google' : 'sign_in_google');
  return result;
}

export async function logOut() {
  const user = auth.currentUser;
  if (user) await logAuthEvent(user, 'sign_out');
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