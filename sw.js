// var cacheName = "restaurant_v1";
// var cacheUrl = [
//   "/",
//   "/index.html",
//   "/restaurant.html",
//   "css/styles.css",
//   "img/",
//   "js/main.js",
//   "/idb.js",
//   "js/dbhelper.js"
// ];

// self.addEventListener("install", function(event) {
//   event.waitUntil(
//     caches
//       .open(cacheName)
//       .then(function(cache) {
//         return cache.addAll(cacheUrl);
//       })
//       .catch(function(err) {
//         console.log("cache err is ", err);
//       })
//   );
// });

// self.addEventListener("fetch", function(event) {
//   event.respondWith(
//     caches
//       .match(event.request)
//       .then(function(response) {
//         if (response) {
//           return response;
//         }
//         const cloneRequest = event.request.clone();
//         return fetch(cloneRequest)
//           .then(function(response) {
//             if (
//               !response || response.status !== 200 || response.type !== "basic"
//             ) {
//               return response;
//             }
//             const responseClone = response.clone();
//             caches
//               .open(cacheName)
//               .then(function(cache) {
//                 cache.put(event.request, responseClone);
//               })
//               .catch(err => console.log(err));
//             return response;
//           })
//           .catch(err => console.log(err));
//       })
//       .catch(err => console.log(err))
//   );
// });
