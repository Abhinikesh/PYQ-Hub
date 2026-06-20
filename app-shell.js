import { getSession, getInitial, logout } from "./auth.js";

const pages = {
  dashboard: { href: "dashboard.html", icon: "📊", label: "Dashboard" },
  uploads: { href: "my-uploads.html", icon: "📁", label: "My Uploads" },
  search: { href: "search.html", icon: "🔍", label: "Search PYQs" },
  community: { href: "community.html", icon: "👥", label: "Community" },
  home: { href: "index.html", icon: "🏠", label: "Home" }
};

export function renderSidebar(active) {
  const container = document.getElementById("sidebarNav");
  if (!container) return;

  const items = ["dashboard", "uploads", "search", "community", "home"]
    .map((key) => {
      const p = pages[key];
      const cls = key === active ? "active" : "";
      return `<li><a href="${p.href}" class="${cls}"><i>${p.icon}</i> ${p.label}</a></li>`;
    })
    .join("");

  container.innerHTML = items;
}

export function renderUserHeader(session) {
  const welcome = document.getElementById("welcomeTitle");
  const avatar = document.getElementById("userAvatar");
  const userName = document.getElementById("userName");
  const logoutBtn = document.getElementById("sidebarLogout");

  if (!session) return;

  const first = session.name.split(" ")[0];
  if (welcome) welcome.textContent = `Welcome back, ${first}! 👋`;
  if (avatar) avatar.textContent = getInitial(session.name);
  if (userName) userName.textContent = session.name;

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => logout());
  }
}

export function initMobileSidebar() {
  const sidebar = document.getElementById("sidebar");
  const menuBtn = document.getElementById("mobileMenuBtn");
  if (!sidebar || !menuBtn) return;

  menuBtn.addEventListener("click", () => sidebar.classList.toggle("open"));

  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 768 &&
        !sidebar.contains(e.target) &&
        !menuBtn.contains(e.target)) {
      sidebar.classList.remove("open");
    }
  });
}

export function initAppShell(activePage) {
  const session = getSession();
  if (!session) return null;
  renderSidebar(activePage);
  renderUserHeader(session);
  initMobileSidebar();
  return session;
}
