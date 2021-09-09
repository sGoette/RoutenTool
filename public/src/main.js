var socket = io();

function getRanColor() {
  var colors = [
    '#A20013',
    '#E86686',
    '#E32051',
    '#632C3A',
    '#B0193E'
  ];
  return colors[Math.floor(Math.random()*colors.length)];
}

const WMS_TILE_SIZE = 512; // px
const TILEGRID_ORIGIN = [2420000, 1350000]; // in EPSG:2056
// resolutions in meter/pixel
const TILEGRID_RESOLUTIONS = [
  4000,
  3750,
  3500,
  3250,
  3000,
  2750,
  2500,
  2250,
  2000,
  1750,
  1500,
  1250,
  1000,
  750,
  650,
  500,
  250,
  100,
  50,
  20,
  10,
  5,
  2.5,
  2,
  1.5,
  1,
  0.5,
  0.25,
  0.1,
  0.01
];

const backgroundLayer = new ol.layer.Tile({
  id: "background-layer",
  source: new ol.source.XYZ({
    //url: `https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg`
    //url: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.digitales-hoehenmodell_25_reliefschattierung/default/current/3857/{z}/{x}/{y}.png'
    //url: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.leichte-basiskarte_reliefschattierung/default/current/3857/{z}/{x}/{y}.png'
    //url: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg'
    url: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissalti3d-reliefschattierung/default/current/3857/{z}/{x}/{y}.png'
  })
});

const view = new ol.View({
  projection: "EPSG:3857",
  center: [830151.6269972717, 5934365.718957167],
  zoom: 10
});


var map = new ol.Map({
  target: "map",
  controls: ol.control.defaults().extend([
    new ol.control.ScaleLine({
      units: "metric"
    })
  ]),
  layers: [backgroundLayer],
  view: view
});

socket.emit("loadTracks", "init");
socket.on('trackList', (tracks) => {
  tracks.forEach((track) => {
    const newTrack = new ol.layer.Vector({
      source: new ol.source.Vector({
        url: track,
        format: new ol.format.GPX(),
      }),
      style: new ol.style.Style({
        stroke: new ol.style.Stroke({
        color: getRanColor(),
        width: 5,
        }),
      }),
    });
    map.addLayer(newTrack);
  });
});
