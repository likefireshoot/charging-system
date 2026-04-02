
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

      <template v-if='!listLoading&&data.list.length==0'>
            <h2 class="hint">暂无数据...</h2>
          </template>

      <div class="itemList" v-else>

        <template v-for="(item,index) in data.list" :key="index">
          <div class="item" @click.stop="goMap(item)">
            <div class="inTtle">
              <img :src="require(`@/assets/fault/icon${index<3?index+1:4}.svg`)" alt="" class="icon">
              <h2 :class="item.device_id==checkItem?'on':''">{{item.device_name}}</h2>
              <!-- <p v-if='item.status==0'>未处理</p>
              <p v-if='item.status==1'>已处理</p> -->
            </div>
            <ul>
              <li>
                <h2>位置：</h2>
                <p>{{item.address}}</p>
              </li>
              <li>
                <h2>时间：</h2>
                <p>{{formatDateTime(new Date(item.report_time))}}</p>
              </li>
              <li>
                <h2>故障：</h2>
                <p>{{item.exception}}</p>
              </li>
            </ul>
          </div>
        </template>

      </div>

    </div>

    <div class="pagesCard">
      <a class="item" @click.stop="prevPage">上一页</a>
      <a class="item" @click.stop="nextPage">下一页</a>
    </div>

  </div>
</template>




<script setup>
import eventBus from '@/api/eventBus';
import { formatDateTime, } from '@/api/being';
import { ref, reactive, watch, getCurrentInstance, defineEmits, onMounted } from "vue";
const { show, allTownSelect } = defineProps(['show', 'allTownSelect']);
const { proxy } = getCurrentInstance();
const emit = defineEmits(['deviceCheck']);

const param = reactive({
  page: 1,
  isHandle: null,
  point_type: null,
  city_town: null,
})
const checkItem = ref(null);
const data = reactive({
  list: [],
});
const listLoading = ref(true);

watch(() => show, a => {
  if (a) {

    param.city_town = allTownSelect;

    exception();
  }
})

onMounted(() => {
  eventBus.on('reGet', () => {
    if (show) {
      checkItem.value=null;
      param.city_town = allTownSelect;
      param.page = 1;
      exception();
    }
  })
})

async function exception() {
  listLoading.value = true;
  let { data: list } = await proxy.ajax.post('device_display/exception', param);
  data.list = list;
  listLoading.value = false;
}

function goMap(item) {
  item.position = [item.lat, item.lnt];
  checkItem.value = item.device_id;
  emit('deviceCheck', item)
}

function prevPage() {
  param.page = param.page > 1 ? param.page - 1 : 1;
  data.list = [];
  exception();
}


function nextPage() {
  if (data.list.length > 0) {
    param.page = param.page + 1;
    data.list = [];
  exception();
  } else {
    ElMessage.warning('暂无更多数据...');
  }
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

.itemList {
  display: flex;
  flex-direction: column;
  padding-top: 20px;
  .item {
    display: flex;
    flex-direction: column;
    padding: 0 20px 18px 20px;
    position: relative;
    cursor: pointer;
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
        &.on {
          color: #46b97e;
        }
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

.pagesCard {
  margin: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  .item {
    margin: 0 20px;
    min-width: 120px;
    height: 40px;
    background: #46b97e;
    border-radius: 6px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    font-size: 16px;
    color: #fff;
  }
}

.hint {
  margin: 20px auto;
  text-align: center;
  color: #666;
  font-size: 16px;
}
</style>