const UPLOADS_KEY = "pyq_uploads";
const ACTIVITIES_KEY = "pyq_activities";
const FORUM_KEY = "pyq_forum_posts";
const RESOURCES_KEY = "pyq_resources";
const SEED_FLAG = "pyq_seeded";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function load(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function hoursAgo(h) {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

function daysAgo(d) {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();
}

function seedData() {
  if (localStorage.getItem(SEED_FLAG)) return;

  const uploads = [
    {
      id: uid(),
      title: "DSA PYQ 2025",
      subject: "Data Structures",
      college: "Manav Rachna University",
      year: "2025",
      semester: "3",
      uploaderEmail: "seed@pyqhub.local",
      uploaderName: "Student User",
      uploadDate: hoursAgo(2),
      downloadCount: 9,
      fileName: "dsa-pyq-2025.pdf"
    },
    {
      id: uid(),
      title: "PYTHON Notes Unit 3",
      subject: "Python Programming",
      college: "Manav Rachna University",
      year: "2025",
      semester: "2",
      uploaderEmail: "seed@pyqhub.local",
      uploaderName: "Student User",
      uploadDate: daysAgo(1),
      downloadCount: 6,
      fileName: "python-notes-unit3.pdf"
    },
    {
      id: uid(),
      title: "Mathematics Solutions 2024",
      subject: "Mathematics",
      college: "IIT Delhi",
      year: "2024",
      semester: "4",
      uploaderEmail: "seed@pyqhub.local",
      uploaderName: "Student User",
      uploadDate: daysAgo(3),
      downloadCount: 23,
      fileName: "math-solutions-2024.pdf"
    },
    {
      id: uid(),
      title: "OOP's Practical file",
      subject: "Object Oriented Programming",
      college: "Manav Rachna University",
      year: "2024",
      semester: "5",
      uploaderEmail: "seed@pyqhub.local",
      uploaderName: "Student User",
      uploadDate: daysAgo(7),
      downloadCount: 15,
      fileName: "oops-practical.pdf"
    }
  ];

  const forum = [
    {
      id: uid(),
      authorEmail: "seed@pyqhub.local",
      authorName: "Student User",
      title: "How to prepare for semester exams?",
      body: "Any good strategies or resources you guys follow?",
      createdAt: daysAgo(2)
    }
  ];

  const resources = [
    {
      id: uid(),
      title: "DBMS PYQ - 2024.pdf",
      fileName: "dbms-pyq-2024.pdf",
      uploaderEmail: "seed@pyqhub.local",
      uploaderName: "Student User",
      uploadDate: daysAgo(5),
      isDemo: true
    },
    {
      id: uid(),
      title: "C Programming Notes",
      fileName: "c-programming-notes.pdf",
      uploaderEmail: "seed@pyqhub.local",
      uploaderName: "Student User",
      uploadDate: daysAgo(10),
      isDemo: true
    }
  ];

  save(UPLOADS_KEY, uploads);
  save(FORUM_KEY, forum);
  save(RESOURCES_KEY, resources);
  save(ACTIVITIES_KEY, []);
  localStorage.setItem(SEED_FLAG, "1");
}

seedData();

export function getAllUploads() {
  return load(UPLOADS_KEY).sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
}

export function getUserUploads(email) {
  const normalized = email.toLowerCase();
  return getAllUploads().filter((u) => u.uploaderEmail === normalized);
}

export function getUploadById(id) {
  return getAllUploads().find((u) => u.id === id) || null;
}

export function addUpload(entry) {
  const uploads = getAllUploads();
  const item = { id: uid(), downloadCount: 0, uploadDate: new Date().toISOString(), ...entry };
  uploads.unshift(item);
  save(UPLOADS_KEY, uploads);
  return item;
}

export function deleteUpload(id, userEmail) {
  const uploads = getAllUploads();
  const item = uploads.find((u) => u.id === id);
  if (!item || item.uploaderEmail !== userEmail.toLowerCase()) return false;
  save(UPLOADS_KEY, uploads.filter((u) => u.id !== id));
  return true;
}

export function incrementDownload(id) {
  const uploads = getAllUploads();
  const item = uploads.find((u) => u.id === id);
  if (!item) return null;
  item.downloadCount += 1;
  save(UPLOADS_KEY, uploads);
  return item;
}

export function searchUploads(filters) {
  let results = getAllUploads();
  if (filters.college) {
    results = results.filter((u) => u.college === filters.college);
  }
  if (filters.subject) {
    const q = filters.subject.toLowerCase();
    results = results.filter((u) =>
      u.subject.toLowerCase().includes(q) || u.title.toLowerCase().includes(q)
    );
  }
  if (filters.year) {
    results = results.filter((u) => String(u.year) === String(filters.year));
  }
  if (filters.semester) {
    results = results.filter((u) => String(u.semester) === String(filters.semester));
  }
  return results;
}

export function getUserStats(email) {
  const uploads = getUserUploads(email);
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

export function getActivities(email) {
  return load(ACTIVITIES_KEY)
    .filter((a) => a.userEmail === email.toLowerCase())
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export function addActivity(email, type, message) {
  const activities = load(ACTIVITIES_KEY);
  activities.unshift({
    id: uid(),
    userEmail: email.toLowerCase(),
    type,
    message,
    timestamp: new Date().toISOString()
  });
  if (activities.length > 50) activities.length = 50;
  save(ACTIVITIES_KEY, activities);
}

export function logDownload(email, title) {
  addActivity(email, "download", `Downloaded ${title}`);
}

export function logUpload(email, title) {
  addActivity(email, "upload", `Uploaded ${title}`);
  addActivity(email, "points", "Earned 10 points");
}

export function logAiUse(email) {
  addActivity(email, "ai", "Used AI Assistant");
}

export function getForumPosts() {
  return load(FORUM_KEY).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function addForumPost(authorEmail, authorName, title, body) {
  const posts = load(FORUM_KEY);
  const post = {
    id: uid(),
    authorEmail: authorEmail.toLowerCase(),
    authorName,
    title,
    body,
    createdAt: new Date().toISOString()
  };
  posts.unshift(post);
  save(FORUM_KEY, posts);
  return post;
}

export function getResources() {
  return load(RESOURCES_KEY).sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
}

export function addResource(entry) {
  const resources = load(RESOURCES_KEY);
  const item = {
    id: uid(),
    uploadDate: new Date().toISOString(),
    isDemo: false,
    ...entry
  };
  resources.unshift(item);
  save(RESOURCES_KEY, resources);
  return item;
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
