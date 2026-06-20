import { initAppShell } from "./app-shell.js";
import {
  getForumPosts,
  addForumPost,
  getResources,
  addResource,
  formatRelativeTime
} from "./pyq-data.js";

const session = initAppShell("community");
if (!session) throw new Error("auth");

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

function renderForum() {
  const container = document.getElementById("forum-posts");
  const posts = getForumPosts();

  container.innerHTML = posts.map((p) => `
    <div class="post">
      <div class="post-head">
        <h4>${escapeHtml(p.title)}</h4>
        <span class="post-meta">${escapeHtml(p.authorName)} • ${formatRelativeTime(p.createdAt)}</span>
      </div>
      <p>${escapeHtml(p.body)}</p>
    </div>
  `).join("");
}

function renderResources() {
  const list = document.getElementById("resource-list");
  const resources = getResources();

  list.innerHTML = resources.map((r) => `
    <li><button type="button" class="resource-link" data-id="${r.id}">${escapeHtml(r.title)}</button></li>
  `).join("");

  list.querySelectorAll(".resource-link").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = getResources().find((r) => r.id === btn.dataset.id);
      if (!item) return;
      openDemoModal(item.title, item.fileName, item.isDemo);
    });
  });
}

function openDemoModal(title, fileName, isDemo) {
  const modal = document.getElementById("demoModal");
  const msg = document.getElementById("demoModalText");
  msg.textContent = isDemo
    ? `"${title}" is a seeded demo resource. No real file is stored — in a production app this would download ${fileName}.`
    : `"${title}" was uploaded as ${fileName}. File storage is simulated in this demo.`;
  modal.classList.add("show");
}

document.getElementById("demoModalClose").addEventListener("click", () => {
  document.getElementById("demoModal").classList.remove("show");
});

document.getElementById("demoModal").addEventListener("click", (e) => {
  if (e.target.id === "demoModal") {
    e.target.classList.remove("show");
  }
});

document.getElementById("forumForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("question").value.trim();
  const body = document.getElementById("details").value.trim();
  if (!title || !body) return;

  addForumPost(session.email, session.name, title, body);
  e.target.reset();
  renderForum();
});

const resourceFile = document.getElementById("file-upload");
const resourceFileLabel = document.getElementById("resourceFileLabel");

resourceFile.addEventListener("change", () => {
  resourceFileLabel.textContent = resourceFile.files.length
    ? resourceFile.files[0].name
    : "Choose file";
});

document.getElementById("resourceForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("file-title").value.trim();
  const file = resourceFile.files[0];
  if (!title || !file) return;

  addResource({
    title,
    fileName: file.name,
    uploaderEmail: session.email,
    uploaderName: session.name,
    isDemo: false
  });

  e.target.reset();
  resourceFileLabel.textContent = "Choose file";
  renderResources();
});

renderForum();
renderResources();
