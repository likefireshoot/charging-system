<template>
  <div class="popCard" :class="show ? 'on' : ''">
    <div class="inHead">
      <p>管线属性</p>
      <a class="btn" @click.stop="$emit('update:show', false)">
        <img src="@/assets/close.svg" class="icon" alt="" />
        <img src="@/assets/close2.svg" class="hov" alt="" />
      </a>
      <div class="bottom">
        <div class="icon"></div>
        <div class="icon2"></div>
        <div class="icon3"></div>
        <div class="bd"></div>
      </div>
    </div>

    <div class="inBody">
      <div v-if="listLoading" class="loadingCard">
        <img src="@/assets/loading.svg" alt="" />
      </div>

      <template v-else>
        <dl class="table">
          <dt>
            <div class="item">序号</div>
            <div class="item">名称</div>
            <div class="item">口径</div>
            <div class="item">长度</div>
            <div class="item">操作</div>
          </dt>

          <template v-if="list.length == 0">
            <h2 class="hint">暂无数据...</h2>
          </template>
          <template v-else>
            <dd v-for="(item, index) in list" :key="index">
              <div class="item">
                <p>{{ (param.page - 1) * pageSize + index + 1 }}</p>
              </div>
              <div class="item">
                <h2>{{ item.name }}</h2>
              </div>
              <div class="item">
                <h2>{{ item.diameter }} mm</h2>
              </div>
              <div class="item">
                <h2>{{ item.length || "-" }} m</h2>
              </div>
              <div class="item operation-cell">
                <a class="btn" @click.stop="checkItem(item)">查看定位</a>
                <a class="btn delete-btn" @click.stop="deleteItem(item)">删除</a>
              </div>
            </dd>
          </template>
        </dl>
      </template>
    </div>

    <div class="pagesCard">
      <a class="item" @click.stop="prevPage">上一页</a>
      <a class="item" @click.stop="nextPage">下一页</a>
    </div>
  </div>
</template>

<script setup>
import eventBus from "@/api/eventBus";
import { ElMessage, ElMessageBox } from "element-plus";
import { ref, reactive, watch, getCurrentInstance, defineEmits, onMounted } from "vue";

const { show, allTownSelect } = defineProps(["show", "allTownSelect"]);
const { proxy } = getCurrentInstance();
const emit = defineEmits(["update:show", "lineCheck", "polylineDeleted"]);

const list = ref([]);
const param = reactive({
  city_town: null,
  page: 1,
});
const listLoading = ref(false);
const pageSize = 20; // 每页显示数量

watch(
  () => show,
  (a, b) => {
    if (a) {
      param.city_town = allTownSelect;
      param.page = 1;
      getlist();
    }
  }
);

onMounted(() => {
  eventBus.on("reGet", () => {
    if (show) {
      param.city_town = allTownSelect;
      param.page = 1;
      getlist();
    }
  });
});

// 从GeoJSON数据中提取管线列表（与map.vue中的extractLinesFromGeoJSON保持一致）
function extractPolylineList(geoJsonData) {
  const polylineList = [];

  if (!geoJsonData) return polylineList;

  const pushLine = (coords, props, feature) => {
    polylineList.push({
      coords,
      properties: props || {},
      feature: feature || {},
      name: props?.name || props?.pipe_name || props?.id || `管线-${props?.pipe_diameter || "未知"}mm`,
      diameter: props?.pipe_diameter || "-",
      length: props?.length || null,
    });
  };

  // 处理FeatureCollection格式
  if (geoJsonData.type === "FeatureCollection" && geoJsonData.features) {
    geoJsonData.features.forEach((f) => {
      const geom = f.geometry || {};
      if (geom.type === "LineString") pushLine(geom.coordinates, f.properties, f);
      if (geom.type === "MultiLineString") geom.coordinates.forEach((c) => pushLine(c, f.properties, f));
    });
  }
  // 处理数组格式
  else if (Array.isArray(geoJsonData)) {
    geoJsonData.forEach((f) => {
      const geom = f.geometry || {};
      if (geom.type === "LineString") pushLine(geom.coordinates, f.properties, f);
      if (geom.type === "MultiLineString") geom.coordinates.forEach((c) => pushLine(c, f.properties, f));
    });
  }

  return polylineList;
}

async function getlist() {
  listLoading.value = true;

  try {
    const { data: features } = await proxy.ajax.get("DBAllDataGet", { city_town: param.city_town }, true);

    // 从GeoJSON数据中提取所有管线
    const allPolylines = extractPolylineList(features);

    // 分页处理
    const start = (param.page - 1) * pageSize;
    const end = start + pageSize;
    list.value = allPolylines.slice(start, end);

    // 保存所有管线数据用于分页判断
    list._allPolylines = allPolylines;
  } catch (error) {
    console.error("获取管线数据失败:", error);
    ElMessage.error("获取管线数据失败");
    list.value = [];
  } finally {
    listLoading.value = false;
  }
}

function checkItem(item) {
  emit("lineCheck", item);
}

async function deleteItem(item) {
  const lineId = item.properties?.id;
  if (!lineId) {
    ElMessage.error("无法获取管线ID");
    return;
  }

  try {
    await ElMessageBox.confirm("确定要删除这条管线吗？删除后不可恢复。", "确认删除", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    // 调用删除接口
    const res = await proxy.ajax.get("deleteBasicLinestringDevice", { id: lineId }, true);

    if (res.code === "success" || res.code === 200) {
      ElMessage.success("删除成功");
      // 刷新列表
      await getlist();
      // 触发地图数据刷新事件
      eventBus.emit("reGet");
      // 通知父组件管线已删除，需要刷新地图
      emit("polylineDeleted");
    } else {
      ElMessage.error(res.msg || "删除失败");
    }
  } catch (error) {
    // 用户取消删除或删除失败
    if (error !== "cancel") {
      console.error("删除管线失败:", error);
      ElMessage.error("删除失败，请重试");
    }
  }
}

function prevPage() {
  if (param.page > 1) {
    param.page = param.page - 1;
    list.value = [];
    getlist();
  }
}

function nextPage() {
  const allPolylines = list._allPolylines || [];
  const totalPages = Math.ceil(allPolylines.length / pageSize);

  if (param.page < totalPages) {
    param.page = param.page + 1;
    list.value = [];
    getlist();
  } else {
    ElMessage.warning("暂无更多数据...");
  }
}
</script>

<style lang="scss" scoped>
.popCard {
  position: absolute;
  right: 180px;
  bottom: 20px;
  top: 20px;
  width: 550px;
  background: #fff;
  z-index: 200;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  transform: translateX(50px);
  pointer-events: none;
  opacity: 0;
  transition: all 0.2s;
  &.on {
    transform: translateX(0px);
    pointer-events: auto;
    opacity: 1;
  }
  .inHead {
    height: 50px;
    min-height: 50px;
    display: flex;
    align-items: center;
    padding: 0 20px;
    position: relative;
    p {
      font-size: 20px;
      color: #585657;
    }
    a {
      margin-left: auto;
      width: 14px;
      height: 14px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        width: 100%;
        height: 100%;
        &.hov {
          position: absolute;
          width: 100%;
          height: 100%;
          left: 0;
          top: 0;
          opacity: 0;
        }
      }
      &:hover {
        img {
          &.hov {
            opacity: 1;
          }
        }
      }
    }
    .bottom {
      position: absolute;
      pointer-events: none;
      left: 20px;
      right: 20px;
      bottom: -3px;
      display: flex;
      align-items: center;
      height: 5px;
      .icon {
        width: 4px;
        height: 4px;
        margin-right: 8px;
        background: #46b97e;
        border-radius: 50%;
      }
      .icon2 {
        width: 4px;
        height: 4px;
        margin-right: 8px;
        background: #90d5b2;
        border-radius: 50%;
      }
      .icon3 {
        width: 4px;
        height: 4px;
        margin-right: 8px;
        background: #c7ead8;
        border-radius: 50%;
      }
      .bd {
        flex: 1;
        height: 1px;
        background: #e9e9e9;
      }
    }
  }
  .inBody {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    flex: 1;
    margin-top: 20px;
    &::-webkit-scrollbar {
      width: 8px;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 6px;
      background: #b5e3cb;
      width: 8px;
    }
    margin-bottom: 30px;
  }
}

.loadingCard {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  img {
    width: 40px;
    height: 40px;
  }
}

.hint {
  margin: 20px auto;
  text-align: center;
  color: #666;
  font-size: 20px;
}

.table {
  border: 1px solid #ececec;
  border-top: none;
  margin: 0 20px;
  border-radius: 6px;
  width: calc(100% - 40px);
  box-sizing: border-box;
  dt {
    border: 1px solid #ececec;
    border-radius: 6px 6px 0 0;
    top: 0px;
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    .item {
      font-size: 20px;
      color: #329c6d;
      font-weight: bold;
      text-align: center;
      height: 100%;
      background: #c7ead8;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-left: 1px solid #ececec;
      box-sizing: border-box;

      &:first-of-type {
        width: 60px;
        min-width: 60px;
        border-left: 0;
      }
      &:nth-of-type(2) {
        width: 140px;
        min-width: 140px;
      }
      &:nth-of-type(3) {
        width: 80px;
        min-width: 80px;
      }
      &:nth-of-type(4) {
        width: 80px;
        min-width: 80px;
      }
      &:nth-of-type(5) {
        flex: 1;
        min-width: 100px;
      }
    }
  }

  dd {
    display: flex;
    min-height: 40px;
    &:nth-of-type(even) {
      background: #ecf8f2;
    }
    a {
      font-size: 20px;
      color: #46b97e;
      white-space: nowrap;
    }
    h2 {
      font-size: 20px;
      color: #606060;
    }
    p {
      font-size: 20px;
      color: #a0a0a0;
    }
  }
  .item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-left: 1px solid #ececec;
    box-sizing: border-box;

    &:first-of-type {
      width: 60px;
      min-width: 60px;
      justify-content: center;
      border-left: 0;
    }
    &:nth-of-type(2) {
      width: 140px;
      min-width: 140px;
    }
    &:nth-of-type(3) {
      width: 80px;
      min-width: 80px;
    }
    &:nth-of-type(4) {
      width: 80px;
      min-width: 80px;
    }
    &:nth-of-type(5) {
      flex: 1;
      min-width: 100px;
      &.operation-cell {
        padding: 0 10px;
        display: flex !important;
        flex-direction: row !important;
        gap: 16px;
        align-items: center;
        justify-content: space-around !important;
        a.btn {
          text-align: center;
          cursor: pointer;
          font-size: 20px;
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          color: #46b97e !important;
          transition: color 0.2s;
          white-space: nowrap;
          text-decoration: none;
          &:hover {
            color: #3aa069 !important;
            text-decoration: underline;
          }
          &.delete-btn {
            color: #f33125 !important;
            &:hover {
              color: #d6291c !important;
              text-decoration: underline;
            }
          }
        }
      }
    }
  }
}

.pagesCard {
  margin: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  .item {
    margin: 0 20px;
    min-width: 120px;
    height: 40px;
    background: #46b97e;
    border-radius: 6px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    font-size: 20px;
    color: #fff;
  }
}
</style>
