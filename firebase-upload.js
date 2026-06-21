import { uploadToCloudinary } from './cloudinary-config.js';
import { getSession, customAlert } from './auth.js';
import { addUpload, logUpload } from './pyq-data.js';

function getCurrentUser() {
  const session = getSession();
  if (!session) return null;
  return { uid: session.email, email: session.email };
}

window.openUploadModal = function() {
  document.getElementById('uploadModal').classList.add('show');
  document.body.style.overflow = 'hidden';
};

window.closeUploadModal = function() {
  document.getElementById('uploadModal').classList.remove('show');
  document.body.style.overflow = 'auto';
  resetForm();
};

document.addEventListener('DOMContentLoaded', function() {
  const fileInput = document.getElementById('fileInput');
  const fileText = document.getElementById('fileText');
  const fileName = document.getElementById('fileName');
  const fileUpload = document.querySelector('.file-upload');

  fileInput.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        await customAlert('Upload Error', 'File size must be less than 10MB');
        fileInput.value = '';
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        await customAlert('Upload Error', 'Please select a valid file type (JPG, PNG, or PDF)');
        fileInput.value = '';
        return;
      }

      fileText.style.display = 'none';
      fileName.style.display = 'block';
      fileName.textContent = file.name;
    }
  });

  fileUpload.addEventListener('dragover', function(e) {
    e.preventDefault();
    fileUpload.classList.add('dragover');
  });

  fileUpload.addEventListener('dragleave', function(e) {
    e.preventDefault();
    fileUpload.classList.remove('dragover');
  });

  fileUpload.addEventListener('drop', async function(e) {
    e.preventDefault();
    fileUpload.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      if (file.size > 10 * 1024 * 1024) {
        await customAlert('Upload Error', 'File size must be less than 10MB');
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        await customAlert('Upload Error', 'Please select a valid file type (JPG, PNG, or PDF)');
        return;
      }

      fileInput.files = files;
      fileText.style.display = 'none';
      fileName.style.display = 'block';
      fileName.textContent = file.name;
    }
  });

  const uploadForm = document.getElementById('uploadForm');
  uploadForm.addEventListener('submit', handleUpload);
});

async function handleUpload(e) {
  e.preventDefault();

  console.log('Upload form submitted');

  const currentUser = getCurrentUser();

  if (!currentUser) {
    await customAlert('Authentication Required', 'Please log in to upload files');
    return;
  }

  console.log('User authenticated:', currentUser.email);

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

  if (!title || !college || !course || !subject || !year || !semester || !examType || !file) {
    await customAlert('Missing Information', 'Please fill in all required fields');
    console.log('Validation failed - missing required fields');
    return;
  }

  const uploadBtn = document.getElementById('uploadBtn');
  const uploadText = document.getElementById('uploadText');
  const uploadLoading = document.getElementById('uploadLoading');
  
  uploadBtn.disabled = true;
  uploadText.style.display = 'none';
  uploadLoading.style.display = 'flex';

  try {
    console.log('Starting Cloudinary upload...');
    
    const cloudinaryResult = await uploadToCloudinary(file);
    
    console.log('Cloudinary upload successful:', cloudinaryResult);

    console.log('Saving to MongoDB via Express API...');

    await addUpload({
      title: title,
      subject: subject,
      college: college === 'Other' ? document.getElementById('college-custom').value : college,
      year: parseInt(year),
      semester: parseInt(semester),
      examType: examType,
      fileName: file.name,
      fileUrl: cloudinaryResult.url
    });
    
    await logUpload(currentUser.email, title);
    
    await customAlert('Upload Successful', 'PYQ uploaded successfully! It will be reviewed and made available soon.');
    
    closeUploadModal();
    
  } catch (error) {
    console.error('Upload error:', error);
    
    let errorMessage = 'Upload failed: ';
    if (error.message.includes('File size')) {
      errorMessage += 'File is too large. Maximum size is 10MB.';
    } else if (error.message.includes('File type')) {
      errorMessage += 'Invalid file type. Please use PDF, JPG, or PNG files.';
    } else {
      errorMessage += error.message;
    }
    
    await customAlert('Upload Failed', errorMessage);
  } finally {
    uploadBtn.disabled = false;
    uploadText.style.display = 'block';
    uploadLoading.style.display = 'none';
  }
}

function resetForm() {
  document.getElementById('uploadForm').reset();
  document.getElementById('fileText').style.display = 'block';
  document.getElementById('fileName').style.display = 'none';
  document.getElementById('fileName').textContent = '';
}

document.addEventListener('click', function(e) {
  const modal = document.getElementById('uploadModal');
  if (e.target === modal) {
    closeUploadModal();
  }
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeUploadModal();
  }
});
