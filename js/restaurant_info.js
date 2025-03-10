let restaurant;
var map;

document.addEventListener('DOMContentLoaded', (event) => {
  console.log('DOMContentLoaded, restaurant', self);
  openIDB(); 
});

openIDB = () => {
  if (!('indexedDB' in window)) {
    console.log('This browser doesn\'t support IndexedDB');
    return;
  }

  self.db_promise = idb.open('restaurants-db', 1, function(db){
    //only run once, when version num is incremented
    db.createObjectStore('restaurants', {keyPath: 'id'});
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = 'Picture of '+DBHelper.nameOfRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const div = document.createElement('div');
  div.style.width = "85%";
  div.style.backgroundColor = "white";
  div.style.borderColor = "white";
  div.style.marginBottom = "20px";

  const header_div = document.createElement('div');
  header_div.style.backgroundColor = "black";
  header_div.style.height = '25px';
  header_div.style.paddingTop = '5px';
  const name = document.createElement('p');
  name.style.display = 'inline';
  name.style.color = 'white';
  name.style.marginLeft = '15px';
  name.innerHTML = review.name;
  header_div.appendChild(name);

  const date = document.createElement('p');
  date.style.display = 'inline';
  date.style.float = 'right';
  date.style.marginTop = '-0.5px';
  date.style.marginRight = '15px';
  date.style.color = 'white';
  date.innerHTML = review.date;
  header_div.appendChild(date);

  div.appendChild(header_div);

  const content_div = document.createElement('div');
  content_div.style.padding = '15px';
  content_div.style.paddingTop = '0px';

  const rating = document.createElement('p');
  rating.style.borderRadius = '5px';
  rating.style.backgroundColor = "orange";
  rating.style.width = '70px';
  rating.style.color = 'white';
  rating.style.textAlign = 'center';
  rating.innerHTML = `Rating: ${review.rating}`;
  content_div.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  content_div.appendChild(comments);

  div.appendChild(content_div);

  return div;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
