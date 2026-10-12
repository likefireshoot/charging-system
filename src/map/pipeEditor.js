import { validatePoint, moveMeters, lineLengthMeters } from "./geometry";
import { NEW_PIPE_PROFILE, writeStoragePoint } from "./coordinates";
import { adaptRecords } from "./legacyAdapters";

export const PIPE_DISTANCES = [1, 5, 10, 20, 50];
const clone = value => structuredClone(value);
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const point = value => {
  const p = validatePoint(value);
  if (p[0] < 73 || p[0] > 136 || p[1] < 2 || p[1] > 54) throw new Error("节点超出中国地图范围");
  return p;
};
const roundLength = coordinates => Math.round(lineLengthMeters(coordinates) * 10) / 10;
export function createPipeEditor({ api, onChange, onSaved, uuid = () => crypto.randomUUID() }) {
  const state = { mode: null, draft: null, selectedNode: null, busy: false, pending: null, error: "" };
  let disposed = false;
  const snapshot = () => clone(state), notify = () => { if (!disposed) onChange(snapshot()); };
  const editable = () => !disposed && !state.busy && !state.pending;
  function storage(draft) {
    const old = draft.model, raw = old && (old.segmentIndex === null ? old.raw.geometry.coordinates : old.raw.geometry.coordinates[old.segmentIndex]);
    return draft.coordinates.map(p => {
      // Preserve every unchanged node exactly, including precision in the old database.
      const index = old ? old.coordinates.findIndex(q => equal(p, q)) : -1;
      return index >= 0 ? clone(raw[index]) : writeStoragePoint(point(p), old?.storageProfile || NEW_PIPE_PROFILE);
    });
  }
  function valid(draft) {
    if (draft.coordinates.length < 2) throw new Error("至少需要两个有效节点");
    draft.coordinates.forEach(point);
    if (draft.coordinates.some((p, i) => i > 0 && equal(p, draft.coordinates[i - 1]))) throw new Error("相邻节点不能重合");
    if (draft.directions.length !== draft.coordinates.length - 1 || !draft.directions.every(x => x === 0 || x === 1)) throw new Error("方向数量与管线节点不匹配，请先确认方向");
    if (!Number.isFinite(Number(draft.properties.pipe_diameter)) || Number(draft.properties.pipe_diameter) <= 0) throw new Error("管径必须大于零");
  }
  function cancel() { if (!editable()) return false; state.mode = null; state.draft = null; state.selectedNode = null; state.error = ""; notify(); return true; }
  async function readback(pending) {
    const records = await api.pipes(pending.regionId);
    const record = records.find(item => pending.kind === "add" ? item.geometry?._mapSource?.r === pending.requestId : String(item.properties.id) === String(pending.id));
    if (pending.kind === "remove") { if (record) throw new Error("删除结果尚未回读确认"); }
    else {
      if (!record) throw new Error("尚未回读到保存的管线");
      const part = pending.segmentIndex === null ? record.geometry.coordinates : record.geometry.coordinates[pending.segmentIndex];
      const directions = typeof record.geometry.direction_flags === "string" ? JSON.parse(record.geometry.direction_flags) : record.geometry.direction_flags;
      const offset = pending.segmentIndex === null ? 0 : record.geometry.coordinates.slice(0, pending.segmentIndex).reduce((n, c) => n + c.length - 1, 0);
      if (!equal(part, pending.coordinates) || !equal(directions.slice(offset, offset + part.length - 1), pending.directions)) throw new Error("节点或方向与回读不一致");
      for (const key of ["pipe_diameter", "type", "pre", "ph", "cl2", ...(pending.kind === "add" ? [] : ["name"])]) {
        if (!equal(record.properties[key], pending.properties[key])) throw new Error("管线属性与回读不一致");
      }
      if (pending.kind === "revise") {
        const old = pending.otherParts;
        if (old && record.geometry.coordinates.some((part, i) => i !== pending.segmentIndex && !equal(part, old[i]))) throw new Error("未编辑子段发生变化");
      }
      if (!Number.isFinite(Number(record.properties.length))) throw new Error("后台长度未回读");
      const models = adaptRecords([record], "pipes").models;
      if (!models.length) throw new Error("保存记录坐标来源无法确认");
      pending.id = record.properties.id;
    }
    if (disposed) return;
    await onSaved({ kind: pending.kind, id: pending.id, modelId: pending.segmentIndex === null ? pending.id : `${pending.id}:${pending.segmentIndex}`, regionId: pending.regionId });
    if (disposed) return;
    state.pending = null; state.mode = null; state.draft = null; state.selectedNode = null; state.error = "";
  }
  async function commit(kind, payload, expected) {
    if (!editable()) throw new Error("请等待保存完成或先核对保存结果");
    state.busy = true; state.error = ""; notify();
    const pending = { ...clone(expected), kind, payload: clone(payload) };
    let submitted = false;
    try {
      const result = await api[kind === "add" ? "add" : kind === "revise" ? "revise" : "remove"](payload);
      submitted = true; if (disposed) return;
      if (kind === "add") pending.id = result?.id;
      state.pending = pending; await readback(pending);
    } catch (error) {
      if (!disposed) {
        if (submitted || error.uncertain) state.pending = pending;
        state.error = state.pending ? `已提交或提交结果待确认：${error.message}。请核对保存结果。` : error.message;
      }
      throw new Error(state.error || error.message);
    } finally { state.busy = false; notify(); }
  }
  return {
    snapshot, cancel,
    beginAdd(regionId) {
      if (!editable()) return false;
      if (!Number.isInteger(Number(regionId)) || Number(regionId) <= 0) throw new Error("请选择所属区域");
      state.mode = "add"; state.draft = { regionId: Number(regionId), requestId: uuid(), coordinates: [], directions: [], properties: { pipe_diameter: 100, type: 1, pre: 1, ph: 1, cl2: 1 } }; state.error = ""; notify(); return true;
    },
    append(value) {
      if (!editable() || state.mode !== "add") return false;
      const p = point(value), coords = state.draft.coordinates;
      if (coords.some(q => Math.abs(q[0] - p[0]) < 0.00001 && Math.abs(q[1] - p[1]) < 0.00001)) return false;
      if (coords.length) state.draft.directions.push(0);
      coords.push(p); notify(); return true;
    },
    replacePoints(values) {
      if (!editable() || state.mode !== "add") return;
      const old = state.draft.coordinates, flags = state.draft.directions;
      const coords = values.map(point);
      state.draft.directions = coords.slice(1).map((_, i) => { const index = old.findIndex(p => equal(p, coords[i])); return index >= 0 ? flags[index] ?? 0 : 0; });
      state.draft.coordinates = coords; state.selectedNode = null; notify();
    },
    beginRevise(model, regionId) {
      if (!editable()) return false;
      if (!model || model.coordinateSpace !== "map-WGS84") throw new Error("请先选择可定位的管线");
      if (model.directions.length !== model.coordinates.length - 1) throw new Error("原管线方向数量不匹配，请先核实原始数据");
      writeStoragePoint(model.coordinates[0], model.storageProfile);
      state.mode = "revise"; state.draft = { model: clone(model), regionId: Number(regionId), requestId: uuid(), coordinates: clone(model.coordinates), directions: clone(model.directions), properties: clone(model.properties) }; state.selectedNode = null; state.error = ""; notify(); return true;
    },
    selectNode(index) { if (!editable() || !state.draft?.coordinates[index]) return false; state.selectedNode = index; notify(); return true; },
    move(direction, meters) {
      if (!editable() || state.mode !== "revise") return;
      if (state.selectedNode === null) throw new Error("请点击地图上的节点");
      if (!PIPE_DISTANCES.includes(meters) || ![1, 2, 3, 4].includes(direction)) throw new Error("移动选项无效");
      state.draft.coordinates[state.selectedNode] = point(moveMeters(state.draft.coordinates[state.selectedNode], meters, { 1: 0, 2: 180, 3: 270, 4: 90 }[direction])); notify();
    },
    changeProperties(properties) { if (!editable() || !state.draft) return; for (const key of ["name", "pipe_diameter", "type", "pre", "ph", "cl2"]) if (key in properties) state.draft.properties[key] = clone(properties[key]); notify(); },
    toggleDirection(index) { if (!editable() || !state.draft || ![0, 1].includes(state.draft.directions[index])) return; state.draft.directions[index] = state.draft.directions[index] === 0 ? 1 : 0; notify(); },
    previewLength() {
      if (!state.draft) return 0;
      const coords = storage(state.draft), model = state.draft.model;
      if (!model || model.segmentIndex === null) return roundLength(coords);
      return Math.round(model.raw.geometry.coordinates.reduce((n, c, i) => n + roundLength(i === model.segmentIndex ? coords : c), 0) * 10) / 10;
    },
    async add(data) {
      if (state.mode !== "add") throw new Error("请先开始添加管线");
      const draft = clone(state.draft), f = data.features?.[0];
      if (data.features?.length !== 1 || f?.geometry?.type !== "LineString" || Number(f.properties.city_town) !== draft.regionId) throw new Error("管线格式或所属区域不正确");
      draft.properties = clone(f.properties); delete draft.properties.city_town; valid(draft);
      const coordinates = storage(draft), payload = { requestId: draft.requestId, regionId: draft.regionId, coordinateSource: NEW_PIPE_PROFILE, coordinates, directions: draft.directions, properties: draft.properties };
      await commit("add", payload, { ...payload, segmentIndex: null }); return { code: 200 };
    },
    async saveRevision() {
      if (state.mode !== "revise") throw new Error("请选择要校正的管线");
      const d = clone(state.draft); valid(d);
      if (!d.properties.name?.trim()) throw new Error("管线名称不能为空");
      if (d.properties.name.length > 10) throw new Error("管线名称最多10个字符");
      const payload = { id: d.model.parentId, regionId: d.regionId, requestId: d.requestId, expected: d.model.raw, segmentIndex: d.model.segmentIndex, coordinates: storage(d), directions: d.directions, properties: d.properties };
      await commit("revise", payload, { ...payload, otherParts: d.model.segmentIndex === null ? null : d.model.raw.geometry.coordinates });
    },
    async remove(model, regionId, entireParent = false) {
      if (!model || model.coordinateSpace !== "map-WGS84") throw new Error("请选择要删除的管线");
      if (model.segmentIndex !== null && !entireParent) throw new Error("多段管线的子段不能单独删除，请核实后删除整条父管线");
      await commit("remove", { id: model.parentId, regionId: Number(regionId), expected: model.raw, entireParent }, { id: model.parentId, regionId: Number(regionId), segmentIndex: null });
    },
    async verifyPending() {
      if (disposed || state.busy || !state.pending) return;
      state.busy = true; notify();
      try { await readback(state.pending); } catch (error) { state.error = `回读未确认：${error.message}`; throw error; } finally { state.busy = false; notify(); }
    },
    dispose() { disposed = true; },
  };
}
