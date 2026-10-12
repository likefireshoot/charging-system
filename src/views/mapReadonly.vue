<template>
  <div ref="uiRoot" class="readonly-map-page map-ui" data-testid="readonly-page">
    <div ref="canvas" class="readonly-canvas"></div>
    <div class="readonly-toolbar">
      <strong>水务地图 · 只读</strong>
      <label>所属区域
        <select data-testid="region-select" :value="state.regionId" :disabled="state.busy || !state.regions.length"
          @change="changeRegion($event.target.value)">
          <option v-if="!state.regions.length" value="">暂无区域</option>
          <option v-for="region in state.regions" :key="region.id" :value="region.id">{{ region.name }}</option>
        </select>
      </label>
      <form @submit.prevent="search">
        <input v-model="name" data-testid="device-search" aria-label="设备名称" placeholder="请输入设备名称…" />
        <button data-testid="search-submit" :disabled="state.busy || state.searchBusy || !state.regions.length">搜索设备</button>
      </form>
      <button data-testid="search-clear" @click="controller.clearSearch()">清除查询</button>
      <button data-testid="refresh" :disabled="state.busy" @click="refresh">刷新</button>
      <button data-testid="national-view" :disabled="!ready" @click="session.national()">全国视野</button>
      <router-link to="/map">返回水务地图</router-link>
    </div>
    <div class="readonly-status" aria-live="polite" data-testid="map-status">
      <p v-if="!ready && !mapError">正在加载中国底图…</p>
      <p v-if="state.busy">正在查询区域数据…</p>
      <p v-if="state.searchBusy">正在搜索设备…</p>
      <p v-if="state.notice">{{ state.notice }}</p>
      <p v-for="error in state.errors" :key="error" class="error">{{ error }}</p>
      <p v-if="mapError" class="error">地图加载失败：{{ mapError }}</p>
      <p v-if="state.pending.length" class="warning">{{ state.pending.length }} 条记录暂未定位，原因见右侧列表。</p>
    </div>
    <div class="readonly-types" aria-label="设备类型筛选">
      <button v-for="type in deviceTypes" :key="type.id" :data-testid="'type-' + type.id"
        :class="{ active: state.types.includes(type.id) }" :aria-pressed="state.types.includes(type.id)"
        @click="controller.toggleType(type.id)">
        <img :src="toolbarIcon(type.toolbar, state.types.includes(type.id))" alt="" />{{ type.name }}
      </button>
    </div>
    <aside class="readonly-properties" data-testid="property-panel">
      <header><h2>设备 / 管线属性</h2><span>只读</span></header>
      <div class="readonly-tabs">
        <button data-testid="tab-devices" :class="{ active: tab === 'device' }" @click="tab = 'device'">设备 {{ state.visibleDevices.length }}</button>
        <button data-testid="tab-pipes" :class="{ active: tab === 'pipe' }" @click="tab = 'pipe'">管线 {{ state.pipes.length }}</button>
      </div>
      <MapPipeLegend v-if="tab === 'pipe'" />
      <div class="readonly-record-list">
        <button v-for="item in list" :key="item.id" :data-testid="'record-' + tab + '-' + item.id"
          :class="{ active: state.selected?.kind === tab && state.selected?.id === item.id }" @click="locate(tab, item.id)">
          <span>{{ item.name }}</span><small>ID {{ item.id }} · {{ tab === 'device' ? typeName(item.type) : (item.diameter ?? '未知') + ' mm' }}</small>
          <em v-if="tab === 'device' && item.exception === 1">异常</em>
        </button>
        <p v-if="!list.length" class="readonly-empty">{{ state.busy ? '查询中…' : '暂无匹配记录' }}</p>
      </div>
      <section v-if="selection" class="readonly-detail" data-testid="selected-details">
        <h3>{{ state.selected.kind === 'device' ? '设备详情' : '管线详情' }}</h3>
        <dl><template v-for="([label, value], index) in details" :key="index"><dt>{{ label }}</dt><dd>{{ value }}</dd></template></dl>
        <p v-for="issue in selection.issues || []" :key="issue" class="warning">{{ issue }}</p>
        <button @click="locate(state.selected.kind, selection.id)">定位选中记录</button>
      </section>
      <section v-if="state.pending.length" class="readonly-pending" data-testid="pending-records">
        <h3>暂未定位</h3><p v-for="(item, index) in state.pending" :key="index">{{ item.name }}（ID {{ item.id ?? '缺失' }}）：{{ item.reason }}</p>
      </section>
      <footer>鼠标悬停可查看设备信息，点击设备或管线可选择并定位。此页面仅供查询。</footer>
    </aside>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useMapUiLayout } from "@/map/mapUiLayout";
import "@/map/mapUi.scss";
import MapPipeLegend from "@/map/MapPipeLegend.vue";
import { readonlyApi } from "@/map/readonlyApi";
import { createReadonlyController } from "@/map/readonlyController";
import { createReadonlySession } from "@/map/readonlySession";
import { deviceTypes, deviceDetails, pipeDetails, typeName } from "@/map/legacyAdapters";

const canvas = ref(null), name = ref(""), ready = ref(false), mapError = ref(""), tab = ref("device");
const uiRoot = ref(null), uiLayout = useMapUiLayout(uiRoot);
let session, unmounted = false;
const controller = createReadonlyController({ api: readonlyApi, onChange: update });
const state = ref(controller.snapshot());
const list = computed(() => tab.value === "device" ? state.value.visibleDevices : state.value.pipes);
const selection = computed(() => {
  const selected = state.value.selected;
  return selected && (selected.kind === "device" ? state.value.devices : state.value.pipes).find(item => String(item.id) === String(selected.id));
});
const details = computed(() => selection.value ? state.value.selected.kind === "device" ? deviceDetails(selection.value) : pipeDetails(selection.value) : []);
function toolbarIcon(index, active) { return require(`@/assets/device/icon${index + (active ? 1 : 0)}.svg`); }
function update(snapshot) {
  if (unmounted) return;
  state.value = snapshot;
  session?.setData(snapshot.visibleDevices, snapshot.pipes); session?.select(snapshot.selected);
  if (snapshot.selected) tab.value = snapshot.selected.kind;
}
async function changeRegion(id) {
  name.value = ""; await controller.selectRegion(id);
  if (!unmounted && ready.value && String(state.value.regionId) === String(id)) session.fitAll();
}
async function refresh() {
  if (!state.value.regions.length) {
    const user = JSON.parse(sessionStorage.getItem("userData") || "null");
    await controller.load(user?.companyId);
  } else await controller.refresh();
  if (!unmounted && ready.value) session.fitAll();
}
async function search() {
  const first = await controller.search(name.value);
  if (first && !unmounted && ready.value) session.locate("device", first.id);
}
function locate(kind, id) {
  controller.select(kind, id);
  if (ready.value) session.locate(kind, id);
}
onMounted(async () => {
  session = createReadonlySession({ container: canvas.value, onSelect: (kind, id) => controller.select(kind, id),
    fitPadding: uiLayout.fitPadding, onError: message => { if (!unmounted) mapError.value = message; } });
  // Diagnostics expose no credential, API, edit, or write operation. They support
  // local projection, duplicate-layer and cleanup checks for this migration.
  window.__mapReadonly = { get map() { return session.map; }, snapshot: controller.snapshot, diagnostics: session.diagnostics, uiLayout: uiLayout.diagnostics };
  const user = JSON.parse(sessionStorage.getItem("userData") || "null");
  const dataReady = controller.load(user?.companyId);
  ready.value = await session.ready;
  await dataReady;
  if (unmounted) return;
  session.setData(state.value.visibleDevices, state.value.pipes);
  if (ready.value) session.fitAll();
});
onUnmounted(() => {
  unmounted = true; controller.dispose(); session?.dispose(); delete window.__mapReadonly;
});
</script>

<style lang="scss" scoped>
.readonly-map-page { position: relative; width: 100%; height: 100%; overflow: hidden; color: #344c42; }
.readonly-canvas { width: 100%; height: 100%; }
.readonly-toolbar { position: absolute; z-index: 3; top: 20px; left: 20px; right: 20px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
  pointer-events: none; > * { pointer-events: auto; } strong { padding: 12px 16px; color: #fff; background: #46b97e; border-radius: 6px; font-size: 20px; }
  label, form { display: flex; align-items: center; gap: 12px; } label { padding: 4px 12px; background: #fff; border-radius: 6px; }
  select, input { background: #fff; padding: 12px; border-radius: 6px; font-size: 18px; } select { max-width: 240px; } input { width: 220px; }
  button, a { background: #fff; border-radius: 6px; color: #3b6950; font-size: 18px; padding: 12px 16px; box-shadow: 0 2px 8px #14352620; text-decoration: none; }
}
button { cursor: pointer; font-family: inherit; } button:disabled { opacity: .5; cursor: default; }
.readonly-status { position: absolute; top: 100px; left: 180px; right: 450px; z-index: 2; font-size: 18px; pointer-events: none;
  p { padding: 10px 14px; margin-bottom: 6px; background: #ffffffed; border-radius: 6px; } }
.error { color: #bb3434; } .warning { color: #9d681b; }
.readonly-types { position: absolute; left: 20px; bottom: 110px; z-index: 3; display: flex; flex-direction: column; gap: 10px; max-height: calc(100% - 240px); overflow-y: auto;
  button { display: flex; align-items: center; gap: 8px; font-size: 20px; background: #fff; color: #585657; width: 135px; min-height: 42px; padding: 10px 12px; border-radius: 6px; box-shadow: 0 2px 8px #14352620;
    img { height: 24px; width: 24px; } &.active { background: #46b97e; color: #fff; } } }
.readonly-properties { position: absolute; top: 115px; bottom: 60px; right: 20px; z-index: 3; width: 400px; border-radius: 10px; background: #ffffffed; box-shadow: 0 4px 18px #14352625;
  display: flex; flex-direction: column; overflow-y: auto; padding: 18px; box-sizing: border-box;
  header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; h2 { font-size: 22px; } span { color: #46b97e; border: 1px solid #46b97e; border-radius: 5px; font-size: 16px; padding: 3px 8px; } }
  footer { font-size: 16px; color: #75847c; line-height: 1.7; margin-top: 15px; }
}
.readonly-tabs { display: flex; gap: 8px; margin-bottom: 15px;
  button { flex: 1; background: #eef5f0; padding: 10px; font-size: 18px; border-radius: 6px; } .active { background: #46b97e; color: #fff; } }
.readonly-record-list { max-height: 290px; overflow: auto; flex-shrink: 0;
  button { width: 100%; text-align: left; background: #f3f6f4; border: 1px solid transparent; padding: 12px; margin-bottom: 8px; border-radius: 6px;
    span { display: block; font-size: 20px; overflow-wrap: anywhere; } small { font-size: 16px; color: #6f8177; } em { color: #c23737; margin-left: 8px; } &.active { border-color: #46b97e; background: #e5f5ec; } } }
.readonly-detail { margin-top: 15px; h3 { font-size: 20px; margin-bottom: 12px; } dl { display: grid; grid-template-columns: 100px 1fr; gap: 10px; font-size: 17px;
  dt { color: #78867d; } dd { overflow-wrap: anywhere; } } button { margin-top: 15px; width: 100%; border-radius: 6px; padding: 10px; background: #46b97e; color: #fff; font-size: 18px; } }
.readonly-pending { font-size: 17px; line-height: 1.8; margin-top: 15px; h3 { color: #9d681b; } p { overflow-wrap: anywhere; } }
.readonly-empty { padding: 20px; text-align: center; color: #819188; font-size: 18px; }
@media (max-width: 1300px) { .readonly-toolbar { gap: 8px; } .readonly-properties { top: 180px; width: 350px; } .readonly-status { top: 170px; right: 380px; left: 170px; } }
</style>

<style lang="scss">
.readonly-map-page {
  .readonly-device { width: 44px; height: 44px; border: 3px solid white; border-radius: 50%; background: var(--device-color, #46b97e); position: absolute;
    cursor: pointer; box-shadow: 0 2px 7px #153d4e60; z-index: 1; padding: 5px; box-sizing: border-box;
    .device-symbol { width: 28px; height: 28px; pointer-events: none; } .device-name { position: absolute; top: 46px; left: 50%; transform: translateX(-50%);
      white-space: nowrap; padding: 3px 7px; border-radius: 4px; background: #ffffffec; color: #315544; font-size: 17px; }
    .exception-badge { position: absolute; top: -9px; right: -9px; background: #db4141; color: #fff; border-radius: 50%; width: 22px; height: 22px; font-size: 18px; line-height: 22px; }
    .closed-badge { position: absolute; right: -11px; bottom: -7px; background: #61576b; color: white; border-radius: 4px; font-size: 13px; padding: 1px 3px; }
    &.is-selected { background: #167bd4; border-color: #ffce42; z-index: 2; }
    &.is-overview { width: 12px; height: 12px; border-width: 2px; padding: 0; .device-symbol, .device-name, .closed-badge { display: none; } .exception-badge { width: 10px; height: 10px; font-size: 0; top: -5px; right: -5px; } }
  }
  .readonly-popup { color: #315044; font-family: Microsoft YaHei, sans-serif; font-size: 16px; line-height: 1.8; p { overflow-wrap: anywhere; } strong { font-weight: 500; } }
}
</style>
