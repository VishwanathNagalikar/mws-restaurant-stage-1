let restaurants, neighborhoods, cuisines;
var newMap;
var markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
	initMap(); // added
	fetchNeighborhoods();
	fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
	DBHelper.fetchNeighborhoods((error, neighborhoods) => {
		if (error) {
			// Got an error
			console.error(error);
		} else {
			self.neighborhoods = neighborhoods;
			fillNeighborhoodsHTML();
		}
	});
};

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
	const select = document.getElementById('neighborhoods-select');
	neighborhoods.forEach((neighborhood) => {
		const option = document.createElement('option');
		option.innerHTML = neighborhood;
		option.value = neighborhood;
		select.append(option);
	});
};

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
	DBHelper.fetchCuisines((error, cuisines) => {
		if (error) {
			// Got an error!
			console.error(error);
		} else {
			self.cuisines = cuisines;
			fillCuisinesHTML();
		}
	});
};

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
	const select = document.getElementById('cuisines-select');

	cuisines.forEach((cuisine) => {
		const option = document.createElement('option');
		option.innerHTML = cuisine;
		option.value = cuisine;
		select.append(option);
	});
};

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
	self.newMap = L.map('map', {
		center: [ 40.722216, -73.987501 ],
		zoom: 12,
		scrollWheelZoom: false
	});
	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
		mapboxToken: 'pk.eyJ1IjoidmlzaHdhbmF0aC1uIiwiYSI6ImNqanJoeGNoMjAwMXUzd282c29sbWZiYjIifQ.d6Mqqqeu4wZiQ7uVGblvGQ',
		maxZoom: 18,
		attribution:
			'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox.streets'
	}).addTo(newMap);

	updateRestaurants();
};
/* window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
} */

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
	const cSelect = document.getElementById('cuisines-select');
	const nSelect = document.getElementById('neighborhoods-select');

	let cIndex = cSelect.selectedIndex;
	let nIndex = nSelect.selectedIndex;

	let cuisine = cSelect[cIndex].value;
	let neighborhood = nSelect[nIndex].value;

	DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
		if (error) {
			// Got an error!
			console.error(error);
		} else {
			resetRestaurants(restaurants);
			fillRestaurantsHTML();
		}
	});
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
	// Remove all restaurants
	self.restaurants = [];
	const ul = document.getElementById('restaurants-list');
	ul.innerHTML = '';

	// Remove all map markers
	if (self.markers) {
		self.markers.forEach((marker) => marker.remove());
	}
	self.markers = [];
	self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
	const ul = document.getElementById('restaurants-list');
	restaurants.forEach((restaurant) => {
		ul.append(createRestaurantHTML(restaurant));
	});
	addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
	const li = document.createElement('li');
	li.setAttribute('tabindex', '0');

	const image = document.createElement('img');
	image.className = 'restaurant-img';
	//alt attribute for images
	image.setAttribute('alt', `${restaurant.name}`);
	image.setAttribute('tabindex', '0');
	image.src = DBHelper.imageUrlForRestaurant(restaurant);
	li.append(image);

	const name = document.createElement('h1');
	name.innerHTML = restaurant.name;
	// name.setAttribute('tabindex','0');
	li.append(name);

	const neighborhood = document.createElement('p');
	neighborhood.innerHTML = restaurant.neighborhood;
	// neighborhood.setAttribute('tabindex','0');
	li.append(neighborhood);

	const address = document.createElement('p');
	address.innerHTML = restaurant.address;
	// address.setAttribute('tabindex','0');
	li.append(address);

	const more = document.createElement('a');
	more.innerHTML = 'View Details';
	more.href = DBHelper.urlForRestaurant(restaurant);
	li.append(more);

	return li;
};

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
	restaurants.forEach((restaurant) => {
		// Add marker to the map
		const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
		marker.on('click', onClick);
		function onClick() {
			window.location.href = marker.options.url;
		}
		self.markers.push(marker);
	});
};

var menu = document.querySelector('#menu');
var close = document.querySelector('#close');
var drawer = document.querySelector('.sidenav');
var focusedElementBeforeModal;

menu.addEventListener('click', function(e) {
	drawer.classList.toggle('open');
	//aria features for expanding nav menu
	menu.setAttribute('aria-expanded', 'true');
	e.stopPropagation();
});

//focus the navigation menu when it is active and defocus other elements
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

/* addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
} */
