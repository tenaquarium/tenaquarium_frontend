// TENAQUARIUM Service Worker - System-Level Push & Background Notification Handler
const CACHE_NAME = 'ten-aquarium-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {
    title: 'TENAQUARIUM',
    body: 'You have a new update from TENAQUARIUM.',
    data: {},
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const isUrgent = data.data?.type === 'PAYMENT';
  const notifTitle = data.title || 'TENAQUARIUM';
  const logoUrl = new URL('/logo.png', self.location.origin).href;
  const badgeUrl = new URL('/favicon.png', self.location.origin).href;

  const options = {
    body: data.body || 'You have a new update.',
    icon: logoUrl,
    badge: badgeUrl,
    image: data.image || null,
    timestamp: data.timestamp || Date.now(),
    vibrate: isUrgent ? [250, 100, 250, 100, 400] : [200, 100, 200],
    tag: data.data?.notificationId ? `notif-${data.data.notificationId}` : `ten-${Date.now()}`,
    renotify: true,
    requireInteraction: isUrgent,
    data: data.data || {},
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'mark_read', title: 'Mark as read' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(notifTitle, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Action: Mark as read directly without opening tab
  if (event.action === 'mark_read') {
    const notifId = event.notification.data?.notificationId;
    if (notifId) {
      event.waitUntil(
        fetch(`/api/notifications/${notifId}/read`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        }).catch(() => {})
      );
    }
    return;
  }

  // Action: Open or body click -> Focus or open window
  const targetUrl = event.notification.data?.url || '/';
  const fullTargetUrl = new URL(
    targetUrl.startsWith('#') ? `/${targetUrl}` : targetUrl,
    self.location.origin
  ).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          if (client.url !== fullTargetUrl && 'navigate' in client) {
            client.navigate(fullTargetUrl);
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(fullTargetUrl);
      }
    })
  );
});
