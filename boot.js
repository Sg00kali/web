const terminal = document.getElementById("terminal");

let stage = "boot";
let username = "";
let password = "";
let currentUser = "";
let commandBuffer = "";
let loginAttempts = 0;

let sudoAction = null;
let sudoPassword = "";

const kernelLogs = [
"[    0.000000] Linux version 6.2.0-portfolio (gcc 13.2.0)",
"[    0.120431] Initializing cgroup subsys cpuset",
"[    0.342991] Mounting root filesystem...",
"[    0.812331] systemd[1]: Starting Journal Service...",
"[    1.203441] systemd[1]: Started Journal Service. [  OK  ]",
"[    1.534221] systemd[1]: Starting Network Manager...",
"[    2.002311] systemd[1]: Started Network Manager. [  OK  ]",
"[    2.331992] systemd[1]: Starting GNOME Display Manager...",
"[    2.900112] systemd[1]: Started GNOME Display Manager. [  OK  ]",
"",
"Ubuntu 22.04 LTS portfolio tty1",
""
];

let logIndex = 0;

/* Utility */

function print(text = "") {
  terminal.innerHTML += text;
  terminal.scrollTop = terminal.scrollHeight;
}

function println(text = "") {
  print(text + "\n");
}

/* Boot */

function bootSequence() {
  if (logIndex < kernelLogs.length) {
    println(kernelLogs[logIndex]);
    logIndex++;
    setTimeout(bootSequence, 120);
  } else {
    stage = "loginUser";
    print("login: ");
  }
}

/* Keyboard */

document.addEventListener("keydown", function(e) {

  if (stage === "loginUser") handleUsernameInput(e);
  else if (stage === "loginPass") handlePasswordInput(e);
  else if (stage === "shell") handleShellInput(e);
  else if (stage === "sudoPass") handleSudoInput(e);

});

/* Login Username */

function handleUsernameInput(e) {

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
}

/* Login Password */

function handlePasswordInput(e) {

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
        println("Too many failed attempts. System locked.");
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
}

/* Shell */

function showPrompt() {
  print(currentUser + "@portfolio:~$ ");
}

function handleShellInput(e) {

  // Ctrl + D logout
  if (e.ctrlKey && e.key === "d") {
    println("");
    logout();
    return;
  }

  if (e.key === "Enter") {
    println("");
    executeCommand(commandBuffer.trim());

    if (stage === "shell") {
      showPrompt();
    }

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
}

/* Commands */

function executeCommand(cmd) {

  switch(cmd) {

    case "help":
      println("Available commands:");
      println("help, clear, whoami, uname -a, date, ls");
      println("about, projects, skills");
      println("exit");
      println("sudo shutdown, sudo restart, startx");
      break;

    case "clear":
      terminal.innerHTML = "";
      break;

    case "whoami":
      println(currentUser);
      break;

    case "uname -a":
      println("Linux portfolio 6.2.0-portfolio x86_64 GNU/Linux");
      break;

    case "date":
      println(new Date().toString());
      break;

    case "ls":
      println("about.txt  projects.txt  skills.txt");
      break;

    case "about":
      println("Creative Developer building OS-inspired web experiences.");
      break;

    case "projects":
      println("• Ubuntu Portfolio UI");
      println("• Interactive Dashboard");
      println("• Terminal-based Web App");
      break;

    case "skills":
      println("HTML/CSS  JavaScript  Linux  UI Engineering");
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

    case "startx":
      println("Launching desktop environment...");
      break;

    default:
      if (cmd !== "") println(cmd + ": command not found");
  }
}

/* Logout */

function logout() {
  println("logout");
  println("");
  stage = "loginUser";
  username = "";
  password = "";
  currentUser = "";
  commandBuffer = "";
  print("login: ");
}

/* Sudo */

function requestSudo(action) {
  sudoAction = action;
  sudoPassword = "";
  stage = "sudoPass";
  print("[sudo] password for " + currentUser + ": ");
}

function handleSudoInput(e) {

  if (e.key === "Enter") {

    if (sudoPassword === "admin@123") {
      println("");

      if (sudoAction === "shutdown") shutdownSequence();
      if (sudoAction === "restart") restartSequence();
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
}

/* Shutdown */

function shutdownSequence() {
  stage = "off";
  println("Stopping services...");
  println("Unmounting filesystems...");
  println("Power down.");
  setTimeout(() => {
    terminal.innerHTML = "";
  }, 1000);
}

/* Restart */

function restartSequence() {
  stage = "boot";
  terminal.innerHTML = "";
  logIndex = 0;
  username = "";
  password = "";
  commandBuffer = "";
  loginAttempts = 0;
  setTimeout(bootSequence, 500);
}

/* Start */

bootSequence();