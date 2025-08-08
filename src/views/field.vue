<template>
  <div class="cardBody over">
    <div id="container" class="mapCard"></div>
    <div class="setCard">
      <div class="controlCard" v-if="showPlayTool">
        <div class="itemBtn" @click.stop="RunPlay()">
          <img src="@/assets/field/icon1.svg" alt="" />
          <p>播放</p>
        </div>
        <span></span>
        <div class="itemBtn" @click.stop="rePlay()">
          <img src="@/assets/field/icon6.svg" alt="" />
          <p>回退</p>
        </div>
        <span></span>
        <div class="itemBtn" @click.stop="pause()">
          <img src="@/assets/field/icon10.svg" alt="" />
          <p>停止</p>
        </div>
        <span></span>
        <div class="itemBtn" @click.stop="setMultiple(1)">
          <img src="@/assets/field/icon8.svg" alt="" />
          <p>快退</p>
        </div>
        <span></span>
        <div class="itemBtn" @click.stop="setMultiple(2)">
          <img src="@/assets/field/icon7.svg" alt="" />
          <p>快进</p>
        </div>
      </div>

      <div class="item">
        <h2 class="titleName">日期</h2>
        <div class="form">
          <select-date @selectDate="setDate"></select-date>
        </div>
      </div>

      <div class="item">
        <h2 class="titleName">时间</h2>
        <div class="form">
          <selectTime width="130" :nowTime="paramData.startTime"></selectTime>
          <p>至</p>
          <selectTime width="130" :nowTime="paramData.endTime"></selectTime>
        </div>
      </div>

      <div class="item">
        <h2 class="titleName">抄表人员</h2>
        <div class="form">
          <selectCard2 width="130" :options="userList" propValue="username" v-model:select="userSelect" @selectItem="setUser"></selectCard2>
        </div>
      </div>

      <div class="btnCard" @click.stop="nowMarket">
        <!-- <a class="btn">
          <img src="@/assets/field/icon5.svg" alt="">
          <p>当前位置</p>
        </a> -->
        <a class="btn on" @click.stop="getTrack">
          <img src="@/assets/field/icon2.svg" alt="" />
          <p>查询轨迹</p>
        </a>
      </div>
      <div class="timeTxt">
        <img src="@/assets/field/icon3.svg" alt="" />
        <p>当前轨迹时间</p>
        <h2 v-if="videoData.nowTime">{{ formatHourMinute(new Date(videoData.nowTime)) }}</h2>
        <h2 v-else>00:00</h2>
      </div>
    </div>
  </div>
</template>

<script setup>
import { splitArray, formatDateTime, formatHourMinute } from "@/api/being";
import AMapLoader from "@amap/amap-jsapi-loader";
import { useStore } from "vuex";
const store = useStore();
import { getCurrentInstance, onMounted, onUnmounted, reactive, ref } from "vue";
const { proxy } = getCurrentInstance();
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";

let aMaps = null;
let AMap = null;
let infoWindow = null;
const mapData = {
  viewMode: "3D", // 是否为3D地图模式
  zoom: 18, // 初始化地图级别
  center: [112.23, 30.33],
  rotateEnable: true,
  pitchEnable: true,
  pitch: 25,
};

async function gaodeMap() {
  AMap = await AMapLoader.load({
    key: "7052effea6756cf9731568d2f386c5b2", // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: ["AMap.MapType", "AMap.MoveAnimation"], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
  });
  aMaps = new AMap.Map("container", mapData);

  infoWindow = new AMap.InfoWindow({
    isCustom: true,
    content: "信息弹框", // 初始内容为空
    offset: new AMap.Pixel(0, -30), // 信息窗口偏移
  });
}

const userList = ref([]);

const userSelect = ref(null);
function getTimeHm() {
  let date = new Date();
  let hour = date.getHours();
  let minute = date.getMinutes();
  hour = hour < 10 ? "0" + hour : hour;
  minute = minute < 10 ? "0" + minute : minute;
  return `${hour}:${minute}`;
}

const nowDate = new Date();
let yearTxt = nowDate.getFullYear();
let monthTxt = nowDate.getMonth() < 9 ? "0" + (parseInt(nowDate.getMonth()) + 1) : parseInt(nowDate.getMonth()) + 1;
let dateTxt = nowDate.getDate() < 10 ? "0" + parseInt(nowDate.getDate()) : parseInt(nowDate.getDate());
let yearDate = ref([yearTxt, monthTxt, dateTxt].join("-"));

const paramData = reactive({
  startTime: "00:00",
  endTime: "23:59",
  userId: null,
});

async function getAllUsers() {
  let { data } = await proxy.ajax.get("getAllUsers");
  userList.value = data;
  userSelect.value = data.length > 0 ? data[0].username : null;
  paramData.userId = data.length > 0 ? data[0].id : null;
}
function setUser(item) {
  paramData.userId = item.id;
}

let frameNum = ref(0);
let frametList = reactive([]);
let playMultiple = ref(1);
let isPlayIng = ref(false);
let playType = ref(0); // 0 停止 1  正序播放，2 反序播放 3
const showPlayTool = ref(false);

const nowTime = ref(null);
function setDate(item) {
  yearDate.value = item;
}

const mapMarketPolylines = reactive({
  UserTrack: [],
  market: [],
  Polylines: [],
});

const videoData = reactive({
  playing: false,
  playType: 0, //0 停止 //1 播放 //2 回放
  playLength: 0,
  Multiple: 1,
  playTrack: [],
  nowTime: null,
  market: [],
  Polylines: [],
});

async function getTrack() {
  let param = new Object();
  playType.value = 1;
  playMultiple.value = 1;

  param.startTime = `${yearDate.value} ${paramData.startTime}`;
  param.endTime = `${yearDate.value} ${paramData.endTime}`;
  param.userId = paramData.userId;
  aMaps.remove(mapMarketPolylines.market);
  aMaps.remove(mapMarketPolylines.Polylines);
  videoData.playLength = 0;

  pause();

  let { data } = await proxy.ajax.post("getUserTrack", param, true);

  if (data.length == 0) {
    ElMessage.warning("暂无轨迹");
    return;
  }
  showPlayTool.value = true;
  mapMarketPolylines.UserTrack = data.reduce((list, item) => {
    return [...list, ...item.points];
  }, []);

  aMaps.remove(mapMarketPolylines.market);
  aMaps.remove(mapMarketPolylines.Polylines);
  mapMarketPolylines.market = mapMarketPolylines.UserTrack.map((item) => {
    let circleMarker = {
      position: [item.longitude, item.latitude],
      offset: new AMap.Pixel(-13, -30),
      icon: "device/market.png",
      extData: item,
    };
    return new AMap.Marker(circleMarker);
  });
  mapMarketPolylines.Polylines = mapMarketPolylines.UserTrack.reduce((list, item) => {
    if (list.find((a) => a.trackId == item.trackId)) {
      return list;
    } else {
      return [...list, item];
    }
  }, [])
    .map((a) => {
      return mapMarketPolylines.UserTrack.filter((item) => item.trackId == a.trackId);
    })
    .map((item) => {
      let PolylineItem = new AMap.Polyline({
        path: item.map((a) => {
          return [a.longitude, a.latitude];
        }),
        strokeColor: "#46b97e",
        strokeOpacity: 1,
        strokeWeight: 6,
        lineJoin: "round",
        lineCap: "round",
        zIndex: 5,
        showDir: true,
        extData: item,
      });
      return PolylineItem;
    });
  videoData.nowTime = mapMarketPolylines.UserTrack[0].timestamp;
  aMaps.add(mapMarketPolylines.market);
  aMaps.add(mapMarketPolylines.Polylines);
  aMaps.setFitView(mapMarketPolylines.market, false, [30, 20, 30, 20], 20);

  mapMarketPolylines.market.map((item) => {
    item.on("mouseover", (a) => {
      let data = item.getExtData();
      infoWindow.setContent(`<div class="mapTimeCard"><h2>当前时刻:${formatDateTime(new Date(data.timestamp))}</h2></div>`);
      infoWindow.open(aMaps, item.getPosition()); // 在 Marker 位置打开信息窗口
    });
    item.on("mouseout", (a) => {
      infoWindow.close();
    });
  });
}

function setMapMarketPolylines(isSetFitView) {
  aMaps.remove(mapMarketPolylines.Polylines);
  mapMarketPolylines.Polylines = [];
  mapMarketPolylines.market.map((item, index) => {
    if (index < videoData.playLength) {
      item.show();
    } else {
      item.hide();
    }
  });
  videoData.playTrack = mapMarketPolylines.UserTrack.filter((item, index) => index < videoData.playLength);
  mapMarketPolylines.Polylines = videoData.playTrack
    .reduce((list, item) => {
      if (list.find((a) => a.trackId == item.trackId)) {
        return list;
      } else {
        return [...list, item];
      }
    }, [])
    .map((a) => {
      return videoData.playTrack.filter((item) => item.trackId == a.trackId);
    })
    .map((item) => {
      let PolylineItem = new AMap.Polyline({
        path: item.map((a) => {
          return [a.longitude, a.latitude];
        }),
        strokeColor: "#46b97e",
        strokeOpacity: 1,
        strokeWeight: 6,
        lineJoin: "round",
        lineCap: "round",
        zIndex: 5,
        showDir: true,
      });
      return PolylineItem;
    });
  videoData.nowTime = videoData.playTrack[videoData.playLength - 1].timestamp;
  aMaps.add(mapMarketPolylines.Polylines);
}

//播放
function play() {
  if (videoData.playType == 0) return;
  let length = mapMarketPolylines.UserTrack.length;
  if (videoData.playLength == 0) {
    mapMarketPolylines.market.map((item) => {
      item.hide();
    });
    aMaps.remove(mapMarketPolylines.Polylines);
    mapMarketPolylines.Polylines = [];
  }
  if (videoData.playType == 1) {
    if (videoData.playLength < length - 1) {
      videoData.playLength = videoData.playLength + 1;
      setMapMarketPolylines();
      setTimeout(() => {
        play();
      }, videoData.Multiple * 1000);
      return;
    }
    videoData.playing = false;
  }
  if (videoData.playType == 2) {
    if (videoData.playLength > 1) {
      videoData.playLength = videoData.playLength - 1;
      setMapMarketPolylines();
      setTimeout(() => {
        play();
      }, videoData.Multiple * 1000);
      return;
    }
    videoData.playing = false;
  }
}

// 开始播放
function RunPlay() {
  if (videoData.playing && videoData.playType == 1) {
    ElMessage.warning("当前正在播放");
    return;
  }
  pause();
  setTimeout(() => {
    videoData.playType = 1;
    videoData.playing = true;
    play();
  }, 1150);
  play();
}

function pause() {
  videoData.playType = 0;
  videoData.playing = false;
}

function rePlay() {
  if (videoData.playing && videoData.playType == 2) {
    ElMessage.warning("当前正在回放");
    return;
  }
  pause();
  setTimeout(() => {
    videoData.playType = 2;
    videoData.playing = true;
    play();
  }, 1250);
}

function setMultiple(index) {
  //快退
  if (index == 1) {
    if (videoData.Multiple >= 2.75) {
      ElMessage.warning("已达到最慢倍数！");
      return;
    }
    videoData.Multiple = parseFloat(Number(videoData.Multiple) + 0.25).toFixed(2);
  }
  //快进
  if (index == 2) {
    if (videoData.Multiple <= 0.25) {
      ElMessage.warning("已达到最大倍数！");
      return;
    }
    videoData.Multiple = parseFloat(Number(videoData.Multiple) - 0.25).toFixed(2);
  }
}

function nowMarket() {}

onMounted(async () => {
  // store.commit("setNavIndex", 1);
  getAllUsers();
  await gaodeMap();
});

onUnmounted(() => {
  // map?.destroy();
});
</script>

<style lang="scss" scoped>
.cardBody {
  background: #f9f9f9;
  display: flex;
  flex-direction: column;
}

.mapCard {
  margin: 20px 20px 10px;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  flex: 1;
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.setCard {
  margin: 0 20px 20px;
  height: 98px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(232, 232, 232, 0.75);
  display: flex;
  align-items: center;
  padding-left: 15px;
  position: relative;
  z-index: 300;

  .item {
    display: flex;
    flex-direction: column;
    margin-right: 10px;
    h2.titleName {
      font-size: 16px;
      color: #585657;
      line-height: 36px;
      height: 36px;
    }
    .form {
      display: flex;
      align-items: center;
      .label {
        width: 130px;
        height: 40px;
        box-sizing: border-box;
        margin-left: 10px;
        border: 1px solid #e6e6e6;
        border-radius: 6px;
        position: relative;
        select {
          opacity: 0;
          position: absolute;
          width: 100%;
          height: 100%;
        }
        &:first-of-type {
          margin-left: 0;
        }
      }
      p {
        font-size: 16px;
        color: #a0a0a0;
        margin: 0 10px;
      }
    }
  }

  .btnCard {
    display: flex;
    align-items: center;
    margin: 0 40px;
    margin-left: auto;
    a {
      width: 120px;
      height: 40px;
      border: 1px solid #e9e9e9;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      margin-left: 10px;
      img {
        width: 24px;
        margin-right: 8px;
      }
      p {
        font-size: 16px;
        color: #585657;
      }
      &.on {
        p {
          color: #fff;
        }
        background: #46b97e;
        border: 1px solid #46b97e;
      }
    }
  }

  .timeTxt {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 78px;
    border-left: 1px solid #ececec;
    width: 338px;
    img {
      width: 38px;
      margin-right: 10px;
    }
    p {
      font-size: 16px;
      color: #585657;
      margin-right: 20px;
    }
    h2 {
      font-size: 42px;
      color: #585657;
      font-weight: bold;
    }
  }
}

.controlCard {
  position: absolute;
  right: 10px;
  bottom: 118px;
  background: #fff;
  display: flex;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(232, 232, 232, 1);
  height: 42px;
  display: flex;
  border: 1px solid #e9e9e9;

  span {
    width: 1px;
    min-width: 1px;
    height: 30px;
    background: #ebebeb;
    align-self: center;
  }
  .itemBtn {
    width: 84px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 6px;
    cursor: pointer;

    border-radius: 6px;
    box-sizing: border-box;
    transition: all 0.2s;
    &:hover {
      background: #f7f7f7;
    }
    &:first-of-type {
      border-left: none;
    }
    img {
      width: 22px;
      margin-right: 10px;
    }
    p {
      font-size: 16px;
      color: #585657;
      line-height: 1em;
    }
  }
}
</style>
