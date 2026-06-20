import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAqnBAa5Y0JEbuFohgn6jS9gWvl3JGWors",
  authDomain: "pyq-hub-fb3bb.firebaseapp.com",
  projectId: "pyq-hub-fb3bb",
  storageBucket: "pyq-hub-fb3bb.firebasestorage.app",
  messagingSenderId: "5765004016",
  appId: "1:5765004016:web:fb7b745a6b64f27ada6035",
  measurementId: "G-VGRQNKZD0P"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const SESSION_KEY = "pyq_session";

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data.loggedIn ? data : null;
  } catch {
    return null;
  }
}

export function setSession(user, name) {
  const displayName = name || user.displayName || user.email.split("@")[0];
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    loggedIn: true,
    email: user.email,
    name: displayName,
    uid: user.uid
  }));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getLoginUrl(redirect) {
  const base = "login.html";
  if (!redirect) return base;
  return `${base}?redirect=${encodeURIComponent(redirect)}`;
}

export function getRedirectTarget() {
  const params = new URLSearchParams(window.location.search);
  return params.get("redirect") || "index.html";
}

export function isLoggedIn() {
  return !!getSession();
}

export async function logout() {
  try {
    await signOut(auth);
  } catch (e) {
    console.error(e);
  }
  clearSession();
  window.location.href = "index.html";
}

export function onSessionReady(callback) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const existing = getSession();
      if (!existing || existing.uid !== user.uid) {
        setSession(user, existing?.name);
      }
    } else {
      clearSession();
    }
    callback(getSession());
  });
}

export function getInitial(name) {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
}
