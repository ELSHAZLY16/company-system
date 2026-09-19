/* علوش البازار — Firebase Cloud Messaging Service Worker */

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
  const notification = payload?.notification || {};

  const title = String(
    data.title ||
    notification.title ||
    'علوش البازار'
  );

  const body = String(
    data.body ||
    notification.body ||
    'لديك إشعار جديد'
  );

  const url = data.appUrl || self.registration.scope;

  // منع تكرار الإشعار إذا أرسله Firebase تلقائياً
  // وكان الـ payload يحتوي فقط على notification
  if (
    payload?.notification &&
    Object.keys(data).length === 0
  ) {
    return;
  }

  return self.registration.showNotification(title, {
    body: body,

    tag: String(
      data.eventId ||
      'allosh-notification'
    ),

    renotify: true,

    dir: 'rtl',
    lang: 'ar',

    data: {
      url: url,
      eventId: String(
        data.eventId || ''
      )
    }
  });
});


/* عند الضغط على الإشعار */
self.addEventListener(
  'notificationclick',
  (event) => {

    event.notification.close();

    const url =
      event.notification?.data?.url ||
      self.registration.scope;

    event.waitUntil(
      (async () => {

        const clients =
          await self.clients.matchAll({
            type: 'window',
            includeUncontrolled: true
          });

        // لو الموقع مفتوح بالفعل
        for (const client of clients) {
          try {

            await client.focus();

            if (
              url &&
              'navigate' in client
            ) {
              await client.navigate(url);
            }

            return;

          } catch (_) {}
        }

        // لو الموقع غير مفتوح
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