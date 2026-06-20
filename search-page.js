import { initAppShell } from "./app-shell.js";
import {
  searchUploads,
  incrementDownload,
  logDownload,
  formatRelativeTime
} from "./pyq-data.js";

const session = initAppShell("search");
if (!session) throw new Error("auth");

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

function renderResults(results) {
  const container = document.getElementById("searchResults");

  if (!results.length) {
    container.innerHTML = `<p class="search-empty">No results found, try adjusting your filters.</p>`;
    return;
  }

  container.innerHTML = results.map((u) => `
    <div class="result-card">
      <div class="result-card-head">
        <h3>${escapeHtml(u.title)}</h3>
        <span class="result-badge">${escapeHtml(u.year)} • Sem ${escapeHtml(String(u.semester))}</span>
      </div>
      <div class="result-meta">
        <p><strong>Subject:</strong> ${escapeHtml(u.subject)}</p>
        <p><strong>College:</strong> ${escapeHtml(u.college)}</p>
        <p><strong>Uploaded by:</strong> ${escapeHtml(u.uploaderName)} • ${formatRelativeTime(u.uploadDate)}</p>
        <p><strong>Downloads:</strong> ${u.downloadCount}</p>
      </div>
      <button type="button" class="btn-download" data-id="${u.id}">📥 Download</button>
    </div>
  `).join("");

  container.querySelectorAll(".btn-download").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const item = incrementDownload(id);
      if (!item) return;
      logDownload(session.email, item.title);
      alert(`Downloading "${item.fileName}" — this is a demo file with no real storage behind it.`);
      renderResults(searchUploads(getFilters()));
    });
  });
}

function getFilters() {
  const form = document.getElementById("searchForm");
  const data = new FormData(form);
  return {
    college: data.get("college") || "",
    subject: (data.get("subject") || "").trim(),
    year: data.get("year") || "",
    semester: data.get("semester") || ""
  };
}

document.getElementById("searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  renderResults(searchUploads(getFilters()));
});

renderResults(searchUploads({}));
