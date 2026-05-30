// Import Firebase functions from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { uploadToCloudinary } from './cloudinary-config.js';

// Your Firebase config
const firebaseConfig = {
  apiKey: "",
  authDomain: "pyq-hub-fb3bb.firebaseapp.com",
  projectId: "pyq-hub-fb3bb",
  storageBucket: "pyq-hub-fb3bb.firebasestorage.app",
  messagingSenderId: "5765004016",
  appId: "1:5765004016:web:fb7b745a6b64f27ada6035",
  measurementId: "G-VGRQNKZD0P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
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

  console.log('Upload form submitted');

  // Check if user is authenticated
  if (!currentUser) {
    alert('Please log in to upload files');
    return;
  }

  console.log('User authenticated:', currentUser.email);

  // Get form data
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const college = document.getElementById('college').value;
  const course = document.getElementById('course').value;
  const subject = document.getElementById('subject').value;
  const year = document.getElementById('year').value;
  const semester = document.getElementById('semester').value;
  const examType = document.getElementById('examType').value;
  const file = document.getElementById('fileInput').files[0];

  console.log('Form data:', {
    title, description, college, course, subject, year, semester, examType,
    fileName: file?.name,
    fileSize: file?.size,
    fileType: file?.type
  });

  // Validate required fields
  if (!title || !college || !course || !subject || !year || !semester || !examType || !file) {
    alert('Please fill in all required fields');
    console.log('Validation failed - missing required fields');
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
    console.log('Starting Cloudinary upload...');
    
    // Upload file to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(file);
    
    console.log('Cloudinary upload successful:', cloudinaryResult);

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
      fileUrl: cloudinaryResult.url,
      publicId: cloudinaryResult.publicId,
      uploadedBy: currentUser.uid,
      uploadedByEmail: currentUser.email,
      uploadDate: serverTimestamp(),
      downloads: 0,
      likes: 0,
      status: 'pending' // pending, approved, rejected
    };

    console.log('Saving to Firestore:', pyqData);

    const docRef = await addDoc(collection(db, 'pyqs'), pyqData);
    
    console.log('Document written with ID: ', docRef.id);
    
    // Show success message
    alert('PYQ uploaded successfully! It will be reviewed and made available soon.');
    
    // Close modal and reset form
    closeUploadModal();
    
  } catch (error) {
    console.error('Upload error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    let errorMessage = 'Upload failed: ';
    
    if (error.message.includes('File size')) {
      errorMessage += 'File is too large. Maximum size is 10MB.';
    } else if (error.message.includes('File type')) {
      errorMessage += 'Invalid file type. Please use PDF, JPG, or PNG files.';
    } else if (error.message.includes('Upload failed: 400')) {
      errorMessage += 'Invalid upload preset. Please check Cloudinary configuration.';
    } else if (error.message.includes('Upload failed: 401')) {
      errorMessage += 'Unauthorized. Please check Cloudinary credentials.';
    } else if (error.message.includes('Upload failed: 413')) {
      errorMessage += 'File is too large for Cloudinary.';
    } else {
      errorMessage += error.message;
    }
    
    alert(errorMessage);
  } finally {
    // Reset loading state
    uploadBtn.disabled = false;
    uploadText.style.display = 'block';
    uploadLoading.style.display = 'none';
  }
}

// Search function
async function searchPYQs(filters = {}) {
  try {
    let q = collection(db, 'pyqs');
    
    // Apply filters
    if (filters.college) {
      q = query(q, where('college', '==', filters.college));
    }
    if (filters.subject) {
      q = query(q, where('subject', '==', filters.subject));
    }
    if (filters.year) {
      q = query(q, where('year', '==', parseInt(filters.year)));
    }
    if (filters.semester) {
      q = query(q, where('semester', '==', parseInt(filters.semester)));
    }
    if (filters.course) {
      q = query(q, where('course', '==', filters.course));
    }
    
    // Order by upload date
    q = query(q, orderBy('uploadDate', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const results = [];
    
    querySnapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return results;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
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

// Export functions for use in other files
window.searchPYQs = searchPYQs; 
