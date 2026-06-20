import { getSession, getLoginUrl, logout, onSessionReady, getInitial } from "./auth.js";

function renderNavAuth(session) {
  const container = document.getElementById("navAuth");
  if (!container) return;

  if (session) {
    container.innerHTML = `
      <div class="nav-user">
        <span class="nav-user-avatar">${getInitial(session.name)}</span>
        <span class="nav-user-name">${session.name}</span>
      </div>
      <button type="button" class="btn btn-ghost" id="logoutBtn">Logout</button>
    `;
    document.getElementById("logoutBtn").addEventListener("click", () => logout());
  } else {
    container.innerHTML = `
      <a href="login.html" class="btn btn-ghost">Login</a>
      <a href="signup.html" class="btn btn-primary btn-sm">Sign Up</a>
    `;
  }
}

function bindProtectedLinks() {
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-auth]");
    if (!el) return;

    const session = getSession();
    const action = el.dataset.auth;

    if (session) {
      if (action === "upload") {
        e.preventDefault();
        if (typeof window.openUploadModal === "function") {
          window.openUploadModal();
        }
      }
      return;
    }

    e.preventDefault();
    let redirect = "index.html";
    if (action === "dashboard") redirect = "dashboard.html";
    if (action === "upload") redirect = "index.html?action=upload";
    window.location.href = getLoginUrl(redirect);
  });
}

function updateHeroButtons(session) {
  const dashBtn = document.getElementById("heroDashboard");
  const uploadBtn = document.getElementById("heroUpload");
  const browseBtn = document.getElementById("heroBrowse");

  if (dashBtn) {
    dashBtn.href = session ? "dashboard.html" : "#";
    if (session) {
      dashBtn.removeAttribute("data-auth");
      dashBtn.classList.add("btn-primary");
      dashBtn.classList.remove("btn-secondary");
    } else {
      dashBtn.dataset.auth = "dashboard";
      dashBtn.classList.remove("btn-primary");
      dashBtn.classList.add("btn-secondary");
    }
  }

  if (uploadBtn) {
    if (session) {
      uploadBtn.removeAttribute("data-auth");
      uploadBtn.classList.add("btn-primary");
      uploadBtn.classList.remove("btn-secondary");
    } else {
      uploadBtn.dataset.auth = "upload";
      uploadBtn.classList.remove("btn-primary");
      uploadBtn.classList.add("btn-secondary");
    }
  }

  if (browseBtn) {
    if (session) {
      browseBtn.href = "dashboard.html";
      browseBtn.removeAttribute("data-auth");
      browseBtn.classList.remove("btn-primary");
      browseBtn.classList.add("btn-secondary");
    } else {
      browseBtn.href = "#";
      browseBtn.dataset.auth = "dashboard";
      browseBtn.classList.add("btn-primary");
      browseBtn.classList.remove("btn-secondary");
    }
  }
}

function initStickyHeader() {
  const header = document.getElementById("siteHeader");
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 8);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initMobileNav() {
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    menu.classList.toggle("open");
    toggle.classList.toggle("active");
  });

  menu.querySelectorAll("a, button").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      toggle.classList.remove("active");
    });
  });
}

function checkPostLoginAction() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("action") === "upload" && getSession()) {
    history.replaceState({}, "", "index.html");
    setTimeout(() => {
      if (typeof window.openUploadModal === "function") {
        window.openUploadModal();
      }
    }, 300);
  }
}

function handleCollegeChange() {
  const collegeSelect = document.getElementById("college");
  const collegeCustom = document.getElementById("college-custom");
  if (!collegeSelect || !collegeCustom) return;

  if (collegeSelect.value === "Other") {
    collegeCustom.classList.remove("is-hidden");
    collegeCustom.required = true;
    collegeSelect.required = false;
  } else {
    collegeCustom.classList.add("is-hidden");
    collegeCustom.required = false;
    collegeSelect.required = true;
  }
}

window.handleCollegeChange = handleCollegeChange;

document.addEventListener("DOMContentLoaded", () => {
  initStickyHeader();
  initMobileNav();
  bindProtectedLinks();

  onSessionReady((session) => {
    renderNavAuth(session);
    updateHeroButtons(session);
    checkPostLoginAction();
  });
});
