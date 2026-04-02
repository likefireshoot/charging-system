<template>
  <div class="cardBody over">
    <div id="container" class="mapCard"></div>
    <div class="setCard">
      <div class="controlCard" v-if="showPlayTool">
        <div class="itemBtn" @click.stop="RunPlay()">
          <img src="@/assets/field/icon1.svg" alt="">
          <p>播放</p>
        </div>
        <span></span>
        <div class="itemBtn" @click.stop="rePlay()">
          <img src="@/assets/field/icon6.svg" alt="">
          <p>回退</p>
        </div><span></span>
        <div class="itemBtn" @click.stop='pause()'>
          <img src="@/assets/field/icon10.svg" alt="">
          <p>停止</p>
        </div><span></span>
        <div class="itemBtn" @click.stop="setMultiple(1)">
          <img src="@/assets/field/icon8.svg" alt="">
          <p>快退</p>
        </div><span></span>
        <div class="itemBtn" @click.stop="setMultiple(2)">
          <img src="@/assets/field/icon7.svg" alt="">
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
          <selectTime width="130" :nowTime='paramData.startTime'></selectTime>
          <p>至</p>
          <selectTime width="130" :nowTime='paramData.endTime'></selectTime>
        </div>
      </div>

      <div class="item">
        <h2 class="titleName">抄表人员</h2>
        <div class="form">
          <selectCard2 width="130" :options="userList" propValue="username" v-model:select="userSelect" @selectItem="setUser"></selectCard2>
        </div>
      </div>

      <div class="btnCard" @click.stop="nowMarket">
        <a class="btn">
          <img src="@/assets/field/icon5.svg" alt="">
          <p>当前位置</p>
        </a>
        <a class="btn on" @click.stop="getTrack">
          <img src="@/assets/field/icon2.svg" alt="">
          <p>查询轨迹</p>
        </a>
      </div>
      <div class="timeTxt">
        <img src="@/assets/field/icon3.svg" alt="">
        <p>当前轨迹时间{{videoData.nowTime}}</p>
        <h2>{{ videoData.nowTime?formatHourMinute(new Date( videoData.nowTime)):'00:00'}}</h2>
      </div>
    </div>

  </div>
</template>
  
  <script setup>
import { splitArray, formatHourMinute } from '@/api/being';
import AMapLoader from "@amap/amap-jsapi-loader";
import { useStore } from 'vuex';
const store = useStore();
import { getCurrentInstance, onMounted, onUnmounted, reactive, ref, } from 'vue';
const { proxy } = getCurrentInstance();
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

let aMaps = null;
let AMap = null;
const mapData = {
  viewMode: "3D", // 是否为3D地图模式
  zoom: 18, // 初始化地图级别
  center: [112.23, 30.33],
  rotateEnable: true,
  pitchEnable: true,
  pitch: 25,
}


async function gaodeMap() {
  AMap = await AMapLoader.load({
    key: "7052effea6756cf9731568d2f386c5b2", // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: ['AMap.MapType', 'AMap.MoveAnimation'], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
  });
  aMaps = new AMap.Map("container", mapData);
}



const userList = ref([]);

const userSelect = ref(null);
function getTimeHm() {
  let date = new Date();
  let hour = date.getHours()
  let minute = date.getMinutes();
  hour = hour < 10 ? '0' + hour : hour;
  minute = minute < 10 ? '0' + minute : minute;
  return `${hour}:${minute}`
}



const nowDate = new Date();
let yearTxt = nowDate.getFullYear();
let monthTxt = nowDate.getMonth() < 9 ? '0' + (parseInt(nowDate.getMonth()) + 1) : (parseInt(nowDate.getMonth()) + 1);
let dateTxt = nowDate.getDate() < 9 ? '0' + (parseInt(nowDate.getDate())) : (parseInt(nowDate.getDate()));
let yearDate = ref([yearTxt, monthTxt, dateTxt].join('-'));


const paramData = reactive({
  startTime: '00:00',
  endTime: '23:59',
  userId: null,
});


async function getAllUsers() {
  let { data } = await proxy.ajax.get('getAllUsers');
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
  market:[],
  Polylines:[],
})

async function getTrack() {
  let param = new Object();
  playType.value = 1;
  playMultiple.value = 1;

  param.startTime = `${yearDate.value} ${paramData.startTime}`;
  param.endTime = `${yearDate.value} ${paramData.endTime}`;
  param.userId = paramData.userId;
  aMaps.remove(mapMarketPolylines.market);
  aMaps.remove(mapMarketPolylines.Polylines);

  pause();

  // let { data } = await proxy.ajax.post('getUserTrack', param, true);

  let data = [
    {
      "trackName": null,
      "startTime": "2024-12-13T14:15:55",
      "endTime": "2024-12-13T14:17:15",
      "points": [
        {
          "id": 74,
          "trackId": 17,
          "userid": 1,
          "timestamp": "2024-12-13T14:15:55",
          "latitude": 30.5043,
          "longitude": 114.3491,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 75,
          "trackId": 17,
          "userid": 1,
          "timestamp": "2024-12-13T14:16:15",
          "latitude": 30.5043,
          "longitude": 114.349,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 76,
          "trackId": 17,
          "userid": 1,
          "timestamp": "2024-12-13T14:16:35",
          "latitude": 30.5045,
          "longitude": 114.3486,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 77,
          "trackId": 17,
          "userid": 1,
          "timestamp": "2024-12-13T14:16:55",
          "latitude": 30.5045,
          "longitude": 114.3485,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 78,
          "trackId": 17,
          "userid": 1,
          "timestamp": "2024-12-13T14:17:15",
          "latitude": 30.5047,
          "longitude": 114.3482,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        }
      ]
    },
    {
      "trackName": null,
      "startTime": "2024-12-13T17:42:43",
      "endTime": "2024-12-13T17:52:08",
      "points": [
        {
          "id": 115,
          "trackId": 20,
          "userid": 1,
          "timestamp": "2024-12-13T17:42:43",
          "latitude": 30.5061,
          "longitude": 114.3437,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 116,
          "trackId": 20,
          "userid": 1,
          "timestamp": "2024-12-13T17:43:11",
          "latitude": 30.5061,
          "longitude": 114.3437,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 117,
          "trackId": 20,
          "userid": 1,
          "timestamp": "2024-12-13T17:43:28",
          "latitude": 30.5062,
          "longitude": 114.3434,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 118,
          "trackId": 20,
          "userid": 1,
          "timestamp": "2024-12-13T17:43:48",
          "latitude": 30.5061,
          "longitude": 114.3433,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 119,
          "trackId": 20,
          "userid": 1,
          "timestamp": "2024-12-13T17:44:08",
          "latitude": 30.5061,
          "longitude": 114.3433,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 120,
          "trackId": 20,
          "userid": 1,
          "timestamp": "2024-12-13T17:44:28",
          "latitude": 30.5061,
          "longitude": 114.3433,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 121,
          "trackId": 20,
          "userid": 1,
          "timestamp": "2024-12-13T17:44:48",
          "latitude": 30.5061,
          "longitude": 114.3433,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 122,
          "trackId": 20,
          "userid": 1,
          "timestamp": "2024-12-13T17:45:08",
          "latitude": 30.506,
          "longitude": 114.3444,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 123,
          "trackId": 20,
          "userid": 1,
          "timestamp": "2024-12-13T17:45:28",
          "latitude": 30.5062,
          "longitude": 114.3444,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 124,
          "trackId": 20,
          "userid": 1,
          "timestamp": "2024-12-13T17:45:48",
          "latitude": 30.5064,
          "longitude": 114.3441,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 125,
          "trackId": 20,
          "userid": 1,
          "timestamp": "2024-12-13T17:46:08",
          "latitude": 30.5065,
          "longitude": 114.3437,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 126,
          "trackId": 20,
          "userid": 1,
          "timestamp": "2024-12-13T17:46:28",
          "latitude": 30.5066,
          "longitude": 114.3435,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 127,
          "trackId": 20,
          "userid": 1,
          "timestamp": "2024-12-13T17:46:48",
          "latitude": 30.5066,
          "longitude": 114.3432,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 128,
          "trackId": 20,
          "userid": 1,
          "timestamp": "2024-12-13T17:47:08",
          "latitude": 30.5067,
          "longitude": 114.343,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 129,
          "trackId": 20,
          "userid": 1,
          "timestamp": "2024-12-13T17:47:28",
          "latitude": 30.5068,
          "longitude": 114.3426,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 130,
          "trackId": 20,
          "userid": 1,
          "timestamp": "2024-12-13T17:47:48",
          "latitude": 30.5068,
          "longitude": 114.3425,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 131,
          "trackId": 20,
          "userid": 1,
          "timestamp": "2024-12-13T17:48:08",
          "latitude": 30.5069,
          "longitude": 114.3422,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 132,
          "trackId": 20,
          "userid": 1,
          "timestamp": "2024-12-13T17:48:28",
          "latitude": 30.507,
          "longitude": 114.342,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 133,
          "trackId": 20,
          "userid": 1,
          "timestamp": "2024-12-13T17:48:48",
          "latitude": 30.5071,
          "longitude": 114.3416,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 134,
          "trackId": 20,
          "userid": 1,
          "timestamp": "2024-12-13T17:49:08",
          "latitude": 30.5071,
          "longitude": 114.3415,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 135,
          "trackId": 20,
          "userid": 1,
          "timestamp": "2024-12-13T17:49:28",
          "latitude": 30.5071,
          "longitude": 114.3415,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 136,
          "trackId": 20,
          "userid": 1,
          "timestamp": "2024-12-13T17:49:48",
          "latitude": 30.5071,
          "longitude": 114.3415,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 137,
          "trackId": 20,
          "userid": 1,
          "timestamp": "2024-12-13T17:50:08",
          "latitude": 30.5071,
          "longitude": 114.3415,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 138,
          "trackId": 20,
          "userid": 1,
          "timestamp": "2024-12-13T17:50:28",
          "latitude": 30.5071,
          "longitude": 114.3415,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 139,
          "trackId": 20,
          "userid": 1,
          "timestamp": "2024-12-13T17:50:48",
          "latitude": 30.5071,
          "longitude": 114.3415,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 140,
          "trackId": 20,
          "userid": 1,
          "timestamp": "2024-12-13T17:51:08",
          "latitude": 30.5071,
          "longitude": 114.3415,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 141,
          "trackId": 20,
          "userid": 1,
          "timestamp": "2024-12-13T17:51:28",
          "latitude": 30.5071,
          "longitude": 114.3415,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 142,
          "trackId": 20,
          "userid": 1,
          "timestamp": "2024-12-13T17:51:48",
          "latitude": 30.5059,
          "longitude": 114.3399,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 143,
          "trackId": 20,
          "userid": 1,
          "timestamp": "2024-12-13T17:52:08",
          "latitude": 30.5057,
          "longitude": 114.3397,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        }
      ]
    },
    {
      "trackName": null,
      "startTime": "2024-12-13T17:57:19",
      "endTime": "2024-12-13T18:18:19",
      "points": [
        {
          "id": 144,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T17:57:19",
          "latitude": 30.5045,
          "longitude": 114.3428,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 145,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T17:57:39",
          "latitude": 30.5044,
          "longitude": 114.3429,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 146,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T17:58:00",
          "latitude": 30.5044,
          "longitude": 114.3428,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 147,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T17:58:19",
          "latitude": 30.5044,
          "longitude": 114.343,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 148,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T17:58:39",
          "latitude": 30.5038,
          "longitude": 114.3434,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 149,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T17:58:59",
          "latitude": 30.5034,
          "longitude": 114.3436,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 150,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T17:59:19",
          "latitude": 30.5029,
          "longitude": 114.3441,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 151,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T17:59:39",
          "latitude": 30.5022,
          "longitude": 114.3447,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 152,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:00:00",
          "latitude": 30.5018,
          "longitude": 114.3449,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 153,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:00:19",
          "latitude": 30.5018,
          "longitude": 114.3449,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 154,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:00:39",
          "latitude": 30.5018,
          "longitude": 114.3449,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 155,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:00:59",
          "latitude": 30.5018,
          "longitude": 114.3449,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 156,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:01:20",
          "latitude": 30.4995,
          "longitude": 114.3436,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 157,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:01:39",
          "latitude": 30.4995,
          "longitude": 114.3437,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 158,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:01:59",
          "latitude": 30.4995,
          "longitude": 114.3434,
          "speed": 0.739,
          "accuracy": 62.3583,
          "horizontalAccuracy": 62.3583,
          "verticalAccuracy": 0.0
        },
        {
          "id": 159,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:02:20",
          "latitude": 30.4998,
          "longitude": 114.3421,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 160,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:02:39",
          "latitude": 30.5,
          "longitude": 114.3412,
          "speed": 0.2805,
          "accuracy": 40.0,
          "horizontalAccuracy": 40.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 161,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:02:59",
          "latitude": 30.5001,
          "longitude": 114.3409,
          "speed": 0.1805,
          "accuracy": 47.3425,
          "horizontalAccuracy": 47.3425,
          "verticalAccuracy": 0.0
        },
        {
          "id": 162,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:03:20",
          "latitude": 30.5004,
          "longitude": 114.3401,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 163,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:03:39",
          "latitude": 30.5006,
          "longitude": 114.3395,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 164,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:03:59",
          "latitude": 30.5008,
          "longitude": 114.3386,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 165,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:04:19",
          "latitude": 30.5011,
          "longitude": 114.3378,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 166,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:04:40",
          "latitude": 30.5014,
          "longitude": 114.3371,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 167,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:04:59",
          "latitude": 30.5014,
          "longitude": 114.3367,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 168,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:05:20",
          "latitude": 30.5017,
          "longitude": 114.3358,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 169,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:05:39",
          "latitude": 30.5018,
          "longitude": 114.3353,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 170,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:05:59",
          "latitude": 30.5021,
          "longitude": 114.3344,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 171,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:06:20",
          "latitude": 30.5022,
          "longitude": 114.3338,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 172,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:06:39",
          "latitude": 30.5024,
          "longitude": 114.3332,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 173,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:06:59",
          "latitude": 30.5026,
          "longitude": 114.3325,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 174,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:07:20",
          "latitude": 30.5029,
          "longitude": 114.3319,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 175,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:07:39",
          "latitude": 30.5032,
          "longitude": 114.3319,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 176,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:07:59",
          "latitude": 30.5032,
          "longitude": 114.3317,
          "speed": 0.5881,
          "accuracy": 54.014,
          "horizontalAccuracy": 54.014,
          "verticalAccuracy": 0.0
        },
        {
          "id": 177,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:08:19",
          "latitude": 30.5053,
          "longitude": 114.3322,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 178,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:08:39",
          "latitude": 30.5045,
          "longitude": 114.3314,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 179,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:08:59",
          "latitude": 30.5052,
          "longitude": 114.3328,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 180,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:09:19",
          "latitude": 30.5054,
          "longitude": 114.3331,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 181,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:09:39",
          "latitude": 30.5057,
          "longitude": 114.3338,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 182,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:10:00",
          "latitude": 30.5057,
          "longitude": 114.3343,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 183,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:10:19",
          "latitude": 30.5054,
          "longitude": 114.3351,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 184,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:10:39",
          "latitude": 30.5061,
          "longitude": 114.3353,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 185,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:10:59",
          "latitude": 30.5069,
          "longitude": 114.3355,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 186,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:11:19",
          "latitude": 30.5074,
          "longitude": 114.3356,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 187,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:11:39",
          "latitude": 30.5082,
          "longitude": 114.336,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 188,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:11:59",
          "latitude": 30.5084,
          "longitude": 114.3364,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 189,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:12:19",
          "latitude": 30.5083,
          "longitude": 114.3371,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 190,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:12:39",
          "latitude": 30.5081,
          "longitude": 114.3374,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 191,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:12:59",
          "latitude": 30.5082,
          "longitude": 114.3375,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 192,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:13:19",
          "latitude": 30.5081,
          "longitude": 114.3377,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 193,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:13:39",
          "latitude": 30.5078,
          "longitude": 114.3376,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 194,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:13:59",
          "latitude": 30.5074,
          "longitude": 114.3373,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 195,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:14:19",
          "latitude": 30.5069,
          "longitude": 114.3369,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 196,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:14:39",
          "latitude": 30.5063,
          "longitude": 114.3367,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 197,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:14:59",
          "latitude": 30.5062,
          "longitude": 114.3374,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 198,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:15:19",
          "latitude": 30.506,
          "longitude": 114.3382,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 199,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:15:39",
          "latitude": 30.5059,
          "longitude": 114.3389,
          "speed": 0.7053,
          "accuracy": 61.486,
          "horizontalAccuracy": 61.486,
          "verticalAccuracy": 0.0
        },
        {
          "id": 200,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:15:59",
          "latitude": 30.5057,
          "longitude": 114.3395,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 201,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:16:19",
          "latitude": 30.5056,
          "longitude": 114.3396,
          "speed": 0.5899,
          "accuracy": 70.3931,
          "horizontalAccuracy": 70.3931,
          "verticalAccuracy": 0.0
        },
        {
          "id": 202,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:16:39",
          "latitude": 30.5056,
          "longitude": 114.3395,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 203,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:16:59",
          "latitude": 30.5055,
          "longitude": 114.3395,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 204,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:17:19",
          "latitude": 30.5055,
          "longitude": 114.3395,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 205,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:17:39",
          "latitude": 30.5055,
          "longitude": 114.3403,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 206,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:17:59",
          "latitude": 30.5053,
          "longitude": 114.3408,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 207,
          "trackId": 21,
          "userid": 1,
          "timestamp": "2024-12-13T18:18:19",
          "latitude": 30.5051,
          "longitude": 114.3414,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        }
      ]
    },
    {
      "trackName": null,
      "startTime": "2024-12-13T18:26:54",
      "endTime": "2024-12-13T18:29:34",
      "points": [
        {
          "id": 208,
          "trackId": 22,
          "userid": 1,
          "timestamp": "2024-12-13T18:26:54",
          "latitude": 30.5061,
          "longitude": 114.345,
          "speed": 0.6283,
          "accuracy": 66.3354,
          "horizontalAccuracy": 66.3354,
          "verticalAccuracy": 0.0
        },
        {
          "id": 209,
          "trackId": 22,
          "userid": 1,
          "timestamp": "2024-12-13T18:27:14",
          "latitude": 30.5059,
          "longitude": 114.3453,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 210,
          "trackId": 22,
          "userid": 1,
          "timestamp": "2024-12-13T18:27:34",
          "latitude": 30.506,
          "longitude": 114.3451,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 211,
          "trackId": 22,
          "userid": 1,
          "timestamp": "2024-12-13T18:27:54",
          "latitude": 30.506,
          "longitude": 114.345,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 212,
          "trackId": 22,
          "userid": 1,
          "timestamp": "2024-12-13T18:28:14",
          "latitude": 30.5061,
          "longitude": 114.3445,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 213,
          "trackId": 22,
          "userid": 1,
          "timestamp": "2024-12-13T18:28:34",
          "latitude": 30.5061,
          "longitude": 114.3444,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 214,
          "trackId": 22,
          "userid": 1,
          "timestamp": "2024-12-13T18:28:55",
          "latitude": 30.506,
          "longitude": 114.3441,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 215,
          "trackId": 22,
          "userid": 1,
          "timestamp": "2024-12-13T18:29:14",
          "latitude": 30.5058,
          "longitude": 114.344,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 216,
          "trackId": 22,
          "userid": 1,
          "timestamp": "2024-12-13T18:29:34",
          "latitude": 30.5056,
          "longitude": 114.3437,
          "speed": 0.0,
          "accuracy": 30.0,
          "horizontalAccuracy": 30.0,
          "verticalAccuracy": 0.0
        }
      ]
    },
    {
      "trackName": null,
      "startTime": "2024-12-13T22:35:58",
      "endTime": "2024-12-13T22:39:20",
      "points": [
        {
          "id": 217,
          "trackId": 23,
          "userid": 1,
          "timestamp": "2024-12-13T22:35:58",
          "latitude": 30.5064,
          "longitude": 114.3443,
          "speed": 0.0,
          "accuracy": 225.0,
          "horizontalAccuracy": 225.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 218,
          "trackId": 23,
          "userid": 1,
          "timestamp": "2024-12-13T22:36:17",
          "latitude": 30.5064,
          "longitude": 114.3443,
          "speed": 0.0,
          "accuracy": 225.0,
          "horizontalAccuracy": 225.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 219,
          "trackId": 23,
          "userid": 1,
          "timestamp": "2024-12-13T22:36:37",
          "latitude": 30.5064,
          "longitude": 114.3443,
          "speed": 0.0,
          "accuracy": 225.0,
          "horizontalAccuracy": 225.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 220,
          "trackId": 23,
          "userid": 1,
          "timestamp": "2024-12-13T22:38:00",
          "latitude": 30.5064,
          "longitude": 114.3443,
          "speed": 0.0,
          "accuracy": 225.0,
          "horizontalAccuracy": 225.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 221,
          "trackId": 23,
          "userid": 1,
          "timestamp": "2024-12-13T22:38:20",
          "latitude": 30.5064,
          "longitude": 114.3443,
          "speed": 0.0,
          "accuracy": 225.0,
          "horizontalAccuracy": 225.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 222,
          "trackId": 23,
          "userid": 1,
          "timestamp": "2024-12-13T22:38:40",
          "latitude": 30.5064,
          "longitude": 114.3443,
          "speed": 0.0,
          "accuracy": 225.0,
          "horizontalAccuracy": 225.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 223,
          "trackId": 23,
          "userid": 1,
          "timestamp": "2024-12-13T22:39:00",
          "latitude": 30.5064,
          "longitude": 114.3443,
          "speed": 0.0,
          "accuracy": 225.0,
          "horizontalAccuracy": 225.0,
          "verticalAccuracy": 0.0
        },
        {
          "id": 224,
          "trackId": 23,
          "userid": 1,
          "timestamp": "2024-12-13T22:39:20",
          "latitude": 30.5064,
          "longitude": 114.3443,
          "speed": 0.0,
          "accuracy": 225.0,
          "horizontalAccuracy": 225.0,
          "verticalAccuracy": 0.0
        }
      ]
    }
  ]




  if (data.length == 0) {
    ElMessage.warning('暂无轨迹');
    return;
  }
  showPlayTool.value = true;
  mapMarketPolylines.UserTrack = data.reduce((list, item) => {
    return [...list, ...item.points];
  }, []);


  aMaps.remove(mapMarketPolylines.market);
  aMaps.remove(mapMarketPolylines.Polylines);
  mapMarketPolylines.market = mapMarketPolylines.UserTrack.map(item => {


    let circleMarker = {
      position: [item.longitude, item.latitude],
      offset: new AMap.Pixel(-13, -30),
      icon: "device/market.png",
      extData: item
    };
    return new AMap.Marker(circleMarker)

    // let circleMarker = {
    //   center: [item.longitude, item.latitude],
    //   radius: 10,//3D视图下，CircleMarker半径不要超过64px
    //   strokeColor: '#fff',
    //   strokeWeight: 2,
    //   strokeOpacity: 1,
    //   fillColor: '#f18127',
    //   fillOpacity: 1,
    //   zIndex: 10,
    //   extData: item
    // };
    // return new AMap.CircleMarker(circleMarker)
  });
  mapMarketPolylines.Polylines = mapMarketPolylines.UserTrack.reduce((list, item) => {
    if (list.find(a => a.trackId == item.trackId)) {
      return list;
    } else {
      return [...list, item]
    }
  }, []).map(a => {
    return mapMarketPolylines.UserTrack.filter(item => item.trackId == a.trackId)
  }).map(item => {
    let PolylineItem = new AMap.Polyline({
      path: item.map(a => { return [a.longitude, a.latitude] }),
      strokeColor: "#f18127",
      strokeOpacity: 1,
      strokeWeight: 6,
      lineJoin: 'round',
      lineCap: 'round',
      zIndex: 5,
      showDir:true,
    });
    return PolylineItem
  })
  videoData.nowTime = mapMarketPolylines.UserTrack[0].timestamp;
  aMaps.add(mapMarketPolylines.market);
  aMaps.add(mapMarketPolylines.Polylines);
  aMaps.setFitView(mapMarketPolylines.market, false, [30, 20, 30, 20], 20);
}

function setMapMarketPolylines(isSetFitView) {
  aMaps.remove(mapMarketPolylines.market);
  aMaps.remove(mapMarketPolylines.Polylines);
  videoData.playTrack = mapMarketPolylines.UserTrack.filter((item, index) => index < videoData.playLength);
  mapMarketPolylines.market = videoData.playTrack.map(item => {

    let circleMarker = {
      position: [item.longitude, item.latitude],
      offset: new AMap.Pixel(-13, -30),
      icon: "device/market.png",
      extData: item
    };
    return new AMap.Marker(circleMarker)

    // let circleMarker = {
    //   center: [item.longitude, item.latitude],
    //   radius: 10,//3D视图下，CircleMarker半径不要超过64px
    //   strokeColor: '#fff',
    //   strokeWeight: 2,
    //   strokeOpacity: 1,
    //   fillColor: '#f18127',
    //   fillOpacity: 1,
    //   zIndex: 10,
    //   extData: item
    // };
    // return new AMap.CircleMarker(circleMarker)
  });
  mapMarketPolylines.Polylines = videoData.playTrack.reduce((list, item) => {
    if (list.find(a => a.trackId == item.trackId)) {
      return list;
    } else {
      return [...list, item]
    }
  }, []).map(a => {
    return videoData.playTrack.filter(item => item.trackId == a.trackId)
  }).map(item => {
    let PolylineItem = new AMap.Polyline({
      path: item.map(a => { return [a.longitude, a.latitude] }),
      strokeColor: "#f18127",
      strokeOpacity: 1,
      strokeWeight: 6,
      lineJoin: 'round',
      lineCap: 'round',
      zIndex: 5,
      showDir:true,
    });
    return PolylineItem
  });

  console.log(videoData);

  videoData.nowTime = videoData.playTrack[videoData.playLength - 1].timestamp;
  aMaps.add(mapMarketPolylines.market);
  aMaps.add(mapMarketPolylines.Polylines);
  if (!isSetFitView) return;
  aMaps.setFitView(mapMarketPolylines.market, false, [30, 20, 30, 20], 20);
};


function setMarketList(isSetFitView) {
  aMaps.remove(circleMarkers);
  aMaps.remove(Polylines);
  let time = frameNum.value;
  let markets = frametList.reduce((list, item, index) => {
    if (index <= time) {
      let data = item[0];
      return [...list, data]
    }
    return list;
  }, []);


  circleMarkers = markets.reduce((list, item) => {
    let circleMarker = {
      center: [item.longitude, item.latitude],
      radius: 10,//3D视图下，CircleMarker半径不要超过64px
      strokeColor: '#fff',
      strokeWeight: 2,
      strokeOpacity: 1,
      fillColor: '#f18127',
      fillOpacity: 1,
      zIndex: 10,
      extData: item
    };
    return [...list, new AMap.CircleMarker(circleMarker)]
  }, [])
  aMaps.add(circleMarkers);
  let PolylinesList = frametList.reduce((list, item, index) => {
    if (index <= time) {
      return [...list, ...item]
    }
    return list;
  }, []);

  Polylines = PolylinesList.reduce((list, item) => {
    if (list.find(a => a.trackId == item.trackId)) {
      return list;
    } else {
      return [...list, item]
    }
  }, []).map(a => {
    return PolylinesList.filter(item => item.trackId == a.trackId)
  }).map(item => {
    let PolylineItem = new AMap.Polyline({
      path: item.map(a => { return [a.longitude, a.latitude] }),
      strokeColor: "#f18127",
      strokeOpacity: 1,
      strokeWeight: 3,
      lineJoin: 'round',
      lineCap: 'round',
      zIndex: 5,
    });
    return PolylineItem
    // aMaps.add(PolylineItem);
  });


  nowTime.value = frametList[frameNum.value][0].timestamp
  // nowTime.value=;
  aMaps.add(Polylines);
  if (!isSetFitView) return;
  aMaps.setFitView(circleMarkers, false, [30, 20, 30, 20], 20);
}





//地图折线
function setPolyline(item) {
  let PolylineItem = {
    path: item.points.map(a => [a.longitude, a.latitude]),
    strokeColor: "#f18127",
    strokeOpacity: 1,
    strokeWeight: 3,
    lineJoin: 'round',
    lineCap: 'round',
    zIndex: 5,
  };
  console.log(item);
  aMaps.add(new AMap.Polyline(PolylineItem));
}



//播放
function play() {
  if (videoData.playType == 0) return;
  let length = mapMarketPolylines.UserTrack.length;
  if (videoData.playType == 1) {
    if (videoData.playLength < length - 1) {
      videoData.playLength = videoData.playLength + 1;
      setMapMarketPolylines();
      setTimeout(() => {
        play();
      }, videoData.Multiple * 1000)
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
      }, videoData.Multiple * 1000)
      return;
    }
    videoData.playing = false;
  }
}


// 开始播放
function RunPlay() {
  if (videoData.playing && videoData.playType == 1) {
    ElMessage.warning('当前正在播放');
    return;
  };
  pause();
  setTimeout(() => {
    videoData.playType = 1;
    videoData.playing = true;
    play();
  }, 1150)
  play();
}

function pause() {
  videoData.playType = 0;
  videoData.playing = false;
}

function rePlay() {
  if (videoData.playing && videoData.playType == 2) {
    ElMessage.warning('当前正在回放');
    return;
  };
  pause();
  setTimeout(() => {
    videoData.playType = 2;
    videoData.playing = true;
    play();
  }, 1250)
}

function setMultiple(index) {
  //快退
  if (index == 1) {
    if (videoData.Multiple >= 2.75) {
      ElMessage.warning('已达到最慢倍数！');
      return;
    }
    videoData.Multiple = parseFloat(Number(videoData.Multiple) + 0.25).toFixed(2);
  }
  //快进
  if (index == 2) {
    if (videoData.Multiple <= 0.25) {
      ElMessage.warning('已达到最大倍数！');
      return;
    }
    videoData.Multiple = parseFloat(Number(videoData.Multiple) - 0.25).toFixed(2);
  }
}


function nowMarket() {


};


onMounted(async () => {
  store.commit('setNavIndex', 1);
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