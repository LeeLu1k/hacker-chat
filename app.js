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

const myId = localStorage.getItem("uid") || crypto.randomUUID();
localStorage.setItem("uid", myId);

// LOGIN
function login() {
  const username = document.getElementById("username").value;
  if (!username) return;

  localStorage.setItem("username", username);

  db.ref("users/" + myId).set({
    username,
    online: true
  });

  document.getElementById("login").style.display = "none";
  document.getElementById("users").style.display = "block";

  loadUsers();
}

// USERS LIST
function loadUsers() {
  const list = document.getElementById("list");

  db.ref("users").on("value", snap => {
    list.innerHTML = "";
    snap.forEach(s => {
      if (s.key === myId) return;

      const div = document.createElement("div");
      div.className = "user";
      div.textContent = s.val().username;
      div.onclick = () => {
        localStorage.setItem("chatWith", s.key);
        location.href = "chat.html";
      };
      list.appendChild(div);
    });
  });
}

// CHAT
const chatWith = localStorage.getItem("chatWith");
if (chatWith) {
  const chatId = [myId, chatWith].sort().join("_");
  const msgBox = document.getElementById("messages");

  db.ref("chats/" + chatId + "/messages")
    .limitToLast(100)
    .on("child_added", snap => {
      const m = snap.val();
      const div = document.createElement("div");
      div.className = "msg " + (m.from === myId ? "me" : "other");
      div.textContent = m.text;
      msgBox.appendChild(div);
      msgBox.scrollTop = msgBox.scrollHeight;
    });

  window.send = () => {
    const input = document.getElementById("text");
    if (!input.value) return;

    db.ref("chats/" + chatId + "/messages").push({
      from: myId,
      text: input.value,
      time: Date.now()
    });

    input.value = "";
  };
}
