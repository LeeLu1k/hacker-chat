// ===== FIREBASE CONFIG =====
firebase.initializeApp({
  apiKey: "AIzaSyDjxMdWwuntPGRvPgcbpWk9LjFpw25xcQc",
  authDomain: "web-app-d7b7a.firebaseapp.com",
  databaseURL: "https://web-app-d7b7a-default-rtdb.firebaseio.com",
  projectId: "web-app-d7b7a",
  messagingSenderId: "781762321374",
  appId: "1:781762321374:web:6fb42bae922f378bd0db4f"
});

const db = firebase.database();
const messaging = firebase.messaging();

// ===== USER =====
const CHAT_PIN = "1337";
let myId = localStorage.getItem("id") || Math.random().toString(36).slice(2);
localStorage.setItem("id", myId);

// ===== ELEMENTS =====
const pinScreen = document.getElementById("pinScreen");
const pinInput = document.getElementById("pinInput");
const messages = document.getElementById("messages");
const footer = document.querySelector("footer");
const input = document.getElementById("msg");

// ===== PIN =====
function checkPin() {
  if (pinInput.value === CHAT_PIN) {
    pinScreen.style.display = "none";
    messages.style.display = "flex";
    footer.style.display = "flex";
    loadMessages();
  } else {
    alert("WRONG PIN");
  }
}

// ===== SEND =====
function send() {
  if (!input.value) return;
  db.ref("chat").push({
    text: input.value,
    sender: myId,
    time: Date.now()
  });
  input.value = "";
}

// ===== RECEIVE =====
function loadMessages() {
  db.ref("chat").limitToLast(200).on("child_added", snap => {
    const m = snap.val();
    const div = document.createElement("div");
    div.className = "msg " + (m.sender === myId ? "me" : "other");
    div.textContent = m.text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  });
}

// ===== PUSH =====
document.getElementById("notifyBtn").onclick = async () => {
  const token = await messaging.getToken({
    vapidKey: "ТВОЙ_VAPID_KEY"
  });
  db.ref("tokens/" + myId).set(token);
  alert("PUSH ENABLED");
};

messaging.onMessage(payload => {
  new Notification(payload.notification.title, {
    body: payload.notification.body
  });
});

