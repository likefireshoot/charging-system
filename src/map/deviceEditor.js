import { validatePoint, moveMeters } from "./geometry";
import { NEW_DEVICE_PROFILE, writeStoragePoint } from "./coordinates";
import { adaptRecords } from "./legacyAdapters";

export const DEVICE_DISTANCES = [1, 5, 10, 20, 50, 100, 200, 300];
export const DEVICE_ANGLES = [5, 10, 15, 45, 90, 180];
const clone = value => structuredClone(value);
const samePoint = (a, b) => a.every((value, index) => Math.abs(value - b[index]) <= 1e-9);
const inRange = value => {
  const point = validatePoint(value);
  if (point[0] < 73 || point[0] > 136 || point[1] < 2 || point[1] > 54) throw new Error("设备位置超出当前地图范围");
  return point;
};

// Drafts never mutate loaded records. A 200 response alone is not save success:
// every mutation must be observed in the original region list before completion.
export function createDeviceEditor({ api, onChange, onSaved, uuid = () => crypto.randomUUID() }) {
  const state = { mode: null, draft: null, busy: false, error: "", pending: null };
  let disposed = false;
  const snapshot = () => clone(state);
  const notify = () => { if (!disposed) onChange(snapshot()); };
  const editable = () => !disposed && !state.busy && !state.pending;
  function cancel() {
    if (!editable()) return false;
    state.mode = null; state.draft = null; state.error = ""; notify(); return true;
  }
  async function readback(pending) {
    const raw = await api.devices(pending.regionId);
    const record = raw.find(item => String(item.id) === String(pending.id));
    if (pending.kind === "remove") {
      if (record) throw new Error("删除结果尚未回读确认");
    } else {
      if (!record || !samePoint(record.position, pending.position) || Number(record.rotationAngle) !== pending.angle)
        throw new Error("设备保存结果与回读不一致");
      if (pending.kind === "add" && record.externInfo?._mapSource?.r !== pending.requestId)
        throw new Error("新增设备坐标来源尚未回读确认");
      const adapted = adaptRecords([record], "devices");
      if (!adapted.models.length) throw new Error("保存记录无法按明确来源定位");
    }
    if (disposed) return false;
    // Refresh the page from records already read, not optimistic draft state.
    await onSaved({ kind: pending.kind, id: pending.id, regionId: pending.regionId, records: raw });
    if (disposed) return false;
    state.pending = null; state.mode = null; state.draft = null; state.error = "";
    return true;
  }
  async function commit(kind, payload, expected) {
    if (!editable()) throw new Error("请等待当前操作或先核对保存结果");
    state.busy = true; state.error = ""; notify();
    let submitted = false;
    try {
      const result = kind === "add" ? await api.add(payload) : kind === "revise" ? await api.revise(payload) : await api.remove(payload);
      submitted = true;
      if (disposed) return;
      const pending = { ...expected, kind, id: kind === "add" ? result?.id : expected.id };
      if (pending.id === null || pending.id === undefined) throw new Error("接口未返回设备 ID，请刷新核对");
      state.pending = pending;
      await readback(pending);
    } catch (error) {
      if (!disposed) state.error = submitted ? `已提交，回读未确认：${error.message}。请点击“核对保存结果”，不要重复提交。` : error.message;
      throw new Error(state.error || error.message);
    } finally {
      state.busy = false; notify();
    }
  }
  return {
    snapshot, cancel,
    beginAdd(regionId) {
      if (!editable()) return false;
      if (!Number.isInteger(Number(regionId)) || Number(regionId) <= 0) throw new Error("请选择所属区域");
      state.mode = "add"; state.draft = { regionId: Number(regionId), requestId: uuid(), position: null }; state.error = ""; notify(); return true;
    },
    point(value) {
      if (!editable() || state.mode !== "add") return false;
      state.draft.position = inRange(value); notify(); return true;
    },
    beginRevise(model, regionId) {
      if (!editable()) return false;
      if (!model || model.coordinateSpace !== "map-WGS84") throw new Error("请先选择可定位的设备");
      writeStoragePoint(model.position, model.storageProfile);
      state.mode = "revise"; state.draft = { regionId: Number(regionId), model: clone(model), position: [...model.position], angle: model.angle }; state.error = ""; notify(); return true;
    },
    move(direction, meters) {
      if (!editable() || state.mode !== "revise") return;
      if (!DEVICE_DISTANCES.includes(meters) || ![1, 2, 3, 4].includes(direction)) throw new Error("移动选项无效");
      state.draft.position = inRange(moveMeters(state.draft.position, meters, { 1: 0, 2: 180, 3: 270, 4: 90 }[direction])); notify();
    },
    rotate(direction, degrees) {
      if (!editable() || state.mode !== "revise") return;
      if (!DEVICE_ANGLES.includes(degrees) || ![1, 2].includes(direction)) throw new Error("旋转选项无效");
      state.draft.angle += direction === 1 ? degrees : -degrees; notify();
    },
    async add(geoJson) {
      if (state.mode !== "add" || !state.draft?.position) throw new Error("请在地图上选择设备位置");
      const draft = clone(state.draft), data = clone(geoJson), feature = data.features?.[0];
      if (data.features?.length !== 1 || feature?.geometry?.type !== "Point") throw new Error("新增设备格式无效");
      if (Number(feature.properties.city_town) !== draft.regionId) throw new Error("设备所属区域已变化，请重新选择");
      feature.geometry.coordinates = writeStoragePoint(inRange(draft.position), NEW_DEVICE_PROFILE);
      await commit("add", { coordinateSource: NEW_DEVICE_PROFILE, requestId: draft.requestId, data },
        { regionId: draft.regionId, requestId: draft.requestId, position: feature.geometry.coordinates, angle: Number(feature.properties.rotation_angle || 0) });
      return { code: 200 };
    },
    async saveRevision() {
      if (state.mode !== "revise") throw new Error("请先选择要校正的设备");
      const draft = clone(state.draft);
      // Preserve original raw coordinates bit for bit when only changing angle.
      const storage = samePoint(draft.position, draft.model.position) ? [...draft.model.raw.position] : writeStoragePoint(inRange(draft.position), draft.model.storageProfile);
      if (!Number.isInteger(draft.angle)) throw new Error("设备旋转角度无效");
      await commit("revise", { id: draft.model.id, position: [storage[1], storage[0]], rotationAngle: draft.angle },
        { id: draft.model.id, regionId: draft.regionId, position: storage, angle: draft.angle });
    },
    async remove(model, regionId) {
      if (!model || model.coordinateSpace !== "map-WGS84") throw new Error("请选择要删除的设备");
      await commit("remove", model.id, { id: model.id, regionId: Number(regionId) });
    },
    async verifyPending() {
      if (disposed || state.busy || !state.pending) return;
      state.busy = true; notify();
      try { await readback(state.pending); }
      catch (error) { state.error = `回读未确认：${error.message}`; throw error; }
      finally { state.busy = false; notify(); }
    },
    dispose() { disposed = true; },
  };
}
