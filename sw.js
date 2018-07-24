self.addEventListener('fetch', function(event){
	event.respondWith(
		// RESPOND TO NETWORK REQUEST
		caches.open('restaurant-cache').then(function(mycache){
			// CHECK IF REQUEST IS CACHED
			return mycache.match(event.request).then(function(response){
				if (response) {
					// REQUEST IS CACHED, THEREFORE RETURN CACHED RESPONSE
					console.log('served from cache: ', event.request.url);
					return response;
				}

				// REQUEST IS NOT CACHED, HENCE PERFORM THE NETWORK REQUEST
				// AND CACHE RESPONSE, FOR FUTURE USE.
				return fetch(event.request).then(function(network_response){
					// CACHE RESPONSE!!
					console.log('served from network: ', event.request.url);
					var url = new URL(event.request.url);
					//dont add the restaraunt data to cache
					if (url.hostname == 'localhost' && url.port == '1337')
						return network_response;

					//add rest to cache
					var ret = mycache.put(event.request, network_response.clone());
					return network_response;
				});
			});
		})
	);
});