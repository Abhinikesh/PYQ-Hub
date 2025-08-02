// Sample PYQ data
const pyqData = {
  Physics: ["2024", "2023", "2022"],
  Chemistry: ["2024", "2023", "2021"],
  Mathematics: ["2023", "2022", "2020"],
  ComputerScience: ["2024", "2023", "2022", "2021"],
  English: ["2024", "2023"],
  Biology: ["2023", "2022", "2021"]
};

// Wait until DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  // Add event listener to subject cards
  document.querySelectorAll(".subject-card").forEach(card => {
    card.addEventListener("click", () => {
      const subject = card.textContent.trim().replace(/\s+/g, '');
      showYearPopup(subject, pyqData[subject] || []);
    });
  });

  // Search functionality
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const query = this.value.toLowerCase();
      const cards = document.querySelectorAll(".subject-card");

      cards.forEach(card => {
        const subject = card.textContent.toLowerCase();
        card.classList.toggle("hidden", !subject.includes(query));
      });
    });
  }
});

// Show popup with years
function showYearPopup(subject, years) {
  closePopup(); // Remove any existing popup first

  const popup = document.createElement("div");
  popup.id = "popup";
  popup.className = "popup-container";

  const content = document.createElement("div");
  content.className = "popup-content";

  const title = document.createElement("h3");
  title.textContent = `${subject} - Select Year`;
  content.appendChild(title);

  const ul = document.createElement("ul");
  years.forEach(year => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = year;
    a.addEventListener("click", () => downloadPaper(subject, year));
    li.appendChild(a);
    ul.appendChild(li);
  });
  content.appendChild(ul);

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Close";
  closeBtn.addEventListener("click", closePopup);
  content.appendChild(closeBtn);

  popup.appendChild(content);
  document.body.appendChild(popup);
}

// Close the popup
function closePopup() {
  const popup = document.getElementById("popup");
  if (popup) popup.remove();
}

// Simulated download
function downloadPaper(subject, year) {
  alert(`📄 Downloading ${subject} paper for year ${year}...`);
  closePopup();
}
