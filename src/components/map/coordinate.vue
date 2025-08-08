
<template>
  <div class="popCard" :class="show?'on':''">

    <div class="inHead">
      <p>修改标记点</p>
      <a class="btn" @click.stop="$emit('update:show',false)">
        <img src="@/assets/close.svg" class="icon" alt="">
        <img src="@/assets/close2.svg" class="hov" alt="">
      </a>
      <div class="bottom">
        <div class="icon"></div>
        <div class="icon2"></div>
        <div class="icon3"></div>
        <div class="bd"></div>
      </div>
    </div>

    <div class="inBody">

      <h2 class="title">当前选中设备</h2>
      <h3 class="title2">{{checkMarket?checkMarket.name:'请选择设备'}}</h3>
      <div class="itemCard">
        <h2 class="name">移动距离</h2>
        <div class="selectCard" :class="selectSlide?'on':''">
          <div class="label" @click.stop="selectSlide=selectSlide?false:true">
            <p>{{param.Distance}}米</p>
            <img src="@/assets/slide.png" alt="">
          </div>
          <div class="slideCard">
            <div class="inBox">
              <div class="list">
                <a class="item" @click.stop="setDistance(1)">1米</a>
                <a class="item" @click.stop="setDistance(5)">5米</a>
                <a class="item" @click.stop="setDistance(10)">10米</a>
                <a class="item" @click.stop="setDistance(20)">20米</a>
                <a class="item" @click.stop="setDistance(50)">50米</a>
                <a class="item" @click.stop="setDistance(100)">100米</a>
                <a class="item" @click.stop="setDistance(200)">200米</a>
                <a class="item" @click.stop="setDistance(300)">300米</a>
              </div>
            </div>
          </div>
        </div>

        <div class="setCard">
          <a class="item item1" @click.stop="goDistance(1)">
            <div class="iconCard">
              <img src="@/assets/coordinate/icon6.svg" alt="" class="icon">
              <img src="@/assets/coordinate/icon5.svg" alt="" class="icon hov">
            </div>
          </a>
          <a class="item item2" @click.stop="goDistance(3)">
            <div class="iconCard">
              <img src="@/assets/coordinate/icon6.svg" alt="" class="icon">
              <img src="@/assets/coordinate/icon5.svg" alt="" class="icon hov">
            </div>
          </a>
          <a class="item item3" @click.stop="goDistance(4)">
            <div class="iconCard">
              <img src="@/assets/coordinate/icon6.svg" alt="" class="icon">
              <img src="@/assets/coordinate/icon5.svg" alt="" class="icon hov">
            </div>
          </a>
          <a class="item item4" @click.stop="goDistance(2)">
            <div class="iconCard">
              <img src="@/assets/coordinate/icon6.svg" alt="" class="icon">
              <img src="@/assets/coordinate/icon5.svg" alt="" class="icon hov">
            </div>
          </a>
        </div>

      </div>

      <div class="itemCard">
        <h2 class="name">旋转角度</h2>

        <div class="selectCard" :class="selectSlide2?'on':''" @click.stop="selectSlide2=selectSlide2?false:true">
          <div class="label">
            <p>{{param.Rotate}}°</p>
            <img src="@/assets/slide.png" alt="">
          </div>
          <div class="slideCard">
            <div class="inBox">
              <div class="list">
                <a class="item" @click.stop="setRotate(5)">5°</a>
                <a class="item" @click.stop="setRotate(10)">10°</a>
                <a class="item" @click.stop="setRotate(15)">15°</a>
                <a class="item" @click.stop="setRotate(45)">45°</a>
                <a class="item" @click.stop="setRotate(90)">90°</a>
                <a class="item" @click.stop="setRotate(180)">180°</a>
              </div>
            </div>
          </div>
        </div>

        <div class="rotateCard">
          <a class="item " @click.stop="goRotate(1)">
            <div class="iconCard">
              <img src="@/assets/coordinate/icon7.svg" alt="" class="icon">
              <img src="@/assets/coordinate/icon9.svg" alt="" class="icon hov">
            </div>
            <p>顺时针旋转</p>
          </a>
          <a class="item" @click.stop="goRotate(2)">
            <div class="iconCard">
              <img src="@/assets/coordinate/icon7.svg" alt="" class="icon">
              <img src="@/assets/coordinate/icon9.svg" alt="" class="icon hov">
            </div>
            <p>逆时针旋转</p>
          </a>
        </div>
      </div>
    </div>

    <div class="saveCard">
      <a class="btn" @click.stop="save">
        <img src="@/assets/coordinate/icon1.svg" alt="">
        <p>保 存</p>
      </a>
    </div>

  </div>
</template>
  
  
  
  
  <script setup>
import { ElMessage } from 'element-plus'
import { reactive, defineProps, ref, onMounted, onBeforeUnmount,defineEmits,getCurrentInstance } from "vue";
const { proxy } = getCurrentInstance();
const emit = defineEmits(['updateMarket','updateUpRotation']);
const props = defineProps(['show', 'checkMarket']);

const selectSlide = ref(false);
const selectSlide2 = ref(false);

onMounted(() => {
  document.body.addEventListener('click', e => {
    selectSlide.value = false;
    selectSlide2.value = false;
  });
});
onBeforeUnmount(() => {
  document.body.removeEventListener('click', e => {
    selectSlide.value = false;
    selectSlide2.value = false;
  });
});


const latAndLng=ref({lng:0.00001141,lat:0.00000899});

const param = reactive({
  Distance: 1,
  Rotate: 5,
});

function setDistance(data) {
  param.Distance = data;
  selectSlide.value = false;
}

function setRotate(data) {
  param.Rotate = data;
  selectSlide2.value = false;
}

function goDistance(index){
  console.log(index);
  let {checkMarket}=props;

  if(!checkMarket){
    ElMessage.warning('请选择要修改的设备');
    return ;
  }



  let {lng,lat}=latAndLng.value;
  if(index==1){
    checkMarket.position[1]=Number(parseFloat(checkMarket.position[1]+lat*param.Distance).toFixed(8));
  }
  if(index==2){
    checkMarket.position[1]=Number(parseFloat(checkMarket.position[1]-lat*param.Distance).toFixed(8));
  }
  if(index==3){
    checkMarket.position[0]=Number(parseFloat(checkMarket.position[0]-lng*param.Distance).toFixed(8));
  }
  if(index==4){
    checkMarket.position[0]=Number(parseFloat(checkMarket.position[0]+lng*param.Distance).toFixed(8));
  }


  emit('updateMarket',checkMarket);
}

function goRotate(index){
  let {checkMarket}=props;
  if(!checkMarket){
    ElMessage.warning('请选择要修改的设备');
    return ;
  }


  if(index==1){
    checkMarket.rotationAngle=checkMarket.rotationAngle+param.Rotate;
  }
  if(index==2){
    checkMarket.rotationAngle=checkMarket.rotationAngle-param.Rotate;
  }

  emit('updateUpRotation',checkMarket);





}

async function save(){

  let {checkMarket}=props;
  if(!checkMarket){
    ElMessage.warning('请选择要修改的设备');
    return ;
  }


  let param=new Object();

  console.log(checkMarket);

  param.id=checkMarket.id;
  param.position=Array.from(checkMarket.position).sort((a,b)=>a-b);
  param.rotationAngle=checkMarket.rotationAngle;

  console.log(param);

  await proxy.ajax.post('device_display/revice',param,true);
  ElMessage.success('保存成功！');

}





  </script>
  
  
  <style lang="scss" scoped>
.popCard {
  position: absolute;
  right: 20px;
  bottom: 20px;
  top: 68px;
  width: 430px;
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
      font-size: 18px;
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
      }
      .icon2 {
        width: 4px;
        height: 4px;
        margin-right: 8px;
        background: #90d5b2;
      }
      .icon3 {
        width: 4px;
        height: 4px;
        margin-right: 8px;
        background: #c7ead8;
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
    &::-webkit-scrollbar {
      width: 8px;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 6px;
      background: #b5e3cb;
      width: 8px;
    }
  }
}

.title {
  font-size: 16px;
  color: #585657;
  line-height: 32px;
  height: 32px;
  margin: 10px 20px 0;
}
.title2 {
  margin: 10px 20px;
  height: 40px;
  line-height: 40px;
  background: #ecf8f2;
  font-size: 18px;
  color: #585657;
  font-weight: bold;
  padding: 0 15px;
}

.selectCard {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  height: 40px;
  flex: 0;
  border: 1px solid #eaeaea;
  width: 164px;
  border-radius: 6px;
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
    cursor: pointer;
    flex: 1;
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
      border: 1px solid #eaeaea;
      background: #fff;
      border-radius: 10px;
      padding: 6px;
      display: flex;
      flex-direction: column;
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

.itemCard {
  margin: 0 20px 20px;
  display: flex;
  flex-direction: column;
  .name {
    font-size: 16px;
    color: #585657;
    line-height: 32px;
    height: 32px;
  }
}

.setCard {
  border-radius: 200px;
  overflow: hidden;
  width: 200px;
  height: 200px;
  margin: 30px auto 10px;
  background: url(@/assets/coordinate/icon4.svg);
  background-size: 100% 100%;
  position: relative;
  .item {
    position: absolute;
    width: 80px;
    height: 80px;
    overflow: hidden;
    // background: #f50;
    // opacity: 0.5;
    display: flex;
    align-items: center;
    justify-content: center;
    .iconCard {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      width: 20px;
      height: 20px;
    }
    &:hover {
      img {
        &.hov {
          opacity: 1;
        }
      }
    }
    img {
      width: 20px;
      &.hov {
        opacity: 0;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translateX(-50%) translateY(-50%);
      }
    }
    &.item1 {
      left: 50%;
      top: 0;
      transform: translateX(-50%) rotate(45deg);
      .iconCard {
        transform: rotate(45deg);
      }
    }
    &.item2 {
      left: 0%;
      top: 50%;
      transform: translateY(-50%) rotate(45deg);
      .iconCard {
        transform: rotate(-45deg);
      }
    }
    &.item3 {
      right: 0%;
      top: 50%;
      transform: translateY(-50%) rotate(45deg);
      .iconCard {
        transform: rotate(135deg);
      }
    }
    &.item4 {
      left: 50%;
      bottom: 0;
      transform: translateX(-50%) rotate(45deg);
      .iconCard {
        transform: rotate(225deg);
      }
    }
  }
}

.rotateCard {
  display: flex;
  align-items: center;
  margin: 36px auto;
  .item {
    display: flex;
    flex-direction: column;
    align-items: center;
    .iconCard {
      width: 102px;
      height: 102px;
      background: url(@/assets/coordinate/icon8.svg);
      background-size: 100% 100%;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 26px 20px;
    }
    &.on,
    &:hover {
      img {
        &.hov {
          opacity: 1;
        }
      }
    }
    &:nth-of-type(2) {
      .iconCard {
        transform: rotateY(180deg);
      }
    }
    img {
      width: 32px;
      height: 32px;
      &.hov {
        opacity: 0;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translateX(-50%) translateY(-50%);
      }
    }
    p {
      font-size: 16px;
      color: #585657;
    }
  }
}

.saveCard {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: 32px;
  .btn {
    border-radius: 6px;
    display: flex;
    align-items: center;
    width: 100px;
    height: 40px;
    justify-content: center;
    background: #46b97e;
    img {
      width: 20px;
      margin-right: 8px;
    }
    p {
      font-size: 16px;
      color: #ffffff;
    }
  }
}
</style>