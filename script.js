// set map view to center on calgary
var map = L.map("map").setView([51.039439, -114.054339], 11);


// tileLayer
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

//function query permit api
const fetchData = $(function () {
  $('input[name="daterange"]').daterangepicker(
    {
      opens: "left",
      maxDate: new Date(),
    },
    async (start, end, label) => {
      const response = await fetch(
        "https://data.calgary.ca/resource/c2es-76ed.geojson?$where=issueddate >= '" +
          start.format("YYYY-MM-DD") +
          "' and issueddate <= '" +
          end.format("YYYY-MM-DD") +
          "'"
      );

      //   save the response in json format
      const geojson = await response.json();
      // console.log(geojson);
      // Show matching results
      getBuildingPermitData(geojson);
    }
  );
});

// Keep track of the existing markers
var markerArray = new Array();

//cluster group
var markerGroup = L.markerClusterGroup();

function getBuildingPermitData(data) {
  // Remove old markers
  removeMarkers();

  if (data.features.length === 0) {
    alert(
      "No building permit information for the selected date range. Please select another date range."
    );
  } else {
    for (let i = 0; i < data.features.length; i++) {
      if (
        data.features[i].properties.latitude != null &&
        data.features[i].properties.longitude != null
      ) {
        //Create Marker
        var marker = L.marker([
          data.features[i].properties.latitude,
          data.features[i].properties.longitude,
        ]);
        markerArray.push(marker);

        //Create Pop-up
        const popUpText =
          "<b>Issued Date: </b>" +
          data.features[i].properties.issueddate +
          "<br><b>Work Class Group: </b>" +
          data.features[i].properties.workclassgroup +
          "<br><b>Contractor Name: </b>" +
          data.features[i].properties.contractorname +
          "<br><b>Community Name: </b>" +
          data.features[i].properties.communityname +
          "<br><b>Original Address: </b>" +
          data.features[i].properties.originaladdress;
        marker.bindPopup(popUpText);
      }
    }
    // Add markers to the map
    addMarkerClusterGroup();
  }
}

// remove existing marker
function removeMarkers() {
  map.removeLayer(markerGroup);
  for (let i = 0; i < markerArray.length; i++) {
    markerGroup.removeLayer(markerArray[i]);
  }
  markerArray = new Array();
}

// Add markers to the cluster group
function addMarkerClusterGroup() {
  for (let i = 0; i < markerArray.length; i++) {
    markerGroup.addLayer(markerArray[i]);
  }
  map.addLayer(markerGroup);
}

// Handle button of searching
document.getElementById("searching").addEventListener("click", fetchData);

// Define the function to handle clear Permit
function handleClearPermit() {
  removeMarkers();

  // recenter the view back to calgary
  map.setView([51.039439, -114.054339], 11);
}

// Add event listener using the function
document
  .getElementById("clearPermit")
  .addEventListener("click", handleClearPermit);
