import maplibregl from "maplibre-gl";

export function constrainNationalViewport(map) {
  const frame = [[73, 2], [135, 54]];
  let minimum = null, adjusting = false;
  const clamp = () => {
    if (adjusting) return;
    const center = map.getCenter();
    const lng = Math.max(73, Math.min(135, center.lng)), lat = Math.max(2, Math.min(54, center.lat));
    if (lng !== center.lng || lat !== center.lat) {
      adjusting = true;
      try { map.jumpTo({ center: [lng, lat] }); } finally { adjusting = false; }
    }
  };
  map.on("move", clamp);
  function update(reset = false) {
    const camera = map.cameraForBounds(frame, { padding: 32, bearing: 0 });
    if (!camera) return;
    const center = map.getCenter(), zoom = map.getZoom();
    const overview = reset || minimum === null || zoom <= minimum + 0.01;
    const canvas = map.getCanvas(), projected = maplibregl.MercatorCoordinate.fromLngLat(camera.center);
    const worldSize = 512 * 2 ** camera.zoom;
    const dx = (canvas.clientWidth / 2 + 1) / worldSize, dy = (canvas.clientHeight / 2 + 1) / worldSize;
    const southwest = new maplibregl.MercatorCoordinate(projected.x - dx, projected.y + dy).toLngLat();
    const northeast = new maplibregl.MercatorCoordinate(projected.x + dx, projected.y - dy).toLngLat();
    map.setMaxBounds(null); map.setMinZoom(camera.zoom); map.setMaxBounds([southwest, northeast]);
    minimum = camera.zoom;
    map.jumpTo(overview ? { ...camera, padding: 0,
      pitch: reset ? 0 : map.getPitch(), bearing: reset ? 0 : map.getBearing() } : { center, zoom: Math.max(zoom, minimum) });
  }
  return { update, national: () => update(true), dispose: () => map.off("move", clamp) };
}
