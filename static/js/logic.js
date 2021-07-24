


//Create tile layer using leaflet quick start guide and mapbox styles link
const streets = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox/streets-v11',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: API_KEY
});

const outdoors = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox/outdoors-v11',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: API_KEY
});

const satellite = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox/satellite-v9',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: API_KEY
});

const baseMaps = {
  "Street Map": streets,
  "Outdoor Map": outdoors,
  "Satellite Map": satellite
};

//Create a new layergroup for earthquake and tectonic plates
const earthquake = new L.layerGroup();
const tectonicplates = new L.layerGroup();

const overlayMaps = {
  "Earthquake": earthquake,
  "Tectonic Plates": tectonicplates
};

//Create map object
var myMap = L.map("map-id", {
  center: [15.5994, -28.6731],
  zoom: 3,
  layers: [satellite, earthquake, tectonicplates]
});

// Create a layer control
// Pass in our baseMaps and overlayMaps
// Add the layer control to the map
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);

//load data from USGS site https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_day.geojson by using d3.json() method promise & .then() method executed when the promise is fulfilled
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_day.geojson").then(function (data) {
  console.log(data);

  //create circle markers for each earthquake required 3 functions
  //getRadius function; all earthquakes in this dataset are magnitude of 1 or larger
  //getColor uses the depth of earthquake
  //getStyle using the 2 functions already created

  function getRadius(magnitude) {
    return Math.sqrt(magnitude) * 6; //multiply by scaling factor such as 6 to help visualize earthquakes
  }

  //use switch and the depth to determine color (visit colorbrewer2.org)
  function getColor(depth) {
    switch (true) {
      case depth > 90:
        return "#d73027";
      case depth > 70:
        return "#fc8d59";
      case depth > 50:
        return "#fee08b";
      case depth > 30:
        return "#ffffbf";
      case depth > 10:
        return "#d9ef8b";
      default:
        return "#91cf60";
    }
  }

  //create function for style
  function getStyle(features) {
    return {
      fillColor: getColor(features.geometry.coordinates[2]),
      radius: getRadius(features.properties.mag),
      weight: 0.5,
      stroke: true,
      opacity: .09,
      fillOpacity: 0.7
    };
  }

  //adding GEOJSON layer to the map and create circleMarker for each earthquake (use pointToLayer option to create the Marker)
  L.geoJSON(data, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    //get style for the circleMarker
    style: getStyle,

    //for each feature include popup using onEachFeature option from Leaflet Choropleth tutorial
    onEachFeature: function (features, layer) {
      layer.bindPopup(
        "Location: "
        + features.properties.place
        + "</br> Time: "
        + Date(features.properties.time)
        + "<br> Magnitude: "
        + features.properties.mag
        + "<br> Depth: "
        + features.geometry.coordinates[2]
      );
    }


  }).addTo(earthquake);



  //end of access to data
});

//get tectonic plates data and add to techtonplates layer and add to myMap
//the tectonic plates at https://github.com/fraxen/tectonicplates using the url: https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plateData) {
  //using the geoJson method to create later and add to tectonicplate object
  L.geoJSON(plateData, {
    color: "orange",
    weight: 1.5,
  })
    .addTo(tectonicplates);
});

//add legend using sample from choropleth tutorial
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

  var div = L.DomUtil.create('div', 'info legend'),
    grades = [90, 70, 50, 30, 20, 10],
    colors = [
      //colors should match the order of the grades
      "#d73027",
      "#fc8d59",
      "#fee08b",
      "#ffffbf",
      "#d9ef8b",
      "#91cf60"
    ];

  // loop through our density intervals and generate a label with a colored square for each interval
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i style="background:'
      + colors[i] //use color vs. grades
      + '"></i> '
      + grades[i]
      + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }

  return div;
};

legend.addTo(myMap);