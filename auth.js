const USERS_KEY = "pyq_users";
const SESSION_KEY = "pyq_session";

export function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function findUserByEmail(email) {
  const normalized = email.trim().toLowerCase();
  return getUsers().find((u) => u.email === normalized) || null;
}

export function emailExists(email) {
  return !!findUserByEmail(email);
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function getSession() {
  for (const storage of [sessionStorage, localStorage]) {
    try {
      const raw = storage.getItem(SESSION_KEY);
      if (!raw) continue;
      const data = JSON.parse(raw);
      if (data.loggedIn) return data;
    } catch {
      continue;
    }
  }
  return null;
}

export function setSession({ name, email }, remember = true) {
  const session = {
    loggedIn: true,
    email: email.trim().toLowerCase(),
    name: name.trim()
  };

  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);

  if (remember) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  return session;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

export function registerUser(name, email, password) {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const newUser = {
    name: name.trim(),
    email: normalizedEmail,
    password
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function attemptLogin(email, password, remember = true) {
  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    return { ok: false };
  }
  const session = setSession(user, remember);
  return { ok: true, session };
}

export function attemptSignup(name, email, password) {
  if (emailExists(email)) {
    return { ok: false, reason: "exists" };
  }
  const user = registerUser(name, email, password);
  const session = setSession(user, true);
  return { ok: true, session };
}

export function logout() {
  clearSession();
  window.location.href = "index.html";
}

export function getLoginUrl(redirect) {
  const base = "login.html";
  if (!redirect) return base;
  return `${base}?redirect=${encodeURIComponent(redirect)}`;
}

export function getRedirectTarget(fallback = "dashboard.html") {
  const params = new URLSearchParams(window.location.search);
  return params.get("redirect") || fallback;
}

export function isLoggedIn() {
  return !!getSession();
}

export function requireAuth() {
  if (getSession()) return true;
  const page = window.location.pathname.split("/").pop() || "dashboard.html";
  window.location.replace(getLoginUrl(page));
  return false;
}

export function redirectIfLoggedIn(destination = "dashboard.html") {
  if (getSession()) {
    window.location.replace(getRedirectTarget(destination));
  }
}

export function onSessionReady(callback) {
  callback(getSession());
}

export function getInitial(name) {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
}
