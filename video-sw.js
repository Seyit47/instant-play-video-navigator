const CACHE_NAME = "react-video-cache-v1";
const VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov"];

self.addEventListener("install", (event) => {
  console.log("Video Service Worker: Installing");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Video Service Worker: Activating");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Video Service Worker: Clearing old cache");
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

function isVideoRequest(url) {
  const pathname = url.pathname;

  const fileExtension = pathname.substring(pathname.lastIndexOf("."));
  return VIDEO_EXTENSIONS.includes(fileExtension.toLowerCase());
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (isVideoRequest(url)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log("Video Service Worker: Using cached video");
            return cachedResponse;
          }

          return fetch(event.request.url)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                const clonedResponse = networkResponse.clone();
                cache.put(event.request, clonedResponse);
                console.log("Video Service Worker: Caching new video file");
              }
              return networkResponse;
            })
            .catch((error) => {
              console.error("Video Service Worker: Fetch failed", error);
              throw error;
            });
        });
      })
    );
  }
});
