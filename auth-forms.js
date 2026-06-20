export function initPasswordToggles() {
  document.querySelectorAll("[data-password-toggle]").forEach((btn) => {
    const targetId = btn.dataset.passwordToggle;
    const input = document.getElementById(targetId);
    if (!input) return;

    btn.addEventListener("click", () => {
      const showing = input.type === "text";
      input.type = showing ? "password" : "text";
      btn.classList.toggle("visible", !showing);
      btn.setAttribute("aria-label", showing ? "Show password" : "Hide password");
    });
  });
}

export function showFieldError(input, message) {
  const group = input.closest(".form_group");
  if (!group) return;
  group.classList.add("has-error");
  let error = group.querySelector(".field-error");
  if (!error) {
    error = document.createElement("p");
    error.className = "field-error";
    group.appendChild(error);
  }
  error.textContent = message;
}

export function clearFieldError(input) {
  const group = input.closest(".form_group");
  if (!group) return;
  group.classList.remove("has-error");
  const error = group.querySelector(".field-error");
  if (error) error.remove();
}

export function clearFormErrors(form) {
  form.querySelectorAll(".form_group.has-error").forEach((group) => {
    group.classList.remove("has-error");
    const error = group.querySelector(".field-error");
    if (error) error.remove();
  });
  const formError = form.querySelector(".form-error");
  if (formError) {
    formError.textContent = "";
    formError.classList.add("is-hidden");
  }
}

export function showFormError(form, message) {
  let el = form.querySelector(".form-error");
  if (!el) {
    el = document.createElement("p");
    el.className = "form-error";
    form.insertBefore(el, form.firstElementChild);
  }
  el.textContent = message;
  el.classList.remove("is-hidden");
}

export function showAuthSuccess(card, message, onDone) {
  const formView = card.querySelector(".auth-form-view");
  const successView = card.querySelector(".auth-success");
  if (!formView || !successView) {
    onDone();
    return;
  }

  const msgEl = successView.querySelector(".auth-success-text");
  if (msgEl) msgEl.textContent = message;

  formView.classList.add("is-hidden");
  successView.classList.remove("is-hidden");
  card.classList.add("auth-card-success");

  setTimeout(onDone, 600);
}
