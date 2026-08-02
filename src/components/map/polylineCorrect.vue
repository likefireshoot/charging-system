<template>
  <div class="popCard" :class="show ? 'on' : ''">
    <div class="inHead">
      <p>管线校正</p>
      <a class="btn" @click.stop="$emit('update:show', false)">
        <img src="@/assets/close.svg" class="icon" alt="" />
        <img src="@/assets/close2.svg" class="hov" alt="" />
      </a>
      <div class="bottom">
        <div class="icon"></div>
        <div class="icon2"></div>
        <div class="icon3"></div>
        <div class="bd"></div>
      </div>
    </div>

    <div class="inBody">
      <h2 class="title">当前选中管线</h2>
      <h3 class="title2">{{ checkLine ? checkLine.name : "请选择管线" }}</h3>

      <div class="infoCard">
        <div class="infoItem">
          <h2 class="label">水管名称：</h2>
          <p class="value">{{ checkLine ? checkLine.name : "-" }}</p>
        </div>
        <div class="infoItem">
          <h2 class="label">水管口径：</h2>
          <p class="value">{{ checkLine ? checkLine.diameter : "-" }} mm</p>
        </div>
      </div>

      <template v-if="selectedPoint && selectedPoint.coord">
        <div class="pointsCard">
          <h2 class="name">当前选中节点</h2>
          <div class="pointItem">
            <div class="pointActions">
              <div class="itemCard">
                <h3 class="name">移动距离</h3>
                <div class="selectCard" :class="selectSlide ? 'on' : ''">
                  <div class="label" @click.stop="toggleDistanceSelect">
                    <p>{{ pointDistance }}米</p>
                    <img src="@/assets/slide.png" alt="" />
                  </div>
                  <div class="slideCard" v-if="selectSlide">
                    <div class="inBox">
                      <div class="list">
                        <a class="item" @click.stop="setPointDistance(1)">1米</a>
                        <a class="item" @click.stop="setPointDistance(5)">5米</a>
                        <a class="item" @click.stop="setPointDistance(10)">10米</a>
                        <a class="item" @click.stop="setPointDistance(20)">20米</a>
                        <a class="item" @click.stop="setPointDistance(50)">50米</a>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="setCard">
                  <a class="item item1" @click.stop="goPointDistance(1)">
                    <div class="iconCard">
                      <img src="@/assets/coordinate/icon6.svg" alt="" class="icon" />
                      <img src="@/assets/coordinate/icon5.svg" alt="" class="icon hov" />
                    </div>
                  </a>
                  <a class="item item2" @click.stop="goPointDistance(3)">
                    <div class="iconCard">
                      <img src="@/assets/coordinate/icon6.svg" alt="" class="icon" />
                      <img src="@/assets/coordinate/icon5.svg" alt="" class="icon hov" />
                    </div>
                  </a>
                  <a class="item item3" @click.stop="goPointDistance(4)">
                    <div class="iconCard">
                      <img src="@/assets/coordinate/icon6.svg" alt="" class="icon" />
                      <img src="@/assets/coordinate/icon5.svg" alt="" class="icon hov" />
                    </div>
                  </a>
                  <a class="item item4" @click.stop="goPointDistance(2)">
                    <div class="iconCard">
                      <img src="@/assets/coordinate/icon6.svg" alt="" class="icon" />
                      <img src="@/assets/coordinate/icon5.svg" alt="" class="icon hov" />
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="hintCard">
          <p class="hint">请点击地图上的节点进行编辑</p>
        </div>
      </template>
    </div>

    <div class="saveCard">
      <a class="btn" @click.stop="save">
        <img src="@/assets/coordinate/icon1.svg" alt="" />
        <p>保 存</p>
      </a>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from "element-plus";
import { reactive, defineProps, ref, watch, defineEmits, getCurrentInstance, computed, onMounted, onBeforeUnmount } from "vue";
const { proxy } = getCurrentInstance();
const emit = defineEmits(["updatePoint", "save"]);

const props = defineProps(["show", "checkLine", "selectedPoint"]);

const selectSlide = ref(false);
const pointDistance = ref(1); // 移动距离

const latAndLng = ref({ lng: 0.00001141, lat: 0.00000899 });

const param = reactive({
  Distance: 1,
});

onMounted(() => {
  document.body.addEventListener("click", (e) => {
    selectSlide.value = false;
  });
});

onBeforeUnmount(() => {
  document.body.removeEventListener("click", (e) => {
    selectSlide.value = false;
  });
});

// 当前选中点的坐标（用于编辑）
const currentCoord = ref([0, 0]);

// 监听selectedPoint变化，更新currentCoord
watch(
  () => props.selectedPoint,
  (newPoint) => {
    if (newPoint && newPoint.coord) {
      currentCoord.value = JSON.parse(JSON.stringify(newPoint.coord));
    } else {
      currentCoord.value = [0, 0];
    }
  },
  { immediate: true, deep: true }
);

function toggleDistanceSelect() {
  selectSlide.value = !selectSlide.value;
}

function setPointDistance(distance) {
  pointDistance.value = distance;
  selectSlide.value = false;
}

function updateCoord(coordIndex, value) {
  if (!props.selectedPoint || !currentCoord.value) {
    return;
  }

  currentCoord.value[coordIndex] = value;

  // 立即更新点的坐标
  emit("updatePoint", [...currentCoord.value]);
}

function goPointDistance(direction) {
  if (!props.selectedPoint || !currentCoord.value) {
    return;
  }

  const distance = pointDistance.value || 1;
  const { lng, lat } = latAndLng.value;

  // 直接计算新坐标，不先复制数组（性能优化）
  let newLng = currentCoord.value[0];
  let newLat = currentCoord.value[1];

  if (direction == 1) {
    // 向上移动（纬度增加）
    newLat = Number(parseFloat(newLat + lat * distance).toFixed(8));
  } else if (direction == 2) {
    // 向下移动（纬度减少）
    newLat = Number(parseFloat(newLat - lat * distance).toFixed(8));
  } else if (direction == 3) {
    // 向左移动（经度减少）
    newLng = Number(parseFloat(newLng - lng * distance).toFixed(8));
  } else if (direction == 4) {
    // 向右移动（经度增加）
    newLng = Number(parseFloat(newLng + lng * distance).toFixed(8));
  }

  const newCoord = [newLng, newLat];
  currentCoord.value = newCoord;
  emit("updatePoint", newCoord);
}

async function save() {
  if (!props.checkLine) {
    ElMessage.warning("请选择要修改的管线");
    return;
  }

  if (!props.selectedPoint) {
    ElMessage.warning("请选择要修改的节点");
    return;
  }

  // TODO: 这里需要调用API保存管线坐标
  // await proxy.ajax.post('polyline/revice', checkLine, true);

  emit("save", props.checkLine);
  ElMessage.success("保存成功！");
}
</script>

<style lang="scss" scoped>
.popCard {
  position: absolute;
  right: 180px;
  bottom: 20px;
  top: 20px;
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
      font-size: 22px;
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
        border-radius: 50%;
      }
      .icon2 {
        width: 4px;
        height: 4px;
        margin-right: 8px;
        background: #90d5b2;
        border-radius: 50%;
      }
      .icon3 {
        width: 4px;
        height: 4px;
        margin-right: 8px;
        background: #c7ead8;
        border-radius: 50%;
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
    padding: 20px;
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
  font-size: 20px;
  color: #585657;
  margin-bottom: 10px;
}

.title2 {
  font-size: 20px;
  color: #46b97e;
  margin-bottom: 20px;
}

.infoCard {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 6px;
}

.infoItem {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
  .label {
    font-size: 20px;
    color: #606060;
    margin-right: 10px;
    min-width: 100px;
  }
  .value {
    font-size: 20px;
    color: #333;
  }
}

.pointsCard {
  margin-top: 20px;
}

.name {
  font-size: 20px;
  color: #585657;
  margin-bottom: 15px;
}

.pointItem {
  background: #f9f9f9;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
}

.pointCoords {
  margin-bottom: 15px;
}

.coordItem {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  span {
    font-size: 20px;
    color: #606060;
    min-width: 80px;
  }
  input {
    flex: 1;
    height: 36px;
    padding: 0 10px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-size: 18px;
    &:focus {
      outline: none;
      border-color: #46b97e;
    }
  }
}

.pointActions {
  margin-top: 15px;
}

.itemCard {
  .name {
    font-size: 20px;
    color: #606060;
    margin-bottom: 10px;
  }
}

.selectCard {
  position: relative;
  margin-bottom: 15px;
  .label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 36px;
    padding: 0 12px;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    cursor: pointer;
    p {
      font-size: 20px;
      color: #333;
    }
    img {
      width: 12px;
      height: 12px;
    }
  }
  &.on {
    .label {
      border-color: #46b97e;
    }
  }
}

.slideCard {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  margin-top: 5px;
  .inBox {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    .list {
      padding: 5px 0;
      .item {
        display: block;
        padding: 8px 12px;
        font-size: 20px;
        color: #333;
        cursor: pointer;
        &:hover {
          background: #f5f5f5;
          color: #46b97e;
        }
      }
    }
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

.hintCard {
  margin-top: 40px;
  text-align: center;
  .hint {
    font-size: 20px;
    color: #999;
  }
}

.saveCard {
  padding: 20px;
  border-top: 1px solid #e9e9e9;
  .btn {
    width: 100%;
    height: 44px;
    background: #46b97e;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    img {
      width: 20px;
      height: 20px;
      margin-right: 8px;
    }
    p {
      font-size: 20px;
      color: #fff;
    }
    &:hover {
      background: #3da069;
    }
  }
}
</style>
