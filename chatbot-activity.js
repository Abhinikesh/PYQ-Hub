import { getSession } from "./auth.js";
import { logAiUse } from "./pyq-data.js";

let logged = false;

function maybeLogAiUse() {
  if (logged) return;
  const session = getSession();
  if (!session) return;
  logged = true;
  logAiUse(session.email);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("sendBtn")?.addEventListener("click", maybeLogAiUse, true);
  document.querySelectorAll(".quick-action").forEach((btn) => {
    btn.addEventListener("click", maybeLogAiUse, true);
  });
});
