self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Thông báo', {
      body: data.body || 'Bạn có thông báo mới',
      icon: '/icon.png',
    }),
  );
});
