<template>
  <div class="selectCard" ref="selectCard" :style="`${width?'width:'+width+'px':''}`" :class="selectSlide?'on':''" @click.stop="selectSlide=selectSlide?false:true">
    <div class="label">
      <p>{{time}}</p>
      <img src="@/assets/field/icon9.png" alt="">
    </div>

    <div class="slideCard" :class="isSlideDown?'':'slideTop'" ref='slideCard'>
      <div class="inBox">
        <div class="list">
          <template v-for="(item,index) in hourList" :key='index'>
            <a class="item" :class="item.value==hourt?'on':''" @click.stop="selectItem(item,0)">{{item.value}}</a>
          </template>
        </div>
        <div class="list">
          <template v-for="(item,index) in minuteList" :key='index'>
            <a class="item" :class="item.value==minute?'on':''" @click.stop="selectItem(item,1)">{{item.value}}</a>
          </template>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onBeforeUnmount, getCurrentInstance, watch } from "vue";
const emit = defineEmits(['update:select']);
const { proxy } = getCurrentInstance();
const { width, propValue, options, select, nowTime } = defineProps(['width', 'nowTime', 'options', 'select']);
const selectSlide = ref(false);


let formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}
function setList(count) {
  let list = new Array();
  for (let i = 0; i < count; i++) {
    list.push({ id: i, value: formatNumber(i) })
  }
  return list;
}

let time = ref(nowTime);
let hourt = ref(null);
let minute = ref(null);
const isSlideDown = ref(null);
const hourList = reactive(setList(24));
const minuteList = reactive(setList(60));


const selectName = ref(select);
function selectItem(item, index) {
  if (index == 0) {
    hourt.value = item.value;
  }
  else {
    minute.value = item.value;
  }

  if (hourt.value && minute.value) {
    time.value = [hourt.value, minute.value].join(':');
    if (index == 1) {
      slideToggle(false);
      emit('update:select', time);
    }
  }




}

function slideToggle(Boolean) {
  selectSlide.value = Boolean;
}


onMounted(()=>{
  document.body.addEventListener('click',e=>{
    slideToggle(false);
  });
  getStyle();
});
onBeforeUnmount(()=>{
  document.body.removeEventListener('click',e=>{
    slideToggle(false);
  });
});

function getStyle() {
  let { selectCard, slideCard } = proxy.$refs;
  const h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  let style = selectCard.getBoundingClientRect();
  let slideStyle = slideCard.getBoundingClientRect();
  if (h - style.bottom < slideStyle.height) {
    isSlideDown.value = false;
  }
}








</script>

<style lang="scss" scoped>
.selectCard {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  height: 40px;
  position: relative;
  &.on {
    .slideCard {
      top: 30px;
      opacity: 1;
      pointer-events: auto;
      &.slideTop {
        top: auto;
        bottom: 30px;
        opacity: 1;
        pointer-events: auto;
      }
    }
    img {
    }
  }
  .label {
    width: 100%;
    cursor: pointer;
    height: 40px;
    border: 1px solid #e6e6e6;
    background: #fff;
    border-radius: 6px;
    display: flex;
    align-items: center;
    transition: all 0.2s;
    padding: 0 12px;
    position: relative;
    z-index: 20;
    p {
      font-size: 16px;
      color: #585657;
      flex: 1;
    }
  }
  img {
  }
  .slideCard {
    &.slideTop {
      top: auto;
      bottom: 0px;
      padding-top: 0;
      padding-bottom: 12px;
    }
    position: absolute;
    z-index: 10;
    width: 100%;
    left: 0;
    padding-top: 12px;
    pointer-events: none;
    opacity: 0;
    transition: all 0.2s;
    top: -20px;
    .inBox {
      height: 250px;
      border: 1px solid #e6e6e6;
      box-sizing: border-box;
      background: #fff;
      border-radius: 10px;
      padding: 6px;
      display: flex;
      .list {
        width: 50%;
        flex-direction: column;
        display: flex;
        overflow-y: auto;
        &::-webkit-scrollbar {
          width: 6px;
        }
        &::-webkit-scrollbar-thumb {
          width: 6px;
          background: #b5e3cb;
          border-radius: 2px;
        }
      }
      .item {
        min-height: 42px;
        height: 42px;
        display: flex;
        align-items: center;
        padding: 0 12px;
        font-size: 16px;
        color: #a0a0a0;
        border-radius: 6px;
        transition: all 0.2s;
        &.on,
        &:hover {
          color: #fff;
          background: #46b97e;
        }
      }
    }
  }
}
</style>