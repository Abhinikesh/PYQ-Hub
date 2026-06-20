import { initAppShell } from "./app-shell.js";
import {
  getUserUploads,
  addUpload,
  deleteUpload,
  logUpload,
  formatRelativeTime,
  iconClass
} from "./pyq-data.js";

const session = initAppShell("uploads");
if (!session) throw new Error("auth");

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

function renderList() {
  const container = document.getElementById("uploadsList");
  const uploads = getUserUploads(session.email);

  if (!uploads.length) {
    container.innerHTML = `<p class="uploads-empty">You haven't uploaded anything yet. Use the form above to add your first PYQ.</p>`;
    return;
  }

  container.innerHTML = uploads.map((u, i) => `
    <div class="upload-row">
      <div class="upload-row-icon ${iconClass(i)}">📄</div>
      <div class="upload-row-info">
        <h4>${escapeHtml(u.title)}</h4>
        <p>${escapeHtml(u.subject)} • ${escapeHtml(u.college)} • ${escapeHtml(u.year)} • Sem ${escapeHtml(String(u.semester))}</p>
        <p class="upload-row-meta">Uploaded ${formatRelativeTime(u.uploadDate)} • ${u.downloadCount} downloads • ${escapeHtml(u.fileName)}</p>
      </div>
      <button type="button" class="btn-delete" data-id="${u.id}">Delete</button>
    </div>
  `).join("");

  container.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const item = getUserUploads(session.email).find((u) => u.id === id);
      if (!item) return;
      if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
      deleteUpload(id, session.email);
      renderList();
    });
  });
}

const fileInput = document.getElementById("uploadFile");
const fileLabel = document.getElementById("uploadFileLabel");

fileInput.addEventListener("change", () => {
  if (fileInput.files.length) {
    fileLabel.textContent = fileInput.files[0].name;
  } else {
    fileLabel.textContent = "Choose a file (PDF, JPG, PNG)";
  }
});

document.getElementById("uploadForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("uploadTitle").value.trim();
  const subject = document.getElementById("uploadSubject").value.trim();
  const college = document.getElementById("uploadCollege").value;
  const year = document.getElementById("uploadYear").value;
  const semester = document.getElementById("uploadSemester").value;
  const file = fileInput.files[0];

  if (!title || !subject || !college || !year || !semester || !file) return;

  addUpload({
    title,
    subject,
    college,
    year,
    semester,
    uploaderEmail: session.email,
    uploaderName: session.name,
    fileName: file.name
  });

  logUpload(session.email, title);
  e.target.reset();
  fileLabel.textContent = "Choose a file (PDF, JPG, PNG)";
  renderList();
});

renderList();
