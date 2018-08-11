var cacheName = "restaurant_v1";
var cacheUrl = [
  "/",
  "/index.html",
  "/restaurant.html",
  "css/styles.css",
  "img/",
  "js/main.js"
];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches
      .open(cacheName)
      .then(function(cache) {
        return cache.addAll(cacheUrl);
      })
      .catch(function(err) {
        console.log("cache err is ", err);
      })
  );
});

self.addEventListener("fetch", function(event) {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches
      .match(event.request)
      .then(function(response) {
        return response || fetch(event.request);
      })
      .catch(err => console.log(err))
  );
});
