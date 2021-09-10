var socket = io();
fetch("config.json").then(response => response.json()).then(data => {
  var config = data;

  const WMS_TILE_SIZE = config.tileSize;
  const TILEGRID_ORIGIN = config.gridOrigin;
  const TILEGRID_RESOLUTIONS = config.resolutions;

  const backgroundLayer = new ol.layer.Tile({
    id: "background-layer",
    source: new ol.source.XYZ({ url: config.url })
  });

  const view = new ol.View({
    projection: "EPSG:3857",
    center: config.center,
    zoom: config.zoom
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
          url: encodeURI(track),
          format: new ol.format.GPX()
        }),
        style: new ol.style.Style({
          stroke: new ol.style.Stroke({
          color: config.colors[Math.floor(Math.random()*config.colors.length)],
          width: 5,
          })
        })
      });
      map.addLayer(newTrack);
    });
  });
});
