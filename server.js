import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    seedDatabase();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String }
});

const PYQSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  college: { type: String, required: true },
  year: { type: Number, required: true },
  semester: { type: Number, required: true },
  examType: { type: String, required: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  uploadedByEmail: { type: String, required: true },
  uploadedByName: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  downloadCount: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  status: { type: String, default: "pending" }
});

const ActivitySchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ForumSchema = new mongoose.Schema({
  authorEmail: { type: String, required: true },
  authorName: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileName: { type: String, required: true },
  uploaderEmail: { type: String, required: true },
  uploaderName: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  isDemo: { type: Boolean, default: false }
});

const User = mongoose.model("User", UserSchema);
const PYQ = mongoose.model("PYQ", PYQSchema);
const Activity = mongoose.model("Activity", ActivitySchema);
const Forum = mongoose.model("Forum", ForumSchema);
const Resource = mongoose.model("Resource", ResourceSchema);

async function seedDatabase() {
  try {
    const pyqCount = await PYQ.countDocuments();
    if (pyqCount === 0) {
      const demoUploads = [
        {
          title: "DSA PYQ 2025",
          subject: "Data Structures",
          college: "Manav Rachna University",
          year: 2025,
          semester: 3,
          examType: "End Semester",
          fileName: "dsa-pyq-2025.pdf",
          fileUrl: "https://res.cloudinary.com/diwacmg02/image/upload/v1/dsa-pyq-2025.pdf",
          uploadedByEmail: "seed@pyqhub.local",
          uploadedByName: "Student User",
          downloadCount: 9,
          likes: 4,
          status: "approved"
        },
        {
          title: "PYTHON Notes Unit 3",
          subject: "Python Programming",
          college: "Manav Rachna University",
          year: 2025,
          semester: 2,
          examType: "Mid Semester",
          fileName: "python-notes-unit3.pdf",
          fileUrl: "https://res.cloudinary.com/diwacmg02/image/upload/v1/python-notes-unit3.pdf",
          uploadedByEmail: "seed@pyqhub.local",
          uploadedByName: "Student User",
          downloadCount: 6,
          likes: 2,
          status: "approved"
        },
        {
          title: "Mathematics Solutions 2024",
          subject: "Mathematics",
          college: "IIT Delhi",
          year: 2024,
          semester: 4,
          examType: "End Semester",
          fileName: "math-solutions-2024.pdf",
          fileUrl: "https://res.cloudinary.com/diwacmg02/image/upload/v1/math-solutions-2024.pdf",
          uploadedByEmail: "seed@pyqhub.local",
          uploadedByName: "Student User",
          downloadCount: 23,
          likes: 12,
          status: "approved"
        },
        {
          title: "OOP's Practical file",
          subject: "Object Oriented Programming",
          college: "Manav Rachna University",
          year: 2024,
          semester: 5,
          examType: "Assignment",
          fileName: "oops-practical.pdf",
          fileUrl: "https://res.cloudinary.com/diwacmg02/image/upload/v1/oops-practical.pdf",
          uploadedByEmail: "seed@pyqhub.local",
          uploadedByName: "Student User",
          downloadCount: 15,
          likes: 7,
          status: "approved"
        }
      ];
      await PYQ.insertMany(demoUploads);
    }

    const resourceCount = await Resource.countDocuments();
    if (resourceCount === 0) {
      const demoResources = [
        {
          title: "DBMS PYQ - 2024.pdf",
          fileName: "dbms-pyq-2024.pdf",
          uploaderEmail: "seed@pyqhub.local",
          uploaderName: "Student User",
          isDemo: true
        },
        {
          title: "C Programming Notes",
          fileName: "c-programming-notes.pdf",
          uploaderEmail: "seed@pyqhub.local",
          uploaderName: "Student User",
          isDemo: true
        }
      ];
      await Resource.insertMany(demoResources);
    }

    const forumCount = await Forum.countDocuments();
    if (forumCount === 0) {
      const demoForum = [
        {
          authorEmail: "seed@pyqhub.local",
          authorName: "Student User",
          title: "How to prepare for semester exams?",
          body: "Any good strategies or resources you guys follow?"
        }
      ];
      await Forum.insertMany(demoForum);
    }
  } catch (err) {
    console.error("Database seeding error:", err);
  }
}

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

app.get("/api/config", (req, res) => {
  res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID });
});

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {
  if (!storedPassword) return false;
  if (!storedPassword.includes(":")) {
    return password === storedPassword; // Plaintext fallback for pre-existing test users
  }
  const [salt, originalHash] = storedPassword.split(":");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === originalHash;
}

app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: "exists" });
    }

    const hashedPassword = hashPassword(password);
    const user = new User({ name, email: email.toLowerCase(), password: hashedPassword });
    await user.save();

    const token = jwt.sign({ name: user.name, email: user.email }, process.env.JWT_SECRET);
    res.json({ token, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(400).json({ error: "invalid" });
    }

    const token = jwt.sign({ name: user.name, email: user.email }, process.env.JWT_SECRET);
    res.json({ token, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/auth/google", async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: "Missing identity token" });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { sub, email, name } = payload;

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = new User({
        name,
        email: email.toLowerCase(),
        googleId: sub
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = sub;
      await user.save();
    }

    const token = jwt.sign({ name: user.name, email: user.email }, process.env.JWT_SECRET);
    res.json({ token, name: user.name, email: user.email });
  } catch (err) {
    res.status(400).json({ error: "Authentication failed" });
  }
});

app.post("/api/chat", authMiddleware, async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const messages = [
    { role: "system", content: "You are a helpful academic study assistant. Keep answers brief, helpful, and formatted in markdown." },
    ...(history || []).map(h => ({ role: h.sender === "bot" ? "assistant" : "user", content: h.content })),
    { role: "user", content: message }
  ];

  try {
    const apiKey = process.env.GROK_API_KEY || "";
    let url = "https://api.x.ai/v1/chat/completions";
    let model = "grok-2-1212";

    if (apiKey.startsWith("gsk_")) {
      url = "https://api.groq.com/openai/v1/chat/completions";
      model = "llama-3.3-70b-versatile";
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API response error:", errorText);
      throw new Error("Failed to fetch response from AI API");
    }

    const data = await response.json();
    const botResponse = data.choices[0].message.content;
    res.json({ response: botResponse });
  } catch (err) {
    console.error("Chat proxy error:", err);
    res.status(500).json({ error: "Failed to communicate with AI model" });
  }
});

app.get("/api/uploads", async (req, res) => {
  const { college, subject, year, semester } = req.query;
  const filter = {};
  if (college) filter.college = college;
  if (year) filter.year = parseInt(year);
  if (semester) filter.semester = parseInt(semester);
  
  try {
    let results = await PYQ.find(filter).sort({ uploadDate: -1 });
    if (subject) {
      const q = subject.toLowerCase();
      results = results.filter(u => 
        u.subject.toLowerCase().includes(q) || u.title.toLowerCase().includes(q)
      );
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed to query uploads" });
  }
});

app.post("/api/uploads", authMiddleware, async (req, res) => {
  try {
    const item = new PYQ({
      ...req.body,
      uploadedByEmail: req.user.email,
      uploadedByName: req.user.name,
      downloadCount: 0,
      likes: 0,
      status: "pending"
    });
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to save upload" });
  }
});

app.delete("/api/uploads/:id", authMiddleware, async (req, res) => {
  try {
    const item = await PYQ.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Upload not found" });
    }
    if (item.uploadedByEmail !== req.user.email) {
      return res.status(403).json({ error: "Unauthorized to delete this record" });
    }
    await PYQ.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete upload" });
  }
});

app.post("/api/uploads/:id/download", authMiddleware, async (req, res) => {
  try {
    const item = await PYQ.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ error: "Upload not found" });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to increment downloads" });
  }
});

app.get("/api/activities", authMiddleware, async (req, res) => {
  try {
    const results = await Activity.find({ userEmail: req.user.email }).sort({ timestamp: -1 }).limit(50);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed to query activities" });
  }
});

app.post("/api/activities", authMiddleware, async (req, res) => {
  const { type, message } = req.body;
  try {
    const item = new Activity({
      userEmail: req.user.email,
      type,
      message
    });
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to log activity" });
  }
});

app.get("/api/forum", async (req, res) => {
  try {
    const results = await Forum.find().sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed to query forum" });
  }
});

app.post("/api/forum", authMiddleware, async (req, res) => {
  const { title, body } = req.body;
  try {
    const item = new Forum({
      authorEmail: req.user.email,
      authorName: req.user.name,
      title,
      body
    });
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to post question" });
  }
});

app.get("/api/resources", async (req, res) => {
  try {
    const results = await Resource.find().sort({ uploadDate: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed to query resources" });
  }
});

app.post("/api/resources", authMiddleware, async (req, res) => {
  const { title, fileName } = req.body;
  try {
    const item = new Resource({
      title,
      fileName,
      uploaderEmail: req.user.email,
      uploaderName: req.user.name,
      isDemo: false
    });
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to add shared resource" });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
