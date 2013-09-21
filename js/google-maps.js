var infowindow;
var map;
var geocoder;
var bermudaTriangle;
var ctaLayer;
var polygonList = {}


function initialize(lat, lng) {

	var mapOptions = {
		zoom: 16,
		center: new google.maps.LatLng(37.410483, -122.059758),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	map = new google.maps.Map(document.getElementById('map-canvas'),
		mapOptions);

	for (var key in places) {
		if (places.hasOwnProperty(key)) {
			var polygonCoords = [];
			var polygon;
			for (var i = 0; i < places[key].length; i++) {
				var coords = places[key][i];
				var lat = coords[1];
				var lng = coords[0];
				polygonCoords.push(new google.maps.LatLng(lat, lng));
			};
			polygon = new google.maps.Polygon({
				paths: polygonCoords,
				strokeColor: '#FF0000',
				strokeOpacity: 0.0,
				strokeWeight: 2,
				fillColor: '#FF0000',
				fillOpacity: 0.0
			});
			polygon.setMap(map);
			polygonList[key] = polygon;
		}
	}
	getLocation();
	getAnnotations();
	// console.log(polygonList);
}

function createMarker(lat, lng) {
	var marker = new google.maps.Marker({
		map: map,
		position: new google.maps.LatLng(lat, lng),
		zIndex: 1
	});
	return marker;
}


google.maps.event.addDomListener(window, 'load', initialize)
