// Buildings use the existing local Protomaps archive. Missing heights stay flat;
// no additional map service, geometry download or business-coordinate changes.
export function buildingLayers(style) {
  return ["protomaps", "protomaps-east"].filter(source => style.sources[source]).map(source => ({
    id: `water-buildings-3d-${source}`, type: "fill-extrusion", source, "source-layer": "buildings", minzoom: 15,
    filter: ["all", ["==", ["geometry-type"], "Polygon"],
      ["in", ["get", "kind"], ["literal", ["building", "building_part"]]],
      [">", ["coalesce", ["get", "height"], 0], 0],
      [">", ["get", "height"], ["coalesce", ["get", "min_height"], 0]]],
    layout: { visibility: "none" },
    paint: { "fill-extrusion-color": "#b7cbc4", "fill-extrusion-opacity": 0.82,
      "fill-extrusion-height": ["get", "height"],
      "fill-extrusion-base": ["max", 0, ["coalesce", ["get", "min_height"], 0]],
      "fill-extrusion-vertical-gradient": true }
  }));
}

export function createMapView(map) {
  const layers = buildingLayers(map.getStyle());
  // Keep labels and every business overlay above the basemap additions.
  const before = map.getStyle().layers.find(layer => layer.type === "symbol")?.id;
  layers.forEach(layer => map.addLayer(layer, before));
  let editing = false, disposed = false, visible = false;
  function sync() {
    if (disposed) return;
    const next = map.getPitch() > 1 && !editing;
    if (next === visible) return;
    visible = next;
    layers.forEach(layer => map.setLayoutProperty(layer.id, "visibility", visible ? "visible" : "none"));
  }
  map.on("pitch", sync);
  function camera(options) {
    if (disposed) return;
    // A previous fit must not leave asymmetric panel padding affecting rotations.
    map.easeTo({ center: map.getCenter(), zoom: map.getZoom(), padding: 0,
      ...options, duration: 400 });
  }
  return {
    setMode: mode => camera(mode === "3d" ? { pitch: 45 } : { pitch: 0, bearing: 0 }),
    rotate: degrees => camera({ bearing: map.getBearing() + degrees }),
    north: () => camera({ bearing: 0 }),
    setEditing(value) { editing = !!value; sync(); },
    diagnostics: () => ({ editing, visible, layers: layers.length, listeners: disposed ? 0 : 1, disposed }),
    dispose() {
      if (disposed) return;
      disposed = true; map.off("pitch", sync);
      layers.forEach(layer => { if (map.getLayer(layer.id)) map.removeLayer(layer.id); });
    }
  };
}
