SELECT
  reservations.id,
  properties.title,
  reservations.start_date,
  properties.cost_per_night,
  avg(property_reviews.rating) AS average_rating
FROM
  reservations
  JOIN properties ON properties.id = reservations.property_id
  JOIN property_reviews ON property_reviews.property_id = properties.id
WHERE
  reservations.guest_id = 1
GROUP BY
  reservations.id,
  properties.id
ORDER BY
  reservations.start_date
LIMIT
  10;