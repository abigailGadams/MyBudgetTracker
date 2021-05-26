const APP_PREFIX = "Budget-";
// changing cache version forces refresh
const VERSION = "version_05";
const CACHE_NAME = APP_PREFIX + VERSION;
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/css/styles.css",
  "icons/icon-72x72.png",
  "icons/icon-96x96.png",
  "icons/icon-128x128.png",
  "icons/icon-144x144.png",
  "icons/icon-152x152.png",
  "icons/icon-192x192.png",
  "icons/icon-384x384.png",
  "icons/icon-512x512.png",
  "/js/idb.js",
  "/js/index.js",
];

// Respond with cached resources
self.addEventListener("fetch", function (e) {
  console.log("fetch request : " + e.request.url);
  e.respondWith(
    caches.match(e.request).then((request) => {
      if (request) {
        // if cache is available, respond with cache
        console.log("responding with cache : " + e.request.url);
        return request || fetch(e.request);
      }
    })
  );
});

// Cache resources
self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log("installing cache : " + CACHE_NAME);
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Delete outdated caches
self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then((keyList) => {
      // `keyList` contains all cache names under your username.github.io
      // filter out ones with this app prefix to create keeplist
      let cacheKeeplist = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX);
      });
      // add current cache name to keeplist
      cacheKeeplist.push(CACHE_NAME);

      return Promise.all(
        keyList.map(function (key, i) {
          if (cacheKeeplist.indexOf(key) === -1) {
            console.log("deleting old cache : " + keyList[i]);
            return caches.delete(keyList[i]);
          }
        })
      );
    })
  );
});