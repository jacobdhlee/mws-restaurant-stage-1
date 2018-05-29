var cacheName = "restaurant_v1";
var cacheUrl = [
  "/",
  "/index.html",
  "css/styles.css",
  "img/",
  "data/restaurants.json",
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
