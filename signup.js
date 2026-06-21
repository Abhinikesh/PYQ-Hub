import {
  redirectIfLoggedIn,
  attemptSignup,
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
              showAuthSuccess(card, "Welcome!", () => {
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

    const result = await attemptSignup(name, email, password);

    if (!result.ok) {
      if (result.reason === "exists") {
        showFieldError(emailInput, "An account with this email already exists.");
      } else {
        showFormError(form, "Signup failed. Please try again.");
      }
      return;
    }

    showAuthSuccess(card, `Welcome, ${name.split(" ")[0]}!`, () => {
      window.location.href = getRedirectTarget();
    });
  });
});
