// TEN Aquarium Service Worker - Push & Background Notification Handler
const CACHE_NAME = 'ten-aquarium-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {
    title: 'TEN Aquarium Alert',
    body: 'New update received.',
    data: {}
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const isUrgent = data.data?.type === 'PAYMENT';

  const options = {
    body: data.body || 'You have a new update.',
    icon: '/logo.png',
    badge: '/favicon.png',
    vibrate: isUrgent ? [300, 100, 300, 100, 500] : [200, 100, 200],
    tag: data.data?.notificationId ? `notif-${data.data.notificationId}` : `ten-${Date.now()}`,
    renotify: true,
    requireInteraction: isUrgent,
    data: data.data || {},
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'TEN Aquarium', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/';
  const fullTargetUrl = new URL(targetUrl.startsWith('#') ? `/${targetUrl}` : targetUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(fullTargetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(fullTargetUrl);
      }
    })
  );
});
