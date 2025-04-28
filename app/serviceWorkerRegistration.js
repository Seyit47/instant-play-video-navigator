// src/serviceWorkerRegistration.js
export function register() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      const swUrl = "/video-sw.js";

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log(
            "Video Service Worker registered with scope:",
            registration.scope
          );

          registration.addEventListener("updatefound", () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) {
              return;
            }

            installingWorker.addEventListener("statechange", () => {
              if (installingWorker.state === "installed") {
                if (navigator.serviceWorker.controller) {
                  console.log("New video service worker installed");
                } else {
                  console.log(
                    "Video service worker cached content for offline use"
                  );
                }
              }
            });
          });
        })
        .catch((error) => {
          console.error(
            "Error during video service worker registration:",
            error
          );
        });
    });
  }
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
