/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * DEVELOPMENT SERVER
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants, FROM DEV SERVER OR IDB
   */
  static fetchRestaurants(callback) {
    self.db_promise.then(function(restaurants_db){
      var tx = restaurants_db.transaction('restaurants');
      tx.objectStore('restaurants').getAll()
      .then(function(data){

        if (data.length != 10){
          //fetch from server
          fetch(DBHelper.DATABASE_URL).then(response => response.json())
          .then(function(response){
            //console.log(response);
            if (response){
              console.log('fetched restaurants from Server');

              //ADD TO IDB
              self.db_promise.then(function(restaurants_db){
                var tx = restaurants_db.transaction('restaurants', 'readwrite');
                for (var restaurant of response){
                  tx.objectStore('restaurants').put(restaurant, restaurant['id']);
                }
                callback(null, response);
              }); 
            }
            else
              callback('No Restaurants', null);
          }).catch(function(error){
            console.log('Failed to fetch from server: ', error);
            callback(error, null);
          });

        }
        else{
          //retrieved data from idb
          console.log('fetched restaurants from IDB');
          callback(null, data);
        }

      });  

    });
  }

  /**
   * Fetch a restaurant by its ID, FROM DEV SERVER or IDB
   */
  static fetchRestaurantById(id, callback) {
    self.db_promise.then(function(restaurants_db){
      var tx = restaurants_db.transaction('restaurants');
      tx.objectStore('restaurants').get(parseInt(id))
      .then(function(restaurant){
        if (!restaurant){
          //not in idb, fetch from server
          fetch(`${DBHelper.DATABASE_URL}/${id}`).then(response => response.json())
          .then(function(response){
            //console.log(response);
            if (response){
              console.log(`fetched restaurant ${response['name']} from Server`);

              //ADD TO IDB
              self.db_promise.then(function(restaurants_db){
                var tx = restaurants_db.transaction('restaurants', 'readwrite');
                tx.objectStore('restaurants').put(response, response['id']);
                callback(null, response);
              }); 
            }
            else
              callback('No Restaurants', null);
          }).catch(function(error){
            console.log('Failed to fetch from server: ', error);
            callback(error, null);
          });

        }
        else{
          //retrieved data from idb
          console.log(`fetched restaurant ${restaurant['name']} from IDB`);
          callback(null, restaurant);
        }

      });  

    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant name.
   */
  static nameOfRestaurant(restaurant) {
    return restaurant.name;
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
