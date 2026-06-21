const SESSION_KEY = "pyq_session";

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

export function getToken() {
  const session = getSession();
  return session ? session.token : null;
}

export function setSession({ name, email, token }, remember = true) {
  const session = {
    loggedIn: true,
    email: email.trim().toLowerCase(),
    name: name.trim(),
    token
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

export async function attemptLogin(email, password, remember = true) {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) return { ok: false };
    const data = await response.json();
    const session = setSession(data, remember);
    return { ok: true, session };
  } catch {
    return { ok: false };
  }
}

export async function attemptSignup(name, email, password) {
  try {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    if (!response.ok) {
      const err = await response.json();
      return { ok: false, reason: err.error };
    }
    const data = await response.json();
    const session = setSession(data, true);
    return { ok: true, session };
  } catch {
    return { ok: false, reason: "server" };
  }
}

export async function attemptGoogleLogin(idToken, remember = true) {
  try {
    const response = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken })
    });
    if (!response.ok) return { ok: false };
    const data = await response.json();
    const session = setSession(data, remember);
    return { ok: true, session };
  } catch {
    return { ok: false };
  }
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

export function customAlert(title, message) {
  return new Promise((resolve) => {
    const modalId = "custom-alert-modal";
    let modal = document.getElementById(modalId);
    if (modal) modal.remove();

    const html = `
      <div id="${modalId}" class="modal-overlay show" style="display: flex;">
        <div class="upload-modal" style="max-width: 400px; text-align: center;">
          <div class="modal-header" style="justify-content: center; border-bottom: none; margin-bottom: 10px;">
            <h2 class="modal-title">${title}</h2>
          </div>
          <div class="section-content" style="padding: 10px 0 20px 0;">
            <p style="color: var(--color-text); font-size: 0.95rem; line-height: 1.5;">${message}</p>
          </div>
          <div class="modal-actions" style="justify-content: center; border-top: none; padding-top: 0; margin-top: 0;">
            <button id="custom-alert-ok" class="btn-upload" type="button" style="padding: 10px 30px;">OK</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", html);
    const okBtn = document.getElementById("custom-alert-ok");
    const container = document.getElementById(modalId);

    const close = () => {
      container.remove();
      resolve();
    };

    okBtn.addEventListener("click", close);
  });
}

export function customConfirm(title, message) {
  return new Promise((resolve) => {
    const modalId = "custom-confirm-modal";
    let modal = document.getElementById(modalId);
    if (modal) modal.remove();

    const html = `
      <div id="${modalId}" class="modal-overlay show" style="display: flex;">
        <div class="upload-modal" style="max-width: 400px; text-align: center;">
          <div class="modal-header" style="justify-content: center; border-bottom: none; margin-bottom: 10px;">
            <h2 class="modal-title">${title}</h2>
          </div>
          <div class="section-content" style="padding: 10px 0 20px 0;">
            <p style="color: var(--color-text); font-size: 0.95rem; line-height: 1.5;">${message}</p>
          </div>
          <div class="modal-actions" style="justify-content: center; border-top: none; padding-top: 0; margin-top: 0; gap: 12px;">
            <button id="custom-confirm-cancel" class="btn-cancel" type="button" style="padding: 10px 24px;">Cancel</button>
            <button id="custom-confirm-ok" class="btn-upload" type="button" style="padding: 10px 24px; background: #dc2626;">Delete</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", html);
    const okBtn = document.getElementById("custom-confirm-ok");
    const cancelBtn = document.getElementById("custom-confirm-cancel");
    const container = document.getElementById(modalId);

    okBtn.addEventListener("click", () => {
      container.remove();
      resolve(true);
    });

    cancelBtn.addEventListener("click", () => {
      container.remove();
      resolve(false);
    });
  });
}
