import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { formatDateTime, formatHourMinute } from "@/api/being";
import { adaptTracks } from "./trackAdapters";
import { createTrackPlayer } from "./trackPlayer";
import { createTrackSession } from "./trackSession";
import { trackApi } from "./trackApi";

export function useTrackPage(mode) {
  const container = ref(null), userList = ref([]), userSelect = ref(null), busy = ref(false), status = ref(""), mapError = ref("");
  const date = new Date(), yearDate = ref(formatDateTime(date).slice(0, 10));
  const paramData = reactive({ startTime: "00:00", endTime: "23:59", userId: null });
  const videoData = reactive({ playing: false, direction: 0, cursor: 0, total: 0, interval: 1, nowTime: null });
  let model = { tracks: [], points: [], frames: [], pending: [], issues: [] }, session, sourcesPromise, disposed = false, generation = 0, activeQuery;
  const lifetime = new AbortController();
  const player = createTrackPlayer({ onChange(value) { Object.assign(videoData, value); session?.render(model, value.visibleIndex); } });
  const showPlayTool = computed(() => videoData.total > 0);
  function clear() {
    generation++; activeQuery?.abort(); activeQuery = null; busy.value = false;
    model = { tracks: [], points: [], frames: [], pending: [], issues: [] }; player.load([]); status.value = "";
  }
  watch(() => [yearDate.value, paramData.startTime, paramData.endTime, paramData.userId], clear);
  function setUser(item) { paramData.userId = item.staffId; }
  function setDate(value) { yearDate.value = value; }
  function setTime(key, value) { paramData[key] = typeof value === "string" ? value : value?.value; }
  async function getTrack() {
    clear();
    if (!Number.isSafeInteger(Number(paramData.userId)) || Number(paramData.userId) <= 0) { ElMessage.warning("请选择抄表人员"); return; }
    const startTime = `${yearDate.value} ${paramData.startTime}`, endTime = `${yearDate.value} ${paramData.endTime}`;
    const start = new Date(startTime.replace(" ", "T")), end = new Date(endTime.replace(" ", "T"));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(yearDate.value) || ![paramData.startTime, paramData.endTime].every(time => /^([01]\d|2[0-3]):[0-5]\d$/.test(time)) ||
      !Number.isFinite(start.getTime()) || start >= end || formatDateTime(start).slice(0, 10) !== yearDate.value) { ElMessage.warning("请选择有效日期和起止时间"); return; }
    const current = generation; activeQuery = new AbortController(); busy.value = true;
    try {
      const [records, sources, ready] = await Promise.all([trackApi.tracks({ startTime, endTime, userId: Number(paramData.userId) }, activeQuery.signal), sourcesPromise, session.ready]);
      if (disposed || current !== generation) return;
      if (!ready) throw new Error("地图尚未加载成功");
      model = adaptTracks(records, sources, mode); player.load(model.frames); session.fit(model.points);
      if (model.pending.length) status.value = `${model.pending.length} 段轨迹坐标来源待确认，暂不显示位置`;
      if (model.issues.length) status.value += `${status.value ? "；" : ""}${model.issues.join("；")}`;
      if (!model.points.length && !model.pending.length) ElMessage.warning("暂无轨迹");
    } catch (error) {
      if (!disposed && current === generation && error.name !== "AbortError" && error.code !== "ERR_CANCELED") { status.value = error.message || "轨迹查询失败"; ElMessage.error(status.value); }
    } finally { if (!disposed && current === generation) { busy.value = false; activeQuery = null; } }
  }
  function RunPlay() { if (!player.start(1) && videoData.playing) ElMessage.warning("当前正在播放"); }
  function rePlay() { if (!player.start(-1) && videoData.playing) ElMessage.warning("当前正在回放"); }
  function pause() { player.stop(); }
  function setMultiple(action) { if (!player.speed(action)) ElMessage.warning(action === 1 ? "已达到最慢倍数！" : "已达到最大倍数！"); }
  function nowMarket() {}
  const debug = { mode, snapshot: () => ({ busy: busy.value, status: status.value, mapError: mapError.value, params: { ...paramData }, date: yearDate.value,
    pointCount: model.points.length, frameCount: model.frames.length, segmentCount: model.tracks.length, pendingCount: model.pending.length,
    player: player.snapshot(), session: session?.diagnostics() }), get map() { return session?.map; } };
  onMounted(() => {
    session = createTrackSession({ container: container.value, onError: message => { if (!disposed) mapError.value = message; } });
    window.__mapTrackPage = debug;
    sourcesPromise = trackApi.sources(lifetime.signal);
    // Attach rejection handling immediately even before the first query.
    sourcesPromise.catch(error => { if (!disposed && error.name !== "AbortError") status.value = error.message; });
    let companyId;
    try { companyId = JSON.parse(sessionStorage.getItem("userData"))?.companyId; } catch (_) { companyId = null; }
    trackApi.staff(companyId, lifetime.signal).then(records => {
      if (disposed) return; userList.value = records;
      if (records.length) { userSelect.value = records[0].staffName; paramData.userId = records[0].staffId; }
    }).catch(error => { if (!disposed && error.code !== "ERR_CANCELED") { status.value = error.message; ElMessage.error(status.value); } });
  });
  onBeforeUnmount(() => {
    disposed = true; generation++; activeQuery?.abort(); lifetime.abort(); player.dispose(); session?.dispose();
    window.__lastTrackCleanup = { player: player.snapshot(), session: session?.diagnostics() };
    if (window.__mapTrackPage === debug) delete window.__mapTrackPage;
  });
  return { container, userList, userSelect, paramData, videoData, showPlayTool, busy, status, mapError, yearDate,
    setDate, setTime, setUser, getTrack, RunPlay, rePlay, pause, setMultiple, nowMarket, formatHourMinute };
}
