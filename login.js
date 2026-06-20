import {
  redirectIfLoggedIn,
  attemptLogin,
  isValidEmail,
  getRedirectTarget
} from "./auth.js";
import {
  initPasswordToggles,
  clearFormErrors,
  showFieldError,
  showFormError,
  showAuthSuccess
} from "./auth-forms.js";

redirectIfLoggedIn();

document.addEventListener("DOMContentLoaded", () => {
  initPasswordToggles();

  const form = document.getElementById("login-form");
  const card = document.getElementById("authCard");
  if (!form || !card) return;

  const signupLink = document.getElementById("signupLink");
  if (signupLink) {
    const redirect = new URLSearchParams(window.location.search).get("redirect");
    signupLink.href = redirect
      ? `signup.html?redirect=${encodeURIComponent(redirect)}`
      : "signup.html";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearFormErrors(form);

    const emailInput = document.getElementById("login-email");
    const passwordInput = document.getElementById("login-password");
    const remember = document.getElementById("remember-me")?.checked ?? true;

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    let valid = true;

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
    }

    if (!valid) return;

    const result = attemptLogin(email, password, remember);

    if (!result.ok) {
      showFormError(form, "Invalid email or password.");
      return;
    }

    showAuthSuccess(card, "Welcome back!", () => {
      window.location.href = getRedirectTarget();
    });
  });
});
