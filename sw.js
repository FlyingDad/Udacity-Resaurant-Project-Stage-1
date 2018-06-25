/* jshint esversion: 6 */

const CACHE = 'restaurant-v1';

let urlsToCache = [
        '/',
        'css/styles.css',
        'js/main.js',
        'js/dbhelper.js',
        'js/restaurant_info.js',
        'data/restaurants.json'
      ];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response.
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(CACHE)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

// FROM MOZILLA COOKBOOK
// self.addEventListener('install', function(event){
//   event.waitUntil(
//     caches.open(CACHE).then(function(cache){
//       cache.addAll([
//         '/',
//         'css/styles.css',
//         'js/main.js',
//         'js/dbhelper.js',
//         'js/restaurant_info.js',
//         'data/restaurants.json'
//       ]);
//     })
//   );
// });

// self.addEventListener('fetch', function(event) {
//   //console.log('The service worker is serving the asset.');
//   event.respondWith(fromCache(event.request));

//   event.waitUntil(
//     update(event.request)
//     .then(refresh)
//   );
// });

// function fromCache(request) {
//   return caches.open(CACHE).then(function (cache) {
//     return cache.match(request);
//   });
// }

// function update(request) {
//   return caches.open(CACHE).then(function (cache) {
//     return fetch(request).then(function (response) {
//       return cache.put(request, response.clone()).then(function () {
//         return response;
//       });
//     });
//   });
// }

// function refresh(response) {
//   return self.clients.matchAll().then(function (clients) {
//     clients.forEach(function (client) {
//       var message = {
//         type: 'refresh',
//         url: response.url,
//         eTag: response.headers.get('ETag')
//       };
//       client.postMessage(JSON.stringify(message));
//     });
//   });
// }

