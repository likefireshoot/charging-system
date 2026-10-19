import { readStoragePoint } from "./coordinates";

const copy = value => JSON.parse(JSON.stringify(value));
export function trackTimestamp(value) {
  if (typeof value === "number" && Number.isFinite(new Date(value).getTime())) return value;
  if (typeof value !== "string" || !value.trim()) throw new Error("轨迹时间无效");
  const time = new Date(value.trim().replace(/^(\d{4}-\d{2}-\d{2}) /, "$1T")).getTime();
  if (!Number.isFinite(time)) throw new Error("轨迹时间无效");
  return time;
}

// Sources are registered per real track ID with evidence. A device source is
// never a default for tracks; response numeric ranges are not CRS evidence.
export function adaptTracks(records, sources, mode = "field") {
  if (!Array.isArray(records)) throw new Error("轨迹响应格式异常");
  if (sources?.version !== 1 || !sources.tracks || typeof sources.tracks !== "object" || Array.isArray(sources.tracks))
    throw new Error("轨迹来源登记格式异常");
  const tracks = [], points = [], pending = [], issues = [];
  let ordinal = 0;
  records.forEach((record, groupIndex) => {
    if (!Array.isArray(record?.points)) { issues.push("轨迹节点格式异常"); return; }
    const byId = new Map();
    for (const value of record.points) {
      const id = value?.trackId;
      if (!Number.isSafeInteger(Number(id)) || id === null || id === undefined || Number(id) <= 0) {
        issues.push("轨迹编号无效"); continue;
      }
      const key = String(id);
      if (!byId.has(key)) byId.set(key, []);
      byId.get(key).push({ value, ordinal: ordinal++ });
    }
    for (const [id, rawPoints] of byId) {
      const source = sources.tracks[id];
      if (!source || !["WGS84", "confirmed-GCJ02"].includes(source.profile) || typeof source.evidence !== "string" || !source.evidence.trim()) {
        pending.push({ trackId: id, pointCount: rawPoints.length, reason: "坐标来源待确认", raw: copy(rawPoints.map(p => p.value)) }); continue;
      }
      const ordered = rawPoints.map(item => {
        try { return { ...item, time: trackTimestamp(item.value.timestamp) }; }
        catch (_) { issues.push(`轨迹 ${id} 有无效时间节点`); return { ...item, time: Infinity, invalid: true }; }
      }).sort((a, b) => a.time - b.time || a.ordinal - b.ordinal);
      let segment = null, part = 0;
      for (const item of ordered) {
        try {
          const raw = item.value;
          if (item.invalid || raw.coordinateSpace) throw new Error("无效节点或重复转换");
          // The existing pinned GCJ inverse supplies the algorithm only. The
          // model retains its own track provenance instead of claiming AMap.
          const position = readStoragePoint([raw.longitude, raw.latitude], source.profile === "WGS84" ? "WGS84" : "confirmed-mainland-AMap-GCJ02");
          if (position[0] < 73 || position[0] > 136 || position[1] < 2 || position[1] > 54) throw new Error("超出中国地图范围");
          if (!segment) { segment = { key: `${groupIndex}:${id}:${part++}`, trackId: id, points: [] }; tracks.push(segment); }
          const point = { key: `${groupIndex}:${item.ordinal}`, trackId: id, segmentKey: segment.key,
            position, timestamp: item.time, ordinal: item.ordinal, raw: copy(raw), coordinateSpace: "map-WGS84", storageProfile: source.profile };
          segment.points.push(point); points.push(point);
        } catch (_) { segment = null; issues.push(`轨迹 ${id} 有无效位置节点，已断开相邻线段`); }
      }
    }
  });
  points.sort((a, b) => a.timestamp - b.timestamp || a.ordinal - b.ordinal);
  points.forEach((point, index) => { point.index = index; });
  let frames = points;
  if (mode === "field3") {
    // Match the original splitArray(flattenedPoints, 18): first point of each
    // 18-point block, then the terminal point once. Line grouping stays separate.
    frames = points.filter((_, index) => index % 18 === 0);
    const last = points.at(-1);
    if (last && frames.at(-1) !== last) frames.push(last);
  }
  return { tracks, points, frames, pending, issues: [...new Set(issues)] };
}

export function trackFeatures(model, visibleIndex = Infinity) {
  const visible = model.points.filter(point => point.index <= visibleIndex);
  const lines = model.tracks.map(track => track.points.filter(point => point.index <= visibleIndex))
    .filter(points => points.length >= 2).map(points => ({ type: "Feature", properties: { trackId: points[0].trackId, segmentKey: points[0].segmentKey },
      geometry: { type: "LineString", coordinates: points.map(point => point.position) } }));
  const frameKeys = new Set(model.frames.map(point => point.key));
  const markers = visible.filter(point => frameKeys.has(point.key)).map(point => ({ type: "Feature", properties: { key: point.key, trackId: point.trackId, timestamp: point.timestamp },
    geometry: { type: "Point", coordinates: point.position } }));
  return { lines: { type: "FeatureCollection", features: lines }, points: { type: "FeatureCollection", features: markers } };
}
