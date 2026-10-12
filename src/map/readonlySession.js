import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { acquireArchiveProtocol, getProtocolUsers, loadNationalResources } from "./resources";
import { constrainNationalViewport } from "./nationalViewport";
import { bearingDegrees } from "./geometry";
import { deviceColor, deviceDetails, pipeDetails } from "./legacyAdapters";
import { getPipeColor } from "@/api/map/map";

const totals = { maps: 0, observers: 0, listeners: 0, markers: 0 };
const collection = features => ({ type: "FeatureCollection", features });
const empty = () => collection([]);
const fireIcon = require("@/assets/device/icon19.svg");
export function createReadonlySession({ container, onSelect, onError, onMapClick, suppressPopup, fitPadding }) {
  let map, observer, viewport, release, disposed = false, loaded = false, popup, resolveReady;
  let devices = [], pipes = [], dataSignature = "", selected = null;
  const markers = new Map(), disposers = [], abort = new AbortController();
  function listen(target, event, handler) {
    target.on(event, handler); totals.listeners++;
    disposers.push(() => { target.off(event, handler); totals.listeners--; });
  }
  function clearMarkers() {
    for (const item of markers.values()) { item.remove(); totals.markers--; }
    markers.clear();
  }
  function infoContent(kind, item) {
    const div = document.createElement("div"); div.className = "readonly-popup";
    for (const [label, value] of kind === "device" ? deviceDetails(item) : pipeDetails(item)) {
      const row = document.createElement("p"), title = document.createElement("strong"), text = document.createElement("span");
      title.textContent = `${label}：`; text.textContent = String(value); row.append(title, text); div.append(row);
    }
    return div;
  }
  function showInfo(kind, item, at) {
    popup?.remove();
    const position = at || (kind === "device" ? item.position : item.coordinates[0]);
    const point = map.project(position), canvas = map.getCanvas();
    const padding = typeof fitPadding === "function" ? fitPadding() : fitPadding;
    let anchor;
    if (padding) {
      // MapLibre's automatic anchor only considers the canvas edge. Also reserve
      // the original business controls so a hover card does not cover a tool.
      const side = point.x < padding.left + 160 ? "left" : point.x > canvas.clientWidth - padding.right - 160 ? "right" : null;
      const vertical = point.y < padding.top + 200 ? "top" : point.y > canvas.clientHeight - padding.bottom - 200 ? "bottom" : null;
      anchor = side ? vertical ? `${vertical}-${side}` : side : vertical || undefined;
    }
    popup = new maplibregl.Popup({ anchor, offset: kind === "device" ? 24 : 8, closeOnClick: false, maxWidth: "300px" })
      .setLngLat(position)
      .setDOMContent(infoContent(kind, item)).addTo(map);
  }
  async function pick(kind, id, at) {
    const item = (kind === "device" ? devices : pipes).find(record => String(record.id) === String(id));
    if (!item) return;
    if (await onSelect(kind, item.id) === false || disposed || !loaded) return;
    select({ kind, id: item.id }); if (!suppressPopup?.()) showInfo(kind, item, at);
  }
  function updateMarkerSizes() {
    for (const marker of markers.values()) marker.getElement().classList.toggle("is-overview", map.getZoom() < 12);
  }
  function setData(nextDevices, nextPipes) {
    devices = nextDevices; pipes = nextPipes;
    if (!loaded || disposed) return;
    if (suppressPopup?.()) popup?.remove();
    const signature = JSON.stringify([devices, pipes]);
    if (signature === dataSignature) return;
    dataSignature = signature; popup?.remove(); clearMarkers();
    for (const device of devices) {
      const button = document.createElement("button"); button.type = "button"; button.className = "readonly-device";
      button.dataset.deviceId = device.id; button.setAttribute("aria-label", device.name);
      button.style.setProperty("--device-color", deviceColor(device.type));
      const icon = document.createElement("img"); icon.className = "device-symbol";
      icon.src = device.type === 31 ? fireIcon : `${process.env.BASE_URL}device/icon${device.type}.svg`;
      icon.alt = ""; icon.style.transform = `rotate(${device.angle}deg)`;
      icon.onerror = () => { icon.onerror = null; icon.src = `${process.env.BASE_URL}device/icon1.svg`; };
      const label = document.createElement("span"); label.className = "device-name"; label.textContent = device.name;
      button.append(icon, label);
      if (device.exception === 1) {
        const badge = document.createElement("span"); badge.className = "exception-badge"; badge.textContent = "!"; badge.title = "异常设备"; button.append(badge);
      }
      if ((device.type === 1 || device.type === 2) && device.externInfo.status && device.externInfo.status !== "开") {
        const closed = document.createElement("span"); closed.className = "closed-badge"; closed.textContent = "关"; closed.title = "阀门关闭"; button.append(closed);
      }
      button.onclick = event => {
        event.stopPropagation();
        const canvas = map.getCanvas(), rect = canvas.getBoundingClientRect();
        const pixel = [(event.clientX - rect.left) * canvas.clientWidth / rect.width, (event.clientY - rect.top) * canvas.clientHeight / rect.height];
        if (onMapClick?.(map.unproject(pixel).toArray(), pixel) === true) return;
        pick("device", device.id);
      };
      button.onmouseenter = () => { if (!suppressPopup?.()) showInfo("device", device); };
      button.onmouseleave = () => { if (selected?.kind !== "device" || String(selected.id) !== String(device.id)) popup?.remove(); };
      const marker = new maplibregl.Marker({ element: button, anchor: "center" }).setLngLat(device.position).addTo(map);
      markers.set(String(device.id), marker); totals.markers++;
    }
    updateMarkerSizes();
    map.getSource("readonly-pipes").setData(collection(pipes.map(pipe => ({ type: "Feature", properties: {
      businessId: String(pipe.id), color: getPipeColor(pipe.diameter) }, geometry: { type: "LineString", coordinates: pipe.coordinates } }))));
    const arrows = pipes.flatMap(pipe => pipe.directions.map((flag, index) => {
      const a = pipe.coordinates[index], b = pipe.coordinates[index + 1];
      if (a[0] === b[0] && a[1] === b[1]) return null;
      return { type: "Feature", properties: { businessId: String(pipe.id), segment: index,
        bearing: (bearingDegrees(a, b) + (flag === 1 ? 180 : 0)) % 360 },
      geometry: { type: "Point", coordinates: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] } };
    }).filter(Boolean));
    map.getSource("readonly-directions").setData(collection(arrows)); select(selected);
  }
  function select(value) {
    const changed = JSON.stringify(value) !== JSON.stringify(selected);
    selected = value;
    if (!loaded || disposed) return;
    if (changed) popup?.remove();
    for (const [id, marker] of markers) marker.getElement().classList.toggle("is-selected", selected?.kind === "device" && String(selected.id) === id);
    map.setFilter("readonly-pipe-selection", ["==", ["get", "businessId"], selected?.kind === "pipe" ? String(selected.id) : ""]);
    const pipe = selected?.kind === "pipe" ? pipes.find(item => String(item.id) === String(selected.id)) : null;
    map.getSource("readonly-nodes").setData(collection((pipe?.coordinates || []).map((point, index) => ({ type: "Feature",
      properties: { index: index + 1 }, geometry: { type: "Point", coordinates: point } }))));
  }
  function fit(points) {
    if (!loaded || disposed) return;
    if (!points.length) { viewport.national(); return; }
    const bounds = points.reduce((result, point) => result.extend(point), new maplibregl.LngLatBounds(points[0], points[0]));
    const padding = typeof fitPadding === "function" ? fitPadding() : fitPadding;
    map.fitBounds(bounds, { padding: padding || { top: 130, bottom: 65, left: 180, right: 440 }, maxZoom: 19, duration: 0 });
  }
  function locate(kind, id) {
    const item = (kind === "device" ? devices : pipes).find(record => String(record.id) === String(id));
    if (!item || !loaded) return;
    fit(kind === "device" ? [item.position] : item.coordinates); pick(kind, id);
  }
  function dispose() {
    if (disposed) return;
    disposed = true; abort.abort(); observer?.disconnect(); if (observer) totals.observers--;
    popup?.remove(); clearMarkers(); viewport?.dispose();
    while (disposers.length) disposers.pop()();
    resolveReady?.(false);
    if (map) { map.remove(); map = null; totals.maps--; }
    release?.(); release = null;
  }
  const ready = (async () => {
    try {
      const resources = await loadNationalResources(abort.signal);
      if (disposed) return false;
      release = acquireArchiveProtocol();
      map = new maplibregl.Map({ container, style: resources.style, center: [104, 35], zoom: 3.6, minZoom: 0,
        maxZoom: 22, renderWorldCopies: false, pitch: 0, bearing: 0, dragRotate: false, pitchWithRotate: false, touchPitch: false,
        localIdeographFontFamily: "Microsoft YaHei, PingFang SC, Noto Sans CJK SC, sans-serif", attributionControl: { compact: true } });
      totals.maps++; map.touchZoomRotate.disableRotation();
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-left");
      map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-right");
      listen(map, "error", event => { if (!disposed) onError(event.error?.message || "地图资源加载失败"); });
      listen(map, "zoom", updateMarkerSizes);
      listen(map, "click", event => {
        // Existing pages scale #app to 0.7. Derive physical pointer pixels from
        // the canvas rectangle, as in the already verified Terra Draw adapter.
        const canvas = map.getCanvas(), rect = canvas.getBoundingClientRect(), original = event.originalEvent;
        const point = [(original.clientX - rect.left) * canvas.clientWidth / rect.width,
          (original.clientY - rect.top) * canvas.clientHeight / rect.height];
        // Device editing can own a click; default read-only selection is unchanged.
        if (onMapClick?.(map.unproject(point).toArray(), point) === true) return;
        const hit = map.queryRenderedFeatures([[point[0] - 8, point[1] - 8], [point[0] + 8, point[1] + 8]], { layers: ["readonly-pipes"] });
        // Near-parallel or crossing lines can both hit the same tolerance box.
        // Select the nearest rendered segment rather than the last drawn line.
        const ids = new Set(hit.map(feature => feature.properties.businessId));
        let nearest = null, distance = Infinity;
        for (const pipe of pipes) {
          if (!ids.has(String(pipe.id))) continue;
          for (let index = 1; index < pipe.coordinates.length; index++) {
            const a = map.project(pipe.coordinates[index - 1]), b = map.project(pipe.coordinates[index]);
            const dx = b.x - a.x, dy = b.y - a.y, length = dx * dx + dy * dy;
            const t = length ? Math.max(0, Math.min(1, ((point[0] - a.x) * dx + (point[1] - a.y) * dy) / length)) : 0;
            const squared = (point[0] - a.x - t * dx) ** 2 + (point[1] - a.y - t * dy) ** 2;
            if (squared < distance) { distance = squared; nearest = pipe; }
          }
        }
        if (nearest) pick("pipe", nearest.id, map.unproject(point));
      });
      await new Promise(resolve => {
        resolveReady = resolve;
        listen(map, "load", () => {
          if (disposed) { resolve(false); return; }
          try {
            map.addSource("readonly-pipes", { type: "geojson", data: empty() });
            map.addLayer({ id: "readonly-pipe-selection", type: "line", source: "readonly-pipes", filter: ["==", ["get", "businessId"], ""],
              paint: { "line-color": "#ffc942", "line-width": 13, "line-opacity": 0.75 }, layout: { "line-cap": "round", "line-join": "round" } });
            map.addLayer({ id: "readonly-pipes", type: "line", source: "readonly-pipes", paint: { "line-color": ["get", "color"], "line-width": 6 },
              layout: { "line-cap": "round", "line-join": "round" } });
            const canvas = document.createElement("canvas"); canvas.width = 32; canvas.height = 32;
            const pen = canvas.getContext("2d"); pen.fillStyle = "white"; pen.strokeStyle = "#183851"; pen.lineWidth = 2;
            pen.beginPath(); pen.moveTo(16, 5); pen.lineTo(25, 24); pen.lineTo(16, 19); pen.lineTo(7, 24); pen.closePath(); pen.fill(); pen.stroke();
            map.addImage("readonly-direction", pen.getImageData(0, 0, 32, 32));
            map.addSource("readonly-directions", { type: "geojson", data: empty() });
            map.addLayer({ id: "readonly-directions", type: "symbol", source: "readonly-directions", minzoom: 12,
              layout: { "icon-image": "readonly-direction", "icon-size": 0.75, "icon-rotate": ["get", "bearing"], "icon-rotation-alignment": "map", "icon-allow-overlap": true } });
            map.addSource("readonly-nodes", { type: "geojson", data: empty() });
            map.addLayer({ id: "readonly-nodes", type: "circle", source: "readonly-nodes",
              paint: { "circle-radius": 5, "circle-color": "white", "circle-stroke-width": 2, "circle-stroke-color": "#46b97e" } });
            viewport = constrainNationalViewport(map); loaded = true; viewport.national(); setData(devices, pipes);
            observer = new ResizeObserver(() => { if (!disposed) { map.resize(); viewport.update(); } });
            observer.observe(container); totals.observers++; resolve(true);
          } catch (error) { onError(error.message); dispose(); resolve(false); }
        });
      });
      return loaded && !disposed;
    } catch (error) { if (!disposed && error.name !== "AbortError") onError(error.message); dispose(); return false; }
  })();
  return { ready, dispose, setData, select, locate, fitAll: () => fit([...devices.map(device => device.position), ...pipes.flatMap(pipe => pipe.coordinates)]),
    national: () => viewport?.national(), get map() { return map; }, diagnostics: () => ({ ...totals, protocolUsers: getProtocolUsers(), disposed }) };
}
