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

const CHAT_PIN = "1337";
const myId = localStorage.getItem("id") || crypto.randomUUID();
localStorage.setItem("id", myId);

const pinScreen = document.getElementById("pinScreen");
const pinInput = document.getElementById("pinInput");
const messages = document.getElementById("messages");
const footer = document.querySelector("footer");
const input = document.getElementById("msg");

// PIN
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

// SEND
function send() {
  if (!input.value) return;
  db.ref("chat").push({
    text: input.value,
    sender: myId,
    time: Date.now()
  });
  input.value = "";
}

// RECEIVE
function loadMessages() {
  db.ref("chat").limitToLast(100).on("child_added", snap => {
    const m = snap.val();
    const div = document.createElement("div");
    div.className = "msg " + (m.sender === myId ? "me" : "");
    div.textContent = m.text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  });
}

// PUSH
document.getElementById("notifyBtn").onclick = async () => {
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return alert("DENIED");

  const token = await messaging.getToken({
    vapidKey: "BOHK_fckIuE_cJKgqnw6F58oPvFEam199T4udSHNigT9mj5_1V0KfXTz4ohCinee-FLkvxqGlX2A3Bk_e03spBc"
  });

  await db.ref("tokens/" + myId).set(token);
  alert("PUSH ENABLED");
};

// FOREGROUND
messaging.onMessage(payload => {
  new Notification(payload.notification.title, {
    body: payload.notification.body
  });
});
