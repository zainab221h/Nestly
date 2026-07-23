var map = L.map("map").setView([coordinates[1], coordinates[0]], 13);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

var marker = L.marker([coordinates[1], coordinates[0]]).addTo(map);
marker.bindPopup("You'll be staying here!").openPopup();
