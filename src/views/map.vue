<template>
  <div class="cardBody">
    <div class="main">
      <div class="searchCard">
        <template v-for="(item, index) in main" :key="index">
          <a class="item" :class="mainIndex == item.id ? 'on' : ''" @click.stop="setMap(item)">
            <div class="imgBox">
              <img :src="item.icon" alt="" class="img" />
              <img :src="item.icon2" alt="" class="hov" />
            </div>
            <p>{{ item.name }}</p>
          </a>
        </template>
      </div>

      <div class="selectCard">
        <selectCard width="250" :options="allTown" propValue="name" :name="allTownSelect" v-model:select="allTownSelect" @selectItem="selectTown"></selectCard>
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

      <div class="searchCard navCard">
        <template v-for="(item, index) in navList" :key="index">
          <a class="item" @click.stop="setNav(item)" :class="(index == 0 && showCorrect) || (index == 1 && showDevice) || (index == 2 && showFalut) ? 'on' : ''">
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
    <device v-model:show="showDevice" @deviceCheck="deviceCheck" :allTownSelect="allTownSelect"></device>
    <coordinate v-model:show="showCorrect" :checkMarket="checkMarket" :allTownSelect="allTownSelect" @updateMarket="updateMarket" @updateUpRotation="updateUpRotation"></coordinate>

    <div id="map" class="mapCard"></div>
  </div>
</template>

<script setup>
import eventBus from "@/api/eventBus";
import { markerTxt } from "@/api/market.js";
import fault from "@/components/map/fault";
import device from "@/components/map/device";
import coordinate from "@/components/map/coordinate";
import { useStore } from "vuex";
import AMapLoader from "@amap/amap-jsapi-loader";
import { getCurrentInstance, onMounted, onUnmounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
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

async function getAllTow() {
  let { data } = await proxy.ajax.get("device_display/getAllTown");
  allTown.value = data;
  allTownSelect.value = data.length > 0 ? data[0].name : null;
  mapData.center = data.length > 0 ? [data[0].lat, data[0].lnt] : null;
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
  aMaps = new AMap.Map("map", mapData);
  // 创建 Loca 实例
  locaMap = new Loca.Container({
    map: aMaps,
  });
}

// const selectSlide = ref(false);
const main = reactive([
  { id: 0, name: "标准地图", icon: require("@/assets/icon11.svg"), icon2: require("@/assets/icon12.svg") },
  { id: 1, name: "卫星地图", icon: require("@/assets/icon13.svg"), icon2: require("@/assets/icon14.svg") },
]);
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
  { id: 0, name: "经纬度校正", icon: require("@/assets/icon17.svg"), icon2: require("@/assets/icon18.svg") },
  { id: 1, name: "设备属性", icon: require("@/assets/icon19.svg"), icon2: require("@/assets/icon20.svg") },
  { id: 2, name: "异常信息", icon: require("@/assets/icon21.svg"), icon2: require("@/assets/icon22.svg") },
]);

const showFalut = ref(false);
const showDevice = ref(false);
const showCorrect = ref(false);

function setNav(item) {
  // item.check = item.check ? false : true;
  if (item.id == 0) {
    showCorrect.value = showCorrect.value ? false : true;
    showDevice.value = false;
    showFalut.value = false;
  }
  if (item.id == 1) {
    showDevice.value = showDevice.value ? false : true;
    showFalut.value = false;
    showCorrect.value = false;
  }
  if (item.id == 2) {
    showFalut.value = showFalut.value ? false : true;
    showDevice.value = false;
    showCorrect.value = false;
  }
  navList.map((a) => {
    if (a.id != item.id) {
      a.check = false;
    }
  });
}

let marketArray = reactive([]);
let markets = reactive([]);
let checkMarket = ref(null);
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
]);

//获取坐标数据
async function device_display() {
  let DeviceDisplayForm = {
    city_town: allTownSelect.value,
    pointTypes: [],
  };
  let { data } = await proxy.ajax.post("/device_display", DeviceDisplayForm, true);
  let { data: features } = await proxy.ajax.get("DBAllDataGet", { city_town: DeviceDisplayForm.city_town }, true);

  setPolyline(features);

  checkMarket.value = null;
  eventBus.emit("reGet");
  if (data) {
    deviceList.map((a) => {
      a.items = data.filter((item) => item.pointType == a.id);
    });
    marketArray = deviceList.filter((item) => item.check).reduce((list, item) => [...list, ...item.items], []);
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
      content: markerTxt.pointTxt(a, checkMarket.value), //自定义点标记覆盖物内容
      position: a.position, //基点位置
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
  aMaps.setFitView(markets, false, [30, 20, 30, 20], 20);
}

let layerObj = null;

//地图折线
function setPolyline(item) {
  locaMap.remove(layerObj);

  var geo = new Loca.GeoJSONSource({
    data: item,
  });
  var layer = new Loca.PulseLineLayer({
    zIndex: 10,
    opacity: 1,
    visible: true,
  });
  layer.setSource(geo);
  layer.setStyle({
    altitude: 0,
    lineWidth: 10,
    // 脉冲头颜色
    headColor: (_, feature) => {
      return "#fff";
    },
    // 脉冲尾颜色
    trailColor: "#46b97e",
    // 脉冲长度，0.25 表示一段脉冲占整条路的 1/4
    interval: 0.1,
    // 脉冲线的速度，几秒钟跑完整段路
    duration: 2500,
  });
  layerObj = layer;
  locaMap.add(layer);
  locaMap.animate.start();
}
//market 点击事件
function handkMarket(data, item) {
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
  let market = markets.find((a) => a.getExtData().id == item.id);
  market.setContent(markerTxt.pointTxt(market.getExtData(), checkMarket.value));
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
</script>

<style lang="scss" scoped>
.cardBody {
  position: relative;
  overflow: hidden;
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
      margin-left: auto;
      margin-right: 12px;
    }
    .item {
      min-width: 120px;
      height: 40px;
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
        font-size: 16px;
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
  width: 250px;
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
    font-size: 16px;
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
    width: 110px;
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
      font-size: 16px;
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
  top: 70px;

  .scaleCard {
    width: 50px;
    height: 50px;
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
        width: 14px;
        height: 14px;
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
    width: 50px;
    height: 50px;
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
      width: 18px;
      opacity: 0.1;
    }
    .item {
      width: 20px;
      height: 20px;
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
        width: 14px;
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
