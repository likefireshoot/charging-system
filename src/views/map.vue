<template>
  <div class="cardBody">
    <div class="main">
      <div style="display: flex; flex-direction: column; ">
        <div class="searchCard" style="margin-bottom: 10px">
          <template v-for="(item, index) in main0" :key="index">
            <a class="item" :class="mainIndex == item.id ? 'on' : ''" @click.stop="setMap(item)">
              <div class="imgBox">
                <img :src="item.icon" alt="" class="img" />
                <img :src="item.icon2" alt="" class="hov" />
              </div>
              <p>{{ item.name }}</p>
            </a>
          </template>
        </div>

        <div class="searchCard" style="margin-top: 10px">
          <template v-for="(item, index) in main1" :key="index">
            <a class="item" :class="mainIndex == item.id ? 'on' : ''" @click.stop="setMap(item)">
              <div class="imgBox">
                <img :src="item.icon" alt="" class="img" />
                <img :src="item.icon2" alt="" class="hov" />
              </div>
              <p>{{ item.name }}</p>
            </a>
          </template>
        </div>
      </div>

      <div class="selectCard">
        <selectCard width="200" :options="allTown" propValue="name" :name="allTownSelect" v-model:select="allTownSelect" @selectItem="selectTown"></selectCard>
      </div>

      <div class="inputCard">
        <input type="text" v-model="inputName" placeholder="请输入设备名称..." />
      </div>

      <div class="searchCard">
        <a class="item" @click.stop="getDevice">
          <div class="imgBox">
            <img src="@/assets/icon15.svg" alt="" class="img" />
            <img src="@/assets/icon16.svg" alt="" class="hov" />
          </div>
          <p>搜索设备</p>
        </a>
      </div>

      <!-- <div class="inputCard">
        <input type="text" v-model="inputCaliber" placeholder="请输入口径..." />
      </div>

      <div class="searchCard">
        <a class="item" @click.stop="getDeviceByCaliber">
          <div class="imgBox">
            <img src="@/assets/icon15.svg" alt="" class="img" />
            <img src="@/assets/icon16.svg" alt="" class="hov" />
          </div>
          <p>搜索口径</p>
        </a>
      </div> -->

      <div class="searchCard navCard">
        <template v-for="(item, index) in navList" :key="index">
          <a
            class="item"
            @click.stop="setNav(item)"
            :class="
              (index == 0 && showDeviceAdd) ||
              (index == 1 && showCorrect) ||
              (index == 2 && showDevice) ||
              (index == 3 && showPolylineAdd) ||
              (index == 4 && showPolylineCorrect) ||
              (index == 5 && showPolylineInfo)
                ? 'on'
                : ''
            "
          >
            <div class="imgBox">
              <img :src="item.icon" alt="" class="img" />
              <img :src="item.icon2" alt="" class="hov" />
            </div>
            <p>{{ item.name }}</p>
          </a>
        </template>
      </div>
    </div>

    <div class="deviceCard">
      <template v-for="(item, index) in deviceList" :key="index">
        <a class="item" :class="item.check ? 'on' : ''" @click.stop="setDevice(item)">
          <div class="imgBox">
            <img :src="item.icon" alt="" class="img" />
            <img :src="item.icon2" alt="" class="hov" />
          </div>
          <p>{{ item.name }}</p>
        </a>
      </template>
    </div>

    <div class="mapTool">
      <div class="scaleCard">
        <a class="item" @click.stop="setZoom(0)">
          <img src="@/assets/map/icon1.svg" alt="" class="img" />
          <img src="@/assets/map/icon2.svg" alt="" class="hov" />
        </a>
        <a class="item" @click.stop="setZoom(1)">
          <img src="@/assets/map/icon6.svg" alt="" class="img" />
          <img src="@/assets/map/icon5.svg" alt="" class="hov" />
        </a>
      </div>

      <div class="panCard">
        <img src="@/assets/map/icon1.svg" alt="" class="icon" />
        <a class="item top" @click.stop="panBy(0)">
          <img src="@/assets/map/icon3.svg" alt="" class="img" />
          <img src="@/assets/map/icon4.svg" alt="" class="hov" />
        </a>
        <a class="item bottom" @click.stop="panBy(1)">
          <img src="@/assets/map/icon3.svg" alt="" class="img" />
          <img src="@/assets/map/icon4.svg" alt="" class="hov" />
        </a>
        <a class="item left" @click.stop="panBy(3)">
          <img src="@/assets/map/icon3.svg" alt="" class="img" />
          <img src="@/assets/map/icon4.svg" alt="" class="hov" />
        </a>
        <a class="item right" @click.stop="panBy(4)">
          <img src="@/assets/map/icon3.svg" alt="" class="img" />
          <img src="@/assets/map/icon4.svg" alt="" class="hov" />
        </a>
      </div>
    </div>

    <fault v-model:show="showFalut" @deviceCheck="deviceCheck" :allTownSelect="allTownSelect"></fault>
    <device v-model:show="showDevice" @deviceCheck="deviceCheck" @deviceDeleted="onDeviceDeleted" :allTownSelect="allTownSelect"></device>
    <coordinate v-model:show="showCorrect" :checkMarket="checkMarket" :allTownSelect="allTownSelect" @updateMarket="updateMarket" @updateUpRotation="updateUpRotation"></coordinate>
    <polylineInfo v-model:show="showPolylineInfo" :allTownSelect="allTownSelect" @lineCheck="lineCheck" @polylineDeleted="onPolylineDeleted"></polylineInfo>
    <polylineCorrect v-model:show="showPolylineCorrect" :checkLine="checkLine" :selectedPoint="selectedPoint" @updatePoint="updatePoint" @save="savePolyline"></polylineCorrect>
    <deviceAdd v-model:show="showDeviceAdd" :allTownSelect="allTownSelect" :clickPosition="deviceAddClickPosition" @deviceAdded="onDeviceAdded"></deviceAdd>
    <polylineAdd
      v-model:show="showPolylineAdd"
      :allTownSelect="allTownSelect"
      :clickPosition="polylineAddClickPosition"
      @polylineAdded="onPolylineAdded"
      @addPoint="onPolylinePointAdded"
      @updatePoints="updatePolylineMarkersFromCoords"
    ></polylineAdd>

    <div id="map" class="mapCard"></div>
  </div>
</template>

<script setup>
import eventBus from "@/api/eventBus";
import { markerTxt } from "@/api/market.js";
import fault from "@/components/map/fault";
import device from "@/components/map/device";
import coordinate from "@/components/map/coordinate";
import polylineInfo from "@/components/map/polylineInfo";
import polylineCorrect from "@/components/map/polylineCorrect";
import deviceAdd from "@/components/map/deviceAdd";
import polylineAdd from "@/components/map/polylineAdd";
import { useStore } from "vuex";
import AMapLoader from "@amap/amap-jsapi-loader";
import { getCurrentInstance, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import service from "@/api/request";
import { getPipeColor } from "@/api/map/map";
const store = useStore();
const { proxy } = getCurrentInstance();

onMounted(async () => {
  // store.commit('setNavIndex', 0);
  getAllTow();
});

onUnmounted(() => {
  if (aMaps) {
    aMaps.destroy();
    aMaps = null;
  }
});

const allTown = ref([]);
const allTownSelect = ref(null);

let polylines = reactive([]);

const companyId = JSON.parse(sessionStorage.getItem("userData")).companyId;
let overlayList = ref([]) //装所有的点

async function getAllTow() {
  let url = "";
  console.log("=== 地图初始化调试 ===");
  console.log("companyId:", companyId, typeof companyId);
  if (companyId === 1) {
    url = `/device_display/getAllTown`;
  } else {
    url = `/device_display/getAllTown?companyId=${companyId}`;
  }
  console.log("请求URL:", url);
  let { data } = await proxy.ajax.get(url);
  console.log("ajax.get 返回 data:", data, "类型:", typeof data, "长度:", data?.length);
  if (data && Array.isArray(data)) {
    console.log("data[0]:", data[0]);
    console.log("data[0].lat:", data[0]?.lat, "data[0].lnt:", data[0]?.lnt);
  }

  // 同步设置中心点（高德要求 [经度, 纬度]），避免依赖异步 service.get 的竞态；
  // 接口返回空时保留默认有效中心，避免 center=null 触发高德 LngLat(NaN, NaN)
  if (data && data.length > 0) {
    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lnt);
    console.log("parseFloat lat:", lat, "lng:", lng, "isNaN(lat):", isNaN(lat), "isNaN(lng):", isNaN(lng));
    if (!isNaN(lat) && !isNaN(lng)) {
      mapData.center = [lng, lat];
    } else {
      console.warn("经纬度为无效数字，保留默认中心点");
    }
  } else {
    console.warn("data 为空或非数组，保留默认中心点 mapData.center:", mapData.center);
  }

  console.log("最终 center:", mapData.center, "调用 gaodeMap() 前");

  // 仍用 service 拉一次补全 town 下拉列表，但不参与地图初始化
  service
    .get(url)
    .then((res) => {
      if (res.code === 200) {
        allTown.value = res.data;
        allTownSelect.value = res.data.length > 0 ? res.data[0].id : null;
      }
    })
    .catch(() => {});

  await gaodeMap();

  if (data.length > 0) {
    selectTown(data[0]);
  }
}

let aMaps = null;
let AMap = null;
var locaMap = null;
const mapData = {
  viewMode: "3D", // 是否为3D地图模式
  zoom: 19, // 初始化地图级别
  center: [114.338881, 30.513345], // 初始化地图中心点位置
  rotateEnable: true,
  pitchEnable: true,
  pitch: 25,
};

async function gaodeMap() {
  AMap = await AMapLoader.load({
    key: "7052effea6756cf9731568d2f386c5b2", // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: ["AMap.MapType", "AMap.MoveAnimation"], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
    Loca: {
      // 是否加载 Loca， 缺省不加载
      version: "2.0.0", // Loca 版本，缺省 1.3.2
    },
  });
  const mapEl = document.getElementById("map");
  console.log("=== map.vue 地图调试 ===");
  console.log("map 容器元素:", mapEl);
  console.log("map 容器尺寸:", mapEl?.clientWidth, "x", mapEl?.clientHeight);
  console.log("mapData.center:", mapData.center, "viewMode:", mapData.viewMode);
  if (!mapEl || mapEl.clientWidth === 0 || mapEl.clientHeight === 0) {
    console.warn("⚠️ 地图容器尺寸为 0，高德可能报 LngLat(NaN, NaN)。请检查 .mapCard / .cardBody 高度");
  }

  aMaps = new AMap.Map("map", mapData);
  // 创建 Loca 实例
  locaMap = new Loca.Container({
    map: aMaps,
  });
}

// const selectSlide = ref(false);
const main0 = reactive([{ id: 0, name: "标准地图", icon: require("@/assets/icon11.svg"), icon2: require("@/assets/icon12.svg") }]);
const main1 = reactive([{ id: 1, name: "卫星地图", icon: require("@/assets/icon13.svg"), icon2: require("@/assets/icon14.svg") }]);
const mainIndex = ref(0);

function setMap(item) {
  mainIndex.value = item.id;
  let layers = aMaps.getLayers();

  if (item.id == 0) {
    let Buildings = layers.find((item) => item.CLASS_NAME == "AMap.Buildings");
    Buildings?.show();

    let layer = layers.find((item) => item.CLASS_NAME == "AMap.TileLayer.Satellite");
    layer?.hide();
    return;
  }
  if (item.id == 1) {
    let layer = layers.find((item) => item.CLASS_NAME == "AMap.TileLayer.Satellite");
    if (layer) {
      layer.show();
    } else {
      aMaps.addLayer(new AMap.TileLayer.Satellite());
    }
    let Buildings = layers.find((item) => item.CLASS_NAME == "AMap.Buildings");
    Buildings?.hide();
  }
}

function selectTown(item) {
  // aMaps.panTo([item.lat, item.lnt], 250);
  device_display();
}

//放大缩小
function setZoom(index) {
  let zoom = aMaps.getZoom();
  if (index == 0) {
    aMaps.setZoom(zoom + 1);
    return;
  }
  aMaps.setZoom(zoom - 1);
}
//地图移动
function panBy(index) {
  if (index == 0) {
    aMaps.panBy(0, 100, 250);
  }
  if (index == 1) {
    aMaps.panBy(0, -100, 250);
  }
  if (index == 3) {
    aMaps.panBy(100, 0, 250);
  }
  if (index == 4) {
    aMaps.panBy(-100, 0, 250);
  }
}

const navIndex = ref(null);
const navList = reactive([
  { id: 0, name: "设备添加", icon: require("@/assets/add2.svg"), icon2: require("@/assets/add1.svg") },
  { id: 1, name: "设备校正", icon: require("@/assets/icon17.svg"), icon2: require("@/assets/icon18.svg") },
  { id: 2, name: "设备属性", icon: require("@/assets/icon19.svg"), icon2: require("@/assets/icon20.svg") },
  { id: 3, name: "管线添加", icon: require("@/assets/add2.svg"), icon2: require("@/assets/add1.svg") },
  { id: 4, name: "管线校正", icon: require("@/assets/icon17.svg"), icon2: require("@/assets/icon18.svg") },
  { id: 5, name: "管线属性", icon: require("@/assets/icon19.svg"), icon2: require("@/assets/icon20.svg") },
]);

const showFalut = ref(false);
const showDevice = ref(false);
const showCorrect = ref(false);
const showPolylineInfo = ref(false);
const showPolylineCorrect = ref(false);
const showDeviceAdd = ref(false);
const showPolylineAdd = ref(false);

// 设备添加和管线添加的点击位置
const deviceAddClickPosition = ref(null);
const polylineAddClickPosition = ref(null);
// 临时管线标记点（用于显示正在添加的管线）
let tempPolylineMarkers = [];
let tempPolylinePolyline = null;

// 监听polylineInfo弹窗关闭/打开
watch(showPolylineInfo, (newVal) => {
  if (!newVal) {
    // 关闭弹窗时，只有在没有其他相关页面打开时才清除管线选中状态
    // 相关页面包括：管线校正、设备属性、设备校正
    const hasRelatedPageOpen = showPolylineCorrect.value || showDevice.value || showCorrect.value;

    if (!hasRelatedPageOpen) {
      // 只有在所有相关页面都关闭时，才清除管线选中状态
      checkLine.value = null;
      selectedPoint.value = null;
      // 清除节点标记点显示
      shouldShowPolylinePoints.value = false;
      updatePolylinePointsVisibility();
    } else {
      // 如果有其他相关页面打开，只清除选中点，但保持管线选中状态
      selectedPoint.value = null;
      // 如果管线校正页面打开，保持节点标记点显示
      if (showPolylineCorrect.value && checkLine.value) {
        shouldShowPolylinePoints.value = true;
        updatePolylinePointsVisibility();
      }
    }
  } else {
    // 打开弹窗时，如果有选中的管线，显示节点标记点
    if (checkLine.value) {
      shouldShowPolylinePoints.value = true;
      updatePolylinePointsVisibility();
    }
  }
});

// 监听polylineCorrect弹窗关闭/打开
watch(showPolylineCorrect, (newVal) => {
  if (!newVal) {
    // 关闭弹窗时，清除选中点，但不清除管线选中状态
    selectedPoint.value = null;
    // 但如果管线属性也没有打开，则清除点显示
    if (!showPolylineInfo.value) {
      shouldShowPolylinePoints.value = false;
      updatePolylinePointsVisibility();
    }
  } else {
    // 打开弹窗时，如果有选中的管线，显示节点标记点
    if (checkLine.value) {
      shouldShowPolylinePoints.value = true;
      updatePolylinePointsVisibility();
    }
  }
});

function setNav(item) {
  // 记录当前状态
  const wasPolylineCorrectOpen = showPolylineCorrect.value;
  const wasPolylineInfoOpen = showPolylineInfo.value;
  const wasDeviceOpen = showDevice.value;
  const wasCorrectOpen = showCorrect.value;
  const wasDeviceAddOpen = showDeviceAdd.value;
  const wasPolylineAddOpen = showPolylineAdd.value;

  // 根据点击的标签页ID，决定是否打开
  if (item.id == 0) {
    // 设备添加：如果不是当前打开的，则打开（切换）
    if (!wasDeviceAddOpen) {
      // 先关闭其他标签页
      showDevice.value = false;
      showCorrect.value = false;
      showFalut.value = false;
      showPolylineCorrect.value = false;
      showPolylineInfo.value = false;
      showPolylineAdd.value = false;
      clearTempPolylineMarkers();
      // 然后打开目标页面
      showDeviceAdd.value = true;
      // 重置点击位置
      deviceAddClickPosition.value = null;
    } else {
      // 如果当前已打开，则关闭
      showDeviceAdd.value = false;
      deviceAddClickPosition.value = null;
    }
  } else if (item.id == 1) {
    // 设备校正：如果不是当前打开的，则打开（切换）
    if (!wasCorrectOpen) {
      // 先关闭其他标签页
      showDevice.value = false;
      showFalut.value = false;
      showPolylineCorrect.value = false;
      showPolylineInfo.value = false;
      showDeviceAdd.value = false;
      showPolylineAdd.value = false;
      clearTempPolylineMarkers();
      // 然后打开目标页面
      showCorrect.value = true;
    } else {
      // 如果当前已打开，则关闭
      showCorrect.value = false;
    }
  } else if (item.id == 2) {
    // 设备属性：如果不是当前打开的，则打开（切换）
    if (!wasDeviceOpen) {
      // 先关闭其他标签页
      showCorrect.value = false;
      showFalut.value = false;
      showPolylineCorrect.value = false;
      showPolylineInfo.value = false;
      showDeviceAdd.value = false;
      showPolylineAdd.value = false;
      clearTempPolylineMarkers();
      // 然后打开目标页面
      showDevice.value = true;
    } else {
      // 如果当前已打开，则关闭
      showDevice.value = false;
    }
  } else if (item.id == 3) {
    // 管线添加：如果不是当前打开的，则打开（切换）
    if (!wasPolylineAddOpen) {
      // 先关闭其他标签页
      showDevice.value = false;
      showCorrect.value = false;
      showFalut.value = false;
      showPolylineCorrect.value = false;
      showPolylineInfo.value = false;
      showDeviceAdd.value = false;
      clearTempPolylineMarkers();
      // 然后打开目标页面
      showPolylineAdd.value = true;
      // 重置点击位置
      polylineAddClickPosition.value = null;
    } else {
      // 如果当前已打开，则关闭
      showPolylineAdd.value = false;
      polylineAddClickPosition.value = null;
      clearTempPolylineMarkers();
    }
  } else if (item.id == 4) {
    // 管线校正：如果不是当前打开的，则打开（切换）
    if (!wasPolylineCorrectOpen) {
      // 先打开目标页面（这样在关闭其他页面时，watch能检测到相关页面已打开）
      showPolylineCorrect.value = true;
      // 然后关闭其他标签页
      showDevice.value = false;
      showCorrect.value = false;
      showFalut.value = false;
      showPolylineInfo.value = false;
      showDeviceAdd.value = false;
      showPolylineAdd.value = false;
      clearTempPolylineMarkers();
      // 打开弹窗时，如果有选中的管线，显示节点标记点
      if (checkLine.value) {
        shouldShowPolylinePoints.value = true;
        updatePolylinePointsVisibility();
      }
    } else {
      // 关闭管线矫正时，先关闭它
      showPolylineCorrect.value = false;
      // 然后关闭其他标签页
      showDevice.value = false;
      showCorrect.value = false;
      showFalut.value = false;
      showPolylineInfo.value = false;
      showDeviceAdd.value = false;
      showPolylineAdd.value = false;
      clearTempPolylineMarkers();
      // 关闭管线矫正时，不清空选中的管线（保持状态）
      // 只清除选中点和节点标记点显示（如果管线属性也没打开）
      selectedPoint.value = null;
      if (!showPolylineInfo.value) {
        shouldShowPolylinePoints.value = false;
        updatePolylinePointsVisibility();
      }
    }
  } else if (item.id == 5) {
    // 管线属性：如果不是当前打开的，则打开（切换）
    if (!wasPolylineInfoOpen) {
      // 先打开目标页面（这样在关闭其他页面时，watch能检测到相关页面已打开）
      showPolylineInfo.value = true;
      // 然后关闭其他标签页
      showDevice.value = false;
      showCorrect.value = false;
      showFalut.value = false;
      showPolylineCorrect.value = false;
      showDeviceAdd.value = false;
      showPolylineAdd.value = false;
      clearTempPolylineMarkers();
      // 打开弹窗时，如果有选中的管线，显示节点标记点
      if (checkLine.value) {
        shouldShowPolylinePoints.value = true;
        updatePolylinePointsVisibility();
      }
    } else {
      // 关闭管线属性时，先关闭它
      showPolylineInfo.value = false;
      // 然后关闭其他标签页
      showDevice.value = false;
      showCorrect.value = false;
      showFalut.value = false;
      showPolylineCorrect.value = false;
      showDeviceAdd.value = false;
      showPolylineAdd.value = false;
      clearTempPolylineMarkers();
      // 关闭管线属性时，只有在没有其他相关页面打开时才清除管线选中状态
      // 由于已经关闭了所有页面，所以这里会清除选中状态（这是正确的行为）
      // 但如果用户是通过点击×按钮关闭的，watch监听器会处理清除逻辑
    }
  }

  navList.map((a) => {
    if (a.id != item.id) {
      a.check = false;
    }
  });
}
function setOverlayList(features,data){
  console.log(features)
  console.log(data)
  // 创建标记点（markers）
  const markers = data.map(item => {
    return new AMap.Marker({
      position: item.position,  // 点的坐标
    });
  });

  // // 创建折线（polylines）
  const polylines = features.features.map(feature => {
    return new AMap.Polyline({
      path: feature.geometry.coordinates,  // 线的坐标
    });
  });

  // 将标记和折线合并到 overlayList 中
  overlayList = markers.concat(polylines);
  console.log(overlayList)

}

let marketArray = reactive([]);
let markets = reactive([]);
let checkMarket = ref(null);
let checkLine = ref(null); // 选中的管线
let allLines = []; // 存储所有管线数据，用于更新
let shouldShowPolylinePoints = ref(false); // 控制是否显示节点标记点
let selectedPoint = ref(null); // 当前选中的点 {coord: [lng, lat], marker: CircleMarker, lineIndex: 0, pointIndex: 0}
let polylinePointMap = new Map(); // 存储坐标到点的映射关系，用于快速查找
const deviceList = reactive([
  { id: 1, check: true, name: "阀门", icon: require("@/assets/device/icon1.svg"), icon2: require("@/assets/device/icon2.svg") },
  { id: 2, check: true, name: "排水阀", icon: require("@/assets/device/icon3.svg"), icon2: require("@/assets/device/icon4.svg") },
  { id: 5, check: true, name: "流量计", icon: require("@/assets/device/icon5.svg"), icon2: require("@/assets/device/icon6.svg") },
  { id: 7, check: true, name: "水池", icon: require("@/assets/device/icon7.svg"), icon2: require("@/assets/device/icon8.svg") },
  { id: 8, check: true, name: "水泵", icon: require("@/assets/device/icon9.svg"), icon2: require("@/assets/device/icon10.svg") },
  { id: 0, check: true, name: "压力计", icon: require("@/assets/device/icon11.svg"), icon2: require("@/assets/device/icon12.svg") },
  { id: 10, check: true, name: "弯头", icon: require("@/assets/device/icon13.svg"), icon2: require("@/assets/device/icon14.svg") },
  { id: 20, check: true, name: "三通", icon: require("@/assets/device/icon15.svg"), icon2: require("@/assets/device/icon16.svg") },
  { id: 30, check: true, name: "四通", icon: require("@/assets/device/icon17.svg"), icon2: require("@/assets/device/icon18.svg") },
  { id: 31, check: true, name: "消防栓", icon: require("@/assets/device/icon19.svg"), icon2: require("@/assets/device/icon20.svg") },
]);

//获取坐标数据
async function device_display() {
  console.log(allTownSelect.value);
  let DeviceDisplayForm = {
    city_town: allTownSelect.value,
    pointTypes: [],
  };
  //获取设备数据
  let { data } = await proxy.ajax.post("/device_display", DeviceDisplayForm, true);
  //获取管线数据
  let { data: features } = await proxy.ajax.get("DBAllDataGet", { city_town: DeviceDisplayForm.city_town }, true);

  //将管线绘制在地图上，并根据管径染色，以及设置管线的点击事件
  setPolyline(features);
  setOverlayList(features,data)
  checkMarket.value = null;
  eventBus.emit("reGet");
  if (data) {
    //将设备添加到对应设备列表中
    deviceList.map((a) => {
      a.items = data.filter((item) => item.pointType == a.id);
    });
    //将所有的设备添加到marketArray中，组合成一个数组
    marketArray = deviceList.filter((item) => item.check).reduce((list, item) => [...list, ...item.items], []);
    // console.log(marketArray)
    //将设备显示在地图上
    setPoint();
  }
}


function setDevice(item) {
  item.check = item.check ? false : true;
  let data = deviceList.filter((item) => item.check).reduce((list, item) => [...list, ...item.items], []);
  marketArray = data;
  setPoint();
}

//设置地图point
function setPoint(setFitView) {
  aMaps.remove(markets);
  markets = [];
  marketArray.map((a) => {
    let { id } = checkMarket.value || { id: null };
    let market = new AMap.Marker({
      extData: a,
      content: markerTxt.pointTxt(a, checkMarket.value), //设置移入图标点显示的内容
      position: a.position, //基点位置
      //设置当前选中点的偏移位置和图层，让其更突出
      offset: a.id == id ? new AMap.Pixel(-30, -49) : new AMap.Pixel(-22, -35), //相对于基点的偏移位置
      zIndex: a.id == id ? 20 : 12,
    });
    market.on("click", (data) => {
      return handkMarket(data, a);
    });
    markets = [...markets, market];
  });
  aMaps.add(markets);
  if (setFitView) {
    return;
  }
  aMaps.setFitView(overlayList, false, [30, 20, 30, 20], 20);
  // console.log("点已经画完了")
}

let layerObj = null;
let polylinePoints = []; // 存储脉冲线的节点标记点
let polylineInfoWindow = null; // 管线信息窗口
let lastClickPosition = null; // 保存最近一次点击的位置

// 提取 item 中所有线（包含属性）
function extractLinesFromGeoJSON(data) {
  const lines = [];
  if (!data) return lines;

  const pushLine = (coords, props, feature) => {
    lines.push({
      coords,
      properties: props || {},
      feature: feature || {},
    });
  };

  if (data.type === "FeatureCollection") {
    data.features.forEach((f) => {
      const geom = f.geometry || {};
      if (geom.type === "LineString") pushLine(geom.coordinates, f.properties, f);
      if (geom.type === "MultiLineString") geom.coordinates.forEach((c) => pushLine(c, f.properties, f));
    });
  } else if (Array.isArray(data)) {
    data.forEach((f) => {
      const geom = f.geometry || {};
      if (geom.type === "LineString") pushLine(geom.coordinates, f.properties, f);
      if (geom.type === "MultiLineString") geom.coordinates.forEach((c) => pushLine(c, f.properties, f));
    });
  }

  return lines;
}

// 计算折线长度（米）
function calcLineLength(coords) {
  let len = 0;
  for (let i = 1; i < coords.length; i++) {
    len += AMap.GeometryUtil.distance(coords[i - 1], coords[i]);
  }
  return len;
}

// 判断点击是否接近管线（使用地理距离，更准确）
function hitTestLinesByPixels(lines, clickPixel, clickLngLat) {
  let best = { minPx: Infinity, line: null, minDist: Infinity };

  if (!clickLngLat) {
    return best;
  }

  const clickLng = clickLngLat.lng || clickLngLat.getLng();
  const clickLat = clickLngLat.lat || clickLngLat.getLat();
  const clickPoint = [clickLng, clickLat];

  lines.forEach((lineObj) => {
    const coords = lineObj.coords;

    for (let i = 1; i < coords.length; i++) {
      const p1 = coords[i - 1];
      const p2 = coords[i];

      // GeoJSON坐标格式：[经度, 纬度]
      const p1Point = [p1[0], p1[1]];
      const p2Point = [p2[0], p2[1]];

      // 计算点到线段的最近距离（地理距离，单位：米）
      // 先计算点到线段的最远点参数t
      const dx = p2[0] - p1[0];
      const dy = p2[1] - p1[1];
      const segLen2 = dx * dx + dy * dy;

      let t = 0;
      if (segLen2 > 0) {
        const toClickDx = clickLng - p1[0];
        const toClickDy = clickLat - p1[1];
        t = (toClickDx * dx + toClickDy * dy) / segLen2;
        t = Math.max(0, Math.min(1, t));
      }

      // 计算线段上最近的点
      const projLng = p1[0] + t * dx;
      const projLat = p1[1] + t * dy;
      const projPoint = [projLng, projLat];

      // 使用AMap.GeometryUtil.distance计算地理距离（米）
      const dist = AMap.GeometryUtil.distance(clickPoint, projPoint);

      // 如果距离更小，更新最佳匹配
      if (dist < best.minDist) {
        best.minDist = dist;
        best.line = lineObj;
        // 同时计算像素距离用于显示
        const p1px = aMaps.lngLatToContainer(new AMap.LngLat(p1[0], p1[1]));
        const p2px = aMaps.lngLatToContainer(new AMap.LngLat(p2[0], p2[1]));
        const clickPx = clickPixel;

        const pxDx = p2px.x - p1px.x;
        const pxDy = p2px.y - p1px.y;

        const projPx = {
          x: p1px.x + t * pxDx,
          y: p1px.y + t * pxDy,
        };
        best.minPx = Math.hypot(projPx.x - clickPx.x, projPx.y - clickPx.y);
      }
    }
  });

  return best;
}

// --------------------------------------------------------------
// ⚡⚡⚡ 你的主函数：绘制管线 + 点击展示UI（最终版）
// --------------------------------------------------------------
function setPolyline(item) {
  // console.log(item)
  if (layerObj) locaMap.remove(layerObj);

  // 移除旧的节点标记点
  if (polylinePoints.length > 0) {
    aMaps.remove(polylinePoints);
    polylinePoints = [];
  }

  const geo = new Loca.GeoJSONSource({ data: item });


  const layer = new Loca.PulseLineLayer({
    zIndex: 10,
    opacity: 1,
    visible: true,
    enablePicked: false, // 禁用Loca图层点击检测，使用DOM事件代替
    selectEnable: false, // 禁用Loca图层选择，使用DOM事件代替
  });

  layer.setSource(geo);

  // 设置样式（动态按管径染色）
  layer.setStyle({
    altitude: 0,
    lineWidth: 10,
    headColor: () => "#fff",
    trailColor: (_, feature) => getPipeColor(feature.properties.pipe_diameter),
    interval: 0.1,
    duration: 2500,
  });

  layerObj = layer;
  locaMap.add(layer);
  locaMap.animate.start();

  // 创建管线信息窗口（如果还没有创建）
  if (!polylineInfoWindow) {
    polylineInfoWindow = new AMap.InfoWindow({
      offset: new AMap.Pixel(0, -10),
      closeWhenClickMap: true,
    });
  }

  // 解析 item → 多条管线
  const lines = extractLinesFromGeoJSON(item);

  // 如果之前有选中的管线，尝试在新数据中找到对应的管线（通过ID匹配）
  let shouldKeepSelected = false;
  if (checkLine.value && checkLine.value.properties) {
    const oldLineId = checkLine.value.properties.id;
    if (oldLineId) {
      const matchedLine = lines.find((line) => {
        return line.properties && line.properties.id === oldLineId;
      });
      if (matchedLine) {
        // 找到匹配的管线，更新 checkLine.value 的 feature 引用
        checkLine.value = {
          coords: JSON.parse(JSON.stringify(matchedLine.coords)),
          name: matchedLine.properties.name || matchedLine.properties.pipe_name || matchedLine.properties.id || `管线-${matchedLine.properties.pipe_diameter || "未知"}mm`,
          diameter: matchedLine.properties.pipe_diameter || "-",
          properties: matchedLine.properties,
          feature: matchedLine.feature,
          originalCoords: JSON.parse(JSON.stringify(matchedLine.coords)),
        };
        shouldKeepSelected = shouldShowPolylinePoints.value; // 保持之前的显示状态
      } else {
        // 没有找到匹配的管线，清除选中状态
        checkLine.value = null;
        shouldShowPolylinePoints.value = false;
      }
    } else {
      // 如果没有ID，清除选中状态
      checkLine.value = null;
      shouldShowPolylinePoints.value = false;
    }
  }

  allLines = lines; // 保存所有管线数据

  // 清空之前的点
  if (polylinePoints.length > 0) {
    aMaps.remove(polylinePoints);
    polylinePoints.forEach((point) => {
      if (point.off) point.off("click");
    });
  }
  polylinePoints = [];
  polylinePointMap.clear();
  selectedPoint.value = null;

  // 如果之前有选中的管线且需要保持显示，重新显示节点标记点
  if (shouldKeepSelected && checkLine.value) {
    updatePolylinePointsVisibility();
  }

  // 移除旧事件（避免重复）
  if (aMaps._mapClickHandler) {
    aMaps.off("click", aMaps._mapClickHandler);
    aMaps._mapClickHandler = null;
  }

  // 不再使用Loca图层的点击事件，改为使用DOM事件检测（更准确，考虑缩放）
  // Loca图层的点击事件已被禁用（enablePicked: false, selectEnable: false）
  // 管线点击检测现在由 setupPolylineDOMClickHandler() 处理

  // 备用方案：使用地图点击事件（如果Loca事件不工作）
  // 移除旧事件（避免重复）
  if (aMaps._mapClickHandler) {
    aMaps.off("click", aMaps._mapClickHandler);
    aMaps._mapClickHandler = null;
  }

  // 注册地图点击事件作为备用（用于管线点击检测和设备/管线添加）
  aMaps._mapClickHandler = function (ev) {
    // 如果设备添加或管线添加页面打开，不在这里处理（使用DOM事件）
    if (showDeviceAdd.value || showPolylineAdd.value) {
      return;
    }

    console.log("地图点击事件触发", ev);

    // 尝试从 DOM 事件获取准确的坐标（如果可用）
    let accurateLngLat = null;
    let accuratePixel = null;

    // 方法1：如果事件有 originalEvent，使用 DOM 事件获取准确坐标
    if (ev.originalEvent) {
      try {
        const mapContainer = document.getElementById("map");
        if (mapContainer) {
          const coords = getLngLatFromDOMClick(ev.originalEvent, mapContainer);
          if (coords && coords.length === 2) {
            const [lng, lat] = coords;
            if (!isNaN(lng) && !isNaN(lat)) {
              accurateLngLat = new AMap.LngLat(lng, lat);
              accuratePixel = aMaps.lngLatToContainer(accurateLngLat);
              console.log("✅ 管线检测 - 使用DOM事件获取的准确坐标:", [lng, lat], "像素坐标:", accuratePixel);
            }
          }
        }
      } catch (e) {
        console.error("从DOM事件获取坐标失败:", e);
      }
    }

    // 方法2：如果没有DOM事件或转换失败，使用事件中的坐标（可能不准确）
    if (!accurateLngLat && ev.lnglat) {
      accurateLngLat = ev.lnglat;
      accuratePixel = ev.pixel || aMaps.lngLatToContainer(ev.lnglat);
      console.log("⚠️ 管线检测 - 使用地图事件的坐标（可能受缩放影响）");
    }

    // 保存点击位置
    if (accurateLngLat) {
      lastClickPosition = accurateLngLat;
    }

    if (!accurateLngLat || !accuratePixel) {
      console.log("无法获取有效的点击坐标，跳过管线检测");
      return;
    }

    // 使用准确的坐标进行管线点击检测
    const hit = hitTestLinesByPixels(lines, accuratePixel, accurateLngLat);

    console.log("点击检测结果:", hit, "地理距离（米）:", hit.minDist);

    // 使用地理距离作为判断标准（单位：米），更可靠
    // 统一使用50米阈值
    const DISTANCE_THRESHOLD = 50; // 50米

    if (!hit.line || hit.minDist > DISTANCE_THRESHOLD) {
      console.log("未检测到管线或距离太远", "地理距离:", hit.minDist, "阈值:", DISTANCE_THRESHOLD, "像素距离:", hit.minPx);
      return;
    }

    const lineObj = hit.line;
    const coords = lineObj.coords;
    const props = lineObj.properties || {};

    // 构建管线信息对象
    const lineInfo = {
      coords: JSON.parse(JSON.stringify(coords)), // 深拷贝坐标
      name: props.name || props.pipe_name || props.id || `管线-${props.pipe_diameter || "未知"}mm`, // 水管名称
      diameter: props.pipe_diameter || "-", // 水管口径
      properties: props,
      feature: lineObj.feature,
      originalCoords: JSON.parse(JSON.stringify(coords)), // 保存原始坐标用于后续操作
    };

    console.log("选中管线（备用方案）:", lineInfo);

    // 如果点击的是同一条管线，则清除选中状态（使用ID比较，更可靠）
    const currentLineId = checkLine.value && checkLine.value.properties ? checkLine.value.properties.id : null;
    const clickedLineId = lineInfo.properties ? lineInfo.properties.id : null;
    const isSameLine = currentLineId && clickedLineId && currentLineId === clickedLineId;

    if (isSameLine) {
      // 如果是同一条管线，清除选中状态（隐藏点）
      console.log("取消选中管线（备用方案）");
      checkLine.value = null;
      selectedPoint.value = null;
      shouldShowPolylinePoints.value = false;
      updatePolylinePointsVisibility();
      // 关闭信息窗口
      if (polylineInfoWindow) {
        polylineInfoWindow.close();
      }
      return;
    }

    // 选中新管线（只选中，不打开页面）
    checkLine.value = lineInfo;
    // 显示节点标记点
    shouldShowPolylinePoints.value = true;
    updatePolylinePointsVisibility();

    // 显示管线信息窗口（传入点击位置）
    showPolylineInfoWindow(lineObj, coords, accurateLngLat || ev.lnglat);

    // 注意：点击管线不会自动打开管线属性或管线矫正页面
  };

  // 注册地图点击事件作为备用
  aMaps.on("click", aMaps._mapClickHandler);

  // 添加DOM事件监听器用于管线点击检测（优先使用，更准确）
  setupPolylineDOMClickHandler();
}

// DOM 事件监听器用于管线点击检测（考虑缩放，更准确）
let mapContainerPolylineClickHandlerForDetection = null;

function setupPolylineDOMClickHandler() {
  const mapContainer = document.getElementById("map");
  if (!mapContainer) {
    console.warn("地图容器不存在，无法设置DOM点击监听");
    return;
  }

  // 移除旧的事件监听器（如果存在）
  if (mapContainerPolylineClickHandlerForDetection) {
    mapContainer.removeEventListener("click", mapContainerPolylineClickHandlerForDetection, true);
    mapContainerPolylineClickHandlerForDetection = null;
  }

  // 创建新的事件监听器
  mapContainerPolylineClickHandlerForDetection = function (domEv) {
    // 如果设备添加或管线添加模式打开，不处理管线点击检测
    if (showDeviceAdd.value || showPolylineAdd.value) {
      return;
    }

    // 检查是否点击了UI元素
    const target = domEv.target;
    const clickedElement = target.closest(".popCard, .el-dialog, .el-message, .searchCard, .inputCard, .selectCard, .deviceCard, .mapTool, .el-popover");
    if (clickedElement) {
      console.log("忽略UI元素点击（管线检测）");
      return;
    }

    // 检查是否有管线数据
    if (!allLines || allLines.length === 0) {
      return;
    }

    // 获取准确的坐标（考虑缩放）
    const coords = getLngLatFromDOMClick(domEv, mapContainer);
    if (!coords || coords.length !== 2) {
      return;
    }

    const [lng, lat] = coords;
    if (isNaN(lng) || isNaN(lat)) {
      return;
    }

    const clickLngLat = new AMap.LngLat(lng, lat);
    const clickPixel = aMaps.lngLatToContainer(clickLngLat);

    console.log("✅ DOM管线检测 - 点击坐标:", [lng, lat], "像素坐标:", clickPixel);

    // 使用准确的坐标进行管线点击检测
    const hit = hitTestLinesByPixels(allLines, clickPixel, clickLngLat);

    console.log("DOM管线检测结果:", hit, "地理距离（米）:", hit.minDist);

    // 使用地理距离作为判断标准（单位：米），更可靠
    const DISTANCE_THRESHOLD = 50; // 50米

    if (!hit.line || hit.minDist > DISTANCE_THRESHOLD) {
      console.log("未检测到管线或距离太远", "地理距离:", hit.minDist, "阈值:", DISTANCE_THRESHOLD);
      return;
    }

    // 阻止事件冒泡，避免触发其他点击事件
    domEv.stopPropagation();
    domEv.preventDefault();

    const lineObj = hit.line;
    const lineCoords = lineObj.coords;
    const props = lineObj.properties || {};

    // 构建管线信息对象
    const lineInfo = {
      coords: JSON.parse(JSON.stringify(lineCoords)), // 深拷贝坐标
      name: props.name || props.pipe_name || props.id || `管线-${props.pipe_diameter || "未知"}mm`,
      diameter: props.pipe_diameter || "-",
      properties: props,
      feature: lineObj.feature,
      originalCoords: JSON.parse(JSON.stringify(lineCoords)),
    };

    console.log("✅ DOM检测到管线:", lineInfo);

    // 如果点击的是同一条管线，则清除选中状态
    const currentLineId = checkLine.value && checkLine.value.properties ? checkLine.value.properties.id : null;
    const clickedLineId = lineInfo.properties ? lineInfo.properties.id : null;
    const isSameLine = currentLineId && clickedLineId && currentLineId === clickedLineId;

    if (isSameLine) {
      // 如果是同一条管线，清除选中状态
      console.log("取消选中管线（DOM检测）");
      checkLine.value = null;
      selectedPoint.value = null;
      shouldShowPolylinePoints.value = false;
      updatePolylinePointsVisibility();
      // 关闭信息窗口
      if (polylineInfoWindow) {
        polylineInfoWindow.close();
      }
      return;
    }

    // 选中新管线
    checkLine.value = lineInfo;
    // 显示节点标记点
    shouldShowPolylinePoints.value = true;
    updatePolylinePointsVisibility();

    // 显示管线信息窗口
    showPolylineInfoWindow(lineObj, lineCoords, clickLngLat);
  };

  // 在捕获阶段添加事件监听器，确保优先级
  mapContainer.addEventListener("click", mapContainerPolylineClickHandlerForDetection, true);
  console.log("✅ 已注册DOM管线点击检测监听器（捕获阶段）");
}

// 显示管线信息窗口
function showPolylineInfoWindow(lineObj, coords, clickPosition) {
  if (!lineObj || !coords || !polylineInfoWindow) return;

  const props = lineObj.properties || {};

  // 直接使用 properties 中的 length 字段
  const length = props.length !== null && props.length !== undefined ? props.length : null;
  const lenStr = length !== null ? `${length} m` : "未知";

  // 构建管线信息
  const lineData = {
    name: props.name || props.pipe_name || props.id || `管线-${props.pipe_diameter || "未知"}mm`,
    diameter: props.pipe_diameter || "-",
    length: length,
    lenStr: lenStr,
  };

  // 生成信息窗口内容
  const content = markerTxt.lineTxt(lineData);

  // 使用点击位置，如果没有则使用管线中心位置
  let position;
  if (clickPosition) {
    // 如果是数组格式 [lng, lat]
    if (Array.isArray(clickPosition)) {
      position = clickPosition;
    }
    // 如果是 AMap.LngLat 对象
    else if (clickPosition.lng !== undefined && clickPosition.lat !== undefined) {
      position = [clickPosition.lng, clickPosition.lat];
    }
    // 如果有 getLng 和 getLat 方法
    else if (typeof clickPosition.getLng === "function" && typeof clickPosition.getLat === "function") {
      position = [clickPosition.getLng(), clickPosition.getLat()];
    } else {
      // 使用管线中心位置作为后备
      let sumLng = 0,
        sumLat = 0;
      coords.forEach((coord) => {
        sumLng += coord[0];
        sumLat += coord[1];
      });
      position = [sumLng / coords.length, sumLat / coords.length];
    }
  } else {
    // 使用管线中心位置
    let sumLng = 0,
      sumLat = 0;
    coords.forEach((coord) => {
      sumLng += coord[0];
      sumLat += coord[1];
    });
    position = [sumLng / coords.length, sumLat / coords.length];
  }

  // 显示信息窗口
  polylineInfoWindow.setContent(content);
  polylineInfoWindow.open(aMaps, position);
}

//market 点击事件
function handkMarket(data, item) {
  // console.log("handkMarket点击")
  console.log(item);
  checkMarket.value = checkMarket.value == item ? null : item;
  setPoint(true);
}
//更新坐标
function updateMarket(item) {
  let market = markets.find((a) => a.getExtData().id == item.id);
  market.moveTo(item.position, {
    duration: 250,
    autoRotation: false,
  });
}

//更新方向
function updateUpRotation(item) {
  // console.log("handkMarket点击")
  // console.log(item)
  let market = markets.find((a) => a.getExtData().id == item.id);
  market.setContent(markerTxt.pointTxt(market.getExtData(), checkMarket.value));
}

// 创建选中管线的节点标记点
function createPolylinePoints(line) {
  if (!line || !line.coords) {
    console.log("createPolylinePoints: line无效", line);
    return;
  }

  // 先移除旧的点
  if (polylinePoints.length > 0) {
    aMaps.remove(polylinePoints);
    polylinePoints.forEach((point) => {
      if (point.off) point.off("click");
    });
  }
  polylinePoints = [];
  polylinePointMap.clear();
  selectedPoint.value = null;

  // 找到line在allLines中的索引（通过feature匹配，如果feature匹配不上，尝试通过坐标匹配）
  let lineIndex = allLines.findIndex((l) => {
    return l.feature === line.feature;
  });

  // 如果通过feature匹配不上，尝试通过坐标匹配（比较第一条坐标是否相同）
  if (lineIndex === -1 && line.coords && line.coords.length > 0) {
    const firstCoord = line.coords[0];
    lineIndex = allLines.findIndex((l) => {
      if (l.coords && l.coords.length > 0) {
        const lFirstCoord = l.coords[0];
        return Math.abs(lFirstCoord[0] - firstCoord[0]) < 0.000001 && Math.abs(lFirstCoord[1] - firstCoord[1]) < 0.000001;
      }
      return false;
    });
  }

  if (lineIndex === -1) {
    console.log("createPolylinePoints: 无法找到匹配的管线", line, allLines);
    // 如果找不到匹配的，直接使用line.coords创建点
    line.coords.forEach((coord, pointIndex) => {
      const pointContent = createPointMarkerContent(false);
      const pointMarker = new AMap.Marker({
        position: [coord[0], coord[1]],
        content: pointContent,
        offset: new AMap.Pixel(-11, -11),
        zIndex: 15,
        extData: {
          coord: coord,
          lineIndex: -1,
          pointIndex: pointIndex,
          lineObj: line,
        },
      });
      polylinePoints.push(pointMarker);
      pointMarker.on("click", function () {
        handlePointClick({
          coord: coord,
          marker: pointMarker,
          lineIndex: -1,
          pointIndex: pointIndex,
          lineObj: line,
        });
      });
    });
    if (polylinePoints.length > 0) {
      aMaps.add(polylinePoints);
      polylinePoints.forEach((point) => {
        point.show();
        updatePointStyle(point);
      });
    }
    return;
  }

  const lineObj = allLines[lineIndex];

  // 为当前选中管线的每个点创建标记
  lineObj.coords.forEach((coord, pointIndex) => {
    // 创建节点标记点的HTML内容
    const pointContent = createPointMarkerContent(false); // 默认未选中

    const pointMarker = new AMap.Marker({
      position: [coord[0], coord[1]],
      content: pointContent,
      offset: new AMap.Pixel(-11, -11), // 居中偏移，使圆点居中
      zIndex: 15, // 确保点在线上方显示
      extData: {
        coord: coord,
        lineIndex: lineIndex,
        pointIndex: pointIndex,
        lineObj: lineObj,
      },
    });

    polylinePoints.push(pointMarker);

    // 绑定点击事件
    pointMarker.on("click", function () {
      handlePointClick({
        coord: coord,
        marker: pointMarker,
        lineIndex: lineIndex,
        pointIndex: pointIndex,
        lineObj: lineObj,
      });
    });
  });

  // 将节点标记点添加到地图
  if (polylinePoints.length > 0) {
    aMaps.add(polylinePoints);
    // 显示所有点
    polylinePoints.forEach((point) => {
      point.show();
      updatePointStyle(point);
    });
  }
}

// 更新节点标记点的显示/隐藏
function updatePolylinePointsVisibility() {
  // 如果应该显示点且有选中的管线，则创建并显示点
  if (shouldShowPolylinePoints.value && checkLine.value) {
    createPolylinePoints(checkLine.value);
  } else if (polylinePoints.length > 0) {
    // 隐藏并移除点
    aMaps.remove(polylinePoints);
    polylinePoints.forEach((point) => {
      if (point.off) point.off("click");
    });
    polylinePoints = [];
    polylinePointMap.clear();
    selectedPoint.value = null;
  }
}

// 创建节点标记点的HTML内容（返回DOM元素）
function createPointMarkerContent(isSelected) {
  const div = document.createElement("div");
  if (isSelected) {
    // 选中状态：红色，放大
    div.style.width = "22px";
    div.style.height = "22px";
    div.style.background = "#f33225";
    div.style.border = "3px solid #fff";
    div.style.borderRadius = "50%";
    div.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
    div.style.cursor = "pointer";
  } else {
    // 普通状态：绿色，正常大小
    div.style.width = "16px";
    div.style.height = "16px";
    div.style.background = "#46b97e";
    div.style.border = "2px solid #fff";
    div.style.borderRadius = "50%";
    div.style.boxShadow = "0 1px 3px rgba(0,0,0,0.2)";
    div.style.cursor = "pointer";
  }
  return div;
}

// 更新点的样式（选中状态改变图标）
function updatePointStyle(point) {
  if (!point || typeof point.setContent !== "function") return;

  // 通过 extData 中的 lineIndex 和 pointIndex 来判断是否选中（更可靠）
  let isSelected = false;
  if (selectedPoint.value) {
    const extData = point.getExtData ? point.getExtData() : {};
    isSelected = extData.lineIndex === selectedPoint.value.lineIndex && extData.pointIndex === selectedPoint.value.pointIndex;
  }

  // 更新Marker的content和zIndex
  const newContent = createPointMarkerContent(isSelected);
  try {
    point.setContent(newContent);
    if (typeof point.setZIndex === "function") {
      point.setZIndex(isSelected ? 20 : 15);
    }
  } catch (error) {
    console.error("更新点样式失败:", error);
  }
}

// 处理点的点击事件
function handlePointClick(pointInfo) {
  // 只有在管线矫正弹窗打开时才允许选中点
  if (!showPolylineCorrect.value) {
    return;
  }

  // 保存之前选中的点，以便取消选中状态
  const previousSelectedPoint = selectedPoint.value
    ? {
        lineIndex: selectedPoint.value.lineIndex,
        pointIndex: selectedPoint.value.pointIndex,
        marker: selectedPoint.value.marker,
      }
    : null;

  // 如果点击的是同一个点，则取消选中
  if (selectedPoint.value && selectedPoint.value.lineIndex === pointInfo.lineIndex && selectedPoint.value.pointIndex === pointInfo.pointIndex) {
    selectedPoint.value = null;
  } else {
    selectedPoint.value = pointInfo;
  }

  // 只更新之前选中的点和当前选中的点的样式（性能优化）
  if (previousSelectedPoint && previousSelectedPoint.marker) {
    updatePointStyle(previousSelectedPoint.marker);
  }
  if (selectedPoint.value && selectedPoint.value.marker) {
    updatePointStyle(selectedPoint.value.marker);
  }

  // 移除panTo，避免延迟（用户已经看到了点，不需要移动地图）
  // 如果需要，可以添加一个选项让用户手动移动地图
}

// 查看管线定位
function lineCheck(line) {
  if (!line) return;

  // 设置选中的管线
  checkLine.value = line;
  // 显示节点标记点
  shouldShowPolylinePoints.value = true;
  updatePolylinePointsVisibility();

  // 计算管线的中心点并移动到该位置
  const coords = line.coords;
  if (coords && coords.length > 0) {
    // 计算所有点的中心位置
    let sumLng = 0,
      sumLat = 0;
    coords.forEach((coord) => {
      sumLng += coord[0];
      sumLat += coord[1];
    });
    const center = [sumLng / coords.length, sumLat / coords.length];
    aMaps.panTo(center, 250);
  }
}

//更新点的坐标（只更新Marker位置，不影响管线，类似设备移动）
function updatePoint(newCoord) {
  if (!selectedPoint.value || !checkLine.value) {
    return;
  }

  const { marker } = selectedPoint.value;
  if (!marker) {
    return;
  }

  // 直接使用setPosition方法，立即更新位置（不使用动画，响应更快）
  try {
    if (typeof marker.setPosition === "function") {
      // 使用setPosition，这是最快的方式
      marker.setPosition(newCoord);
    } else if (typeof marker.setLngLat === "function") {
      // 某些地图库使用setLngLat
      marker.setLngLat(newCoord);
    } else if (typeof marker.moveTo === "function") {
      // 如果setPosition不存在，使用moveTo但设置duration为0（立即移动）
      marker.moveTo(newCoord, {
        duration: 0,
        autoRotation: false,
      });
    }
  } catch (error) {
    console.error("更新点位置失败:", error);
  }

  // 更新选中点的坐标信息（用于后续保存）
  selectedPoint.value.coord = newCoord;
  if (marker && typeof marker.setExtData === "function") {
    const extData = marker.getExtData ? marker.getExtData() : {};
    marker.setExtData({
      ...extData,
      coord: newCoord,
    });
  }
}

// 从lines数组重新构建GeoJSON数据
function buildGeoJSONFromLines(lines) {
  const features = lines.map((lineObj) => {
    return {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: lineObj.coords,
      },
      properties: lineObj.properties,
    };
  });

  return {
    type: "FeatureCollection",
    features: features,
  };
}

// 保存管线
async function savePolyline(line) {
  if (!checkLine.value) {
    return;
  }

  let updatedPointInfo = null; // 记录更新的点信息

  // 保存时，将当前Marker的位置更新到管线的实际数据中
  if (selectedPoint.value && selectedPoint.value.marker) {
    const { lineIndex, pointIndex, marker } = selectedPoint.value;
    const currentPosition = marker.getPosition();
    const newCoord = [currentPosition.getLng(), currentPosition.getLat()];

    // 记录更新的点信息（用于打印）
    const originalCoord = checkLine.value.coords[pointIndex];
    updatedPointInfo = {
      pointIndex: pointIndex,
      originalCoord: originalCoord,
      newCoord: newCoord,
      lineIndex: lineIndex,
    };

    // 更新管线数据
    checkLine.value.coords[pointIndex] = newCoord;
    if (allLines[lineIndex]) {
      allLines[lineIndex].coords[pointIndex] = newCoord;
    }

    // 更新选中点的坐标信息
    selectedPoint.value.coord = newCoord;
  }

  // 获取管线ID
  const lineId = checkLine.value.properties?.id;
  if (!lineId) {
    ElMessage.error("无法获取管线ID，保存失败");
    return;
  }

  // 构建请求数据
  const requestData = {
    id: lineId,
    geometry: {
      coordinates: checkLine.value.coords,
      type: "LineString",
    },
  };

  try {
    // 调用API保存管线坐标
    const { code, msg } = await proxy.ajax.post("/updateBasicLinestringDevice", requestData, true);

    if (code === 200) {
      ElMessage.success("保存成功");

      // 构建更新后的GeoJSON数据用于更新地图显示
      if (layerObj && allLines.length > 0) {
        const geoJsonData = buildGeoJSONFromLines(allLines);
        const newGeo = new Loca.GeoJSONSource({ data: geoJsonData });
        layerObj.setSource(newGeo);
      }

      // 打印更新后的管线数据
      console.log("=== 更新后的管线数据 ===");
      console.log(JSON.stringify(requestData, null, 2));

      // 打印更新的点信息
      if (updatedPointInfo) {
        console.log("\n=== 更新的点信息 ===");
        console.log(`点索引: ${updatedPointInfo.pointIndex}`);
        console.log(`原始坐标: [${updatedPointInfo.originalCoord[0]}, ${updatedPointInfo.originalCoord[1]}]`);
        console.log(`新坐标: [${updatedPointInfo.newCoord[0]}, ${updatedPointInfo.newCoord[1]}]`);
        console.log(`经度变化: ${updatedPointInfo.newCoord[0] - updatedPointInfo.originalCoord[0]}`);
        console.log(`纬度变化: ${updatedPointInfo.newCoord[1] - updatedPointInfo.originalCoord[1]}`);
      }

      // 保存后清除选中的点和节点标记点显示
      selectedPoint.value = null;
      shouldShowPolylinePoints.value = false;
      updatePolylinePointsVisibility();

      // 刷新页面数据
      await device_display();
    } else {
      ElMessage.error(msg || "保存失败");
    }
  } catch (error) {
    console.error("保存管线失败:", error);
    ElMessage.error("保存失败，请重试");
  }
}

//设置属性
function deviceCheck(item) {
  item.id = item.device_id ? item.device_id : item.id;
  checkMarket.value = item;
  deviceList.find((a) => {
    if (a.id == item.pointType) {
      a.check = true;
      return;
    }
  });

  aMaps.panTo(item.position, 250);
  marketArray = deviceList.filter((item) => item.check).reduce((list, item) => [...list, ...item.items], []);
  setPoint(true);
}

const inputName = ref(null);
//口径
const inputCaliber = ref(null);

async function getDevice() {
  let name = inputName.value;

  if (!name) {
    ElMessage.warning("请输入设备名称");
    return;
  }

  let { data } = await proxy.ajax.post("device_display/getDevice", { name }, true);
  if (data.length > 0) {
    let item = data[0];
    checkMarket.value = item;
    deviceList.find((a) => {
      if (a.id == item.pointType) {
        a.check = true;
        return;
      }
    });

    setTimeout(() => {
      aMaps.panTo(item.position, 250);
      marketArray = deviceList.filter((item) => item.check).reduce((list, item) => [...list, ...item.items], []);
      setPoint(true);
    }, 250);
  }
}

async function getDeviceByCaliber() {
  let caliber = inputCaliber.value;
  if (!caliber) {
    ElMessage.warning("请输入口径");
    return;
  }
  //需要多加管线口径
  device_display();
}

// 清除临时管线标记点
function clearTempPolylineMarkers() {
  if (tempPolylineMarkers.length > 0) {
    aMaps.remove(tempPolylineMarkers);
    tempPolylineMarkers.forEach((marker) => {
      if (marker.off) marker.off("click");
    });
    tempPolylineMarkers = [];
  }
  if (tempPolylinePolyline) {
    aMaps.remove(tempPolylinePolyline);
    tempPolylinePolyline = null;
  }
}

// 临时设备标记点（用于显示正在添加的设备位置）
let tempDeviceMarker = null;

// 获取缩放比例
function getScaleRatio() {
  const appElement = document.getElementById("app");
  if (!appElement) return 1;

  const transform = window.getComputedStyle(appElement).transform;
  if (!transform || transform === "none") return 1;

  // 解析 transform: matrix(scaleX, 0, 0, scaleY, tx, ty)
  const matrix = transform.match(/matrix\(([^)]+)\)/);
  if (matrix && matrix[1]) {
    const values = matrix[1].split(",").map((v) => parseFloat(v.trim()));
    if (values.length >= 4 && values[0] > 0) {
      return values[0]; // scaleX
    }
  }

  return 1;
}

// 从DOM点击事件获取准确的经纬度坐标
function getLngLatFromDOMClick(domEvent, mapContainer) {
  const scale = getScaleRatio();

  // 获取地图容器的位置信息（这是缩放后的）
  const rect = mapContainer.getBoundingClientRect();

  // 计算点击位置相对于容器的像素坐标（这是缩放后的坐标）
  const relativeX = domEvent.clientX - rect.left;
  const relativeY = domEvent.clientY - rect.top;

  // 将缩放后的坐标转换为未缩放前的坐标
  // 因为高德地图的 containerToLngLat 使用的是容器内部的坐标系统
  const pixelX = relativeX / scale;
  const pixelY = relativeY / scale;

  console.log("=== DOM点击坐标转换 ===");
  console.log("屏幕坐标:", domEvent.clientX, domEvent.clientY);
  console.log("容器位置:", rect.left, rect.top);
  console.log("容器尺寸:", rect.width, rect.height);
  console.log("相对位置(缩放后):", relativeX, relativeY);
  console.log("缩放比例:", scale);
  console.log("调整后位置(未缩放):", pixelX, pixelY);

  // 使用调整后的坐标转换为地理坐标
  const pixel = new AMap.Pixel(pixelX, pixelY);
  const lnglat = aMaps.containerToLngLat(pixel);

  if (lnglat) {
    const lng = typeof lnglat.getLng === "function" ? lnglat.getLng() : lnglat.lng;
    const lat = typeof lnglat.getLat === "function" ? lnglat.getLat() : lnglat.lat;
    console.log("转换后的地理坐标:", lng, lat);
    return [lng, lat];
  }

  return null;
}

// 更新临时设备标记点
function updateTempDeviceMarker(position) {
  // 移除旧的标记点
  if (tempDeviceMarker) {
    aMaps.remove(tempDeviceMarker);
    tempDeviceMarker = null;
  }

  if (!position || !Array.isArray(position) || position.length < 2) {
    return;
  }

  const [lng, lat] = position;
  if (typeof lng !== "number" || typeof lat !== "number" || isNaN(lng) || isNaN(lat)) {
    return;
  }

  console.log("创建临时标记点，坐标:", [lng, lat]);

  // 创建标记点内容
  const markerContent = createTempDeviceMarkerContent();

  // 创建 marker，offset 设置为 0，让 marker 的左上角对准点击位置
  // 但实际上我们需要让圆心对准，所以计算 offset
  const markerSize = 44; // 标记点大小
  const offsetX = -markerSize / 2; // 向左偏移一半，让圆心对准
  const offsetY = -markerSize / 2; // 向上偏移一半，让圆心对准

  tempDeviceMarker = new AMap.Marker({
    position: [lng, lat],
    content: markerContent,
    offset: new AMap.Pixel(offsetX, offsetY), // 让圆心对准点击位置
    zIndex: 999,
    draggable: false,
  });

  aMaps.add(tempDeviceMarker);

  // 验证标记点位置
  setTimeout(() => {
    if (tempDeviceMarker) {
      const markerPos = tempDeviceMarker.getPosition();
      const actualLng = typeof markerPos.getLng === "function" ? markerPos.getLng() : markerPos.lng;
      const actualLat = typeof markerPos.getLat === "function" ? markerPos.getLat() : markerPos.lat;
      console.log("标记点实际位置:", [actualLng, actualLat], "期望位置:", [lng, lat]);

      // 将实际位置和期望位置都转换为像素坐标，看看偏差
      const expectedPixel = aMaps.lngLatToContainer(new AMap.LngLat(lng, lat));
      const actualPixel = aMaps.lngLatToContainer(markerPos);
      console.log("期望像素坐标:", expectedPixel?.x, expectedPixel?.y);
      console.log("实际像素坐标:", actualPixel?.x, actualPixel?.y);
      if (expectedPixel && actualPixel) {
        console.log("像素偏差:", actualPixel.x - expectedPixel.x, actualPixel.y - expectedPixel.y);
      }
    }
  }, 100);
}

// 创建临时设备标记点内容
function createTempDeviceMarkerContent() {
  const div = document.createElement("div");
  const size = 44;
  div.style.width = `${size}px`;
  div.style.height = `${size}px`;
  div.style.background = "#ff6600";
  div.style.border = "3px solid #fff";
  div.style.borderRadius = "50%";
  div.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
  div.style.cursor = "pointer";
  div.style.display = "flex";
  div.style.alignItems = "center";
  div.style.justifyContent = "center";
  div.style.boxSizing = "border-box";

  const innerCircle = document.createElement("div");
  innerCircle.style.width = "20px";
  innerCircle.style.height = "20px";
  innerCircle.style.background = "#fff";
  innerCircle.style.borderRadius = "50%";
  div.appendChild(innerCircle);

  return div;
}

// 清除临时设备标记点
function clearTempDeviceMarker() {
  if (tempDeviceMarker) {
    aMaps.remove(tempDeviceMarker);
    tempDeviceMarker = null;
  }
}

// 地图容器 DOM 点击事件处理器（用于设备添加模式）
let mapContainerClickHandler = null;

// 监听设备添加页面状态，管理 DOM 事件监听和临时标记点
watch(showDeviceAdd, (newVal) => {
  const mapContainer = document.getElementById("map");
  if (!mapContainer) {
    console.warn("地图容器不存在");
    return;
  }

  if (!newVal) {
    // 关闭时清除临时标记点和事件监听
    clearTempDeviceMarker();
    if (mapContainerClickHandler) {
      mapContainer.removeEventListener("click", mapContainerClickHandler, true);
      mapContainerClickHandler = null;
    }
    deviceAddClickPosition.value = null;
  } else {
    // 打开时添加 DOM 点击事件监听（在捕获阶段，优先于地图事件）
    if (!mapContainerClickHandler) {
      mapContainerClickHandler = function (domEv) {
        if (!showDeviceAdd.value) return;

        // 检查是否点击的是UI元素
        const target = domEv.target;
        const clickedElement = target.closest(".popCard, .el-dialog, .el-message, .searchCard, .inputCard, .selectCard, .deviceCard, .mapTool");
        if (clickedElement) {
          console.log("忽略UI元素点击");
          return;
        }

        // 阻止事件传播到地图点击事件
        domEv.stopPropagation();
        domEv.preventDefault();

        // 获取准确的经纬度坐标
        const coords = getLngLatFromDOMClick(domEv, mapContainer);
        if (coords && coords.length === 2) {
          deviceAddClickPosition.value = coords;
          console.log("✅ 设备添加 - 点击位置:", deviceAddClickPosition.value);
          // 更新临时标记点（会自动触发）
        } else {
          console.error("❌ 无法获取有效的坐标");
          ElMessage.warning("无法获取点击位置，请重试");
        }
      };
      mapContainer.addEventListener("click", mapContainerClickHandler, true);
      console.log("已注册DOM点击事件监听（设备添加模式）");
    }
  }
});

// 监听设备添加点击位置变化，更新临时标记点
watch(deviceAddClickPosition, (newPos) => {
  if (showDeviceAdd.value && newPos && Array.isArray(newPos) && newPos.length >= 2) {
    updateTempDeviceMarker(newPos);
  } else {
    clearTempDeviceMarker();
  }
});

// 设备添加完成回调
async function onDeviceAdded(deviceData) {
  console.log("设备添加完成:", deviceData);
  try {
    // 清除临时标记点
    clearTempDeviceMarker();
    // 清除点击位置
    deviceAddClickPosition.value = null;
    // 刷新设备列表和地图显示
    await device_display();
    ElMessage.success("地图设备已更新");
  } catch (error) {
    console.error("刷新设备列表失败:", error);
    ElMessage.error("设备添加成功，但刷新地图失败，请手动刷新");
  }
  // 关闭设备添加页面（可选）
  // showDeviceAdd.value = false;
}

// 设备删除完成回调
async function onDeviceDeleted() {
  console.log("设备删除完成，刷新地图设备");
  try {
    // 清除当前选中的设备
    checkMarket.value = null;
    // 刷新设备列表和地图显示
    await device_display();
  } catch (error) {
    console.error("刷新地图设备失败:", error);
    ElMessage.error("设备删除成功，但刷新地图失败，请手动刷新");
  }
}

// 管线添加完成回调
async function onPolylineAdded(polylineData) {
  console.log("管线添加完成:", polylineData);
  try {
    // 清除临时标记点
    clearTempPolylineMarkers();
    // 清除点击位置
    polylineAddClickPosition.value = null;
    // 刷新设备列表和地图显示（包含管线刷新）
    await device_display();
    ElMessage.success("地图管线已更新");
  } catch (error) {
    console.error("刷新地图管线失败:", error);
    ElMessage.error("管线添加成功，但刷新地图失败，请手动刷新");
  }
  await device_display();
  // 关闭管线添加页面（可选）
  // showPolylineAdd.value = false;
}

// 管线删除完成回调
async function onPolylineDeleted() {
  console.log("管线删除完成，刷新地图管线");
  try {
    // 清除当前选中的管线
    checkLine.value = null;
    // 清除管线节点标记点
    if (polylinePoints.length > 0) {
      aMaps.remove(polylinePoints);
      polylinePoints = [];
    }
    // 刷新设备列表和地图显示（包含管线刷新）
    await device_display();
    ElMessage.success("地图管线已更新");
  } catch (error) {
    console.error("刷新地图管线失败:", error);
    ElMessage.error("管线删除成功，但刷新地图失败，请手动刷新");
  }
}

// 管线添加点回调（用于实时显示添加的管线）
function onPolylinePointAdded(coord) {
  console.log("管线添加点:", coord);
  // 在地图上显示临时标记点
  if (coord && Array.isArray(coord) && coord.length >= 2) {
    const marker = new AMap.Marker({
      position: [coord[0], coord[1]],
      content: createTempPointContent(),
      offset: new AMap.Pixel(-11, -11),
      zIndex: 16,
    });
    tempPolylineMarkers.push(marker);
    aMaps.add(marker);

    // 如果有至少2个点，绘制临时管线
    if (tempPolylineMarkers.length >= 2) {
      updateTempPolyline();
    }
  }
}

// 更新管线标记点（根据新的点列表重新绘制）
function updatePolylineMarkersFromCoords(coords) {
  console.log("更新管线标记点，新点列表:", coords);

  // 清除所有现有的临时标记点
  clearTempPolylineMarkers();

  // 根据新的点列表重新创建标记点
  if (coords && Array.isArray(coords) && coords.length > 0) {
    coords.forEach((coord) => {
      if (coord && Array.isArray(coord) && coord.length >= 2) {
        const marker = new AMap.Marker({
          position: [coord[0], coord[1]],
          content: createTempPointContent(),
          offset: new AMap.Pixel(-11, -11),
          zIndex: 16,
        });
        tempPolylineMarkers.push(marker);
        aMaps.add(marker);
      }
    });

    // 如果有至少2个点，绘制临时管线
    if (tempPolylineMarkers.length >= 2) {
      updateTempPolyline();
    }
  }
}

// 创建临时点标记内容
function createTempPointContent() {
  const div = document.createElement("div");
  div.style.width = "22px";
  div.style.height = "22px";
  div.style.background = "#ff6600";
  div.style.border = "3px solid #fff";
  div.style.borderRadius = "50%";
  div.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
  div.style.cursor = "pointer";
  return div;
}

// 更新临时管线显示
function updateTempPolyline() {
  if (tempPolylineMarkers.length < 2) return;

  // 移除旧的临时管线
  if (tempPolylinePolyline) {
    aMaps.remove(tempPolylinePolyline);
  }

  // 获取所有点的坐标
  const path = tempPolylineMarkers.map((marker) => {
    const pos = marker.getPosition();
    return [pos.getLng(), pos.getLat()];
  });

  // 创建临时管线
  tempPolylinePolyline = new AMap.Polyline({
    path: path,
    strokeColor: "#ff6600",
    strokeWeight: 4,
    strokeOpacity: 0.8,
    strokeStyle: "dashed",
    zIndex: 14,
  });

  aMaps.add(tempPolylinePolyline);
}

// 地图容器 DOM 点击事件处理器（用于管线添加模式）
let mapContainerPolylineClickHandler = null;

// 监听管线添加页面状态，管理 DOM 事件监听和临时标记点
watch(showPolylineAdd, (newVal) => {
  const mapContainer = document.getElementById("map");
  if (!mapContainer) {
    console.warn("地图容器不存在");
    return;
  }

  if (!newVal) {
    // 关闭时清除临时标记点和事件监听
    clearTempPolylineMarkers();
    if (mapContainerPolylineClickHandler) {
      mapContainer.removeEventListener("click", mapContainerPolylineClickHandler, true);
      mapContainerPolylineClickHandler = null;
    }
    polylineAddClickPosition.value = null;
  } else {
    // 打开时添加 DOM 点击事件监听（在捕获阶段，优先于地图事件）
    if (!mapContainerPolylineClickHandler) {
      mapContainerPolylineClickHandler = function (domEv) {
        if (!showPolylineAdd.value) return;

        // 检查是否点击的是UI元素
        const target = domEv.target;
        const clickedElement = target.closest(".popCard, .el-dialog, .el-message, .searchCard, .inputCard, .selectCard, .deviceCard, .mapTool");
        if (clickedElement) {
          console.log("忽略UI元素点击");
          return;
        }

        // 阻止事件传播到地图点击事件
        domEv.stopPropagation();
        domEv.preventDefault();

        // 获取准确的经纬度坐标
        const coords = getLngLatFromDOMClick(domEv, mapContainer);
        if (coords && coords.length === 2) {
          polylineAddClickPosition.value = coords;
          console.log("✅ 管线添加 - 点击位置:", polylineAddClickPosition.value);
        } else {
          console.error("❌ 无法获取有效的坐标");
          ElMessage.warning("无法获取点击位置，请重试");
        }
      };
      mapContainer.addEventListener("click", mapContainerPolylineClickHandler, true);
      console.log("已注册DOM点击事件监听（管线添加模式）");
    }
  }
});
</script>

<style lang="scss" scoped>
.cardBody {
  position: relative;
  overflow: hidden;
  height: 100%; /* 兜底：确保根容器撑满 #app，使 #map 有有效高度，避免高德 3D 地图 LngLat(NaN, NaN) */
}

.mapCard {
  width: 100%;
  height: 100%;
}

.main {
  display: flex;
  position: relative;
  height: 0;

  padding-left: 12px;

  .searchCard {
    position: relative;
    z-index: 10;
    margin: 20px 0px 0 12px;
    display: flex;
    align-items: center;
    height: 40px;

    &.navCard {
      position: absolute;
      right: 20px;
      top: 20px;
      margin: 0;
      flex-direction: column;
      align-items: flex-start;
      height: auto;

      .item {
        width: 140px;
        min-width: 110px;
        margin: 0 0 10px 0;
        justify-content: flex-start;
      }
    }

    .item {
      min-width: 120px;
      height: 50px;
      background: #fff;
      border-radius: 6px;
      margin-right: 10px;
      box-sizing: border-box;
      padding: 0 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

      &:hover,
      &.on {
        background: #46b97e;

        .imgBox {
          img.hov {
            position: absolute;
            left: 50%;
            top: 50%;
            z-index: 2;
            transform: translateX(-50%) translateY(-50%);
            opacity: 1;
          }
        }

        p {
          color: #fff;
        }
      }

      .imgBox {
        height: 22px;
        margin-right: 8px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;

        img {
          height: 22px;

          &.hov {
            position: absolute;
            left: 50%;
            top: 50%;
            z-index: 2;
            transform: translateX(-50%) translateY(-50%);
            opacity: 0;
          }
        }
      }

      p {
        font-size: 20px;
        color: #585657;
        line-height: 1em;
      }
    }
  }
}

.inputCard {
  position: relative;
  z-index: 10;
  margin: 20px 0 10px;
  display: flex;
  align-items: center;
  height: 40px;
  position: relative;
  width: 175px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  height: 40px;
  background: #fff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 0 12px;

  input {
    flex: 1;
    font-size: 20px;
    color: #585657;

    &::placeholder {
      color: #a0a0a0;
    }
  }
}

.deviceCard {
  position: absolute;
  display: flex;
  flex-direction: column;
  left: 20px;
  bottom: 20px;
  z-index: 20;

  .item {
    &.tc {
      justify-content: center;
    }

    &.on,
    &:hover {
      background: #46b97e;

      p {
        color: #fff;
      }

      .imgBox {
        img {
          opacity: 0;
        }

        .hov {
          opacity: 1;
        }
      }
    }

    transition: all 0.2s;
    width: 120px;
    height: 42px;
    border-radius: 6px;
    margin-top: 10px;
    background: #fff;
    box-sizing: border-box;
    padding: 0 12px;
    display: flex;
    align-items: center;

    .imgBox {
      width: 24px;
      height: 24px;
      margin-right: 8px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 24px;
        height: 24px;

        &.hov {
          position: absolute;
          left: 50%;
          top: 50%;
          z-index: 2;
          transform: translateX(-50%) translateY(-50%);
          opacity: 0;
        }
      }
    }

    p {
      font-size: 20px;
      color: #585657;
    }
  }
}

.mapTool {
  position: absolute;
  z-index: 20;
  left: 20px;
  display: flex;
  flex-direction: column;
  top: 140px;

  .scaleCard {
    width: 70px;
    height: 70px;
    background: #fff;
    border-radius: 6px;
    margin-right: 10px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    transition: all 0.2s;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 10px;

    .item {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      border-top: 1px solid #f6f6f6;
      margin: 0 8px;

      &:hover {
        img {
          &.hov {
            opacity: 1;
          }
        }
      }

      img {
        width: 20px;
        height: 20px;

        &.hov {
          position: absolute;
          left: 50%;
          top: 50%;
          z-index: 2;
          transform: translateX(-50%) translateY(-50%);
          opacity: 0;
        }
      }
    }
  }

  .panCard {
    width: 70px;
    height: 70px;
    background: #fff;
    border-radius: 6px;
    margin-right: 10px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: all 0.2s;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    position: relative;

    .icon {
      width: 22px;
      opacity: 0.1;
    }

    .item {
      width: 25px;
      height: 25px;
      display: flex;
      align-items: center;
      justify-content: center;
      left: 50%;
      top: 50%;
      position: absolute;

      &:hover {
        img {
          &.hov {
            opacity: 1;
          }
        }
      }

      // transform: translateX(-50%) translateY(-50%);/
      img {
        width: 22px;

        &.hov {
          position: absolute;
          left: 50%;
          top: 50%;
          z-index: 2;
          transform: translateX(-50%) translateY(-50%);
          opacity: 0;
        }
      }

      &.top {
        top: 0%;
        transform: translateX(-50%);
      }

      &.bottom {
        top: auto;
        bottom: 0;
        transform: translateX(-50%) rotate(180deg);
      }

      &.left {
        left: 0;
        top: 50%;
        transform: translateY(-50%) rotate(270deg);
      }

      &.right {
        left: auto;
        right: 0;
        top: 50%;
        transform: translateY(-50%) rotate(90deg);
      }
    }
  }
}
</style>
