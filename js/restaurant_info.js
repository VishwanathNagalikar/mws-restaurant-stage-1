let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
	initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
	fetchRestaurantFromURL((error, restaurant) => {
		if (error) {
			// Got an error!
			console.error(error);
		} else {
			self.newMap = L.map('map', {
				center: [ restaurant.latlng.lat, restaurant.latlng.lng ],
				zoom: 16,
				scrollWheelZoom: false
			});
			L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
				mapboxToken: '<your MAPBOX API KEY HERE>',
				maxZoom: 18,
				attribution:
					'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
					'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
					'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
				id: 'mapbox.streets'
			}).addTo(newMap);
			fillBreadcrumb();
			// fillSidenav();
			DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
		}
	});
};

/* window.initMap = () => {
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
} */

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
	if (self.restaurant) {
		// restaurant already fetched!
		callback(null, self.restaurant);
		return;
	}
	const id = getParameterByName('id');
	if (!id) {
		// no id found in URL
		error = 'No restaurant id in URL';
		callback(error, null);
	} else {
		DBHelper.fetchRestaurantById(id, (error, restaurant) => {
			self.restaurant = restaurant;
			if (!restaurant) {
				console.error(error);
				return;
			}
			fillRestaurantHTML();
			callback(null, restaurant);
		});
	}
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
	const name = document.getElementById('restaurant-name');
	name.innerHTML = restaurant.name;
	name.setAttribute('tabindex', '0');
	name.setAttribute('aria-label', `restaurant name ${restaurant.name}`);

	const address = document.getElementById('restaurant-address');
	address.innerHTML = restaurant.address;
	address.setAttribute('aria-label', `address ${restaurant.address}`);

	const image = document.getElementById('restaurant-img');
	image.setAttribute('alt', `${restaurant.name}`);
	image.setAttribute('aria-label', 'image');
	image.className = 'restaurant-img';
	image.src = DBHelper.imageUrlForRestaurant(restaurant);

	const cuisine = document.getElementById('restaurant-cuisine');
	cuisine.setAttribute('aria-label', `cuisine type ${restaurant.cuisine_type}`);
	cuisine.innerHTML = restaurant.cuisine_type;

	// fill operating hours
	if (restaurant.operating_hours) {
		fillRestaurantHoursHTML();
	}
	// fill reviews
	fillReviewsHTML();
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
	const hours = document.getElementById('restaurant-hours');
	hours.setAttribute('aria-label', 'working hours');
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
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
	const container = document.getElementById('reviews-container');
	const title = document.createElement('h2');
	//Aria features for better accessibility
	title.setAttribute('tabindex', '0');
	title.innerHTML = 'Reviews';
	container.appendChild(title);

	if (!reviews) {
		const noReviews = document.createElement('p');
		noReviews.innerHTML = 'No reviews yet!';
		container.appendChild(noReviews);
		return;
	}
	const ul = document.getElementById('reviews-list');
	reviews.forEach((review) => {
		ul.appendChild(createReviewHTML(review));
	});
	container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
	const li = document.createElement('li');
	li.setAttribute('tabindex', '0');
	const name = document.createElement('p');
	name.setAttribute('aria-label', 'Person name');
	name.innerHTML = review.name;
	li.appendChild(name);

	const date = document.createElement('p');
	date.innerHTML = review.date;
	date.setAttribute('aria-label', 'date of review');
	li.appendChild(date);

	const rating = document.createElement('p');
	rating.innerHTML = `Rating: ${review.rating}`;
	rating.setAttribute('aria-label', 'Ratings Given');
	li.appendChild(rating);

	const comments = document.createElement('p');
	comments.innerHTML = review.comments;
	comments.setAttribute('aria-label', 'comments');
	li.appendChild(comments);

	return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
	const breadcrumb = document.getElementById('breadcrumb');
	const li = document.createElement('li');
	li.setAttribute('tabindex', '0');
	li.innerHTML = restaurant.name;
	breadcrumb.appendChild(li);
};

// fillSidenav=(restaurant=self.restaurant) => {
//  const sidenav = document.getElementById('mySidenav');
//  const a = document.createElement('a');
//  a.innerHTMl=restaurant.name;
//  sidenav.appendChild(a);
// }

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, '\\$&');
	const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

var menu = document.querySelector('#menu');
var close = document.querySelector('#close');
var drawer = document.querySelector('.sidenav');
var focusedElementBeforeModal;

//aria-expanded feature for using navigation
menu.addEventListener('click', function(e) {
	drawer.classList.toggle('open');
	menu.setAttribute('aria-expanded', 'true');
	e.stopPropagation();
});
// close.addEventListener('click', function() {
//   drawer.classList.remove('open');
//   menu.setAttribute('aria-expanded','false');
// });

//trapping tabkey for focused element
menu.addEventListener('click', openNav);

function openNav() {
	focusedElementBeforeModal = document.activeElement;

	drawer.addEventListener('keydown', trapTabKey);

	close.addEventListener('click', closeNav);

	var focusableElementsString =
		'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';

	var focusableElements = drawer.querySelectorAll(focusableElementsString);

	focusableElements = Array.prototype.slice.call(focusableElements);

	var firstTabStop = focusableElements[0];
	var lastTabStop = focusableElements[focusableElements.length - 1];

	firstTabStop.focus();

	function trapTabKey(e) {
		// Check for TAB key press
		if (e.keyCode === 9) {
			// SHIFT + TAB
			if (e.shiftKey) {
				if (document.activeElement === firstTabStop) {
					e.preventDefault();
					lastTabStop.focus();
				}

				// TAB
			} else {
				if (document.activeElement === lastTabStop) {
					e.preventDefault();
					firstTabStop.focus();
				}
			}
		}

		// ESCAPE
		if (e.keyCode === 27) {
			closeModal();
		}
	}
}

function closeNav() {
	drawer.classList.remove('open');
	menu.setAttribute('aria-expanded', 'false');

	// Set focus back to element that had it before the modal was opened
	focusedElementBeforeModal.focus();
}
