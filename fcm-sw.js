/*
 * علوش البازار — Firebase Cloud Messaging Service Worker
 * مستقل عن sw.js الأساسي حتى لا يؤثر على PWA / Offline Sync.
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

  // لو الرسالة تحتوي على notification
  // Firebase يتولى عرضها تلقائيًا.
  // لذلك لا نعرضها مرة أخرى حتى لا يظهر الإشعار مرتين.
  if (payload && payload.notification) return;

  const data = payload?.data || {};

  const title = data.title || "علوش البازار";
  const body = data.body || "لديك إشعار جديد";

  const url =
    data.appUrl ||
    self.registration.scope;

  return self.registration.showNotification(title, {
    body: body,

    tag:
      data.eventId ||
      "allosh-notification",

    renotify: true,

    dir: "rtl",

    lang: "ar",

    icon: "/icon-192.png",

    badge: "/icon-192.png",

    data: {
      url: url
    }
  });
});


/*
 * عند الضغط على الإشعار
 */
self.addEventListener("notificationclick", (event) => {

  event.notification.close();

  const url =
    event.notification?.data?.url ||
    self.registration.scope;

  event.waitUntil(
    (async () => {

      const windows =
        await self.clients.matchAll({
          type: "window",
          includeUncontrolled: true
        });

      /*
       * لو الموقع مفتوح بالفعل:
       * نركز على النافذة ونفتح الرابط المطلوب.
       */
      for (const client of windows) {

        try {

          await client.focus();

          if (
            "navigate" in client &&
            url
          ) {
            await client.navigate(url);
          }

          return;

        } catch (_) {}

      }

      /*
       * لو الموقع غير مفتوح:
       * افتح الموقع.
       */
      if (
        self.clients.openWindow &&
        url
      ) {

        await self.clients.openWindow(url);

      }

    })()
  );

});