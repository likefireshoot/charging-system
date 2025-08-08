<template>
  <div class="selectCard" ref="selectCard" :style="`${width?'width:'+width+'px':''}`" :class="selectSlide?'on':''" @click.stop="selectSlide=selectSlide?false:true">
    <div class="label">
      <p>{{select || '请选择'}}</p>
      <img src="@/assets/slide.png" alt="">
    </div>
    <div v-if="options && options.length>0" class="slideCard" :class="isSlideDown?'':'slideTop'" ref='slideCard'>
      <div class="inBox">
        <div class="list">
          <template v-for="(item,index) in options" :key='index'>
            <a class="item" @click.stop="selectItem(item)">{{item[inputValue]}}</a>
          </template>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted, onBeforeUnmount, getCurrentInstance } from "vue";
const emit = defineEmits(['update:select', 'selectItem']);
const { proxy } = getCurrentInstance();
const { width, propValue, options, select } = defineProps(['width', 'propValue', 'options', 'select']);
const selectSlide = ref(false);
const inputValue = propValue ? propValue : 'value';

const isSlideDown = ref(null);


const selectName = ref(null);
watch(() => select, (a, b) => {
  selectName.value = a;
})

function selectItem(item) {
  slideToggle(false);
  selectName.value = item[propValue];
  emit('update:select', item[propValue]);
  emit('selectItem', item);
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

  if (options && options.length > 0) {
    let { selectCard, slideCard } = proxy.$refs;
    const h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    let style = selectCard.getBoundingClientRect();
    let slideStyle = slideCard.getBoundingClientRect();
    if (h - style.bottom < slideStyle.height) {
      isSlideDown.value = false;
    }
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
      transform: rotate(0deg);
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
    transform: rotate(180deg);
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
      border: 1px solid #e6e6e6;
      box-sizing: border-box;
      background: #fff;
      border-radius: 10px;
      padding: 6px;

      .list {
        display: flex;
        max-height: 250px;
        overflow-y: auto;
        flex-direction: column;
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
        &:hover {
          color: #fff;
          background: #46b97e;
        }
      }
    }
  }
}
</style>