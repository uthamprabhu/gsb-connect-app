self.addEventListener("push", function (event) {
  if (!event.data) return;
  const payload = event.data.json();
  const title = payload?.notification?.title || "GSB Connect";
  const body = payload?.notification?.body || "You have a new update.";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icon.png",
      badge: "/icon.png",
    }),
  );
});
