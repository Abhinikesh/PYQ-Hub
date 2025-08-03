
// Search functionality for PYQs
document.addEventListener('DOMContentLoaded', function() {
  const searchForm = document.getElementById('searchForm');
  const resultsContainer = document.getElementById('searchResults');
  
  if (searchForm) {
    searchForm.addEventListener('submit', handleSearch);
  }
  
  // Load initial results
  loadAllPYQs();
});

async function handleSearch(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const filters = {
    college: formData.get('college') || null,
    course: formData.get('course') || null,
    subject: formData.get('subject') || null,
    year: formData.get('year') || null,
    semester: formData.get('semester') || null
  };
  
  // Remove null values
  Object.keys(filters).forEach(key => {
    if (!filters[key]) delete filters[key];
  });
  
  try {
    const results = await searchPYQs(filters);
    displayResults(results);
  } catch (error) {
    console.error('Search failed:', error);
    alert('Search failed. Please try again.');
  }
}

async function loadAllPYQs() {
  try {
    const results = await searchPYQs({});
    displayResults(results);
  } catch (error) {
    console.error('Failed to load PYQs:', error);
  }
}

function displayResults(results) {
  const container = document.getElementById('searchResults');
  if (!container) return;
  
  if (results.length === 0) {
    container.innerHTML = '<div class="no-results">No PYQs found matching your criteria.</div>';
    return;
  }
  
  const resultsHTML = results.map(pyq => `
    <div class="pyq-card" data-id="${pyq.id}">
      <div class="pyq-header">
        <h3>${pyq.title}</h3>
        <span class="pyq-status ${pyq.status}">${pyq.status}</span>
      </div>
      <div class="pyq-meta">
        <p><strong>College:</strong> ${pyq.college}</p>
        <p><strong>Course:</strong> ${pyq.course}</p>
        <p><strong>Subject:</strong> ${pyq.subject}</p>
        <p><strong>Year:</strong> ${pyq.year}</p>
        <p><strong>Semester:</strong> ${pyq.semester}</p>
        <p><strong>Exam Type:</strong> ${pyq.examType}</p>
      </div>
      ${pyq.description ? `<p class="pyq-description">${pyq.description}</p>` : ''}
      <div class="pyq-actions">
        <button onclick="downloadPYQ('${pyq.fileUrl}', '${pyq.fileName}')" class="btn-download">
          📥 Download
        </button>
        <button onclick="likePYQ('${pyq.id}')" class="btn-like">
          ❤️ ${pyq.likes || 0}
        </button>
        <span class="downloads">📊 ${pyq.downloads || 0} downloads</span>
      </div>
      <div class="pyq-footer">
        <small>Uploaded by ${pyq.uploadedByEmail} on ${formatDate(pyq.uploadDate)}</small>
      </div>
    </div>
  `).join('');
  
  container.innerHTML = resultsHTML;
}

function downloadPYQ(fileUrl, fileName) {
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = fileName;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Update download count (you can implement this)
  console.log('Downloading:', fileName);
}

function likePYQ(pyqId) {
  // Implement like functionality
  console.log('Liking PYQ:', pyqId);
}

function formatDate(timestamp) {
  if (!timestamp) return 'Unknown date';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Filter functions
function filterByCollege(college) {
  const filter = college ? { college } : {};
  searchPYQs(filter).then(displayResults);
}

function filterBySubject(subject) {
  const filter = subject ? { subject } : {};
  searchPYQs(filter).then(displayResults);
}

function filterByYear(year) {
  const filter = year ? { year } : {};
  searchPYQs(filter).then(displayResults);
}

// Export functions
window.downloadPYQ = downloadPYQ;
window.likePYQ = likePYQ;
window.filterByCollege = filterByCollege;
window.filterBySubject = filterBySubject;
window.filterByYear = filterByYear; 
