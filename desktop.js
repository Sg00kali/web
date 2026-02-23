const desktop = document.getElementById("desktop");
const terminalContainer = document.getElementById("terminal").parentElement;
const windowsContainer = document.getElementById("windows");
const clock = document.getElementById("clock");

/* Launch desktop */

function launchDesktop() {
  terminalContainer.style.display = "none";
  desktop.classList.remove("hidden");
  startClock();
}

/* Clock */

function startClock() {
  setInterval(() => {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString();
  }, 1000);
}

/* Open App */

document.querySelectorAll(".dock-item").forEach(item => {
  item.addEventListener("click", () => {
    openWindow(item.dataset.app);
  });
});

function openWindow(app) {

  const win = document.createElement("div");
  win.classList.add("window");

  let content = "";

  if (app === "about") {
    content = "Creative Developer building OS-inspired experiences.";
  }

  if (app === "projects") {
    content = "Ubuntu Portfolio UI<br>Terminal Web App<br>Dashboard App";
  }

  if (app === "skills") {
    content = "HTML<br>CSS<br>JavaScript<br>Linux<br>UI Engineering";
  }

  win.innerHTML = `
    <div class="window-header">${app}</div>
    <div class="window-content">${content}</div>
  `;

  windowsContainer.appendChild(win);
}