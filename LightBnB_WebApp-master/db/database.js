const properties = require("./json/properties.json");
const users = require("./json/users.json");
const { Pool } = require('pg');
const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});
/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  const queryString = `Select * from users where email like $1`;
  const values = [email];
  return pool.query(queryString, values).then(
    function (res) {
      if (!res.rows[0]) {
        return null
      }
      console.log(res.rows[0]);
      return res.rows[0];
    }
  ).catch(function (err) {
    console.log(err.message)
  })
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  const queryString = `Select * from users where id = $1`;
  const values = [id];
  return pool.query(queryString, values).then(
    function (res) {
      if (!res.rows[0]) {
        return null
      }
      console.log(res.rows[0]);
      return res.rows[0];
    }
  ).catch(function (err) {
    console.log(err.message)
  })
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  const queryString = `INSERT INTO users (
  name, email, password) 
  VALUES (
  $1, $2, $3) RETURNING *;`;
  const values = [user.name, user.email, user.password];
  return pool.query(queryString, values).then(
    function (res) {
      console.log(res.rows[0]);
      return res.rows[0];
    }
  ).catch(function (err) {
    console.log(err.message)
  })
};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  const queryString = `SELECT
  reservations.id as id,
  properties.* ,
  reservations.start_date as start_date,
  reservations.end_date as end_date,
  avg(property_reviews.rating) AS average_rating
FROM
  reservations
  JOIN properties ON properties.id = reservations.property_id
  JOIN property_reviews ON property_reviews.property_id = properties.id
WHERE
  reservations.guest_id = $1
GROUP BY
  reservations.id,
  properties.id
ORDER BY
  reservations.start_date
LIMIT
  $2;`;
  const values = [guest_id, limit];
  return pool
    .query(
      queryString,
      values)
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
// This code filters directly in properties if city is not entered because where clause in not included.
const getAllProperties = (options, limit = 10) => {
  let values = [];
  let queryString = `SELECT
  properties.*,
  avg(property_reviews.rating) AS average_rating
FROM
  properties
  JOIN property_reviews ON properties.id = property_id`;
  if (options.city) {
    values.push(`%${options.city}%`);
    queryString += ` WHERE UPPER(city) LIKE UPPER($${values.length})`;
  }
  if (options.owner_id) {
    values.push(`${options.owner_id}`);
    queryString += ` AND owner_id = $${values.length}`;
  }
  if (options.minimum_price_per_night) {
    values.push(`${options.minimum_price_per_night}`);
    queryString += ` AND cost_per_night/100 >= $${values.length}`;
  }
  if (options.maximum_price_per_night) {
    values.push(`${options.maximum_price_per_night}`);
    queryString += ` AND cost_per_night/100 <= $${values.length}`;
  }
  queryString += ` 
  GROUP BY properties.id
  `;
  if (options.minimum_rating) {
    values.push(`${options.minimum_rating}`);
    queryString += ` HAVING avg(property_reviews.rating) >= $${values.length}`;
  }
  values.push(limit);
  queryString += ` ORDER BY cost_per_night LIMIT $${values.length}`;
  console.log(queryString, values);
  return pool
    .query(
      queryString,
      values)
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const queryString = `INSERT INTO
  properties (
    owner_id,
    title,
    description,
    thumbnail_photo_url,
    cover_photo_url,
    cost_per_night,
    street,
    city,
    province,
    post_code,
    country,
    parking_spaces,
    number_of_bathrooms,
    number_of_bedrooms
  )
VALUES
  (
    $ 1,
    $ 2,
    $ 3,
    $ 4,
    $ 5,
    $ 6,
    $ 7,
    $ 8,
    $ 9,
    $ 10,
    $ 11,
    $ 12,
    $ 13,
    $ 14
  ) RETURNING *;`;
  const values = [property.owner_id, property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night, property.street, property.city, property.province, property.post_code, property.country, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms];
  return pool.query(queryString, values).then(
    function (res) {
      console.log(res.rows);
      return res.rows;
    }
  ).catch(function (err) {
    console.log(err.message)
  })
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
