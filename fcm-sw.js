/*
 * علوش البازار — FCM Service Worker
 * مسؤول عن استقبال Push Notifications فقط.
 * لا يستبدل sw.js الخاص بالـPWA/Offline Sync.
 */

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBXfsQ_rLekcATTyEZ2G77aHyb6NDDeKyM",
  authDomain: "securityallosh.firebaseapp.com",
  databaseURL: "https://securityallosh-default-rtdb.firebaseio.com/",
  projectId: "securityallosh",
  storageBucket: "securityallosh.appspot.com",
  messagingSenderId: "907162116715",
  appId: "1:907162116715:web:e5a7c786d3ffa7ae56872e"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const data = payload?.data || {};

  // لو Firebase عرض notification تلقائيًا،
  // لا نعرضها مرة ثانية.
  if (payload?.notification && !Object.keys(data).length) {
    return;
  }

  const title = String(
    data.title ||
    payload?.notification?.title ||
    "علوش البازار"
  );

  const body = String(
    data.body ||
    payload?.notification?.body ||
    "لديك إشعار جديد"
  );

  const targetUrl =
    data.appUrl ||
    self.registration.scope;

  return self.registration.showNotification(title, {
    body: body,

    tag: String(
      data.eventId ||
      "allosh-notification"
    ),

    renotify: true,

    dir: "rtl",

    lang: "ar",

    data: {
      url: targetUrl,

      eventId: String(
        data.eventId || ""
      )
    }
  });
});


/*
 * عند الضغط على الإشعار
 * يفتح النظام ويركز على الصفحة الموجودة
 * أو يفتح الموقع إذا لم تكن الصفحة مفتوحة.
 */

self.addEventListener(
  "notificationclick",
  (event) => {

    event.notification.close();

    const url =
      event.notification?.data?.url ||
      self.registration.scope;

    event.waitUntil(
      (async () => {

        const clients =
          await self.clients.matchAll({
            type: "window",
            includeUncontrolled: true
          });

        for (const client of clients) {

          try {

            await client.focus();

            if (
              url &&
              "navigate" in client
            ) {
              await client.navigate(url);
            }

            return;

          } catch (_) {}

        }

        if (
          self.clients.openWindow &&
          url
        ) {
          await self.clients.openWindow(url);
        }

      })()
    );
  }
);