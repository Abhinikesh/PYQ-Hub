import {
  redirectIfLoggedIn,
  attemptLogin,
  attemptGoogleLogin,
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

  fetch("/api/config")
    .then(res => res.json())
    .then(data => {
      const clientId = data.googleClientId;
      if (clientId && clientId !== "your-google-client-id-here" && window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            const result = await attemptGoogleLogin(response.credential);
            if (result.ok) {
              showAuthSuccess(card, "Welcome back!", () => {
                window.location.href = getRedirectTarget();
              });
            } else {
              showFormError(form, "Google authentication failed.");
            }
          }
        });
        const googleBtn = document.getElementById("googleBtn");
        if (googleBtn) {
          window.google.accounts.id.renderButton(googleBtn, {
            theme: "outline",
            size: "large",
            width: googleBtn.offsetWidth || 340
          });
        }
      } else {
        const sep = document.querySelector(".google-auth-separator");
        if (sep) sep.style.display = "none";
        const btn = document.getElementById("googleBtn");
        if (btn) btn.style.display = "none";
      }
    })
    .catch(() => {});

  form.addEventListener("submit", async (e) => {
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

    const result = await attemptLogin(email, password, remember);

    if (!result.ok) {
      showFormError(form, "Invalid email or password.");
      return;
    }

    showAuthSuccess(card, "Welcome back!", () => {
      window.location.href = getRedirectTarget();
    });
  });
});
