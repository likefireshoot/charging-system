<template>
  <div ref="uiRoot" class="readonly-map-page device-map-page map-ui" data-testid="devices-page">
    <div ref="canvas" class="readonly-canvas"></div>
    <MapPanControl :map="session?.map" :ready="ready" />
    <div class="readonly-toolbar">
      <strong>水务地图</strong>
      <label>所属区域
        <select data-testid="region-select" :value="state.regionId" :disabled="locked || state.busy || !state.regions.length" @change="changeRegion($event)">
          <option v-if="!state.regions.length" value="">暂无区域</option>
          <option v-for="region in state.regions" :key="region.id" :value="region.id">{{ region.name }}</option>
        </select>
      </label>
      <form @submit.prevent="search">
        <input v-model="name" data-testid="device-search" aria-label="设备名称" placeholder="请输入设备名称…" :disabled="locked" />
        <button data-testid="search-submit" :disabled="locked || state.busy || state.searchBusy || !state.regions.length">搜索设备</button>
      </form>
      <button data-testid="search-clear" :disabled="locked" @click="clearSearch">清除查询</button>
      <button data-testid="refresh" :disabled="locked || state.busy" @click="refresh">刷新</button>
      <button data-testid="national-view" :disabled="!ready" @click="session.national()">全国视野</button>
      <MapViewControl :map="session?.map" :view="session?.view" :ready="ready" :disabled="locked" />
    </div>
    <div class="readonly-status" aria-live="polite" data-testid="map-status">
      <p v-if="!ready && !mapError">正在加载中国底图…</p>
      <p v-if="state.busy">正在查询区域数据…</p>
      <p v-if="edit.busy">正在保存并核对设备…</p>
      <p v-if="edit.mode === 'add' && !edit.busy">请点击地图选择设备位置，再填写右侧表单。</p>
      <p v-if="edit.mode === 'revise'">正在预览设备校正；点击保存后生效，关闭可放弃。</p>
      <p v-if="edit.error" class="error">{{ edit.error }}</p>
      <p v-if="pipeEdit.busy">正在保存并核对管线…</p>
      <p v-if="pipeEdit.mode === 'add' && !pipeEdit.busy">请点击地图依次选点；右侧可清空或删除节点。至少两个节点才能保存。</p>
      <p v-if="pipeEdit.mode === 'revise'">点击橙色草稿上的节点，再使用右侧面板按米移动；保存后生效。</p>
      <p v-if="pipeEdit.error" class="error">{{ pipeEdit.error }}</p>
      <button v-if="pipeEdit.pending" data-testid="verify-pipe-save" :disabled="pipeEdit.busy" @click="verifyPipeSave">核对管线保存结果</button>
      <p v-if="state.notice">{{ state.notice }}</p>
      <p v-for="error in state.errors" :key="error" class="error">{{ error }}</p>
      <p v-if="mapError" class="error">地图加载失败：{{ mapError }}</p>
      <button v-if="edit.pending" data-testid="verify-save" :disabled="edit.busy" @click="verifySave">核对保存结果</button>
    </div>
    <div class="readonly-types" aria-label="设备类型筛选">
      <button v-for="type in deviceTypes" :key="type.id" :data-testid="'type-' + type.id" :disabled="locked"
        :class="{ active: state.types.includes(type.id) }" :aria-pressed="state.types.includes(type.id)" @click="toggleType(type.id)">
        <img :src="toolbarIcon(type.toolbar, state.types.includes(type.id))" alt="" />{{ type.name }}
      </button>
    </div>
    <nav class="device-tools" aria-label="地图操作">
      <button data-testid="tool-add" :disabled="locked || !ready || state.busy || !state.regionId" :class="{ active: tool === 'add' }" :aria-pressed="tool === 'add'" @click="setTool('add')"><MapToolIcon name="device-add" />设备添加</button>
      <button data-testid="tool-revise" :disabled="locked || !ready || state.busy" :class="{ active: tool === 'revise' }" :aria-pressed="tool === 'revise'" @click="setTool('revise')"><MapToolIcon name="device-revise" />设备校正</button>
      <button data-testid="tool-devices" :disabled="locked" :class="{ active: tool === 'device' }" :aria-pressed="tool === 'device'" @click="setTool('device')"><MapToolIcon name="device-info" />设备属性</button>
      <button data-testid="tool-pipe-add" :disabled="locked || !ready || state.busy || !state.regionId" :class="{ active: tool === 'pipe-add' }" :aria-pressed="tool === 'pipe-add'" @click="setTool('pipe-add')"><MapToolIcon name="pipe-add" />管线添加</button>
      <button data-testid="tool-pipe-revise" :disabled="locked || !ready || state.busy" :class="{ active: tool === 'pipe-revise' }" :aria-pressed="tool === 'pipe-revise'" @click="setTool('pipe-revise')"><MapToolIcon name="pipe-revise" />管线校正</button>
      <button data-testid="tool-pipes" :disabled="locked" :class="{ active: tool === 'pipe' }" :aria-pressed="tool === 'pipe'" @click="setTool('pipe')"><MapToolIcon name="pipe-info" />管线属性</button>
    </nav>
    <div v-if="edit.mode === 'add'" class="device-form" data-testid="add-panel">
      <DeviceAdd :show="true" :all-town-select="state.regionId" :click-position="edit.draft?.position" :submit-device="submitDevice" :busy="locked"
        @update:show="closeTool" @deviceAdded="added" />
    </div>
    <div v-if="tool === 'revise'" class="device-form" data-testid="revise-panel">
      <Coordinate :show="true" :check-market="checkMarket" :edit-actions="editActions" :busy="locked" @update:show="closeTool" />
    </div>
    <div v-if="pipeEdit.mode === 'add'" class="device-form" data-testid="pipe-add-panel">
      <PolylineAdd :show="true" :all-town-select="state.regionId" :draft-coordinates="pipeEdit.draft.coordinates" :submit-pipe="submitPipe" :busy="locked" :preview-length="pipeLength"
        @update:show="closeTool" @updatePoints="replacePipePoints" @polylineAdded="pipeAdded" />
    </div>
    <div v-if="tool === 'pipe-revise'" class="device-form" data-testid="pipe-revise-panel">
      <PolylineCorrect :show="true" :check-line="checkPipe" :selected-point="selectedNode" :edit-actions="pipeActions" :busy="locked" :pipe-draft="pipeEdit.draft" :preview-length="pipeLength" @update:show="closeTool" />
    </div>
    <aside v-if="tool === 'device' || tool === 'pipe'" class="readonly-properties" data-testid="property-panel">
      <header><div class="map-panel-heading"><h2>{{ tool === 'device' ? '设备属性' : '管线属性' }}</h2><p>{{ tool === 'device' ? typeName(propertyType) : '区域管线' }} · {{ allList.length }} 条记录</p></div><button data-testid="close-properties" :disabled="locked" @click="tool = null">关闭</button></header>
      <div v-if="tool === 'device'" class="device-property-tabs">
        <button v-for="type in deviceTypes" :key="type.id" :disabled="locked" :data-testid="'property-type-' + type.id" :class="{ active: propertyType === type.id }" @click="propertyType = type.id; page = 1">{{ type.name }}</button>
      </div>
      <MapPipeLegend v-if="tool === 'pipe'" />
      <div class="readonly-record-list">
        <div v-for="(item, index) in list" :key="item.id" class="device-property-row">
          <button :data-testid="'record-' + tool + '-' + item.id" :disabled="locked" :class="{ active: String(state.selected?.id) === String(item.id) && state.selected?.kind === tool }" @click="locate(tool, item.id)">
            <span>{{ (page - 1) * pageSize + index + 1 }}. {{ item.name }}</span><small>ID {{ item.id }} · {{ tool === 'device' ? typeName(item.type) : (item.diameter ?? '未知') + ' mm' }}</small>
            <span v-if="tool === 'pipe'">长度 {{ item.length ?? '-' }} m · 查看定位{{ item.segmentIndex === null ? '' : ' · 子段 ' + (item.segmentIndex + 1) }}</span>
            <span v-if="tool === 'device'">{{ typeSummary(item) }}</span><em v-if="item.exception === 1">异常</em>
          </button>
          <button v-if="tool === 'pipe'" :data-testid="'delete-pipe-' + item.id" class="device-delete" :disabled="locked" @click="removePipe(item)">{{ item.segmentIndex === null ? '删除' : '删除整条' }}</button>
          <button v-if="tool === 'device'" :data-testid="'delete-' + item.id" class="device-delete" :disabled="locked" @click="remove(item)">删除</button>
        </div>
        <p v-if="!list.length" class="readonly-empty">{{ state.busy ? '查询中…' : '暂无匹配记录' }}</p>
      </div>
      <div class="device-pagination">
        <button data-testid="page-prev" :disabled="locked || page <= 1" @click="page--">上一页</button><span>{{ page }} / {{ pages }}</span>
        <button data-testid="page-next" :disabled="locked || page >= pages" @click="page++">下一页</button>
      </div>
      <section v-if="selection" class="readonly-detail" data-testid="selected-details">
        <h3>{{ state.selected.kind === 'device' ? '设备详情' : '管线详情' }}</h3>
        <dl><template v-for="([label, value], index) in details" :key="index"><dt>{{ label }}</dt><dd>{{ value }}</dd></template></dl>
        <p v-for="issue in selection.issues || []" :key="issue" class="warning">{{ issue }}</p>
        <button v-if="state.selected.kind === 'device'" data-testid="correct-selected" :disabled="locked" @click="setTool('revise')">校正选中设备</button>
        <button v-if="state.selected.kind === 'pipe'" data-testid="correct-pipe-selected" :disabled="locked" @click="setTool('pipe-revise')">校正选中管线</button>
      </section>
      <section v-if="state.pending.length" class="readonly-pending" data-testid="pending-records">
        <h3>暂未定位</h3><p v-for="(item, index) in state.pending" :key="index">{{ item.name }}（ID {{ item.id ?? '缺失' }}）：{{ item.reason }}</p>
      </section>
    </aside>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import { useMapUiLayout } from "@/map/mapUiLayout";
import "@/map/mapUi.scss";
import "@/map/waterMapTheme.scss";
import MapToolIcon from "@/map/MapToolIcon.vue";
import MapPipeLegend from "@/map/MapPipeLegend.vue";
import MapPanControl from "@/map/MapPanControl.vue";
import MapViewControl from "@/map/MapViewControl.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import eventBus from "@/api/eventBus";
import DeviceAdd from "@/components/map/deviceAdd.vue";
import PolylineAdd from "@/components/map/polylineAdd.vue";
import PolylineCorrect from "@/components/map/polylineCorrect.vue";
import { pipeApi } from "@/map/pipeApi";
import { createPipeEditor } from "@/map/pipeEditor";
import { createPipeDraftSession } from "@/map/pipeDraftSession";
import Coordinate from "@/components/map/coordinate.vue";
import { deviceApi } from "@/map/deviceApi";
import { createDeviceEditor } from "@/map/deviceEditor";
import { createReadonlyController } from "@/map/readonlyController";
import { createReadonlySession } from "@/map/readonlySession";
import { deviceTypes, deviceDetails, pipeDetails, typeName } from "@/map/legacyAdapters";

const canvas = ref(null), name = ref(""), ready = ref(false), mapError = ref(""), tool = ref(null), propertyType = ref(1), page = ref(1), pageSize = 20;
const uiRoot = ref(null), uiLayout = useMapUiLayout(uiRoot);
let session, pipeDraftSession, unmounted = false;
const controller = createReadonlyController({ api: deviceApi, onChange: update });
const state = ref(controller.snapshot());
const editor = createDeviceEditor({ api: deviceApi, onChange: updateEdit, onSaved });
const edit = ref(editor.snapshot());
const pipeEditor = createPipeEditor({ api: pipeApi, onChange: updatePipeEdit, onSaved: onPipeSaved });
const pipeEdit = ref(pipeEditor.snapshot());
const locked = computed(() => edit.value.busy || !!edit.value.pending || pipeEdit.value.busy || !!pipeEdit.value.pending);
const flowPaused = computed(() => locked.value || !!edit.value.mode || !!pipeEdit.value.mode || ["add", "revise", "pipe-add", "pipe-revise"].includes(tool.value));
function syncFlow() { session?.setFlowPaused(flowPaused.value); }
watch(flowPaused, syncFlow, { flush: "post" });
const pipeLength = computed(() => { pipeEdit.value; return pipeEditor.previewLength(); });
const checkPipe = computed(() => pipeEdit.value.draft?.model ? { ...pipeEdit.value.draft.model, coords: pipeEdit.value.draft.coordinates } : null);
const selectedNode = computed(() => pipeEdit.value.selectedNode === null ? null : { index: pipeEdit.value.selectedNode, coord: pipeEdit.value.draft.coordinates[pipeEdit.value.selectedNode] });
const pipeActions = { move: (direction, meters) => safely(() => pipeEditor.move(direction, meters)), save: () => pipeEditor.saveRevision(), properties: p => pipeEditor.changeProperties(p), direction: index => pipeEditor.toggleDirection(index) };
const allList = computed(() => tool.value === "pipe" ? state.value.pipes : state.value.visibleDevices.filter(item => item.type === propertyType.value));
const pages = computed(() => Math.max(1, Math.ceil(allList.value.length / pageSize)));
const list = computed(() => allList.value.slice((page.value - 1) * pageSize, page.value * pageSize));
watch(pages, value => { if (page.value > value) page.value = value; });
const selection = computed(() => {
  const selected = state.value.selected;
  return selected && (selected.kind === "device" ? state.value.devices : state.value.pipes).find(item => String(item.id) === String(selected.id));
});
const details = computed(() => selection.value ? state.value.selected.kind === "device" ? deviceDetails(selection.value) : pipeDetails(selection.value) : []);
const checkMarket = computed(() => edit.value.mode === "revise" ? { id: edit.value.draft.model.id, name: edit.value.draft.model.name, position: edit.value.draft.position, rotationAngle: edit.value.draft.angle } : null);
const editActions = { move: (direction, meters) => safely(() => editor.move(direction, meters)), rotate: (direction, degrees) => safely(() => editor.rotate(direction, degrees)), save: () => editor.saveRevision() };
function toolbarIcon(index, active) { return require(`@/assets/device/icon${index + (active ? 1 : 0)}.svg`); }
function typeSummary(item) {
  return deviceDetails(item).filter(([label]) => ["状态", "阀门状态", "压力值", "深度", "电流", "电压", "开关"].includes(label) || label.startsWith("口径")).map(([label, value]) => `${label} ${value}`).join(" · ");
}
function safely(action) { try { return action(); } catch (error) { ElMessage.warning(error.message); } }
function render() {
  if (!session || unmounted) return;
  let devices = state.value.visibleDevices;
  const draft = edit.value.draft;
  if (edit.value.mode === "revise") devices = devices.map(item => String(item.id) === String(draft.model.id) ? { ...item, position: draft.position, angle: draft.angle } : item);
  if (edit.value.mode === "add" && draft.position) devices = [...devices, { id: "draft-new", name: "待保存设备", position: draft.position, type: 1, angle: 0, exception: 0, externInfo: {} }];
  const pipeDraft = pipeEdit.value.draft;
  const pipes = pipeEdit.value.mode === "revise" ? state.value.pipes.filter(item => String(item.id) !== String(pipeDraft.model.id)) : state.value.pipes;
  session.setData(devices, pipes); session.select(state.value.selected);
  pipeDraftSession?.setDraft(pipeDraft, pipeEdit.value.selectedNode);
}
function update(snapshot) { if (!unmounted) { state.value = snapshot; render(); } }
function updateEdit(snapshot) { if (!unmounted) { edit.value = snapshot; render(); } }
function updatePipeEdit(snapshot) { if (!unmounted) { pipeEdit.value = snapshot; render(); } }
async function discard() {
  if (locked.value) { ElMessage.warning("请等待保存完成，或先核对保存结果"); return false; }
  const draft = edit.value.draft;
  const pipeDraft = pipeEdit.value.draft;
  const pipeDirty = pipeEdit.value.mode === "add"
    ? !!pipeDraft?.coordinates.length
    : !!pipeDraft?.model && (JSON.stringify(pipeDraft.coordinates) !== JSON.stringify(pipeDraft.model.coordinates) || JSON.stringify(pipeDraft.directions) !== JSON.stringify(pipeDraft.model.directions) || JSON.stringify(pipeDraft.properties) !== JSON.stringify(pipeDraft.model.properties));
  const deviceDirty = edit.value.mode === "add"
    ? !!draft?.position
    : !!draft?.model && (draft.angle !== draft.model.angle || JSON.stringify(draft.position) !== JSON.stringify(draft.model.position));
  const dirty = pipeDirty || deviceDirty;
  if (dirty) {
    try { await ElMessageBox.confirm(pipeDirty ? "放弃本次尚未保存的管线操作？" : "放弃本次尚未保存的设备操作？", pipeDirty ? "退出管线编辑" : "退出设备编辑", { confirmButtonText: "放弃", cancelButtonText: "继续编辑", type: "warning" }); }
    catch (_) { return false; }
  }
  return editor.cancel() && pipeEditor.cancel();
}
async function closeTool() { if (await discard()) tool.value = null; }
async function setTool(next) {
  if (!(await discard())) return;
  if (tool.value === next) { tool.value = null; return; }
  if (next === "add") { safely(() => editor.beginAdd(state.value.regionId)); if (edit.value.mode !== "add") return; }
  if (next === "revise" && state.value.selected?.kind === "device") safely(() => editor.beginRevise(selection.value, state.value.regionId));
  if (next === "pipe-add") { safely(() => pipeEditor.beginAdd(state.value.regionId)); if (pipeEdit.value.mode !== "add") return; }
  if (next === "pipe-revise" && state.value.selected?.kind === "pipe") safely(() => pipeEditor.beginRevise(selection.value, state.value.regionId));
  tool.value = next; page.value = 1;
}
async function select(kind, id) {
  if (locked.value || edit.value.mode === "add" || pipeEdit.value.mode === "add") return false;
  if (tool.value === "revise") {
    if (kind !== "device") return false;
    if (edit.value.mode === "revise" && String(edit.value.draft.model.id) === String(id)) return true;
    if (!(await discard())) return false;
    const model = controller.select(kind, id); safely(() => editor.beginRevise(model, state.value.regionId));
  } else if (tool.value === "pipe-revise") {
    if (kind !== "pipe") return false;
    if (pipeEdit.value.mode === "revise" && String(pipeEdit.value.draft.model.id) === String(id)) return true;
    if (!(await discard())) return false;
    const model = controller.select(kind, id); safely(() => pipeEditor.beginRevise(model, state.value.regionId));
  } else { controller.select(kind, id); tool.value = kind; }
  const model = selection.value;
  if (kind === "device" && model) { propertyType.value = model.type; page.value = 1; }
  return true;
}
async function locate(kind, id) { if (await select(kind, id) && ready.value && !locked.value) session.locate(kind, id); }
async function changeRegion(event) {
  const id = event.target.value;
  if (!(await discard())) { event.target.value = String(state.value.regionId ?? ""); return; }
  name.value = ""; tool.value = null; page.value = 1; await controller.selectRegion(id); if (!unmounted && ready.value) session.fitAll();
}
async function refresh() {
  if (!(await discard())) return;
  if (!state.value.regions.length) { const user = JSON.parse(sessionStorage.getItem("userData") || "null"); await controller.load(user?.companyId); }
  else await controller.refresh();
  page.value = 1; if (!unmounted && ready.value) session.fitAll();
}
async function clearSearch() { if (await discard()) { controller.clearSearch(); page.value = 1; } }
async function search() { if (!(await discard())) return; const first = await controller.search(name.value); if (first && !unmounted && ready.value) { tool.value = "device"; propertyType.value = first.type; page.value = 1; session.locate("device", first.id); } }
async function toggleType(id) { if (await discard()) controller.toggleType(id); }
const submitDevice = data => editor.add(data);
function added() { tool.value = "device"; }
async function onSaved(result) {
  await controller.refresh();
  if (unmounted) return;
  if (state.value.errors.some(error => error.startsWith("设备"))) throw new Error("设备列表刷新失败");
  controller.clearSearch(); tool.value = "device";
  if (result.kind !== "remove") {
    const model = state.value.devices.find(item => String(item.id) === String(result.id));
    if (!model) throw new Error("已保存设备暂未显示，需再次核对");
    propertyType.value = model.type;
    if (!state.value.types.includes(model.type)) controller.toggleType(model.type);
    controller.select("device", model.id);
    page.value = Math.floor(state.value.visibleDevices.filter(item => item.type === model.type).findIndex(item => String(item.id) === String(model.id)) / pageSize) + 1;
    if (ready.value) session.locate("device", model.id);
  }
  eventBus.emit("reGet");
}
async function remove(item) {
  if (locked.value) return;
  try { await ElMessageBox.confirm("确定要删除这个设备吗？删除后不可恢复。", "确认删除", { confirmButtonText: "确定", cancelButtonText: "取消", type: "warning" }); }
  catch (_) { return; }
  try { await editor.remove(item, state.value.regionId); if (!unmounted) ElMessage.success("删除成功"); }
  catch (error) { if (!unmounted) ElMessage.error(error.message); }
}
const submitPipe = data => pipeEditor.add(data);
function replacePipePoints(coords) { safely(() => pipeEditor.replacePoints(coords)); }
function pipeAdded() { tool.value = "pipe"; }
async function onPipeSaved(result) {
  await controller.refresh();
  if (unmounted) return;
  if (state.value.errors.some(error => error.startsWith("管线"))) throw new Error("管线列表刷新失败");
  tool.value = "pipe";
  if (result.kind !== "remove") {
    const model = state.value.pipes.find(item => String(item.id) === String(result.modelId));
    if (!model) throw new Error("已保存管线暂未显示，需再次核对");
    controller.select("pipe", model.id);
    page.value = Math.floor(state.value.pipes.findIndex(item => String(item.id) === String(model.id)) / pageSize) + 1;
  }
  eventBus.emit("reGet");
}
async function removePipe(item) {
  if (locked.value || !(await discard())) return;
  const entireParent = item.segmentIndex !== null;
  try { await ElMessageBox.confirm(entireParent ? `确定删除整条父管线（ID ${item.parentId}）及全部 ${item.raw.geometry.coordinates.length} 个子段吗？此操作不可恢复。` : "确定要删除这条管线吗？删除后不可恢复。", "确认删除", { confirmButtonText: "确定", cancelButtonText: "取消", type: "warning" }); }
  catch (_) { return; }
  try { await pipeEditor.remove(item, state.value.regionId, entireParent); if (!unmounted) ElMessage.success("删除成功"); }
  catch (error) { if (!unmounted) ElMessage.error(error.message); }
}
async function verifyPipeSave() { try { await pipeEditor.verifyPending(); ElMessage.success("管线保存结果已核对"); } catch (error) { ElMessage.error(error.message); } }
async function verifySave() { try { await editor.verifyPending(); ElMessage.success("保存结果已核对"); } catch (error) { ElMessage.error(error.message); } }
onBeforeRouteLeave(to => to.name === "login" || !sessionStorage.getItem("userData") ? true : discard());
onMounted(async () => {
  session = createReadonlySession({ container: canvas.value, onSelect: select, onError: message => { if (!unmounted) mapError.value = message; },
    suppressPopup: () => !!edit.value.mode || !!pipeEdit.value.mode,
    onMapClick: (point, pixel) => {
      if (edit.value.mode === "add") { if (!locked.value) safely(() => editor.point(point)); return true; }
      if (pipeEdit.value.mode === "add") { if (!locked.value) safely(() => pipeEditor.append(point)); return true; }
      if (pipeEdit.value.mode === "revise") { const index = pipeDraftSession?.pickNode(pixel); if (index >= 0) { if (!locked.value) pipeEditor.selectNode(index); return true; } }
      return false;
    },
    fitPadding: uiLayout.fitPadding });
  window.__mapDevices = { get map() { return session.map; }, snapshot: controller.snapshot, editor: editor.snapshot, pipeEditor: pipeEditor.snapshot, pipeDraft: () => pipeDraftSession?.diagnostics(), diagnostics: session.diagnostics, uiLayout: uiLayout.diagnostics };
  const user = JSON.parse(sessionStorage.getItem("userData") || "null"), dataReady = controller.load(user?.companyId);
  ready.value = await session.ready; await dataReady;
  if (unmounted) return; if (ready.value) pipeDraftSession = createPipeDraftSession(session.map); syncFlow(); render(); if (ready.value) session.fitAll();
});
onUnmounted(() => { unmounted = true; editor.dispose(); pipeEditor.dispose(); pipeDraftSession?.dispose(); controller.dispose(); session?.dispose(); delete window.__mapDevices; });
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
.readonly-record-list { flex: 1 1 0; min-height: 0; overflow: auto;
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

<style lang="scss" scoped>
.device-tools { position: absolute; top: 115px; right: 20px; z-index: 4; width: 135px; display: flex; flex-direction: column; gap: 12px;
  button { padding: 14px 8px; font-size: 20px; border-radius: 6px; color: #585657; background: white; box-shadow: 0 2px 8px #14352620; }
  button.active { color: white; background: #46b97e; } button:disabled { opacity: .5; } }
.device-map-page .readonly-properties { right: 180px; width: 550px; }
.device-map-page .readonly-status { right: 760px; }
.device-form :deep(.popCard) { right: 180px; top: 115px; }
.device-property-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0;
  button { padding: 8px 10px; border: 1px solid #ececec; background: white; color: #585657; font-size: 18px; border-radius: 6px; }
  button.active { background: #46b97e; color: white; } }
.device-property-row { display: flex; align-items: center; gap: 8px; > button:first-child { flex: 1; min-width: 0; }
  .device-delete { width: auto; flex: none; white-space: nowrap; color: #d34036; border: none; padding: 10px; } }
.device-pagination { display: flex; justify-content: center; align-items: center; gap: 18px; padding: 10px; font-size: 17px;
  button { padding: 9px; background: #46b97e; color: white; border-radius: 6px; } }
.device-map-page .readonly-status button { pointer-events: auto; padding: 12px; background: #46b97e; color: white; border-radius: 6px; font-size: 18px; }
@media (max-width: 1000px) { .device-map-page .readonly-properties { width: 440px; } .device-map-page .readonly-status { right: 650px; } }
</style>
