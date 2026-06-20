import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-analytics.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { app, auth, setSession, getRedirectTarget } from "./auth.js";

getAnalytics(app);

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = document.getElementById("login-email")?.value;
      const password = document.getElementById("login-password")?.value;

      if (!email || !password) {
        alert("Please fill in all fields");
        return;
      }

      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          setSession(userCredential.user);
          window.location.href = getRedirectTarget();
        })
        .catch((error) => {
          let errorMessage = "Login failed: ";
          switch (error.code) {
            case "auth/user-not-found":
              errorMessage += "No account found with this email";
              break;
            case "auth/wrong-password":
              errorMessage += "Incorrect password";
              break;
            case "auth/invalid-email":
              errorMessage += "Invalid email address";
              break;
            case "auth/too-many-requests":
              errorMessage += "Too many failed attempts. Please try again later";
              break;
            default:
              errorMessage += error.message;
          }
          alert(errorMessage);
        });
    });
  }

  const signupForm = document.getElementById("signup-form");

  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = document.getElementById("signup-email")?.value;
      const password = document.getElementById("signup-password")?.value;
      const name = document.getElementById("name")?.value || "";

      if (!email || !password) {
        alert("Please fill in all required fields");
        return;
      }

      if (password.length < 6) {
        alert("Password must be at least 6 characters long");
        return;
      }

      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          setSession(userCredential.user, name);
          window.location.href = getRedirectTarget();
        })
        .catch((error) => {
          let errorMessage = "Signup failed: ";
          switch (error.code) {
            case "auth/email-already-in-use":
              errorMessage += "An account with this email already exists";
              break;
            case "auth/invalid-email":
              errorMessage += "Invalid email address";
              break;
            case "auth/weak-password":
              errorMessage += "Password is too weak. Use at least 6 characters";
              break;
            default:
              errorMessage += error.message;
          }
          alert(errorMessage);
        });
    });
  }
});
