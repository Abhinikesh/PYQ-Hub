// Import Firebase functions from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-storage.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyClrHzNNcLGV8YgSseR41e18w_rRHxXQtg",
  authDomain: "pyq-d7579.firebaseapp.com",
  projectId: "pyq-d7579",
  storageBucket: "pyq-d7579.firebasestorage.app",
  messagingSenderId: "440851411467",
  appId: "1:440851411467:web:ad812e46faa5edaf9d4d0e",
  measurementId: "G-RXNZRYP6NM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Global variables
let currentUser = null;

// Check authentication state
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  console.log("Auth state changed:", user ? "User logged in" : "No user");
});

// Modal functions
window.openUploadModal = function() {
  document.getElementById('uploadModal').classList.add('show');
  document.body.style.overflow = 'hidden';
};

window.closeUploadModal = function() {
  document.getElementById('uploadModal').classList.remove('show');
  document.body.style.overflow = 'auto';
  resetForm();
};

// File upload handling
document.addEventListener('DOMContentLoaded', function() {
  const fileInput = document.getElementById('fileInput');
  const fileText = document.getElementById('fileText');
  const fileName = document.getElementById('fileName');
  const fileUpload = document.querySelector('.file-upload');

  // File selection
  fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        fileInput.value = '';
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid file type (JPG, PNG, or PDF)');
        fileInput.value = '';
        return;
      }

      fileText.style.display = 'none';
      fileName.style.display = 'block';
      fileName.textContent = file.name;
    }
  });

  // Drag and drop functionality
  fileUpload.addEventListener('dragover', function(e) {
    e.preventDefault();
    fileUpload.classList.add('dragover');
  });

  fileUpload.addEventListener('dragleave', function(e) {
    e.preventDefault();
    fileUpload.classList.remove('dragover');
  });

  fileUpload.addEventListener('drop', function(e) {
    e.preventDefault();
    fileUpload.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      // Validate file size
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid file type (JPG, PNG, or PDF)');
        return;
      }

      fileInput.files = files;
      fileText.style.display = 'none';
      fileName.style.display = 'block';
      fileName.textContent = file.name;
    }
  });

  // Form submission
  const uploadForm = document.getElementById('uploadForm');
  uploadForm.addEventListener('submit', handleUpload);
});

// Upload handling function
async function handleUpload(e) {
  e.preventDefault();

  // Check if user is authenticated
  if (!currentUser) {
    alert('Please log in to upload files');
    return;
  }

  // Get form data
  const formData = new FormData(e.target);
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const college = document.getElementById('college').value;
  const course = document.getElementById('course').value;
  const subject = document.getElementById('subject').value;
  const year = document.getElementById('year').value;
  const semester = document.getElementById('semester').value;
  const examType = document.getElementById('examType').value;
  const file = document.getElementById('fileInput').files[0];

  // Validate required fields
  if (!title || !college || !course || !subject || !year || !semester || !examType || !file) {
    alert('Please fill in all required fields');
    return;
  }

  // Show loading state
  const uploadBtn = document.getElementById('uploadBtn');
  const uploadText = document.getElementById('uploadText');
  const uploadLoading = document.getElementById('uploadLoading');
  
  uploadBtn.disabled = true;
  uploadText.style.display = 'none';
  uploadLoading.style.display = 'flex';

  try {
    // Upload file to Firebase Storage
    const storageRef = ref(storage, `pyqs/${currentUser.uid}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Store metadata in Firestore
    const pyqData = {
      title: title,
      description: description,
      college: college,
      course: course,
      subject: subject,
      year: parseInt(year),
      semester: parseInt(semester),
      examType: examType,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      downloadURL: downloadURL,
      storageRef: snapshot.ref.fullPath,
      uploadedBy: currentUser.uid,
      uploadedByEmail: currentUser.email,
      uploadDate: serverTimestamp(),
      downloads: 0,
      likes: 0,
      status: 'pending' // pending, approved, rejected
    };

    const docRef = await addDoc(collection(db, 'pyqs'), pyqData);
    
    console.log('Document written with ID: ', docRef.id);
    
    // Show success message
    alert('PYQ uploaded successfully! It will be reviewed and made available soon.');
    
    // Close modal and reset form
    closeUploadModal();
    
  } catch (error) {
    console.error('Upload error:', error);
    alert('Upload failed: ' + error.message);
  } finally {
    // Reset loading state
    uploadBtn.disabled = false;
    uploadText.style.display = 'block';
    uploadLoading.style.display = 'none';
  }
}

// Reset form function
function resetForm() {
  document.getElementById('uploadForm').reset();
  document.getElementById('fileText').style.display = 'block';
  document.getElementById('fileName').style.display = 'none';
  document.getElementById('fileName').textContent = '';
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
  const modal = document.getElementById('uploadModal');
  if (e.target === modal) {
    closeUploadModal();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeUploadModal();
  }
});