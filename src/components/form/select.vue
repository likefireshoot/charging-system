<template>
  <div class="selectCard" :style="`${width?'width:'+width+'px':''}`" :class="selectSlide?'on':''" @click.stop="selectSlide=selectSlide?false:true">
    <div class="label">
      <p>{{selectName}}</p>
      <img src="@/assets/slide.png" alt="">
    </div>
    <div class="slideCard">
      <div class="inBox">
        <template v-for="(item,index) in options" :key='index'>
          <a class="item" @click.stop="selectItem(item)">{{item[inputValue]}}</a>
        </template>
      </div>
    </div>

  </div>
</template>

<script setup>
import { reactive, ref,computed, onMounted, onBeforeUnmount,watch } from "vue";
const emit = defineEmits(['update:select','selectItem']);
const { width, propValue, options,select } = defineProps(['width', 'propValue', 'options','select']);
const selectSlide = ref(false);
const inputValue = propValue ? propValue : 'value';



const selectName=ref(select);

watch(() => select, (a, b) => {
  selectName.value = a;
})

function selectItem(item){
    slideToggle(false);
    selectName.value=item.name;
    emit('update:select',item.name);
    emit('selectItem', item);

}

function slideToggle(Boolean){
    selectSlide.value=Boolean;
}

onMounted(()=>{
  document.body.addEventListener('click',e=>{
    slideToggle(false);
  });
});
onBeforeUnmount(()=>{
  document.body.removeEventListener('click',e=>{
    slideToggle(false);
  });
});








</script>

<style lang="scss" scoped>
.selectCard {
  position: relative;
  z-index: 10;
  margin: 20px 10px;
  display: flex;
  align-items: center;
  height: 40px;
  position: relative;
  &.on {
    .slideCard {
      top: 30px;
      opacity: 1;
      pointer-events: auto;
    }
    img {
      transform: rotate(0deg);
    }
  }
  .label {
    width: 100%;
    cursor: pointer;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    height: 40px;
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
    position: absolute;
    z-index: 10;
    width: 100%;
    left: 0;
    top: 30px;
    padding-top: 12px;
    pointer-events: none;
    opacity: 0;
    transition: all 0.2s;
    top: -20px;
    .inBox {
      background: #fff;
      border-radius: 10px;
      padding: 6px;
      display: flex;
      flex-direction: column;
      .item {
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