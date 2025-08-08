
<template>
  <div class="popCard" :class="show?'on':''">

    <div class="inHead">
      <p>故障信息</p>
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


      <div v-if="listLoading" class="loadingCard">

<img src="@/assets/loading.svg" alt="">
</div>

      <div class="itemList">
        
        <div class="item" v-for="item in list">
          <div class="inTtle">
            <img src="@/assets/fault/icon1.svg" alt="" class="icon">
            <h2>{{item.list}}</h2>
            <p>未处理</p>
          </div>
          <ul>
            <li>
              <h2>位置：</h2>
              <p>梅隆镇-党支部办公区</p>
            </li>
            <li>
              <h2>时间：</h2>
              <p>2024-03-21 12：30</p>
            </li>
            <li>
              <h2>故障：</h2>
              <p>水泵发生短路，电路异常，梅隆镇水路暂停 送水。</p>
            </li>
          </ul>
        </div>
<!-- 
        <div class="item">
          <div class="inTtle">
            <img src="@/assets/fault/icon2.svg" alt="" class="icon">
            <h2>XXXXXX阀门</h2>
            <p>未处理</p>
          </div>
          <ul>
            <li>
              <h2>位置：</h2>
              <p>梅隆镇-党支部办公区</p>
            </li>
            <li>
              <h2>时间：</h2>
              <p>2024-03-21 12：30</p>
            </li>
            <li>
              <h2>故障：</h2>
              <p>水泵发生短路，电路异常，梅隆镇水路暂停 送水。</p>
            </li>
          </ul>
        </div>

        <div class="item">
          <div class="inTtle">
            <img src="@/assets/fault/icon3.svg" alt="" class="icon">
            <h2>XXXXXX阀门</h2>
            <p>未处理</p>
          </div>
          <ul>
            <li>
              <h2>位置：</h2>
              <p>梅隆镇-党支部办公区</p>
            </li>
            <li>
              <h2>时间：</h2>
              <p>2024-03-21 12：30</p>
            </li>
            <li>
              <h2>故障：</h2>
              <p>水泵发生短路，电路异常，梅隆镇水路暂停 送水。</p>
            </li>
          </ul>
        </div>
        <div class="item">
          <div class="inTtle">
            <img src="@/assets/fault/icon4.svg" alt="" class="icon">
            <h2>XXXXXX阀门</h2>
            <p>未处理</p>
          </div>
          <ul>
            <li>
              <h2>位置：</h2>
              <p>梅隆镇-党支部办公区</p>
            </li>
            <li>
              <h2>时间：</h2>
              <p>2024-03-21 12：30</p>
            </li>
            <li>
              <h2>故障：</h2>
              <p>水泵发生短路，电路异常，梅隆镇水路暂停 送水。</p>
            </li>-->
          </ul> 
        </div>

      </div>

    </div>

  </div>
</template>




<script setup>
import { ref, reactive, watch, getCurrentInstance,defineEmits } from "vue";
const { show, } = defineProps(['show']);
const { proxy } = getCurrentInstance();
const emit = defineEmits();


const param=ref({
  page:1,
  isHandle:null,
  point_type:null,
})
const list=ref([]);
const listLoading=ref(true);

watch(()=>show,a=>{
  if(a){
    exception();
  }
})

async function exception(){
  listLoading.value=true;
  let {data}=await proxy.ajax.post('device_display/exception',param.value);
  console.log(data);
  list.value=data;
  listLoading.value=false;
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
  transition: all .2s;
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

.itemList {
  display: flex;
  flex-direction: column;
  padding-top: 20px;
  .item {
    display: flex;
    flex-direction: column;
    padding: 0 20px 18px 20px;
    position: relative;
    &::before {
      content: "";
      position: absolute;
      top: 28px;
      left: 29px;
      bottom: 0;
      border-left: 2px dotted #ececec;
      z-index: 1;
    }
    .inTtle {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
      .icon {
        width: 20px;
        margin-right: 10px;
        position: relative;
        z-index: 2;
      }
      h2 {
        font-size: 18px;
        color: #585657;
        font-weight: bold;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      p {
        margin-left: auto;
        width: 70px;
        height: 30px;
        border-radius: 4px;
        background: #feeae9;
        font-size: 16px;
        color: #f33225;
        line-height: 30px;
        text-align: center;
        &.green {
          background: #ecf8f2;
          color: #46b97e;
        }
      }
    }
    ul {
      padding-left: 30px;
      li {
        display: flex;
        h2 {
          line-height: 28px;
          font-size: 16px;
          color: #9aa8b1;
        }
        p {
          flex: 1;
          line-height: 28px;
          font-size: 16px;
          color: #585657;
        }
      }
    }
  }
}
</style>