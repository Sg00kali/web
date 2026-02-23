const terminal = document.getElementById("terminal");
const input = document.getElementById("cmdInput");
const promptEl = document.getElementById("prompt");

let stage = "boot";
let username = "";
let currentUser = "";
let loginAttempts = 0;
let sudoAction = null;

/* ---------- Utility ---------- */

function println(text = "") {
  terminal.innerHTML += text + "\n";
  window.scrollTo(0, document.body.scrollHeight);
}

function setPrompt(text, type = "text") {
  promptEl.textContent = text + " ";
  input.type = type;
  input.value = "";
  input.focus();
}

/* ---------- Boot ---------- */

const bootLines = [
"[    0.000000] Linux version 6.2.0-portfolio",
"[    0.120431] Initializing hardware...",
"[    0.342991] Mounting filesystem...",
"[    0.812331] Starting system services...",
"[    1.534221] Network Manager started. [ OK ]",
"[    2.331992] Display Manager started. [ OK ]",
"",
"Ubuntu 22.04 LTS portfolio tty1",
""
];

let i = 0;

function boot() {
  if (i < bootLines.length) {
    println(bootLines[i]);
    i++;
    setTimeout(boot, 100);
  } else {
    stage = "loginUser";
    setPrompt("login:");
  }
}

/* ---------- Input ---------- */

input.addEventListener("keydown", function(e) {

  if (e.key !== "Enter") return;

  const value = input.value.trim();   // IMPORTANT: trim

  if (stage === "loginUser") {
    username = value;
    println("login: " + username);
    stage = "loginPass";
    setPrompt("Password:", "password");
    return;
  }

  if (stage === "loginPass") {

    println("Password: ******");  // NEVER show real password

    if (username === "kali" && value === "admin@123") {

      loginAttempts = 0;
      currentUser = username;
      println("Login successful.\n");
      stage = "shell";
      setPrompt(currentUser + "@portfolio:~$");

    } else {

      loginAttempts++;
      println("Login incorrect");

      if (loginAttempts >= 3) {
        println("System locked.");
        input.disabled = true;
        return;
      }

      stage = "loginUser";
      setPrompt("login:");
    }

    return;
  }

  if (stage === "shell") {
    println(promptEl.textContent + value);
    executeCommand(value);
  }

  if (stage === "sudoPass") {

    println("[sudo] password for " + currentUser + ": ******");

    if (value === "admin@123") {

      if (sudoAction === "shutdown") shutdown();
      if (sudoAction === "restart") restart();

    } else {

      println("Sorry, try again.");
      stage = "shell";
      setPrompt(currentUser + "@portfolio:~$");
    }

    return;
  }

});

/* ---------- Commands ---------- */

function executeCommand(cmd) {

  switch(cmd) {

    case "help":
      println("help clear whoami date ls");
      println("about projects skills");
      println("exit sudo shutdown sudo restart");
      break;

    case "clear":
      terminal.innerHTML = "";
      break;

    case "whoami":
      println(currentUser);
      break;

    case "date":
      println(new Date().toString());
      break;

    case "ls":
      println("about.txt projects.txt skills.txt");
      break;

    case "about":
      println("Creative Developer building OS-style portfolio.");
      break;

    case "projects":
      println("• Ubuntu Portfolio UI");
      println("• Terminal Web App");
      break;

    case "skills":
      println("HTML CSS JavaScript Linux UI");
      break;

    case "exit":
      stage = "loginUser";
      setPrompt("login:");
      break;

    case "sudo shutdown":
      sudoAction = "shutdown";
      stage = "sudoPass";
      setPrompt("[sudo] password for " + currentUser + ":", "password");
      return;

    case "sudo restart":
      sudoAction = "restart";
      stage = "sudoPass";
      setPrompt("[sudo] password for " + currentUser + ":", "password");
      return;

      case "startx":
  launchDesktop();
  return;

    default:
      if (cmd !== "") println(cmd + ": command not found");
  }

  if (stage === "shell") {
    setPrompt(currentUser + "@portfolio:~$");
  }
}

/* ---------- Power ---------- */

function shutdown() {
  println("Stopping services...");
  println("Power down.");
  input.disabled = true;
}

function restart() {
  terminal.innerHTML = "";
  input.disabled = false;
  stage = "boot";
  i = 0;
  setTimeout(boot, 300);
}

/* ---------- Start ---------- */

boot();