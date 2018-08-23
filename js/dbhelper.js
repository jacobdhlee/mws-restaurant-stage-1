/**
 * Common database helper functions.
 */
class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  static get REVIEWS_URL() {
    const port = 1337;
    return `http://localhost:${port}/reviews`;
  }

  /**
   * IndexedDB function.
   */

  static dbPromise() {
    return idb.open("mws-restaurants", 3, function(upgradeDB) {
      switch (upgradeDB.oldVersion) {
        case 0:
          upgradeDB.createObjectStore("restaurants", { keyPath: "id" });

        case 1:
          const reviews = upgradeDB.createObjectStore("reviews", {
            keyPath: "id"
          });
          reviews.createIndex("restaurant_id", "restaurant_id");
      }
    });
  }
  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    const url = DBHelper.DATABASE_URL;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        callback(null, data);
        this.dbPromise().then(db => {
          const tx = db.transaction("restaurants", "readwrite");
          const store = tx.objectStore("restaurants");
          data.forEach(restaurant => store.put(restaurant));
          return tx.complete;
        });
      })
      .catch(err => {
        this.dbPromise()
          .then(db => {
            return db
              .transaction("restaurants")
              .objectStore("restaurants")
              .getAll();
          })
          .then(restaurants => {
            callback(null, restaurants);
          });

        console.log(`something is wrong. Here is Error ${err}`);
      });
  }

  static fetchRestaurantReviewById(id, callback) {
    const url = `http://localhost:1337/reviews/?restaurant_id=${id}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        this.dbPromise().then(db => {
          const tx = db.transaction("reviews", "readwrite");
          const store = tx.objectStore("reviews");
          // store.put({ id: data });
          data.forEach(review => store.put(review));
          return tx.complete;
        });
        callback(null, data.reverse());
      })
      .catch(err => {
        this.dbPromise()
          .then(db => {
            const tx = db.transaction("reviews");
            const store = tx.objectStore("reviews");
            const index = store.index("restaurant_id");
            return index.getAll(id);
          })
          .then(reviews => {
            callback(null, reviews.reverse());
          });
        console.log("err is ", err);
      });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) {
          // Got the restaurant
          callback(null, restaurant);
        } else {
          // Restaurant does not exist in the database
          callback("Restaurant does not exist", null);
        }
      }
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
  static fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    callback
  ) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != "all") {
          // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != "all") {
          // filter by neighborhood
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
        const neighborhoods = restaurants.map(
          (v, i) => restaurants[i].neighborhood
        );
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter(
          (v, i) => neighborhoods.indexOf(v) == i
        );
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
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter(
          (v, i) => cuisines.indexOf(v) == i
        );
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if (restaurant.id === 10) {
      return `/img/${restaurant.id}.jpg`;
    }
    return `/img/${restaurant.photograph}.jpg`;
  }

  /**
   * Map marker for a restaurant.
   */

  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker(
      [restaurant.latlng.lat, restaurant.latlng.lng],
      {
        title: restaurant.name,
        alt: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant)
      }
    );
    marker.addTo(newMap);
    return marker;
  }

  static addReviewFetch(data) {
    const url = "http://localhost:1337/reviews/";
    const headers = new Headers({
      "Content-Type": "application/json; charset=utf-8"
    });
    const method = "POST";
    const body = JSON.stringify(data);
    const option = { method, body, headers };
    fetch(url, option)
      .then(res => res.json())
      .catch(err => console.log(`post fetch error is ${err}`))
      .then(data => {
        this.dbPromise().then(db => {
          const tx = db.transaction("reviews", "readwrite");
          const store = tx.objectStore("reviews");
          store.put(data);
          return tx.complete;
        });
      });
  }

  static checkDislike(restaurant, callback) {
    let dislike = [];
    const url = "http://localhost:1337/restaurants/?is_favorite=false";
    fetch(url)
      .then(res => res.json())
      .then(data => {
        dislike = [...data];
        let match = dislike.filter(res => {
          return res.id === restaurant.id;
        });
        callback(match);
      })
      .catch(err => console.log(err));
  }
  static likeClick(restaurant) {
    const original = document.getElementsByClassName("like");
    let id = restaurant.id - 1;
    DBHelper.checkDislike(restaurant, match => {
      const findMatch = match.filter(res => {
        return res.id === restaurant.id;
      });
      if (match.length > 0) {
        DBHelper.fetchLike(restaurant.id, true);
        original[id].classList.add("liked");
        original[id].setAttribute("aria-label", "add to favorite");
      } else {
        DBHelper.fetchLike(restaurant.id, false);
        original[id].classList.remove("liked");
        original[id].setAttribute("aria-label", "remove favorite");
      }
    });
  }

  static fetchLike(id, like) {
    const likeURL = `http://localhost:1337/restaurants/${id}/?is_favorite=true`;
    const dislikeURL = `http://localhost:1337/restaurants/${id}/?is_favorite=false`;
    const options = { method: "PUT" };
    if (like) {
      fetch(likeURL, options)
        .then(() => {
          DBHelper.updateLikeDB(id);
          console.log("change to liked ");
        })
        .catch(err => console.log(err));
    } else {
      fetch(dislikeURL, options)
        .then(() => console.log("change to disliked"))
        .catch(err => console.log(err));
    }
  }

  static updateLikeDB(id) {
    this.dbPromise().then(db => {
      const tx = db.transaction("restaurants", "readwrite");
      const store = tx.objectStore("restaurants");
      store.getAll(id).then(restaurant => {
        let isFavorite = !restaurant[0].is_favorite;
        console.log("asfas ", restaurant[0]);
        restaurant[0].is_favorite = isFavorite;
        store.put(restaurant[0]);
        return tx.complete;
      });
    });
  }
}
