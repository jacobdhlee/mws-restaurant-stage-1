let restaurant;
var newMap;
let reviews;
let savedItem = 1;

window.addEventListener(
  "online",
  function(e) {
    DBHelper.checkOfflineDB();
    updateReview();
    savedItem = 1;
  },
  false
);

/**
 * Initialize Google map, called from HTML.
 */

document.addEventListener("DOMContentLoaded", event => {
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
      self.newMap = L.map("map", {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer(
        "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}",
        {
          mapboxToken: "pk.eyJ1IjoiamFjb2JkaGxlZSIsImEiOiJjamtpY2phYzAwMTgwM3BqeDgxY3NnYXUyIn0.WUIlsU-eDYkY3VrJpY7hVA",
          maxZoom: 18,
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          id: "mapbox.streets"
        }
      ).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
};

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = callback => {
  if (self.restaurant) {
    // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName("id");
  if (!id) {
    // no id found in URL
    error = "No restaurant id in URL";
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      DBHelper.fetchRestaurantReviewById(self.restaurant.id, (error, data) => {
        if (error) {
          console.log(error);
        } else {
          self.reviews = data;
          fillReviewsHTML(data);
        }
      });
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById("restaurant-name");
  name.innerHTML = restaurant.name;

  const address = document.getElementById("restaurant-address");
  address.innerHTML = restaurant.address;

  const image = document.getElementById("restaurant-img");
  image.className = "restaurant-img";
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = `Image of ${restaurant.name} restaurant`;

  const cuisine = document.getElementById("restaurant-cuisine");
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (
  operatingHours = self.restaurant.operating_hours
) => {
  const hours = document.getElementById("restaurant-hours");
  for (let key in operatingHours) {
    const row = document.createElement("tr");

    const day = document.createElement("td");
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement("td");
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = reviews => {
  const container = document.getElementById("reviews-container");
  const title = document.createElement("h3");

  title.innerHTML = "Reviews";
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement("p");
    noReviews.innerHTML = "No reviews yet!";
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById("reviews-list");
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = review => {
  const li = document.createElement("li");
  const div = document.createElement("div");
  div.className = "name-container";
  li.appendChild(div);

  const name = document.createElement("p");
  name.innerHTML = review.name;
  div.appendChild(name);

  const date = document.createElement("p");
  date.innerHTML = review.date;
  div.appendChild(date);

  const ratingDiv = document.createElement("div");
  ratingDiv.className = "rating-container";
  li.appendChild(ratingDiv);
  const rating = document.createElement("p");
  rating.innerHTML = `Rating: ${review.rating}`;
  ratingDiv.appendChild(rating);

  const commentsDiv = document.createElement("div");
  commentsDiv.className = "comments-container";
  li.appendChild(commentsDiv);
  const comments = document.createElement("p");
  comments.innerHTML = review.comments;
  commentsDiv.appendChild(comments);

  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById("breadcrumb");
  const li = document.createElement("li");
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

/**
 * Submit user's review
 */

getMonthString = num => {
  switch (num) {
    case 0:
      return "January";
      break;
    case 1:
      return "February";
      break;
    case 2:
      return "March";
      break;
    case 3:
      return "April";
      break;
    case 4:
      return "May";
      break;
    case 5:
      return "June";
      break;
    case 6:
      return "July";
      break;
    case 7:
      return "August";
      break;
    case 8:
      return "September";
      break;
    case 9:
      return "October";
      break;
    case 10:
      return "November";
      break;
    case 11:
      return "December";
      break;
  }
};

submitReview = () => {
  event.preventDefault();
  let form = document.getElementById("review-form");
  const name = document.getElementsByClassName("name-input").name.value;
  const rating = Number(
    document.getElementsByClassName("review-rating").rating.value
  );
  const comments = document.getElementsByClassName("commnets").commnets.value;
  const dateO = new Date();
  const date = `${getMonthString(dateO.getMonth())} ${dateO.getDate()}, ${dateO.getFullYear()}`;
  const restaurant_id = Number(getParameterByName("id"));
  let customReview = { restaurant_id, name, rating, comments, date };
  if (!name || !rating || !comments) {
    const error = document.getElementsByClassName("error");
    error[0].style.visibility = "visible";
  } else {
    if (!window.navigator.onLine) {
      DBHelper.offlineUpdateDB(customReview);
      alert(
        `Now offline your ${savedItem} item(s) will automatically added when online`
      );
      savedItem += 1;
      form.reset();
    } else {
      DBHelper.addReviewFetch(customReview);
      updateReview();
    }
  }
};

updateReview = () => {
  window.location.reload();
};
