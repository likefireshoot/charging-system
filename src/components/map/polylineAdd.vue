<template>
  <div class="popCard" :class="show ? 'on' : ''">
    <div class="inHead">
      <p>管线添加</p>
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
      <h2 class="title">添加新管线</h2>
      <p class="hint">请在地图上点击多个位置来绘制管线</p>

      <div class="infoCard">
        <div class="infoItem">
          <h2 class="label">已选点数：</h2>
          <p class="value">{{ newPolyline.coords.length }} 个点</p>
        </div>
      </div>

      <div class="itemCard">
        <h2 class="name">管径 (mm)</h2>
        <div class="selectCard" :class="selectSlide ? 'on' : ''">
          <div class="label" @click.stop="selectSlide = selectSlide ? false : true">
            <p>{{ newPolyline.diameter }} mm</p>
            <img src="@/assets/slide.png" alt="" />
          </div>
          <div class="slideCard">
            <div class="inBox">
              <div class="list">
                <a class="item" @click.stop="setDiameter(50)">50 mm</a>
                <a class="item" @click.stop="setDiameter(100)">100 mm</a>
                <a class="item" @click.stop="setDiameter(150)">150 mm</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="actionsCard">
        <a class="btn" @click.stop="clearPoints">
          <p>清除所有点</p>
        </a>
        <a class="btn" @click.stop="removeLastPoint" :class="{ disabled: newPolyline.coords.length === 0 }">
          <p>删除最后一点</p>
        </a>
      </div>

      <div v-if="newPolyline.coords.length > 0" class="pointsCard">
        <h2 class="name">已选择的点</h2>
        <div class="pointList">
          <div v-for="(coord, index) in newPolyline.coords" :key="index" class="pointItem">
            <span class="pointIndex">点 {{ index + 1 }}</span>
            <span class="pointCoord">{{ coord[0].toFixed(6) }}, {{ coord[1].toFixed(6) }}</span>
            <a class="deleteBtn" @click.stop="removePoint(index)">删除</a>
          </div>
        </div>
      </div>
    </div>

    <div class="saveCard">
      <a class="btn" @click.stop="save" :class="{ disabled: !canSave }">
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
const emit = defineEmits(["update:show", "polylineAdded", "addPoint", "updatePoints"]);

const props = defineProps(["show", "allTownSelect", "clickPosition"]);

const selectSlide = ref(false);

const handleBodyClick = () => {
  selectSlide.value = false;
};

onMounted(() => {
  document.body.addEventListener("click", handleBodyClick);
});

onBeforeUnmount(() => {
  document.body.removeEventListener("click", handleBodyClick);
});

const newPolyline = reactive({
  diameter: 100,
  coords: [], // [[lng, lat], ...]
});

// 监听点击位置变化，添加点到管线
watch(
  () => [props.clickPosition, props.show],
  ([newPos, isShow]) => {
    // 只有当弹窗打开且有新位置时才添加点
    if (!isShow || !newPos) {
      return;
    }

    let coord;
    if (Array.isArray(newPos)) {
      coord = [...newPos];
    } else if (newPos.lng !== undefined && newPos.lat !== undefined) {
      coord = [newPos.lng, newPos.lat];
    } else if (typeof newPos.getLng === "function") {
      coord = [newPos.getLng(), newPos.getLat()];
    } else {
      return;
    }

    // 检查是否已存在相同的点（避免重复点击，使用较小的阈值）
    const exists = newPolyline.coords.some((c) => {
      const dx = Math.abs(c[0] - coord[0]);
      const dy = Math.abs(c[1] - coord[1]);
      return dx < 0.00001 && dy < 0.00001; // 约1米范围内的点视为相同
    });

    if (!exists) {
      newPolyline.coords.push(coord);
      emit("addPoint", coord);
      // 通知父组件更新所有点
      emit("updatePoints", [...newPolyline.coords]);
    }
  },
  { deep: true }
);

// 监听弹窗关闭，清空已选择的点（可选，根据需求决定）
watch(
  () => props.show,
  (isShow) => {
    if (!isShow) {
      // 关闭时清空已选择的点（如果需要保留已选择的点，可以注释掉这部分）
      // newPolyline.coords = [];
    }
  }
);

const canSave = computed(() => {
  return newPolyline.coords.length >= 2 && newPolyline.diameter > 0;
});

function setDiameter(diameter) {
  newPolyline.diameter = diameter;
  selectSlide.value = false;
}

function clearPoints() {
  newPolyline.coords = [];
  emit("updatePoints", []);
  ElMessage.info("已清除所有点");
}

function removeLastPoint() {
  if (newPolyline.coords.length > 0) {
    newPolyline.coords.pop();
    emit("updatePoints", [...newPolyline.coords]);
    ElMessage.info("已删除最后一个点");
  }
}

function removePoint(index) {
  if (index >= 0 && index < newPolyline.coords.length) {
    newPolyline.coords.splice(index, 1);
    emit("updatePoints", [...newPolyline.coords]);
    ElMessage.info("已删除该点");
  }
}

async function save() {
  if (!canSave.value) {
    if (newPolyline.coords.length < 2) {
      ElMessage.warning("至少需要选择2个点才能创建管线");
      return;
    }
    if (!newPolyline.diameter || newPolyline.diameter <= 0) {
      ElMessage.warning("请输入有效的管径值");
      return;
    }
    return;
  }

  if (!props.allTownSelect) {
    ElMessage.warning("请选择所属区域");
    return;
  }

  try {
    // 构建 GeoJSON Feature 格式的数据（包含 commitType 和 features 数组）
    const geoJsonData = {
      commitType: "提交",
      features: [
        {
          type: "Feature",
          properties: {
            point_type: 1, // 管线类型，固定为1
            pipe_diameter: newPolyline.diameter,
            type: 1,
            pre: 1,
            ph: 1,
            cl2: 1,
            city_town: props.allTownSelect,
          },
          geometry: {
            type: "LineString",
            coordinates: newPolyline.coords, // [[lng, lat], [lng, lat], ...]
          },
        },
      ],
    };

    // 调用添加管线API
    const { code, msg } = await proxy.ajax.post("/DBAllDataPostWeb", geoJsonData, true);

    if (code === 200) {
      ElMessage.success("管线添加成功！");
      emit("polylineAdded", geoJsonData);
      // 重置表单
      newPolyline.diameter = 100;
      newPolyline.coords = [];
    } else {
      ElMessage.error(msg || "添加失败");
    }
  } catch (error) {
    console.error("添加管线失败:", error);
    ElMessage.error("添加失败，请重试");
  }
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

.hint {
  font-size: 20px;
  color: #999;
  margin-bottom: 20px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 6px;
}

.infoCard {
  margin-bottom: 20px;
  padding: 15px;
  background: #ecf8f2;
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

.itemCard {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  .name {
    font-size: 20px;
    color: #585657;
    line-height: 32px;
    height: 32px;
    margin-bottom: 10px;
  }
  .input {
    width: 100%;
    height: 40px;
    padding: 0 12px;
    border: 1px solid #eaeaea;
    border-radius: 6px;
    font-size: 20px;
    color: #585657;
    box-sizing: border-box;
    &:focus {
      outline: none;
      border-color: #46b97e;
    }
    &::placeholder {
      color: #a0a0a0;
    }
  }
}

.selectCard {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  height: 40px;
  flex: 0;
  border: 1px solid #eaeaea;
  width: 100%;
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
      font-size: 20px;
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
        font-size: 20px;
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

.actionsCard {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  .btn {
    flex: 1;
    height: 36px;
    background: #fff;
    border: 1px solid #eaeaea;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    &:not(.disabled):hover {
      background: #46b97e;
      border-color: #46b97e;
      p {
        color: #fff;
      }
    }
    p {
      font-size: 20px;
      color: #585657;
      transition: all 0.2s;
    }
  }
}

.pointsCard {
  margin-top: 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; // 确保可以收缩
  overflow: hidden; // 防止溢出

  .name {
    flex-shrink: 0; // 标题不收缩
    margin-bottom: 10px;
    line-height: 32px;
    height: 32px;
    font-size: 20px;
    color: #585657;
  }
}

.pointList {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #eaeaea;
  border-radius: 6px;
  padding: 10px;
  min-height: 0; // 确保可以收缩
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #b5e3cb;
    border-radius: 3px;
  }
}

.pointItem {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px dashed #e0e0e0;
  &:last-child {
    border-bottom: none;
  }
  .pointIndex {
    font-size: 20px;
    color: #46b97e;
    font-weight: bold;
    min-width: 50px;
    margin-right: 10px;
  }
  .pointCoord {
    flex: 1;
    font-size: 20px;
    color: #666;
    word-break: break-all;
  }
  .deleteBtn {
    font-size: 20px;
    color: #f33225;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s;
    &:hover {
      background: #fee;
      color: #d00;
    }
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
    &.disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    &:not(.disabled):hover {
      background: #3da069;
    }
    img {
      width: 20px;
      height: 20px;
      margin-right: 8px;
    }
    p {
      font-size: 20px;
      color: #fff;
    }
  }
}
</style>
