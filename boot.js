const terminal = document.getElementById("terminal");
const input = document.getElementById("mobileInput");

let stage = "boot";
let username = "";
let password = "";
let currentUser = "";
let commandBuffer = "";
let loginAttempts = 0;

let sudoAction = null;
let sudoPassword = "";

const kernelLogs = [
"[    0.000000] Linux version 6.2.0-portfolio",
"[    0.120431] Initializing hardware...",
"[    0.342991] Mounting filesystem...",
"[    0.812331] Starting system services...",
"[    1.534221] Network Manager started. [  OK  ]",
"[    2.331992] Display Manager started. [  OK  ]",
"",
"Ubuntu 22.04 LTS portfolio tty1",
""
];

let logIndex = 0;

/* ---------- UTIL ---------- */

function print(text = "") {
  terminal.innerHTML += text;
  terminal.scrollTop = terminal.scrollHeight;
}

function println(text = "") {
  print(text + "\n");
}

function focusInput() {
  input.focus();
}

/* Force focus when tapping anywhere */
document.addEventListener("click", focusInput);
document.addEventListener("touchstart", focusInput);

/* ---------- BOOT ---------- */

function bootSequence() {
  if (logIndex < kernelLogs.length) {
    println(kernelLogs[logIndex]);
    logIndex++;
    setTimeout(bootSequence, 100);
  } else {
    stage = "loginUser";
    print("login: ");
    focusInput();
  }
}

/* ---------- INPUT HANDLER ---------- */

input.addEventListener("keydown", function(e) {

  if (stage === "loginUser") handleUsername(e);
  else if (stage === "loginPass") handlePassword(e);
  else if (stage === "shell") handleShell(e);
  else if (stage === "sudoPass") handleSudo(e);

});

/* ---------- LOGIN ---------- */

function handleUsername(e) {

  if (e.key === "Enter") {
    stage = "loginPass";
    print("\nPassword: ");
  }

  else if (e.key === "Backspace") {
    username = username.slice(0, -1);
    terminal.innerHTML = terminal.innerHTML.slice(0, -1);
  }

  else if (e.key.length === 1) {
    username += e.key;
    print(e.key);
  }

  input.value = "";
}

function handlePassword(e) {

  if (e.key === "Enter") {

    if (username === "kali" && password === "admin@123") {

      loginAttempts = 0;
      currentUser = username;
      println("\n\nLogin successful.\n");
      stage = "shell";
      showPrompt();
    }

    else {

      loginAttempts++;
      println("\nLogin incorrect");

      if (loginAttempts >= 3) {
        println("System locked.");
        stage = "locked";
        return;
      }

      println("");
      username = "";
      password = "";
      stage = "loginUser";
      print("login: ");
    }
  }

  else if (e.key === "Backspace") {
    password = password.slice(0, -1);
    terminal.innerHTML = terminal.innerHTML.slice(0, -1);
  }

  else if (e.key.length === 1) {
    password += e.key;
    print("*");
  }

  input.value = "";
}

/* ---------- SHELL ---------- */

function showPrompt() {
  print(currentUser + "@portfolio:~$ ");
}

function handleShell(e) {

  if (e.ctrlKey && e.key === "d") {
    println("");
    logout();
    input.value = "";
    return;
  }

  if (e.key === "Enter") {
    println("");
    executeCommand(commandBuffer.trim());

    if (stage === "shell") showPrompt();
    commandBuffer = "";
  }

  else if (e.key === "Backspace") {
    commandBuffer = commandBuffer.slice(0, -1);
    terminal.innerHTML = terminal.innerHTML.slice(0, -1);
  }

  else if (e.key.length === 1) {
    commandBuffer += e.key;
    print(e.key);
  }

  input.value = "";
}

/* ---------- COMMANDS ---------- */

function executeCommand(cmd) {

  switch(cmd) {

    case "help":
      println("help, clear, whoami, date, ls");
      println("about, projects, skills");
      println("exit");
      println("sudo shutdown, sudo restart");
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
      logout();
      break;

    case "sudo shutdown":
      requestSudo("shutdown");
      break;

    case "sudo restart":
      requestSudo("restart");
      break;

    default:
      if (cmd !== "") println(cmd + ": command not found");
  }
}

/* ---------- LOGOUT ---------- */

function logout() {
  println("logout\n");
  stage = "loginUser";
  username = "";
  password = "";
  currentUser = "";
  commandBuffer = "";
  print("login: ");
}

/* ---------- SUDO ---------- */

function requestSudo(action) {
  sudoAction = action;
  sudoPassword = "";
  stage = "sudoPass";
  print("[sudo] password for " + currentUser + ": ");
}

function handleSudo(e) {

  if (e.key === "Enter") {

    if (sudoPassword === "admin@123") {
      println("");
      if (sudoAction === "shutdown") shutdown();
      if (sudoAction === "restart") restart();
    }

    else {
      println("\nSorry, try again.");
      stage = "shell";
      showPrompt();
    }
  }

  else if (e.key === "Backspace") {
    sudoPassword = sudoPassword.slice(0, -1);
    terminal.innerHTML = terminal.innerHTML.slice(0, -1);
  }

  else if (e.key.length === 1) {
    sudoPassword += e.key;
    print("*");
  }

  input.value = "";
}

/* ---------- POWER ---------- */

function shutdown() {
  stage = "off";
  println("Stopping services...");
  println("Power down.");
  setTimeout(() => terminal.innerHTML = "", 800);
}

function restart() {
  stage = "boot";
  terminal.innerHTML = "";
  logIndex = 0;
  username = "";
  password = "";
  commandBuffer = "";
  loginAttempts = 0;
  setTimeout(bootSequence, 500);
}

/* ---------- START ---------- */

bootSequence();