// ================= FIREBASE =================
const firebaseConfig = {
  apiKey: "AIzaSyDjxMdWwuntPGRvPgcbpWk9LjFpw25xcQc",
  authDomain: "web-app-d7b7a.firebaseapp.com",
  databaseURL: "https://web-app-d7b7a-default-rtdb.firebaseio.com",
  projectId: "web-app-d7b7a",
  storageBucket: "web-app-d7b7a.firebasestorage.app",
  messagingSenderId: "781762321374",
  appId: "1:781762321374:web:6fb42bae922f378bd0db4f"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const CHAT_PIN = "1337"; // 🔴 ПОМЕНЯЙ
let pinUnlocked = false;

const pinScreen = document.getElementById("pinScreen");
const pinInput = document.getElementById("pinInput");

if (localStorage.getItem("pin_ok") === "true") {
  unlockChat();
}

function checkPin() {
  if (pinInput.value === CHAT_PIN) {
    localStorage.setItem("pin_ok", "true");
    unlockChat();
  } else {
    alert("WRONG PIN");
  }
}

function unlockChat() {
  pinUnlocked = true;
  pinScreen.style.display = "none";
}

// ================= USER =================
// username из URL (?u=neo)
const params = new URLSearchParams(window.location.search);
const username = params.get("u") || "admin";

// локальный ID (кто ты)
let myId = localStorage.getItem("myId");
if (!myId) {
  myId = Math.random().toString(36).substring(2, 10);
  localStorage.setItem("myId", myId);
}

// ================= ELEMENTS =================
const messagesBox = document.getElementById("messages");
const input = document.getElementById("msg");
const notifyBtn = document.getElementById("notifyBtn");

// ================= SOUND =================
const audio = new Audio(
  "https://assets.mixkit.co/sfx/preview/mixkit-retro-game-notification-212.wav"
);

function playSound() {
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

// ================= TYPE EFFECT =================
function typeText(element, text, speed = 15) {
  let i = 0;
  element.textContent = "";

  const interval = setInterval(() => {
    element.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(interval);
  }, speed);
}

// ================= NOTIFICATIONS =================
let notificationsEnabled = localStorage.getItem("notify") === "true";
updateNotifyBtn();

notifyBtn.onclick = async () => {
  if (!("Notification" in window)) {
    alert("Уведомления не поддерживаются");
    return;
  }

  if (Notification.permission === "granted") {
    notificationsEnabled = !notificationsEnabled;
    localStorage.setItem("notify", notificationsEnabled);
    updateNotifyBtn();
  } else if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      notificationsEnabled = true;
      localStorage.setItem("notify", "true");
      updateNotifyBtn();
    }
  }
};

function updateNotifyBtn() {
  if (!notifyBtn) return;

  if (notificationsEnabled) {
    notifyBtn.textContent = "🔔 ON";
    notifyBtn.classList.add("on");
  } else {
    notifyBtn.textContent = "🔕 OFF";
    notifyBtn.classList.remove("on");
  }
}

// ================= SEND MESSAGE =================
function send() {
  if (!input.value.trim()) return;

  db.ref("users/" + username).push({
    text: input.value,
    senderId: myId,
    time: Date.now()
  });

  input.value = "";
}

// Enter → send
input.addEventListener("keydown", e => {
  if (e.key === "Enter") send();
});

// ================= RECEIVE =================
db.ref("users/" + username)
  .limitToLast(300)
  .on("child_added", snap => {
    const data = snap.val();

    if (!pinUnlocked) return;

    const wrapper = document.createElement("div");
    wrapper.classList.add("msg");

    const meta = document.createElement("div");
    meta.className = "meta";

    const textDiv = document.createElement("div");

    if (data.senderId === myId) {
      // МОЁ сообщение (СПРАВА)
      wrapper.classList.add("me");
      meta.textContent = "YOU";
    } else {
      // ЧУЖОЕ сообщение (СЛЕВА)
      wrapper.classList.add("other");
      meta.textContent = "ANON";
      playSound();

      // уведомление
      if (notificationsEnabled && document.hidden) {
        new Notification("Новое сообщение", {
          body: data.text.slice(0, 80),
          icon: "https://cdn-icons-png.flaticon.com/512/3064/3064197.png"
        });
      }
    }

    wrapper.appendChild(meta);
    wrapper.appendChild(textDiv);
    messagesBox.appendChild(wrapper);
    messagesBox.scrollTop = messagesBox.scrollHeight;

    typeText(textDiv, data.text);
  });
