var map, config
fetch("config.json").then(response => response.json()).then(data => {
  config = data

  var backgroundLayers = [];
  config.urls.forEach((layer, i) => {
    var newLayer = new ol.layer.Tile({
      source: new ol.source.XYZ({ url: layer.url }),
      visible: layer.default,
      class: "base-layer"
    });
    backgroundLayers.push(newLayer)
    var button = document.createElement("ITEM")
    button.classList.add("base-layer")
    button.setAttribute("layer", layer.id)
    button.innerHTML = layer.id
    if(layer.default) {
      button.classList.add("active")
    }
    button.addEventListener("click", (e) => {
      if(!button.classList.contains("active")) {
        var baseLayers = map.getLayers();
        baseLayers.forEach((currentLayer) => {
          if(currentLayer.get("class") == "base-layer") {
            currentLayer.setVisible(false);
          }
        });
        document.querySelector("#layerSelector item.active").classList.remove("active");
        button.classList.add("active");
        newLayer.setVisible(true);
      }
    });
    document.getElementById("layerSelector").append(button);
  });

  const view = new ol.View({
    projection: "EPSG:3857",
    center: config.center,
    zoom: config.zoom
  });

  map = new ol.Map({
    target: "map",
    controls: ol.control.defaults().extend([
      new ol.control.ScaleLine({
        units: "metric"
      })
    ]),
    layers: backgroundLayers,
    view: view
  });
  if(localStorage.getItem("folder")) window.api.send("toMain", {action: "load files from folder", folder: localStorage.getItem("folder")})
});

window.api.receive("fromMain", (data) => {
  if(data.action == "send tracks") {
    var tracksContainer = document.getElementById("tracksContainer")
    data.tracks.forEach((track) => {
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
      })
      map.addLayer(newTrack)
      var trackitem = document.createElement("ITEM")
      trackitem.innerHTML = track.substring(track.lastIndexOf("_") + 1, track.lastIndexOf(".gpx")).replace(/-/g, " ")
      trackitem.classList.add("active")
      trackitem.addEventListener("click", (e) => {
        if(newTrack.getVisible()) {
          newTrack.setVisible(false)
          trackitem.classList.remove("active")
        }
        else {
          newTrack.setVisible(true)
          trackitem.classList.add("active")
        }
      })
      tracksContainer.appendChild(trackitem)
    })
  }
  else if(data.action == "set folder to local storage") {
    localStorage.setItem("folder", data.folder)
  }
})
