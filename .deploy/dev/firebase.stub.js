// Dev-only stub for js/firebase.js.
//
// Swapped in by .github/workflows/firebase-hosting-dev.yml at deploy time, in place
// of the real js/firebase.js, which initializes Auth/Firestore/Analytics against the
// PRODUCTION Firebase project (orb-analytics-7d212). This file is never committed over
// the real one in the repo -- it only ever overwrites js/firebase.js inside the
// ephemeral dev-deploy runner's working copy, right before that copy is uploaded to
// the orb-analytics-dev Hosting site.
//
// It re-exports every name the real js/firebase.js exports (checked dynamically by the
// workflow step that swaps this in, so a new export added to the real file later gets
// caught instead of silently missing here) so no page throws an import error, but none
// of them talk to the production backend: signing in, signing up, or saving a bet on
// the dev site fails loudly instead of writing real rows into the production database.

const DISABLED = () => {
  throw new Error('Disabled on the dev site: Auth/Firestore are not available here.');
};

export async function signUp()          { return DISABLED(); }
export async function signIn()           { return DISABLED(); }
export async function signInWithGoogle() { return DISABLED(); }
export async function logOut()           { return DISABLED(); }
export function onAuthChange(callback)   { callback(null); return () => {}; }
export function currentUser()            { return null; }
export async function saveBet()          { return DISABLED(); }
export async function loadBets()         { return null; }
export async function deleteBet()        { return DISABLED(); }
export async function deleteAllBets()    { return DISABLED(); }
