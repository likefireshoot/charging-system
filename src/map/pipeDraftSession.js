import { TerraDraw, TerraDrawLineStringMode } from "terra-draw";
import { ScaledDrawAdapter } from "./scaledDrawAdapter";

// The original click/list/meter-panel workflow owns input. Terra Draw manages
// the editable geometry, separate from formal business layers and IDs.
export function createPipeDraftSession(map) {
  const draw = new TerraDraw({ adapter: new ScaledDrawAdapter({ map, coordinatePrecision: 9 }), modes: [
    new TerraDrawLineStringMode({ styles: { lineStringColor: "#ef8d25", lineStringWidth: 8 } }),
  ] });
  let id = null, coordinates = [], signature = "", disposed = false;
  draw.start(); draw.setMode("static");
  map.addSource("editable-pipe-nodes", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
  map.addLayer({ id: "editable-pipe-nodes", type: "circle", source: "editable-pipe-nodes", paint: {
    "circle-radius": ["case", ["get", "selected"], 8, 6], "circle-color": ["case", ["get", "selected"], "#ffc942", "white"], "circle-stroke-color": "#ef8d25", "circle-stroke-width": 3,
  } });
  function clear() {
    if (disposed) return;
    if (id !== null && draw.hasFeature(id)) draw.removeFeatures([id]);
    id = null; coordinates = []; signature = "";
    map.getSource("editable-pipe-nodes").setData({ type: "FeatureCollection", features: [] });
  }
  return {
    setDraft(draft, selectedNode) {
      if (disposed) return;
      if (!draft) { clear(); return; }
      const next = JSON.stringify([draft.coordinates, selectedNode, draft.requestId]);
      if (signature === next) return;
      const changedSession = signature && JSON.parse(signature)[2] !== draft.requestId;
      if (changedSession) clear();
      coordinates = draft.coordinates.map(p => [...p]);
      if (coordinates.length >= 2) {
        // Terra validates the adapter's nine-decimal display precision. Keep
        // full original coordinates in the editor and API; round rendering only.
        const geometry = { type: "LineString", coordinates: coordinates.map(p => p.map(n => Number(n.toFixed(9)))) };
        if (id === null) {
          const nextId = draw.getFeatureId();
          const added = draw.addFeatures([{ type: "Feature", id: nextId, properties: { mode: "linestring" }, geometry }]);
          if (!added[0]?.valid) throw new Error(`管线草稿几何无效：${added[0]?.reason || '节点校验失败'}`);
          id = nextId;
        } else draw.updateFeatureGeometry(id, geometry);
      } else if (id !== null) { draw.removeFeatures([id]); id = null; }
      map.getSource("editable-pipe-nodes").setData({ type: "FeatureCollection", features: coordinates.map((p, index) => ({ type: "Feature", properties: { index, selected: index === selectedNode }, geometry: { type: "Point", coordinates: p } })) });
      signature = next;
    },
    pickNode(point) {
      let best = -1, distance = 14 * 14;
      coordinates.forEach((p, index) => { const q = map.project(p), square = (q.x - point[0]) ** 2 + (q.y - point[1]) ** 2; if (square < distance) { best = index; distance = square; } });
      return best;
    },
    diagnostics: () => ({ enabled: !disposed && draw.enabled, draftCount: disposed ? 0 : draw.getSnapshot().filter(f => f.geometry.type === "LineString").length, nodes: coordinates.length }),
    clear,
    dispose() { if (disposed) return; clear(); disposed = true; if (draw.enabled) draw.stop(); if (map.getLayer("editable-pipe-nodes")) map.removeLayer("editable-pipe-nodes"); if (map.getSource("editable-pipe-nodes")) map.removeSource("editable-pipe-nodes"); },
  };
}
