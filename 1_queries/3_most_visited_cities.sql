SELECT
  properties.city,
  count(reservations.property_id) AS total_reservations
FROM
  properties
  JOIN reservations ON reservations.property_id = properties.id
GROUP BY
  properties.city
ORDER BY
  total_reservations DESC;