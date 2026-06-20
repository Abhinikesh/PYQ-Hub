import { getSession } from "./auth.js";
import { initAppShell } from "./app-shell.js";
import {
  getUserUploads,
  getUserStats,
  getActivities,
  formatRelativeTime,
  iconClass,
  activityIcon
} from "./pyq-data.js";

const session = initAppShell("dashboard");
if (!session) throw new Error("auth");

function renderStats() {
  const stats = getUserStats(session.email);
  document.getElementById("statUploads").textContent = stats.totalUploads;
  document.getElementById("statDownloads").textContent = stats.downloads;
  document.getElementById("statPoints").textContent = stats.points;
  document.getElementById("statSubjects").textContent = stats.subjectsCovered;
}

function renderRecentUploads() {
  const list = document.getElementById("recentUploadsList");
  const uploads = getUserUploads(session.email).slice(0, 4);

  if (!uploads.length) {
    list.innerHTML = `<li class="upload-empty">No uploads yet. <a href="my-uploads.html">Upload your first PYQ</a></li>`;
    return;
  }

  list.innerHTML = uploads.map((u, i) => `
    <li class="upload-item">
      <div class="upload-icon ${iconClass(i)}">📄</div>
      <div class="upload-info">
        <h4>${escapeHtml(u.title)}</h4>
        <p>Uploaded ${formatRelativeTime(u.uploadDate)} • ${u.downloadCount} downloads</p>
      </div>
    </li>
  `).join("");
}

function renderActivity() {
  const container = document.getElementById("activityFeed");
  const activities = getActivities(session.email).slice(0, 5);

  if (!activities.length) {
    container.innerHTML = `<p class="activity-empty">No recent activity yet.</p>`;
    return;
  }

  container.innerHTML = activities.map((a) => {
    const meta = activityIcon(a.type);
    return `
      <div class="activity-item">
        <div class="activity-icon ${meta.cls}">${meta.icon}</div>
        <div class="activity-info">
          <h4>${escapeHtml(a.message)}</h4>
          <p>${formatRelativeTime(a.timestamp)}</p>
        </div>
      </div>
    `;
  }).join("");
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

renderStats();
renderRecentUploads();
renderActivity();
