const cacheName = 'v2';

var cacheAssets =
	["index.html",
		"js/app.js"	];


// Install Service Worker
self.addEventListener("install", e => {
	console.log('Service Worker: Installed')
	e.waitUntil(
		caches
			.open(cacheName)
			.then(cache => {
				console.log('Service Worker: Caching Files')
				cache.addAll(cacheAssets);
				// speed up the cacheing...

			})
			.then(() => self.skipWaiting())
	);
});


// Activate Service Worker
self.addEventListener("activate", function (e) {
	console.log("Service worker Activated");
	// remove unwanted caches
	e.waitUntil(
		caches.keys().then(cacheNames => {
			return Promise.all(
				cacheNames.map(cache => {
					if (cache !== cacheName) {
						console.log('Service Worker: Clearing Old Cache');
						return caches.delete(cache);
					}
				})
			)
		})
	)
});

// Call Fetch Event
self.addEventListener('fetch', e => {
	console.log('Service Worker: Fetching');
	e.respondWith(
		fetch(e.request)
		.then(res => {
			const resClone = res.clone();
			caches
				.open(cacheName)
				.then(cache => {
					cache.put(e.request, resClone);
				});
			return res;
		}).catch(err => caches.match(e.request).then(res => res)));
})

self.addEventListener('push', function (event) {
	console.log('[Service Worker] Push Received.');
	console.log(event);
	var notificationURL;

	if (event.data) {
		notificationURL = event.data.text();
	}

	const title = 'Product Locator';

	const notificationOptions = {
		body: notificationURL,
		icon: './images/icons/icon-128x128.png',
		data: { url: notificationURL }, //the url which we gonna use later
		actions: [{ action: "open_url", title: title }]
		//click_action : notificationURL,
	};

	send_message_to_all_clients("notification");
	event.waitUntil(self.registration.showNotification(title, notificationOptions));
});
//
self.addEventListener('notificationclick', function (event) { //What happens when clicked on Notification
	console.log('[Service Worker] Notification click Received.', event.notification.data);

	event.notification.close();

	event.waitUntil(
		clients.openWindow(event.notification.data.url)
	);

});

function send_message_to_client(client, msg) {
	return new Promise(function (resolve, reject) { //Returns a Promise to extend a THEN later when sending to multiple clients
		var msg_chan = new MessageChannel(); //API to send message between Client & SW
		msg_chan.port1.onmessage = function (event) { //Send a Promise Resolve only when the reply message is received from Client
			if (event.data.error) {
				reject(event.data.error);
			} else {
				resolve(event.data);
			}
		};

		client.postMessage(msg, [msg_chan.port2]);
	});
}

function send_message_to_all_clients(msg) { //Multiple Clients might be opened, so SW need to send the message to ALL clients

	clients.matchAll()
		.then(clients => {
			clients.forEach(client => { //Send a message to all clients SW servicing
				send_message_to_client(client, msg)
					.then(m => //Response/Confirmation message from Client that it has been received
						console.log("[Service Worker] From Client:" + msg)
					);
			});
		});
}
