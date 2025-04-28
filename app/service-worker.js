self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("https://cdn.kinestex.com")) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return (
          response ||
          fetch(event.request).then((fetchResponse) => {
            let responseClone = fetchResponse.clone();
            caches.open("videos").then((cache) => {
              cache.put(event.request, responseClone);
            });
            return fetchResponse;
          })
        );
      })
    );
  }
});
