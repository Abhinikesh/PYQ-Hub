import { getSession } from "./auth.js";
import { logAiUse } from "./pyq-data.js";

export class Chatbot {
  constructor() {
    this.isOpen = false;
    this.conversationHistory = [];
    this.typingTimeout = null;
    this.loggedUse = false;

    this.initializeElements();
    this.bindEvents();
    this.loadConversationHistory();
    if (window.location.pathname.endsWith("chatbot.html")) {
      this.openChat();
    }
  }

  initializeElements() {
    this.chatbotContainer = document.querySelector(".chatbot-container");
    this.floatingChatBtn = document.getElementById("floatingChatBtn");
    this.chatMessages = document.getElementById("chatMessages");
    this.messageInput = document.getElementById("messageInput");
    this.sendBtn = document.getElementById("sendBtn");
    this.typingIndicator = document.getElementById("typingIndicator");
    this.minimizeBtn = document.getElementById("minimizeBtn");
    this.closeBtn = document.getElementById("closeBtn");
    this.quickActions = document.querySelectorAll(".quick-action");
  }

  bindEvents() {
    this.floatingChatBtn.addEventListener("click", () => this.openChat());
    this.sendBtn.addEventListener("click", () => this.sendMessage());
    
    this.messageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    this.messageInput.addEventListener("input", () => this.autoResizeTextarea());

    this.minimizeBtn.addEventListener("click", () => this.closeChat());
    this.closeBtn.addEventListener("click", () => this.closeChat());

    this.quickActions.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const action = e.currentTarget.dataset.action;
        this.handleQuickAction(action);
      });
    });

    document.addEventListener("click", (e) => {
      if (
        this.chatbotContainer &&
        !this.chatbotContainer.contains(e.target) &&
        this.floatingChatBtn &&
        !this.floatingChatBtn.contains(e.target) &&
        this.isOpen
      ) {
        this.closeChat();
      }
    });
  }

  openChat() {
    this.isOpen = true;
    this.chatbotContainer.classList.add("active");
    this.floatingChatBtn.style.display = "none";
    this.messageInput.focus();
    this.scrollToBottom();
  }

  closeChat() {
    this.isOpen = false;
    this.chatbotContainer.classList.remove("active");
    this.floatingChatBtn.style.display = "flex";
    this.hideTypingIndicator();
  }

  sendMessage() {
    const message = this.messageInput.value.trim();
    if (!message) return;

    this.addMessage(message, "user");
    this.messageInput.value = "";
    this.autoResizeTextarea();
    this.scrollToBottom();

    this.maybeTriggerActivityLogging();
    this.showTypingIndicator();

    const delay = 800 + Math.random() * 700;
    setTimeout(() => {
      this.hideTypingIndicator();
      const response = this.generateAIResponse(message);
      this.addMessage(response, "bot");
    }, delay);
  }

  maybeTriggerActivityLogging() {
    if (this.loggedUse) return;
    const session = getSession();
    if (!session) return;
    this.loggedUse = true;
    logAiUse(session.email);
  }

  addMessage(content, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}-message`;

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    const icon = document.createElement("i");
    icon.className = sender === "bot" ? "fas fa-robot" : "fas fa-user";
    avatar.appendChild(icon);

    const messageContent = document.createElement("div");
    messageContent.className = "message-content";

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.innerHTML = this.formatMessage(content);

    const time = document.createElement("span");
    time.className = "message-time";
    time.textContent = this.getCurrentTime();

    messageContent.appendChild(bubble);
    messageContent.appendChild(time);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);

    this.chatMessages.appendChild(messageDiv);
    this.scrollToBottom();

    this.conversationHistory.push({
      sender,
      content,
      timestamp: new Date().toISOString()
    });
    this.saveConversationHistory();
  }

  formatMessage(content) {
    let formatted = content.replace(
      /(https?:\/\/[^\s]+)/g,
      `<a href="$1" target="_blank" style="color: var(--color-primary); text-decoration: underline;">$1</a>`
    );
    formatted = formatted.replace(/\n/g, "<br>");
    return formatted;
  }

  generateAIResponse(userMessage) {
    const text = userMessage.toLowerCase();

    if (text.includes("study") || text.includes("tip") || text.includes("learn")) {
      const studyTips = [
        "Try the Pomodoro Technique: Study for 25 minutes, then take a 5-minute break. It keeps your mind fresh!",
        "Active Recall is key! Instead of just reading, close your book and try to write down everything you remember.",
        "Feynman Technique: Try explaining the topic to someone else in simple terms. If you struggle, that's where you need to review.",
        "Spaced Repetition: Review your notes after 1 day, then 3 days, then a week. It helps move info to long-term memory."
      ];
      return studyTips[Math.floor(Math.random() * studyTips.length)];
    }

    if (text.includes("find") || text.includes("question") || text.includes("search") || text.includes("pyq")) {
      const searchTips = [
        "You can use the 'Search PYQs' tab in the sidebar to filter past papers by college, subject, year, or semester!",
        "Looking for something specific? Type the subject name (like 'Data Structures' or 'Mathematics') in the search bar to find matching files.",
        "We have a growing collection of papers for MRU, IITs, and other colleges. Check the search page to see if your college is listed!",
        "To find a paper quickly, select your semester from the dropdown filters on the Search page."
      ];
      return searchTips[Math.floor(Math.random() * searchTips.length)];
    }

    if (text.includes("organize") || text.includes("folder") || text.includes("structure") || text.includes("manage")) {
      const organizeTips = [
        "Group your study files by semester first, then by subject. Keeping a clean folder structure on your drive makes revision so much easier!",
        "Name your downloaded files consistently, like 'Semester3_DSA_Midsem_2025.pdf' so you can search them instantly on your computer.",
        "Create a revision tracker checklist: list all topics and color-code them (Red: Need to study, Yellow: Reviewing, Green: Mastered).",
        "Use digital note-taking apps like Notion or Obsidian to link your class notes directly with the relevant past year questions."
      ];
      return organizeTips[Math.floor(Math.random() * organizeTips.length)];
    }

    if (text.includes("prep") || text.includes("exam") || text.includes("test") || text.includes("prepare") || text.includes("revision")) {
      const prepTips = [
        "Solve at least 3 past papers under timed conditions. It helps you get used to the exam pressure and time limits!",
        "Focus on high-weightage topics first. Look at past papers to identify which topics are repeatedly asked every year.",
        "Don't cram the night before! A good 7-8 hours of sleep before the exam will do more for your performance than last-minute stress.",
        "Make a 1-page summary sheet for each subject with key formulas and concepts. It's perfect for quick reference right before entering the exam hall."
      ];
      return prepTips[Math.floor(Math.random() * prepTips.length)];
    }

    if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
      const greetings = [
        "Hey there! Ready to ace your studies today? Ask me about study tips, organizing notes, or preparing for exams!",
        "Hello! 👋 I'm your PYQ Hub Assistant. What are we studying today?",
        "Hi! How can I help you prepare for your exams today?"
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    const defaultResponses = [
      "That's interesting! I'm designed to help you with study tips, finding past papers, organizing files, and exam preparation. What topic are you working on?",
      "I'm not sure about that specific topic, but I can help you with study strategies, revision checklists, or navigating PYQ Hub. What do you need?",
      "Let's focus on acing your exams! Feel free to click any of the quick action buttons below (Study Tips, Find PYQs, Organize, Exam Prep) to get started."
    ];
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }

  handleQuickAction(action) {
    let message = "";
    if (action === "study-tips") {
      message = "Can you give me some study tips?";
    } else if (action === "find-questions") {
      message = "I need help finding specific questions.";
    } else if (action === "organize") {
      message = "How can I organize my study materials?";
    } else if (action === "exam-prep") {
      message = "What are the best exam preparation strategies?";
    }

    if (message) {
      this.addMessage(message, "user");
      this.maybeTriggerActivityLogging();
      this.showTypingIndicator();

      const delay = 800 + Math.random() * 700;
      setTimeout(() => {
        this.hideTypingIndicator();
        const response = this.generateAIResponse(message);
        this.addMessage(response, "bot");
      }, delay);
    }
  }

  showTypingIndicator() {
    this.typingIndicator.style.display = "flex";
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    this.typingIndicator.style.display = "none";
  }

  autoResizeTextarea() {
    const textarea = this.messageInput;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  }

  scrollToBottom() {
    setTimeout(() => {
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }, 100);
  }

  getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  loadConversationHistory() {
    const session = getSession();
    const userEmail = session ? session.email : "anonymous";
    this.localStorageKey = `chatbotHistory_${userEmail}`;
    const saved = localStorage.getItem(this.localStorageKey);
    if (saved) {
      this.conversationHistory = JSON.parse(saved);
      this.renderHistory();
    } else {
      this.conversationHistory = [
        {
          sender: "bot",
          content: "Hello! 👋 I'm your PYQ Hub Assistant. How can I help you today?",
          timestamp: new Date().toISOString()
        }
      ];
      this.saveConversationHistory();
      this.renderHistory();
    }
  }

  saveConversationHistory() {
    if (this.conversationHistory.length > 50) {
      this.conversationHistory = this.conversationHistory.slice(-50);
    }
    localStorage.setItem(this.localStorageKey, JSON.stringify(this.conversationHistory));
  }

  renderHistory() {
    this.chatMessages.innerHTML = "";
    this.conversationHistory.forEach((msg) => {
      const messageDiv = document.createElement("div");
      messageDiv.className = `message ${msg.sender}-message`;

      const avatar = document.createElement("div");
      avatar.className = "message-avatar";
      const icon = document.createElement("i");
      icon.className = msg.sender === "bot" ? "fas fa-robot" : "fas fa-user";
      avatar.appendChild(icon);

      const messageContent = document.createElement("div");
      messageContent.className = "message-content";

      const bubble = document.createElement("div");
      bubble.className = "message-bubble";
      bubble.innerHTML = this.formatMessage(msg.content);

      const time = document.createElement("span");
      time.className = "message-time";
      
      const date = new Date(msg.timestamp);
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      time.textContent = `${hours}:${minutes}`;

      messageContent.appendChild(bubble);
      messageContent.appendChild(time);
      messageDiv.appendChild(avatar);
      messageDiv.appendChild(messageContent);

      this.chatMessages.appendChild(messageDiv);
    });
    this.scrollToBottom();
  }
}

export function addChatbotToPage() {
  if (document.querySelector(".chatbot-container")) {
    return;
  }

  const chatbotHTML = `
    <div class="chatbot-container">
      <div class="chatbot-header">
        <div class="header-content">
          <div class="bot-info">
            <div class="bot-avatar">
              <i class="fas fa-robot"></i>
            </div>
            <div class="bot-details">
              <h3>PYQ Hub Assistant</h3>
              <span class="status online">Online</span>
            </div>
          </div>
          <div class="header-actions">
            <button class="minimize-btn" id="minimizeBtn" type="button" aria-label="Minimize">
              <i class="fas fa-minus"></i>
            </button>
            <button class="close-btn" id="closeBtn" type="button" aria-label="Close">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="chat-messages" id="chatMessages"></div>

      <div class="typing-indicator" id="typingIndicator" style="display: none;">
        <div class="message-avatar">
          <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
          <div class="message-bubble typing">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input-area">
        <div class="input-container">
          <textarea 
            id="messageInput" 
            placeholder="Type your message here..."
            rows="1"
          ></textarea>
          <button class="send-btn" id="sendBtn" type="button" aria-label="Send">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
        <div class="quick-actions">
          <button class="quick-action" data-action="study-tips" type="button">
            <i class="fas fa-lightbulb"></i>
            Study Tips
          </button>
          <button class="quick-action" data-action="find-questions" type="button">
            <i class="fas fa-search"></i>
            Find PYQs
          </button>
          <button class="quick-action" data-action="organize" type="button">
            <i class="fas fa-folder"></i>
            Organize
          </button>
          <button class="quick-action" data-action="exam-prep" type="button">
            <i class="fas fa-calendar"></i>
            Exam Prep
          </button>
        </div>
      </div>
    </div>

    <div class="floating-chat-btn" id="floatingChatBtn">
      <i class="fas fa-comments"></i>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", chatbotHTML);
  new Chatbot();
}