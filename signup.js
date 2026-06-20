import {
  redirectIfLoggedIn,
  attemptSignup,
  isValidEmail,
  getRedirectTarget
} from "./auth.js";
import {
  initPasswordToggles,
  clearFormErrors,
  showFieldError,
  showAuthSuccess
} from "./auth-forms.js";

redirectIfLoggedIn();

document.addEventListener("DOMContentLoaded", () => {
  initPasswordToggles();

  const form = document.getElementById("signup-form");
  const card = document.getElementById("authCard");
  if (!form || !card) return;

  const loginLink = document.getElementById("loginLink");
  if (loginLink) {
    const redirect = new URLSearchParams(window.location.search).get("redirect");
    loginLink.href = redirect
      ? `login.html?redirect=${encodeURIComponent(redirect)}`
      : "login.html";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearFormErrors(form);

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("signup-email");
    const passwordInput = document.getElementById("signup-password");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    let valid = true;

    if (!name) {
      showFieldError(nameInput, "Name is required.");
      valid = false;
    }

    if (!email) {
      showFieldError(emailInput, "Email is required.");
      valid = false;
    } else if (!isValidEmail(email)) {
      showFieldError(emailInput, "Enter a valid email address.");
      valid = false;
    }

    if (!password) {
      showFieldError(passwordInput, "Password is required.");
      valid = false;
    } else if (password.length < 6) {
      showFieldError(passwordInput, "Password must be at least 6 characters.");
      valid = false;
    }

    if (!valid) return;

    const result = attemptSignup(name, email, password);

    if (!result.ok && result.reason === "exists") {
      showFieldError(emailInput, "An account with this email already exists.");
      return;
    }

    showAuthSuccess(card, `Welcome, ${name.split(" ")[0]}!`, () => {
      window.location.href = getRedirectTarget();
    });
  });
});
