// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Perform a GET request to the query URL.
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

// Define a function to calculate the color based on depth.
function getColor(depth) {
  // Define custom depth ranges and corresponding colors.
  return depth > 700 ? '#FF0000' :
         depth > 300 ? '#FF3300' :
         depth > 100 ? '#FF9900' :
         depth > 50  ? '#FFFF00' :
         depth > 30  ? '#99FF00' :
         depth > 10  ? '#66FF00' :
                       '#00FF00';
}

function createFeatures(earthquakeData) {
  // Create a GeoJSON layer with a Choropleth representation based on earthquake depth.
  let earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      // Calculate the marker size based on magnitude.
      let markerSize = feature.properties.mag * 5; // Adjust the scale factor as needed.

      // Get the color based on depth.
      let markerColor = getColor(feature.geometry.coordinates[2]);

      // Create a custom marker with the calculated size and color.
      return L.circleMarker(latlng, {
        radius: markerSize,
        fillColor: markerColor,
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    },
    onEachFeature: function (feature, layer) {
      // Bind a popup that describes the place, time, magnitude, and depth of the earthquake.
      layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]} km</p>`);
    }
  });

  // Send our earthquakes layer to the createMap function.
  createMap(earthquakes);
}

function createMap(earthquakes) {
  // Define a custom legend for the Chloropleth map.
  let legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info legend');
    let depthRanges = [0, 10, 30, 50, 100, 300, 700];
    let labels = ['<10', '10-30', '30-50', '50-100', '100-300', '300-700'];

    // loop through the depth ranges and generate a label with a colored square for each range
    for (let i = 0; i < depthRanges.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(depthRanges[i] + 1) + '"></i> ' +
        depthRanges[i] + (depthRanges[i + 1] ? '&ndash;' + depthRanges[i + 1] + ' km<br>' : '+ km');
    }

    return div;
};

  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Add the legend to the map.
  legend.addTo(myMap);

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
};