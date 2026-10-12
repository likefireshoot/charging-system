import registry from "./coordinateSources.json";
import { readStoragePoint, NEW_DEVICE_PROFILE, NEW_PIPE_PROFILE } from "./coordinates";

export const deviceTypes = [
  { id: 1, name: "阀门", toolbar: 1 }, { id: 2, name: "排水阀", toolbar: 3 },
  { id: 5, name: "流量计", toolbar: 5 }, { id: 7, name: "水池", toolbar: 7 },
  { id: 8, name: "水泵", toolbar: 9 }, { id: 0, name: "压力计", toolbar: 11 },
  { id: 10, name: "弯头", toolbar: 13 }, { id: 20, name: "三通", toolbar: 15 },
  { id: 30, name: "四通", toolbar: 17 }, { id: 31, name: "消防栓", toolbar: 19 },
];
export const typeName = type => deviceTypes.find(item => item.id === Number(type))?.name || "未知设备";
export const deviceColor = type => ({ 1: "#ec761e", 2: "#7e5fb3", 5: "#a573bd", 7: "#2a81d6", 8: "#e15f4a",
  0: "#0cbbab", 10: "#46b97e", 20: "#f05770", 30: "#63a1d6", 31: "#d85140" })[type] || "#46b97e";
const copy = value => JSON.parse(JSON.stringify(value));
const recordId = value => {
  if (value === null || value === undefined || String(value).trim() === "") throw new Error("缺少记录 ID");
  return value;
};
function rawRecord(value) {
  if (!value || typeof value !== "object" || value.coordinateSpace) throw new Error("记录缺失或已转换，不能重复适配");
  return copy(value);
}
function profileFor(kind, id, sources) {
  const profile = sources[kind]?.[String(id)];
  if (!profile) throw new Error("坐标来源待确认");
  return profile;
}
export function adaptDevice(value, sources = registry) {
  const raw = rawRecord(value), id = recordId(raw.id);
  const source = raw.externInfo?._mapSource;
  const profile = source ? (source.v === 1 && source.p === NEW_DEVICE_PROFILE &&
    typeof source.r === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(source.r) ? NEW_DEVICE_PROFILE : null) : profileFor("devices", id, sources);
  if (!profile) throw new Error("持久坐标来源格式无效");
  const position = readStoragePoint(raw.position, profile);
  const angle = Number(raw.rotationAngle);
  return { coordinateSpace: "map-WGS84", storageProfile: profile, raw, id,
    name: String(raw.name ?? "未命名设备"), position, type: Number(raw.pointType),
    angle: Number.isFinite(angle) ? angle : 0, exception: Number(raw.exception),
    regionName: raw.city_town, externInfo: raw.externInfo && typeof raw.externInfo === "object" ? copy(raw.externInfo) : {} };
}
export function adaptDeviceLocation(value, id, sources = registry) {
  // The old location API uses reversed column names, not normal longitude/latitude semantics.
  const raw = rawRecord(value);
  return readStoragePoint([raw.latitude, raw.longitude], profileFor("devices", id, sources));
}
export function adaptPipe(value, sources = registry, segmentIndex = null) {
  const raw = rawRecord(value), id = recordId(raw.properties?.id);
  const geometry = raw.geometry, nested = Array.isArray(geometry?.coordinates?.[0]?.[0]);
  if (!["LineString", "MultiLineString"].includes(geometry?.type) || !Array.isArray(geometry.coordinates)) {
    throw new Error("管线几何无效或尚未支持该类型");
  }
  if (geometry.type === "MultiLineString" && !nested) throw new Error("多段管线几何无效");
  if (nested && (segmentIndex === null || !geometry.coordinates[segmentIndex])) throw new Error("请选择多段管线的具体子段");
  const part = nested ? geometry.coordinates[segmentIndex] : geometry.coordinates;
  if (part.length < 2) throw new Error("管线至少需要两个节点");
  const source = geometry._mapSource;
  const profile = source ? (source.v === 1 && source.p === NEW_PIPE_PROFILE && typeof source.r === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(source.r) ? NEW_PIPE_PROFILE : null) : profileFor("pipes", id, sources);
  if (!profile) throw new Error("持久坐标来源格式无效");
  const coordinates = part.map(point => readStoragePoint(point, profile));
  const issues = [];
  let directions;
  try {
    directions = typeof raw.geometry.direction_flags === "string" ? JSON.parse(raw.geometry.direction_flags) : raw.geometry.direction_flags;
    const total = nested ? geometry.coordinates.reduce((n, line) => n + line.length - 1, 0) : coordinates.length - 1;
    if (!Array.isArray(directions) || directions.length !== total || !directions.every(flag => flag === 0 || flag === 1)) throw new Error();
    if (nested) { const offset = geometry.coordinates.slice(0, segmentIndex).reduce((n, line) => n + line.length - 1, 0); directions = directions.slice(offset, offset + part.length - 1); }
  } catch (_) {
    directions = []; issues.push("方向标记无效，暂不显示箭头");
  }
  return { coordinateSpace: "map-WGS84", storageProfile: profile, raw, id: nested ? `${id}:${segmentIndex}` : id, parentId: id, segmentIndex: nested ? segmentIndex : null,
    name: String(raw.properties.name ?? "未命名管线"), coordinates, directions: copy(directions),
    diameter: raw.properties.pipe_diameter, length: raw.properties.length, properties: copy(raw.properties), issues };
}
export function adaptRecords(records, kind, sources = registry) {
  const models = [], pending = [], ids = new Set();
  for (const value of records) {
    const id = kind === "devices" ? value?.id : value?.properties?.id;
    try {
      const parts = kind === "pipes" && Array.isArray(value?.geometry?.coordinates?.[0]?.[0]) ? value.geometry.coordinates.map((_, i) => i) : [null];
      const adapted = parts.map(index => kind === "devices" ? adaptDevice(value, sources) : adaptPipe(value, sources, index));
      if (adapted.some(model => ids.has(String(model.id)))) throw new Error("重复记录 ID");
      adapted.forEach(model => { ids.add(String(model.id)); models.push(model); });
    } catch (error) {
      pending.push({ kind, id, name: String((kind === "devices" ? value?.name : value?.properties?.name) ?? "未命名记录"),
        reason: error.message, raw: value === undefined ? null : copy(value) });
    }
  }
  return { models, pending };
}
export function deviceDetails(device) {
  const e = device.externInfo || {}, rows = [];
  const add = (label, value, unit = "") => { if (value !== null && value !== undefined && value !== "") rows.push([label, `${value}${unit}`]); };
  add("名称", device.name); add("ID", device.id); add("所属区域", device.regionName);
  add("类型", typeName(device.type)); add("状态", device.exception === 1 ? "异常" : device.exception === 0 ? "正常" : "未提供");
  add("旋转角度", device.angle, "°");
  if (device.type === 0 || device.type === 31) add("压力值", e.pressure, " MPa");
  if (device.type === 1 || device.type === 2) {
    add("阀门状态", e.status); add("阀门类型", ({ 1: "进水阀", 2: "放空阀", 3: "落水阀" })[e.type] || e.type);
  }
  add("口径", e.caliber, " mm");
  if ([10, 20, 30].includes(device.type)) ["one", "two", "three", "four"].forEach((key, index) => add(`口径 ${index + 1}`, e[`caliber_${key}`], " mm"));
  if (device.type === 7) add("深度", e.depth, " 米");
  if (device.type === 8) { add("开关", e.status); add("电压", e.voltage, " V"); add("电流", e.electricity, " A"); }
  return rows;
}
export function pipeDetails(pipe) {
  const p = pipe.properties;
  return [["名称", pipe.name], ["ID", pipe.parentId ?? pipe.id], ...(pipe.segmentIndex === null || pipe.segmentIndex === undefined ? [] : [["子段", `${pipe.segmentIndex + 1} / ${pipe.raw.geometry.coordinates.length}`]]), ["管径", pipe.diameter == null ? "未提供" : `${pipe.diameter} mm`],
    ["长度", pipe.length == null ? "未提供" : `${pipe.length} 米`], ["节点数", pipe.coordinates.length],
    ["方向", pipe.directions.length ? pipe.directions.map((flag, index) => `第${index + 1}段 ${flag === 1 ? "逆向" : "正向"}`).join("；") : "待确认"],
    ...[["类型", p.type], ["压力", p.pre], ["余氯", p.cl2], ["pH", p.ph]].filter(row => row[1] !== null && row[1] !== undefined)];
}
