importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "ТВОЙ_API_KEY",
  projectId: "web-app-d7b7a",
  messagingSenderId: "781762321374",
  appId: "1:781762321374:web:6fb42bae922f378bd0db4f"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  self.registration.showNotification("Anonymous Chat", {
    body: payload.notification.body,
    icon: "./icon.png"
  });
});
