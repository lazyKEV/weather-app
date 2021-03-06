// first location to show on loading of map - New Delhi (default)
var inital_coords = {
    lng: 77.216721,
    lat: 28.644800    
}

mapboxgl.accessToken = 'pk.eyJ1IjoibGF6eWtldiIsImEiOiJjandnNWR0dngxYnphNDhvODdtc3oxb2d0In0.8jL87EEGCfRkiZZ6XjHAxA';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    doubleClickZoom: false,
    center: Object.values(inital_coords),
    zoom: 9
});

// add marker
var marker = new mapboxgl.Marker()
    .setLngLat(inital_coords)
    .addTo(map)

// get weather for default location
fetchWeather()

var pos

// Add geolocate
map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true,
        timeout: 5000
    },
    fitBoundsOptions: {
        maxZoom: 14
    }
}).on('geolocate', (position) => {
    pos = mapboxgl.LngLat.convert([position.coords.longitude, position.coords.latitude]);
    marker.setLngLat(pos);
    marker.addTo(map);
    fetchWeather(pos);
}), position = 'bottom-right');

// add geocode control - forward geocoding
map.addControl(new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    marker: false
}).on('result', (e) => {
    pos = mapboxgl.LngLat.convert(e.result.center);
    marker.setLngLat(pos);
    fetchWeather(pos);
}), position = 'top-left');

// add navigation control
map.addControl(new mapboxgl.NavigationControl(), position = 'bottom-right');

// add click behaviour
map.on('click', (e) => {
    pos = e.lngLat
    marker.setLngLat(pos);
    fetchWeather(pos)
});

// get weather
function fetchWeather(coords = inital_coords) {
    // console.log(coords)
    lat = coords.lat;
    lng = coords.lng;
    
    // select target HTML element
    var report = document.getElementById('report');
    var loading = document.getElementById('loading');
    loading.style.display = 'block';
    report.style.display = 'none'

    fetch(`/weather?lat=${lat}&lng=${lng}`)
        .then(response => response.json())
        .then(data => {
            loading.style.display = 'none';
            var dayTime = moment.unix(data.time).local().format('dddd, h:mm a');
            // report.textContent = JSON.stringify(data.report);
            report.style.display = 'block';
            
            // add elements content
            report.querySelector('div > h2').textContent = dayTime
            report.querySelector('div > h3').textContent = data.summary

            // targetting flex items
            var col1 = document.querySelectorAll('.column')[0];
            var col2 = document.querySelectorAll('.column')[1];
            col1.querySelector('div > span > span').textContent = data.temperature.toFixed(0);
            col1.querySelector('div > img').src = `/img/darksky-icons/${data.icon}.png`;
            col1.querySelector('div > img').alt = data.icon;
            col2.querySelectorAll('div > div')[0].querySelector('span').textContent = (data.precipProbability * 100).toFixed(0);
            col2.querySelectorAll('div > div')[1].querySelector('span').textContent = (data.humidity * 100).toFixed(0);
            col2.querySelectorAll('div > div')[2].querySelector('span').textContent = data.windSpeed.toFixed(0);
        })
}

