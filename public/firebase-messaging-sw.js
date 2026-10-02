importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBJSkEfC3FmkBdohxv6glPGafFwW8IjulU",
  authDomain: "poojify-59855.firebaseapp.com",
  projectId: "poojify-59855",
  storageBucket: "poojify-59855.firebasestorage.app",
  messagingSenderId: "413639924690",
  appId: "1:413639924690:web:22469d0721abf418bf060b",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || "Poojify", {
    body: body || "",
    icon: icon || "/favicon.svg",
  });
});