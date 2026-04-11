<template>
  <div class="transaction-record-dialog" v-if="transaction_dialogFormVisible">
    <div class="transaction-record-dialog-content">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yonghu/icon11.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 20px">{{ title }}</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="handleTransactionRecordClose">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>

      <chargeRecordItemVue  v-if="isShow" :data="data" @changeTye="changeTye"></chargeRecordItemVue>

      <transactionRecordVue v-else :data="data" @changeTye="changeTye"></transactionRecordVue>
    </div>
  </div>
</template>

<script>
import service from "@/api/request";
import { ElMessage } from "element-plus";
import axios from "axios";
import chargeRecordItemVue from "./transactionRecord/chargeRecordItem.vue";
import transactionRecordVue from "./transactionRecord/transactionRecord.vue";
export default {
  components: {
    chargeRecordItemVue,
    transactionRecordVue,
  },
  props: {
    transaction_dialogFormVisible: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      title: "历史扣费记录",
      isShow: true, //两个的显示与否
    };
  },
  mounted() {},
  methods: {
    handleTransactionRecordClose() {
      this.$emit("close");
    },
    changeTye() {
      this.isShow = !this.isShow; // title在改变
      if (this.isShow) {
        this.title = "历史扣费记录";
      } else {
        this.title = "历史交易记录";
      }
    },
  },
};
</script>

<style>
.transaction-record-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 199;
  background-color: rgb(31 33 38 / 15%);
}

.transaction-record-dialog-content {
  width: 80%;
  border: 1px solid #fafafa;
  background-color: #fafafa;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.transaction-record-content {
  width: 100%;
  min-height: 42vh;
  background: none;
  margin-top: 0px;
  margin-bottom: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-wrap: nowrap;
  padding: 1%;
  overflow-y: auto;
}

.serach-box {
  margin-top: 15px;
  margin-bottom: 20px;
  height: 100px;
  display: flex;
  align-items: center;
}

.search-input {
  display: flex;
  justify-content: flex-end;
  justify-content: center;
  /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 12%;
  height: 100%;
  margin-right: 20px;
}

.search-input > span {
  font-size: 20px;
  margin-bottom: 5px;
}

.time-input {
  display: flex;
  width: 100%;
}

.time-input > * {
  width: 50%;
  margin-right: 20px;
}

.transaction-record-content > .serach-box {
  background-color: #fff;
  border-radius: 5px;
  width: 96%;
  height: 100px;
  margin-top: 5px;
  margin-bottom: 5px;
  padding: 0 10px;
}

.transaction-record-content > .transaction-list {
  width: 96%;
  /* height: 100%; */
  background-color: #fff;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
  padding: 0 10px;
  margin-bottom: 50px;
}

.command-buttons {
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  margin-top: 10px;
  margin-bottom: 5px;
}

.export-in-btn,
.export-out-btn {
  display: flex;
  align-items: center;
  width: 80px;
  /* 设置按钮的宽度 */
  height: 32px;
  /* 设置按钮的高度 */
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 20px;
  background-color: #fff;
  border: 2px solid #f2f2f2;
}

.reflush {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  /* 设置按钮的宽度 */
  height: 32px;
  /* 设置按钮的高度 */
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 20px;
  background-color: #fff;
  border: 2px solid #f2f2f2;
}

.transaction-table {
  width: 100%;
  height: 40vh;
  margin-top: 5px;
  overflow-y: auto;
}

.title {
  width: 100%;
  background-color: #fff;
  border-radius: 5px 5px 0 0;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  height: 45px;
  line-height: 45px;
  text-align: center;
  display: flex;
  justify-content: space-between;
}

.page-box {
  width: 100%;
  height: 65px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: 0;
}
</style>
