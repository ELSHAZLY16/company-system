/* علوش البازار — Service Worker لإشعارات الموبايل (Firebase Cloud Messaging)
   يتحط جنب index.html على الاستضافة بنفس الاسم: fcm-sw.js
   - الإشعارات اللي فيها notification بيعرضها Firebase تلقائيًا (من غير تكرار).
   - الإشعارات اللي فيها data بس بنعرضها إحنا.
   - الضغط على الإشعار بيفتح السيستم (أو يرجّع للتاب المفتوح). */
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
const APP_ROOT = self.registration.scope.replace(/fcm\/?$/, '');

messaging.onBackgroundMessage(function (payload) {
  if (payload && payload.notification) return; // Firebase عرضه بالفعل
  const d = (payload && payload.data) || {};
  return self.registration.showNotification(d.title || 'علوش البازار', {
    body: d.body || 'لديك إشعار جديد',
    dir: 'rtl', lang: 'ar',
    tag: d.eventId || 'allosh', renotify: true,
    data: { url: d.url || d.appUrl || APP_ROOT }
  });
});

self.addEventListener('notificationclick', function (event) {
  const data = event.notification.data || {};
  const fcm = data.FCM_MSG || {};
  const url = data.url || (fcm.notification && fcm.notification.click_action) || (fcm.data && (fcm.data.url || fcm.data.appUrl)) || APP_ROOT;
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    const base = String(url).split('#')[0];
    for (const c of list) { if (c.url.split('#')[0] === base && 'focus' in c) return c.focus(); }
    for (const c of list) { if (c.url.indexOf(APP_ROOT) === 0 && 'focus' in c) return c.focus(); }
    return clients.openWindow(url);
  }));
});

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
