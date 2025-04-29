// video-sw.js
const CACHE_NAME = "react-video-cache-v1";
const VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov"];

// React-specific asset paths that might contain video files
const REACT_VIDEO_PATHS = ["/assets/videos/", "/static/media/", "/videos/"];

// Install event
self.addEventListener("install", (event) => {
  console.log("Video Service Worker: Installing");
  self.skipWaiting();
});

// Activate event
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

// Helper function to check if the request is for a video file
function isVideoRequest(url) {
  const pathname = url.pathname;

  // Check file extension
  const fileExtension = pathname.substring(pathname.lastIndexOf("."));
  if (VIDEO_EXTENSIONS.includes(fileExtension.toLowerCase())) {
    return true;
  }

  // Check if the path contains React-specific video paths
  return REACT_VIDEO_PATHS.some((path) => pathname.includes(path));
}

// Fetch event
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only cache video files
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
                // Clone the response before putting it in the cache
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
