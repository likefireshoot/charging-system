import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { applyWaterMapTheme, waterMapColors } from "./waterMapTheme";

let sharedProtocol = null;
let protocolUsers = 0;

export function acquireArchiveProtocol() {
  if (!sharedProtocol) {
    sharedProtocol = new Protocol();
    maplibregl.addProtocol("pmtiles", sharedProtocol.tile);
  }
  protocolUsers += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    protocolUsers -= 1;
    if (protocolUsers === 0) {
      maplibregl.removeProtocol("pmtiles");
      sharedProtocol = null;
    }
  };
}

export function getProtocolUsers() { return protocolUsers; }

export async function loadNationalResources(signal) {
  const configured = process.env.VUE_APP_MAP_ASSET_BASE || "/map-assets/";
  const base = new URL(configured.endsWith("/") ? configured : `${configured}/`, window.location.href);
  const absolute = name => new URL(name, base).href;
  async function json(name) {
    const response = await fetch(absolute(name), { signal });
    if (!response.ok) throw new Error(`Map resource ${name}: HTTP ${response.status}`);
    return response.json();
  }
  const maskUrl = new URL(`${process.env.BASE_URL}map-config/china-display-mask.geojson`, window.location.origin);
  const maskResponse = await fetch(maskUrl, { signal });
  if (!maskResponse.ok) throw new Error(`China display mask: HTTP ${maskResponse.status}`);
  const [style, regions, displayMask] = await Promise.all([json("style-light.json"), json("regions.json"), maskResponse.json()]);
  applyWaterMapTheme(style);
  style.glyphs = absolute("fonts/{fontstack}/{range}.pbf").replaceAll("%7B", "{").replaceAll("%7D", "}");
  style.sprite = absolute("sprites/light");
  style.sources.protomaps.url = `pmtiles://${absolute("地图数据/china-20261010-z15.pmtiles")}`;
  style.sources["protomaps-east"].url = `pmtiles://${absolute("地图数据/east-islands-20261010-z15.pmtiles")}`;
  for (const source of Object.values(style.sources)) {
    source.attribution = source.attribution.replace('./licenses/地图数据署名.html', absolute("licenses/地图数据署名.html"));
  }
  // Cover unused exterior fragments after all basemap labels; original
  // archive coverage and coordinate data remain unchanged.
  style.sources["prototype-china-display-mask"] = { type: "geojson", data: displayMask };
  const overviewMask = displayMask.features.find(feature => feature.properties.display === "overview");
  const seaFont = style.layers.find(layer => layer.id === "water_label_ocean")?.layout?.["text-font"] || ["Noto Sans Regular"];
  for (const layer of style.layers) {
    if (layer.id.startsWith("water_label_ocean")) layer.minzoom = Math.max(layer.minzoom || 0, 6);
    // Hide the whole exterior label, rather than cutting off its glyphs where
    // a long neighboring place name overlaps the display mask's edge.
    if (layer.type === "symbol") {
      let originalFilter = layer.filter ?? true;
      // The frozen basemap mixes legacy property filters and expressions.
      // Normalize its two legacy symbol forms before combining expressions.
      if (Array.isArray(originalFilter) && typeof originalFilter[1] === "string") {
        if (originalFilter[0] === "==") originalFilter = ["==", ["get", originalFilter[1]], originalFilter[2]];
        else if (originalFilter[0] === "in") originalFilter = ["in", ["get", originalFilter[1]], ["literal", originalFilter.slice(2)]];
      }
      layer.filter = ["all", originalFilter, ["any", [">=", ["zoom"], 6], ["!", ["within", overviewMask]]]];
    }
  }
  style.layers.push({ id: "prototype-china-display-mask", type: "fill", source: "prototype-china-display-mask", minzoom: 6,
    filter: ["==", ["get", "display"], "detail"],
    paint: { "fill-color": waterMapColors.water, "fill-opacity": 1, "fill-antialias": false } });
  style.layers.push({ id: "prototype-china-display-mask-overview", type: "fill", source: "prototype-china-display-mask", maxzoom: 6,
    filter: ["==", ["get", "display"], "overview"],
    paint: { "fill-color": waterMapColors.water, "fill-opacity": 1, "fill-antialias": false } });
  style.sources["prototype-south-sea-label"] = { type: "geojson", data: {
    type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [113, 11] } } };
  style.layers.push({ id: "prototype-south-sea-label", type: "symbol", source: "prototype-south-sea-label", maxzoom: 6,
    layout: { "text-field": "南海诸岛", "text-font": seaFont, "text-size": 14 },
    paint: { "text-color": "#65899a", "text-halo-color": waterMapColors.water, "text-halo-width": 1 } });
  return { style, regions };
}
