import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { acquireArchiveProtocol, getProtocolUsers, loadNationalResources } from "./resources";
import { constrainNationalViewport } from "./nationalViewport";
import { trackFeatures } from "./trackAdapters";
import { formatDateTime } from "@/api/being";

const totals = { maps: 0, observers: 0, listeners: 0, popups: 0 };
const empty = () => ({ type: "FeatureCollection", features: [] });
export function createTrackSession({ container, onError }) {
  let map, observer, release, viewport, popup, resolveReady, disposed = false, loaded = false, hoverKey = null;
  const abort = new AbortController(), listeners = [];
  function listen(event, handler) { map.on(event, handler); totals.listeners++; listeners.push(() => { map.off(event, handler); totals.listeners--; }); }
  function closePopup() { popup?.remove(); if (popup) totals.popups--; popup = null; hoverKey = null; if (map) map.getCanvas().style.cursor = ""; }
  function render(model, visibleIndex = Infinity) {
    if (!loaded || disposed) return;
    closePopup();
    const data = trackFeatures(model, visibleIndex);
    map.getSource("track-lines").setData(data.lines);
    map.getSource("track-points").setData(data.points);
  }
  function fit(points) {
    if (!loaded || disposed) return;
    if (!points.length) { viewport.national(); return; }
    const bounds = points.reduce((bounds, point) => bounds.extend(point.position), new maplibregl.LngLatBounds(points[0].position, points[0].position));
    map.fitBounds(bounds, { padding: 40, maxZoom: 20, duration: 0 });
  }
  function dispose() {
    if (disposed) return;
    disposed = true; abort.abort(); observer?.disconnect(); if (observer) totals.observers--;
    closePopup(); viewport?.dispose(); while (listeners.length) listeners.pop()();
    resolveReady?.(false); if (map) { map.remove(); map = null; totals.maps--; }
    release?.(); release = null;
  }
  const ready = (async () => {
    try {
      const resources = await loadNationalResources(abort.signal);
      if (disposed) return false;
      release = acquireArchiveProtocol();
      map = new maplibregl.Map({ container, style: resources.style, center: [104, 35], zoom: 3.6, minZoom: 0, maxZoom: 22,
        renderWorldCopies: false, pitch: 0, bearing: 0, dragRotate: false, pitchWithRotate: false, touchPitch: false,
        localIdeographFontFamily: "Microsoft YaHei, PingFang SC, Noto Sans CJK SC, sans-serif", attributionControl: { compact: true } });
      totals.maps++; map.touchZoomRotate.disableRotation();
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-left");
      map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-right");
      listen("error", event => { if (!disposed) onError?.(event.error?.message || "地图资源加载失败"); });
      listen("mousemove", event => {
        if (!loaded || disposed || !event.originalEvent) return;
        const canvas = map.getCanvas(), rect = canvas.getBoundingClientRect(), original = event.originalEvent;
        const x = (original.clientX - rect.left) * canvas.clientWidth / rect.width, y = (original.clientY - rect.top) * canvas.clientHeight / rect.height;
        const hits = map.queryRenderedFeatures([[x - 8, y - 8], [x + 8, y + 8]], { layers: ["track-points"] });
        const hit = hits.sort((a, b) => { const pa = map.project(a.geometry.coordinates), pb = map.project(b.geometry.coordinates);
          return (pa.x - x) ** 2 + (pa.y - y) ** 2 - ((pb.x - x) ** 2 + (pb.y - y) ** 2); })[0];
        if (!hit) { closePopup(); return; }
        if (hoverKey === hit.properties.key) return;
        closePopup(); hoverKey = hit.properties.key;
        const div = document.createElement("div"); div.className = "mapTimeCard";
        const heading = document.createElement("h2"); heading.textContent = `当前时刻:${formatDateTime(new Date(Number(hit.properties.timestamp)))}`; div.append(heading);
        popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 20 }).setLngLat(hit.geometry.coordinates).setDOMContent(div).addTo(map);
        totals.popups++; canvas.style.cursor = "pointer";
      });
      const leave = () => closePopup(); map.getCanvas().addEventListener("mouseleave", leave);
      totals.listeners++; listeners.push(() => { map.getCanvas().removeEventListener("mouseleave", leave); totals.listeners--; });
      await new Promise(resolve => {
        resolveReady = resolve;
        listen("load", () => {
          if (disposed) { resolve(false); return; }
          try {
            map.addSource("track-lines", { type: "geojson", data: empty() });
            map.addSource("track-points", { type: "geojson", data: empty() });
            map.addLayer({ id: "track-lines", type: "line", source: "track-lines", layout: { "line-cap": "round", "line-join": "round" },
              paint: { "line-color": "#46b97e", "line-width": 6, "line-opacity": 1 } });
            const canvas = document.createElement("canvas"); canvas.width = 24; canvas.height = 24;
            const pen = canvas.getContext("2d"); pen.strokeStyle = "white"; pen.lineWidth = 3; pen.beginPath(); pen.moveTo(8, 5); pen.lineTo(15, 12); pen.lineTo(8, 19); pen.stroke();
            map.addImage("track-direction", pen.getImageData(0, 0, 24, 24));
            map.addLayer({ id: "track-directions", type: "symbol", source: "track-lines", layout: { "symbol-placement": "line", "symbol-spacing": 70,
              "icon-image": "track-direction", "icon-size": 0.75, "icon-rotation-alignment": "map", "icon-allow-overlap": true, "icon-ignore-placement": true } });
            map.addLayer({ id: "track-points", type: "circle", source: "track-points", paint: { "circle-radius": 6, "circle-color": "white", "circle-stroke-width": 2, "circle-stroke-color": "#46b97e" } });
            viewport = constrainNationalViewport(map); loaded = true; viewport.national();
            observer = new ResizeObserver(() => { if (!disposed) { map.resize(); viewport.update(); } }); observer.observe(container); totals.observers++;
            resolve(true);
          } catch (error) { onError?.(error.message); dispose(); resolve(false); }
        });
      });
      return loaded && !disposed;
    } catch (error) { if (!disposed && error.name !== "AbortError") onError?.(error.message); dispose(); return false; }
  })();
  return { ready, dispose, render, fit, get map() { return map; }, diagnostics: () => ({ ...totals, protocolUsers: getProtocolUsers(), disposed, loaded }) };
}
