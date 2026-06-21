import { getToken } from "./auth.js";

function getHeaders(extraHeaders = {}) {
  const token = getToken();
  const headers = { ...extraHeaders };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

const mapItem = (item) => {
  if (!item) return null;
  return {
    id: item._id,
    title: item.title,
    subject: item.subject,
    college: item.college,
    year: item.year,
    semester: item.semester,
    examType: item.examType,
    fileName: item.fileName,
    fileUrl: item.fileUrl,
    uploaderEmail: item.uploadedByEmail || item.uploaderEmail,
    uploaderName: item.uploadedByName || item.uploaderName,
    uploadDate: item.uploadDate,
    downloadCount: item.downloadCount || 0,
    likes: item.likes || 0,
    status: item.status
  };
};

const mapForum = (post) => {
  if (!post) return null;
  return {
    id: post._id,
    authorEmail: post.authorEmail,
    authorName: post.authorName,
    title: post.title,
    body: post.body,
    createdAt: post.createdAt
  };
};

const mapResource = (resource) => {
  if (!resource) return null;
  return {
    id: resource._id,
    title: resource.title,
    fileName: resource.fileName,
    uploaderEmail: resource.uploaderEmail,
    uploaderName: resource.uploaderName,
    uploadDate: resource.uploadDate,
    isDemo: resource.isDemo
  };
};

const mapActivity = (activity) => {
  if (!activity) return null;
  return {
    id: activity._id,
    userEmail: activity.userEmail,
    type: activity.type,
    message: activity.message,
    timestamp: activity.timestamp
  };
};

export async function getAllUploads() {
  const response = await fetch("/api/uploads", {
    headers: getHeaders()
  });
  if (!response.ok) return [];
  const items = await response.json();
  return items.map(mapItem);
}

export async function getUserUploads(email) {
  const uploads = await getAllUploads();
  const normalized = email.toLowerCase();
  return uploads.filter((u) => u.uploaderEmail === normalized);
}

export async function getUploadById(id) {
  const response = await fetch("/api/uploads", {
    headers: getHeaders()
  });
  if (!response.ok) return null;
  const items = await response.json();
  const found = items.find(u => u._id === id);
  return found ? mapItem(found) : null;
}

export async function addUpload(entry) {
  const response = await fetch("/api/uploads", {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(entry)
  });
  if (!response.ok) throw new Error("Failed to add upload");
  const item = await response.json();
  return mapItem(item);
}

export async function deleteUpload(id, userEmail) {
  const response = await fetch(`/api/uploads/${id}`, {
    method: "DELETE",
    headers: getHeaders()
  });
  if (!response.ok) return false;
  const result = await response.json();
  return result.success;
}

export async function incrementDownload(id) {
  const response = await fetch(`/api/uploads/${id}/download`, {
    method: "POST",
    headers: getHeaders()
  });
  if (!response.ok) return null;
  const item = await response.json();
  return mapItem(item);
}

export async function searchUploads(filters) {
  const params = new URLSearchParams();
  if (filters.college) params.append("college", filters.college);
  if (filters.subject) params.append("subject", filters.subject);
  if (filters.year) params.append("year", filters.year);
  if (filters.semester) params.append("semester", filters.semester);

  const response = await fetch(`/api/uploads?${params.toString()}`, {
    headers: getHeaders()
  });
  if (!response.ok) return [];
  const items = await response.json();
  return items.map(mapItem);
}

export async function getUserStats(email) {
  const uploads = await getUserUploads(email);
  const totalDownloads = uploads.reduce((sum, u) => sum + (u.downloadCount || 0), 0);
  const subjects = new Set(uploads.map((u) => u.subject.toLowerCase()));
  const points = uploads.length * 10 + totalDownloads * 2;
  return {
    totalUploads: uploads.length,
    downloads: totalDownloads,
    points,
    subjectsCovered: subjects.size
  };
}

export async function getActivities(email) {
  const response = await fetch("/api/activities", {
    headers: getHeaders()
  });
  if (!response.ok) return [];
  const items = await response.json();
  return items.map(mapActivity);
}

export async function addActivity(email, type, message) {
  const response = await fetch("/api/activities", {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ type, message })
  });
  if (!response.ok) return null;
  const item = await response.json();
  return mapActivity(item);
}

export async function logDownload(email, title) {
  await addActivity(email, "download", `Downloaded ${title}`);
}

export async function logUpload(email, title) {
  await addActivity(email, "upload", `Uploaded ${title}`);
  await addActivity(email, "points", "Earned 10 points");
}

export async function logAiUse(email) {
  await addActivity(email, "ai", "Used AI Assistant");
}

export async function getForumPosts() {
  const response = await fetch("/api/forum", {
    headers: getHeaders()
  });
  if (!response.ok) return [];
  const items = await response.json();
  return items.map(mapForum);
}

export async function addForumPost(authorEmail, authorName, title, body) {
  const response = await fetch("/api/forum", {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ title, body })
  });
  if (!response.ok) throw new Error("Failed to add forum post");
  const item = await response.json();
  return mapForum(item);
}

export async function getResources() {
  const response = await fetch("/api/resources", {
    headers: getHeaders()
  });
  if (!response.ok) return [];
  const items = await response.json();
  return items.map(mapResource);
}

export async function addResource(entry) {
  const response = await fetch("/api/resources", {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(entry)
  });
  if (!response.ok) throw new Error("Failed to add resource");
  const item = await response.json();
  return mapResource(item);
}

export function formatRelativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
}

export function iconClass(index) {
  const classes = ["blue", "green", "purple", "orange"];
  return classes[index % classes.length];
}

export function activityIcon(type) {
  if (type === "download") return { cls: "green", icon: "📥" };
  if (type === "points") return { cls: "purple", icon: "🏆" };
  if (type === "ai") return { cls: "orange", icon: "🤖" };
  if (type === "upload") return { cls: "blue", icon: "📤" };
  return { cls: "blue", icon: "📌" };
}
