import { adaptRecords, deviceTypes } from "./legacyAdapters";

// Data-only controller. Every request is a query; stale responses cannot replace
// a newer region, search or page instance.
export function createReadonlyController({ api, onChange, sources }) {
  const state = { regions: [], regionId: null, devices: [], pipes: [], pending: [], errors: [],
    types: deviceTypes.map(item => item.id), busy: false, searchBusy: false, searchIds: null, selected: null, notice: "" };
  let disposed = false, generation = 0, searchGeneration = 0;
  const visible = () => state.devices.filter(device => state.types.includes(device.type) &&
    (state.searchIds === null || state.searchIds.some(id => String(id) === String(device.id))));
  const snapshot = () => structuredClone({ ...state, visibleDevices: visible() });
  const notify = () => { if (!disposed) onChange(snapshot()); };
  function validateSelection() {
    const items = state.selected?.kind === "device" ? visible() : state.pipes;
    if (state.selected && !items.some(item => String(item.id) === String(state.selected.id))) state.selected = null;
  }
  async function selectRegion(id) {
    if (disposed || !state.regions.some(region => String(region.id) === String(id))) return;
    const version = ++generation; ++searchGeneration;
    state.regionId = id; state.busy = true; state.searchBusy = false; state.searchIds = null;
    state.selected = null; state.devices = []; state.pipes = []; state.pending = []; state.errors = []; state.notice = ""; notify();
    const results = await Promise.allSettled([api.devices(id), api.pipes(id)]);
    if (disposed || version !== generation) return;
    results.forEach((result, index) => {
      const kind = index === 0 ? "devices" : "pipes";
      if (result.status === "fulfilled") {
        const adapted = adaptRecords(result.value, kind, sources);
        state[kind] = adapted.models; state.pending.push(...adapted.pending);
      } else state.errors.push(`${index === 0 ? "设备" : "管线"}查询失败：${result.reason.message}`);
    });
    state.busy = false;
    if (!state.devices.length && !state.pipes.length && !state.pending.length && !state.errors.length) state.notice = "当前区域暂无设备和管线";
    notify();
  }
  async function load(companyId) {
    const version = ++generation;
    state.busy = true; state.errors = []; notify();
    try {
      const regions = await api.regions(companyId);
      if (disposed || version !== generation) return;
      state.regions = regions.filter(region => region && region.id !== null && region.id !== undefined);
      state.busy = false;
      if (!state.regions.length) { state.notice = "当前账号没有可用区域，请在原系统中配置区域后刷新"; notify(); return; }
      await selectRegion(state.regions[0].id);
    } catch (error) {
      if (disposed || version !== generation) return;
      state.busy = false; state.errors = [`区域查询失败：${error.message}`]; notify();
    }
  }
  return {
    load, selectRegion, snapshot,
    refresh: () => state.regionId === null ? Promise.resolve() : selectRegion(state.regionId),
    toggleType(id) {
      state.types = state.types.includes(id) ? state.types.filter(type => type !== id) : [...state.types, id];
      validateSelection(); notify();
    },
    clearSearch() { ++searchGeneration; state.searchBusy = false; state.searchIds = null; state.notice = ""; validateSelection(); notify(); },
    async search(value) {
      const name = value?.trim();
      if (!name) { state.notice = "请输入设备名称"; notify(); return null; }
      if (state.regionId === null || state.busy || disposed) return null;
      let version = ++searchGeneration;
      const regionVersion = generation;
      state.searchBusy = true; state.notice = ""; notify();
      try {
        // Keep name lookup across the account's available regions. The legacy
        // endpoint itself is global, so verify IDs using each permitted region's
        // list instead of trusting response region names or introducing other companies.
        const found = await api.search(name);
        if (disposed || version !== searchGeneration || regionVersion !== generation) return null;
        const foundIds = new Set(found.map(device => String(device.id)));
        if (foundIds.size && !state.devices.some(device => foundIds.has(String(device.id)))) {
          for (const region of state.regions) {
            if (String(region.id) === String(state.regionId)) continue;
            const records = await api.devices(region.id);
            if (disposed || version !== searchGeneration || regionVersion !== generation) return null;
            const known = adaptRecords(records, "devices", sources).models;
            if (known.some(device => foundIds.has(String(device.id)))) {
              const loading = selectRegion(region.id);
              version = searchGeneration;
              await loading;
              if (disposed || version !== searchGeneration || String(state.regionId) !== String(region.id)) return null;
              break;
            }
          }
        }
        const currentIds = new Set(state.devices.map(device => String(device.id)));
        state.searchIds = found.filter(device => currentIds.has(String(device.id))).map(device => device.id);
        const first = state.devices.find(device => state.searchIds.some(id => String(id) === String(device.id)));
        if (first && !state.types.includes(first.type)) state.types.push(first.type);
        state.selected = first ? { kind: "device", id: first.id } : null;
        state.notice = state.searchIds.length ? `当前区域找到 ${state.searchIds.length} 个设备` : "可用区域没有可定位的匹配设备";
        state.searchBusy = false; notify(); return first || null;
      } catch (error) {
        if (disposed || version !== searchGeneration || regionVersion !== generation) return null;
        state.searchBusy = false;
        if (error.message.includes("无此设备")) {
          state.searchIds = []; state.selected = null; state.notice = "当前区域没有匹配设备";
        } else state.notice = `名称查询失败：${error.message}`;
        notify(); return null;
      }
    },
    select(kind, id) {
      const item = (kind === "device" ? visible() : state.pipes).find(model => String(model.id) === String(id));
      state.selected = item ? { kind, id: item.id } : null; notify(); return item;
    },
    dispose() { disposed = true; ++generation; ++searchGeneration; },
  };
}
