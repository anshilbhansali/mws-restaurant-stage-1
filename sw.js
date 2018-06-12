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
					mycache.put(event.request, network_response.clone());
					console.log('served from network: ', event.request.url);
					return network_response;
				});
			});
		})
	);
});