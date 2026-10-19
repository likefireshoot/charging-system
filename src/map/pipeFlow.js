const SOURCE = "readonly-pipe-flow";
const MIN_ZOOM = 12;
const PERIOD_MS = 2500;
const FRAME_INTERVAL = 1000 / 24;
const samePoint = (a, b) => a[0] === b[0] && a[1] === b[1];
const validPoint = p => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite) && Math.abs(p[0]) <= 180 && Math.abs(p[1]) <= 90;

// Consecutive segments with the same direction form one continuous display
// run. Reverse copies for flag 1; never change business geometry or flags.
export function orientedPipeRuns(pipe) {
  const points = pipe.coordinates, flags = pipe.directions;
  if (!Array.isArray(points) || points.length < 2 || !points.every(validPoint) ||
    !Array.isArray(flags) || flags.length !== points.length - 1 || !flags.every(flag => flag === 0 || flag === 1)) return [];
  const runs = [];
  let coordinates = [], direction = null, start = 0;
  function flush() {
    if (coordinates.length >= 2) runs.push({ coordinates: direction === 1 ? coordinates.reverse() : coordinates, direction, start });
    coordinates = [];
  }
  flags.forEach((flag, index) => {
    const a = points[index], b = points[index + 1];
    if (samePoint(a, b)) return;
    if (flag !== direction || !coordinates.length) {
      flush(); direction = flag; start = index; coordinates = [[...a], [...b]];
    } else coordinates.push([...b]);
  });
  flush();
  return runs;
}

export function buildPipeFlowFeatures(pipes, colorForDiameter) {
  return { type: "FeatureCollection", features: pipes.flatMap(pipe => orientedPipeRuns(pipe).map(run => ({
    type: "Feature", properties: { businessId: String(pipe.id), startSegment: run.start, direction: run.direction, color: colorForDiameter(pipe.diameter) },
    geometry: { type: "LineString", coordinates: run.coordinates },
  }))) };
}

export function pipePulseGradient(color, phase) {
  const rgb = [1, 3, 5].map(start => parseInt(color.slice(start, start + 2), 16));
  const transparent = `rgba(${rgb.join(",")},0)`;
  const tinted = `rgb(${rgb.map(value => Math.round(value + (255 - value) * .55)).join(",")})`;
  return ["interpolate", ["linear"], ["%", ["+", ["*", ["line-progress"], 2], 1 - phase], 1],
    0, transparent, .60, transparent, .73, color, .88, tinted, .96, "#ffffff", .985, "#ffffff", 1, transparent];
}

// Geometry is uploaded only when pipe data changes. Animation updates up to
// four gradient textures, with one shared scheduler, regardless of pipe count.
export function createPipeFlow(map, { colorForDiameter }) {
  const palette = [50, 100, 150, 0].map((diameter, index) => ({ id: `${SOURCE}-${index}`, color: colorForDiameter(diameter) }));
  let disposed = false, paused = false, visible = false, frame = null, lastTime = null, lastDraw = null;
  let phase = 0, draws = 0, sourceUpdates = 0, signature = "", featureCount = 0, activeColors = new Set();
  map.addSource(SOURCE, { type: "geojson", lineMetrics: true, data: { type: "FeatureCollection", features: [] } });
  palette.forEach(item => map.addLayer({ id: item.id, type: "line", source: SOURCE, minzoom: MIN_ZOOM,
    filter: ["==", ["get", "color"], item.color],
    layout: { visibility: "none", "line-cap": "round", "line-join": "round" },
    paint: { "line-width": 8, "line-gradient": pipePulseGradient(item.color, 0) },
  }, "readonly-directions"));
  function canRun() { return !disposed && !paused && !document.hidden && map.getZoom() >= MIN_ZOOM && featureCount > 0; }
  function stop() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null; lastTime = null; lastDraw = null;
  }
  function tick(time) {
    frame = null;
    if (!canRun()) { sync(); return; }
    if (lastTime !== null) phase = (phase + Math.max(0, Math.min(time - lastTime, 100)) / PERIOD_MS) % 1;
    lastTime = time;
    if (lastDraw === null || time - lastDraw >= FRAME_INTERVAL) {
      palette.forEach(item => { if (activeColors.has(item.color)) map.setPaintProperty(item.id, "line-gradient", pipePulseGradient(item.color, phase)); });
      draws++; lastDraw = time;
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (disposed) return;
    visible = canRun();
    palette.forEach(item => {
      const next = visible && activeColors.has(item.color) ? "visible" : "none";
      if (map.getLayoutProperty(item.id, "visibility") !== next) map.setLayoutProperty(item.id, "visibility", next);
    });
    if (!visible) stop();
    else if (frame === null) frame = requestAnimationFrame(tick);
  }
  map.on("zoom", sync);
  document.addEventListener("visibilitychange", sync);
  return {
    setPipes(pipes) {
      if (disposed) return;
      const data = buildPipeFlowFeatures(pipes, colorForDiameter), next = JSON.stringify(data);
      if (next !== signature) {
        signature = next; featureCount = data.features.length;
        activeColors = new Set(data.features.map(feature => feature.properties.color));
        map.getSource(SOURCE).setData(data); sourceUpdates++;
      }
      sync();
    },
    setPaused(value) { if (!disposed) { paused = !!value; sync(); } },
    diagnostics: () => ({ enabled: true, paused, visible, running: frame !== null, schedulers: frame === null ? 0 : 1,
      phase, draws, sourceUpdates, featureCount, activeLayers: visible ? activeColors.size : 0, listeners: disposed ? 0 : 2, disposed }),
    dispose() {
      if (disposed) return;
      stop(); disposed = true; visible = false;
      map.off("zoom", sync); document.removeEventListener("visibilitychange", sync);
      palette.forEach(item => { if (map.getLayer(item.id)) map.removeLayer(item.id); });
      if (map.getSource(SOURCE)) map.removeSource(SOURCE);
      signature = ""; activeColors.clear(); featureCount = 0;
    },
  };
}
