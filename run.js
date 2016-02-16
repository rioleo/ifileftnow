var home = "826 Valencia Street San Francisco CA";
var work = "1600 Amphitheatre Pkwy, Mountain View, CA 94043";
var theme = "blue"; // or "brown"
var format = "twentyfour"; // or "twelve"
var morning_start = "07:00";
var morning_end = "09:00";
var evening_start = "16:00";
var evening_end = "18:00";
var zoom = 12; // Zoom level (0-21) for background map
var api = ""; // Put your API key here

// Retrieve any stored data
if (localStorage.getItem("home") !== null) {
  home = localStorage.getItem("home");
  work = localStorage.getItem("work");
  format = localStorage.getItem("format");
  theme = localStorage.getItem("theme");
  morning_start = localStorage.getItem("startm");
  evening_start = localStorage.getItem("starte");
  morning_end = localStorage.getItem("endm");
  evening_end = localStorage.getItem("ende");
  zoom = localStorage.getItem("zoom");
  api = localStorage.getItem("api");
}

$("#home").val(home);
$("#work").val(work);
$("input[name='format'][value='" + format + "']").prop('checked', true);
$("input[name='theme'][value='" + theme + "']").prop('checked', true);
$("#startm").val(morning_start);
$("#starte").val(evening_start);
$("#endm").val(morning_end);
$("#ende").val(evening_end);
$("#zoom").val(zoom);
$("#api").val(api);

// Load Google Maps API with the right key
google.load("maps", "3", {
  other_params: 'sensor=false&key=' + api,
  callback: function() {

    // Initial load of data
    loadData();

    // Check every minute whether or not to retrieve new traffic
    var check = setInterval(checkTime, 60000);

    function calculateDistances(origins, destinations) {
      var service = new google.maps.DistanceMatrixService();
      var d = $.Deferred();
      service.getDistanceMatrix({
          origins: origins,
          destinations: destinations,
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false,
          drivingOptions: {
            departureTime: new Date(Date.now()),
          }
        },
        function(response, status) {
          if (status != google.maps.DistanceMatrixStatus.OK) {
            d.reject(status);
          } else {
            d.resolve(response);
          }
        });
      return d.promise();
    }

    function getHourMinutes(d, format) {
      var hours = d.getHours();
      label = "";
      if (format == "twelve") {
        label = "am"
        if (hours > 12) {
          label = "pm"
          hours = hours - 12;
        }
      }
      if (hours < 10 && format != "twelve") {
        hours = "0" + hours;
      }
      var minutes = d.getMinutes()
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      user_format = hours + ":" + minutes;

      return hours + ":" + minutes + label;
    }

    function loadData() {
      calculateDistances([home], [work])
        .done(function(response) {

          var origins = response.originAddresses;

          for (var i = 0; i < origins.length; i++) {
            var results = response.rows[i].elements;
            console.log(results);
            for (var j = 0; j < results.length; j++) {
              //console.log(results[j].distance.text);
              document.getElementById('result').innerHTML = results[j].duration_in_traffic.text;
              var t = new Date();
              t.setSeconds(t.getSeconds() + results[j].duration_in_traffic.value);
              arrival_time = getHourMinutes(t, format);
              document.getElementById('result2').innerHTML = arrival_time;
            }
          }

        })
        .fail(function(status) {
          document.getElementById('result').innerHTML = 'An error occured. Status: ' + status;
        });
    }

    function checkTime() {
      var t = new Date();
      current_time = getHourMinutes(t, "twentyfour");
      console.log(current_time);
      if (current_time >= morning_start && current_time <= morning_end) {
        loadData();
        $("#homework").html("work");
        console.log("Morning time");
      } else if (current_time >= evening_start && current_time <= evening_end) {
        loadData();
        $("#homework").html("home");
        console.log("Evening time");
      }
    }

    function initialize() {
      geocoder = new google.maps.Geocoder();
      var latlng = new google.maps.LatLng(-34.397, 150.644);
      var myOptions = {
        zoom: parseInt(zoom),
        center: latlng,
        mapTypeControl: false,
        disableDefaultUI: true,
        styles: eval(theme),
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      map = new google.maps.Map(document.getElementById("map"), myOptions);
      if (geocoder) {
        geocoder.geocode({
          'address': home
        }, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            if (status != google.maps.GeocoderStatus.ZERO_RESULTS) {
              map.setCenter(results[0].geometry.location);
            } else {
              alert("No results found");
            }
          } else {
            alert("Geocode was not successful for the following reason: " + status);
          }
        });
      }
    }
    google.maps.event.addDomListener(window, 'load', initialize);

  }
});

var geocoder;

// Possible themes
var blue = [{
  "featureType": "all",
  "elementType": "labels.text.fill",
  "stylers": [{
    "color": "#ffffff"
  }, {
    "weight": "0.20"
  }, {
    "lightness": "28"
  }, {
    "saturation": "23"
  }, {
    "visibility": "off"
  }]
}, {
  "featureType": "all",
  "elementType": "labels.text.stroke",
  "stylers": [{
    "color": "#494949"
  }, {
    "lightness": 13
  }, {
    "visibility": "off"
  }]
}, {
  "featureType": "all",
  "elementType": "labels.icon",
  "stylers": [{
    "visibility": "off"
  }]
}, {
  "featureType": "administrative",
  "elementType": "geometry.fill",
  "stylers": [{
    "color": "#000000"
  }]
}, {
  "featureType": "administrative",
  "elementType": "geometry.stroke",
  "stylers": [{
    "color": "#144b53"
  }, {
    "lightness": 14
  }, {
    "weight": 1.4
  }]
}, {
  "featureType": "landscape",
  "elementType": "all",
  "stylers": [{
    "color": "#08304b"
  }]
}, {
  "featureType": "poi",
  "elementType": "geometry",
  "stylers": [{
    "color": "#0c4152"
  }, {
    "lightness": 5
  }]
}, {
  "featureType": "road.highway",
  "elementType": "geometry.fill",
  "stylers": [{
    "color": "#000000"
  }]
}, {
  "featureType": "road.highway",
  "elementType": "geometry.stroke",
  "stylers": [{
    "color": "#0b434f"
  }, {
    "lightness": 25
  }]
}, {
  "featureType": "road.arterial",
  "elementType": "geometry.fill",
  "stylers": [{
    "color": "#000000"
  }]
}, {
  "featureType": "road.arterial",
  "elementType": "geometry.stroke",
  "stylers": [{
    "color": "#0b3d51"
  }, {
    "lightness": 16
  }]
}, {
  "featureType": "road.local",
  "elementType": "geometry",
  "stylers": [{
    "color": "#000000"
  }]
}, {
  "featureType": "transit",
  "elementType": "all",
  "stylers": [{
    "color": "#146474"
  }]
}, {
  "featureType": "water",
  "elementType": "all",
  "stylers": [{
    "color": "#021019"
  }]
}];

var brown = [{
  "featureType": "all",
  "elementType": "labels.text.fill",
  "stylers": [{
    "saturation": 36
  }, {
    "color": "#8e8065"
  }, {
    "lightness": 40
  }]
}, {
  "featureType": "all",
  "elementType": "labels.text.stroke",
  "stylers": [{
    "visibility": "on"
  }, {
    "color": "#000000"
  }, {
    "lightness": 16
  }]
}, {
  "featureType": "all",
  "elementType": "labels.icon",
  "stylers": [{
    "visibility": "off"
  }]
}, {
  "featureType": "administrative",
  "elementType": "geometry.fill",
  "stylers": [{
    "color": "#443b32"
  }]
}, {
  "featureType": "administrative",
  "elementType": "geometry.stroke",
  "stylers": [{
    "color": "#000000"
  }, {
    "lightness": 17
  }, {
    "weight": 1.2
  }]
}, {
  "featureType": "administrative.country",
  "elementType": "labels",
  "stylers": [{
    "visibility": "off"
  }]
}, {
  "featureType": "administrative.province",
  "elementType": "labels",
  "stylers": [{
    "visibility": "off"
  }]
}, {
  "featureType": "administrative.locality",
  "elementType": "labels",
  "stylers": [{
    "visibility": "off"
  }]
}, {
  "featureType": "administrative.neighborhood",
  "elementType": "labels",
  "stylers": [{
    "visibility": "off"
  }]
}, {
  "featureType": "administrative.land_parcel",
  "elementType": "labels",
  "stylers": [{
    "visibility": "off"
  }]
}, {
  "featureType": "landscape",
  "elementType": "all",
  "stylers": [{
    "visibility": "on"
  }]
}, {
  "featureType": "landscape",
  "elementType": "geometry",
  "stylers": [{
    "color": "#565048"
  }, {
    "lightness": "-22"
  }]
}, {
  "featureType": "landscape",
  "elementType": "geometry.fill",
  "stylers": [{
    "lightness": "45"
  }, {
    "color": "#2e2925"
  }, {
    "saturation": "0"
  }]
}, {
  "featureType": "landscape",
  "elementType": "labels.icon",
  "stylers": [{
    "saturation": "-100"
  }, {
    "lightness": "-54"
  }]
}, {
  "featureType": "landscape.natural",
  "elementType": "labels",
  "stylers": [{
    "visibility": "off"
  }]
}, {
  "featureType": "poi",
  "elementType": "all",
  "stylers": [{
    "visibility": "on"
  }, {
    "lightness": "0"
  }]
}, {
  "featureType": "poi",
  "elementType": "geometry",
  "stylers": [{
    "color": "#2e2925"
  }, {
    "lightness": "5"
  }]
}, {
  "featureType": "poi",
  "elementType": "labels",
  "stylers": [{
    "visibility": "off"
  }]
}, {
  "featureType": "poi",
  "elementType": "labels.icon",
  "stylers": [{
    "saturation": "-89"
  }, {
    "lightness": "-55"
  }]
}, {
  "featureType": "poi.attraction",
  "elementType": "labels",
  "stylers": [{
    "visibility": "off"
  }]
}, {
  "featureType": "poi.business",
  "elementType": "labels",
  "stylers": [{
    "visibility": "off"
  }]
}, {
  "featureType": "poi.government",
  "elementType": "labels",
  "stylers": [{
    "visibility": "off"
  }]
}, {
  "featureType": "road",
  "elementType": "labels",
  "stylers": [{
    "visibility": "off"
  }]
}, {
  "featureType": "road",
  "elementType": "labels.icon",
  "stylers": [{
    "visibility": "off"
  }]
}, {
  "featureType": "road.highway",
  "elementType": "geometry.fill",
  "stylers": [{
    "color": "#8f7a5b"
  }, {
    "lightness": "0"
  }]
}, {
  "featureType": "road.highway",
  "elementType": "geometry.stroke",
  "stylers": [{
    "color": "#8f7a5b"
  }, {
    "lightness": "0"
  }, {
    "weight": 0.2
  }]
}, {
  "featureType": "road.arterial",
  "elementType": "geometry",
  "stylers": [{
    "color": "#8f7a5b"
  }, {
    "lightness": "0"
  }]
}, {
  "featureType": "road.local",
  "elementType": "geometry",
  "stylers": [{
    "color": "#565048"
  }, {
    "lightness": "0"
  }]
}, {
  "featureType": "transit",
  "elementType": "geometry",
  "stylers": [{
    "color": "#443b32"
  }, {
    "lightness": "12"
  }]
}, {
  "featureType": "transit",
  "elementType": "labels",
  "stylers": [{
    "visibility": "off"
  }]
}, {
  "featureType": "transit.station",
  "elementType": "labels.icon",
  "stylers": [{
    "visibility": "on"
  }, {
    "saturation": "-100"
  }, {
    "lightness": "-51"
  }]
}, {
  "featureType": "water",
  "elementType": "geometry",
  "stylers": [{
    "color": "#443b32"
  }, {
    "lightness": "15"
  }]
}, {
  "featureType": "water",
  "elementType": "labels",
  "stylers": [{
    "visibility": "off"
  }]
}];


$("#menu").click(function() {
  $("#bottom").animate({
    top: "-=400",
  }, 500, function() {
    // Animation complete.
  });
})

$("#close").click(function() {

  // Store settings and reload
  var settings = $('#settings').serializeArray();

  for (var i = 0, n = settings.length; i < n; ++i) {
    localStorage[settings[i].name] = settings[i].value;
  }
  location.reload();
})