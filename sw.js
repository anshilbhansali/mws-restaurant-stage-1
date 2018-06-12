self.addEventListener('fetch', function(event){
	event.respondWith(
		caches.open('restaurant-cache').then(function(mycache){
			return mycache.match(event.request).then(function(response){
				if (response) {
					console.log('served from cache: ', event.request.url);
					return response;
				}

				return fetch(event.request).then(function(network_response){
					mycache.put(event.request, network_response.clone());
					console.log('served from network: ', event.request.url);
					return network_response;
				});
			});
		})
	);
});