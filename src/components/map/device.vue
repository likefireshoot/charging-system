
<template>
  <div class="popCard" :class="show?'on':''">

    <div class="inHead">
      <p>设备属性</p>
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

    <div class="barBox">
      <template v-for="(item,index) in barList" :key="index">
        <a class="item" :class="item.id==param.pointTypes[0]?'on':''" @click.stop="barItem(item)">{{item.name}}</a>
      </template>

    </div>

    <div class="inBody">

      <div v-if="listLoading" class="loadingCard">

        <img src="@/assets/loading.svg" alt="">
      </div>

      <template v-else>

        <dl class="table">
          <dt>
            <div class="item">序号</div>
            <div class="item">设备名称</div>
            <template v-if="hasExternInfo">
              <div v-if="param.pointTypes[0]==7" class="item">水陈深度</div>
              <div v-else-if="param.pointTypes[0]==0" class="item item74">压力值</div>
              <div v-else-if="param.pointTypes[0]==8" class="item ">状态</div>
              <div v-else class="item item74">状态</div>
            </template>
            <div class="item">位置</div>
          </dt>

          <template v-if='list.length==0'>
            <h2 class="hint">暂无数据...</h2>
          </template>
          <template v-else>
            <dd v-for="(item,index) in list" :key="index">
              <div class="item">
                <p>{{index+1}}</p>
              </div>
              <div class="item">
                <h2>{{item.name}}</h2>
              </div>
              <template v-if="hasExternInfo">
                <div class="item item74" v-if="param.pointTypes[0]==1">
                  <div class="type2">
                    <font :color="item.externInfo.status=='开'?'#46b97e':'#f33225'">{{item.externInfo.status}}</font>
                  </div>
                </div>

                <div class="item" v-if="param.pointTypes[0]==7">
                  <div class="type2">
                    <font color='#46b97e'>{{item.externInfo.depth}}米</font>
                  </div>
                </div>

                <div class="item" v-if="param.pointTypes[0]==8">
                  <div class="type">
                    <font :color="item.externInfo.status=='开'?'#46b97e':'#f33225'">{{item.externInfo.status}}</font>
                  </div>
                  <div class="txt">
                    <p>电流：</p>
                    <h2>{{item.externInfo.electricity}}A</h2>
                  </div>
                  <div class="txt">
                    <p>电压：</p>
                    <h2>{{item.externInfo.voltage}}V</h2>
                  </div>
                </div>

                <div class="item item74" v-if="param.pointTypes[0]==0">
                  <div class="type2">
                    <font color='#606060'>{{item.externInfo?item.externInfo.pressure:0}}MPa</font>
                  </div>
                </div>
              </template>
              <div class="item">
                <a class="btn" @click.stop="checkItem(item)">查看定位</a>
              </div>
            </dd>
          </template>
        </dl>
      </template>

    </div>

    <div class="pagesCard">
      <a class="item" @click.stop="prevPage">上一页</a>
      <a class="item" @click.stop="nextPage">下一页</a>
    </div>

  </div>
</template>




<script setup>
import eventBus from '@/api/eventBus';
import { ElMessage } from 'element-plus';
import { ref, reactive, watch, getCurrentInstance, defineEmits, onMounted } from "vue";

const { show, allTownSelect } = defineProps(['show', 'allTownSelect']);
const { proxy } = getCurrentInstance();
const emit = defineEmits(['deviceCheck']);

const barList = reactive([
  { id: 1, name: '阀门' },
  { id: 2, name: '排气阀' },
  { id: 5, name: '流量计' },
  { id: 7, name: '水池' },
  { id: 8, name: '水泵' },
  { id: 0, name: '压力计' },
  { id: 10, name: '弯头' },
  { id: 20, name: '三通' },
  { id: 30, name: '四通' },
]);

const list = ref([]);
const param = reactive({
  city_town: null,
  page: 1,
  pointTypes: [1],
})
const hasExternInfo = ref(false);
const listLoading = ref(true);


watch(() => show, (a, b) => {
  console.log(a);
  if (a) {
    if (list.value.length == 0) {
      param.city_town = allTownSelect;
      getlist();
    }
  }
});


onMounted(() => {
  eventBus.on('reGet', () => {
    if (show) {
      param.city_town = allTownSelect;
      param.page = 1;
      getlist();
    }
  })
})

function barItem(pointType) {
  param.pointTypes = [pointType.id];
  param.page = 1;
  param.city_town = allTownSelect;
  getlist();

};

async function getlist() {


  listLoading.value = true;

  console.log(param);
  let { data } = await proxy.ajax.post('device_display', param);
  hasExternInfo.value = data.find(a => a.externInfo) ? true : false;
  listLoading.value = false;
  list.value = data;
  console.log(data);
}


function checkItem(item) {
  emit('deviceCheck', item)
}


function prevPage() {
  param.page = param.page > 1 ? param.page - 1 : 1;
  list.value = [];
  getlist();
}


function nextPage() {
  if (list.value.length > 0) {
    param.page = param.page + 1;
    list.value = [];
    getlist();
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
    margin-bottom: 30px;
  }
}

.itemList {
  display: flex;
  flex-direction: column;
  padding-top: 20px;
}

.barBox {
  display: flex;
  flex-wrap: wrap;
  padding: 20px 20px 0 12px;
  .item {
    width: 71px;
    height: 40px;
    margin-bottom: 10px;
    margin-left: 8px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #585657;
    font-size: 16px;
    border-radius: 6px;
    border: 1px solid #ececec;
    &.on {
      background: #46b97e;
      color: #fff;
      border: 1px solid #46b97e;
    }
  }
}

.table {
  border: 1px solid #ececec;
  border-top: none;
  margin: 0 20px;
  border-radius: 6px;
  dt {
    border: 1px solid #ececec;
    border-radius: 6px 6px 0 0;
    top: 0px;
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    .item {
      font-size: 16px;
      color: #329c6d;
      font-weight: bold;
      text-align: center;
      height: 100%;
      background: #c7ead8;
    }
  }

  dd {
    display: flex;
    min-height: 40px;
    &:nth-of-type(even) {
      background: #ecf8f2;
    }
    a {
      font-size: 16px;
      color: #46b97e;
      white-space: nowrap;
    }
    .type {
      width: calc(100% - 20px);

      height: 44px;
      margin: 0 10px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px dashed #e6e6e6;
    }
    h2 {
      font-size: 16px;
      color: #606060;
    }
    p {
      font-size: 16px;
      color: #a0a0a0;
    }
    .txt {
      width: 100%;
      box-sizing: border-box;
      padding-left: 10px;
      display: flex;
      align-items: center;
      white-space: nowrap;
      margin-bottom: 10px;
    }
  }
  .item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-left: 1px solid #ececec;

    &:first-of-type {
      width: 44px;
      min-width: 44px;
      justify-content: center;
      border-left: 0;
    }
    &:nth-of-type(2) {
      flex: 1;
    }
    &:nth-of-type(3) {
      width: 112px;
    }
    &:nth-of-type(4) {
      min-width: 86px;
    }
    &.item74 {
      width: 74px;
      min-width: 74px;
    }
  }
}

.hint {
  margin: 20px auto;
  text-align: center;
  color: #666;
  font-size: 16px;
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
</style>