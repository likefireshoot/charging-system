<template>
  <div class="cardBody over map-track-ui">
    <div id="container" ref="container" class="mapCard"></div>
    <p v-if="status || mapError" class="track-status" role="status">{{ mapError || status }}</p>
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
          <selectTime width="130" :nowTime="paramData.startTime" @update:select="setTime('startTime', $event)"></selectTime>
          <p>至</p>
          <selectTime width="130" :nowTime="paramData.endTime" @update:select="setTime('endTime', $event)"></selectTime>
        </div>
      </div>

      <div class="item">
        <h2 class="titleName">抄表人员</h2>
        <div class="form">
          <selectCard2 width="170" :options="userList" propValue="staffName" v-model:select="userSelect" @selectItem="setUser"></selectCard2>
        </div>
      </div>

      <div class="btnCard" @click.stop="nowMarket">
        <!-- <a class="btn">
          <img src="@/assets/field/icon5.svg" alt="">
          <p>当前位置</p>
        </a> -->
        <a class="btn on" :aria-busy="busy" style="width: 140px;height: 50px" @click.stop="getTrack">
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
import { useTrackPage } from "@/map/useTrackPage";
import "@/map/mapUi.scss";

const { container, userList, userSelect, paramData, videoData, showPlayTool, busy, status, mapError,
  setDate, setTime, setUser, getTrack, RunPlay, rePlay, pause, setMultiple, nowMarket, formatHourMinute } = useTrackPage("field");
</script>

<style lang="scss" scoped>
.track-status { position: absolute; top: 30px; left: 40px; z-index: 3; max-width: 70%; background: #fffef1ed; color: #745c25; padding: 10px 14px; border-radius: 6px; font-size: 16px; }
.cardBody {
  background: #f9f9f9;
  display: flex;
  flex-direction: column;
  height: 100%; /* 兜底：确保父链缺失 flex 高度时仍能撑满 #app，使 #container 有有效高度，保证地图容器尺寸有效 */
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
      font-size: 20px;
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
        font-size: 20px;
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
        font-size: 22px;
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
      font-size: 18px;
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
