<template>
  <div class="delete-dialog" v-if="delete_dialogFormVisible">
    <div class="delete-dialog-content">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yonghu/icon4.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 18px">删除</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="handleDeleteClose">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="delete-content">
        <el-icon style="margin-right: 10px; margin-top: 35px; font-size: 40px; color: #f33125" align-self="center"><WarningFilled /></el-icon>
        <span style="margin-top: 5px">删除后不可恢复，确认删除数据吗？</span>
      </div>
      <div class="btn">
        <div class="confirm-btn" @click="handleDeleteCommit">
          <el-icon style="margin-left: 15%"><Check /></el-icon>
          <span style="font-size: 16px; margin-left: 15%">确认</span>
        </div>
        <div class="cancel-btn" @click="handleDeleteClose">
          <el-icon style="margin-left: 15%; color: #45ba7e"><Close /></el-icon>
          <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">取消</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import service from "@/api/request";
import { ElMessage } from "element-plus";

export default {
  props: {
    delete_dialogFormVisible: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  mounted() {
    console.log(this.data);
  },
  methods: {
    handleDeleteClose() {
      this.$emit("close");
    },
    handleDeleteCommit() {
      let userIds = [];
      this.data.forEach((item) => {
        userIds.push(item.userId);
      });
      service
        .delete(`/userManage/userCharge/deleteUsers?userIds=${userIds}`)
        .then((response) => {
          if (response.code === 200) {
            ElMessage.success("删除成功");
            this.handleDeleteClose();
          } else if (response.code === -1) {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error("删除失败");
        });
    },
  },
};
</script>

<style>
.delete-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 199;
  background-color: rgb(31 33 38 / 15%);
}

.delete-dialog-content {
  width: 35%;
  height: 300px;
  border: 1px solid #fafafa;
  background-color: #fafafa;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%);
  margin-top: -150px;
  display: flex;
  flex-direction: column;
  align-items: center;
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

.delete-content {
  width: 94%;
  background-color: #fff;
  border-radius: 5px;
  margin-top: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.delete-content {
  height: 150px;
}

.btn {
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 15px;
}

.confirm-btn,
.cancel-btn {
  height: 35px;
  width: 90px;
  cursor: pointer;
  border: 1px solid #f2f2f2;
  border-radius: 5px;
  display: flex;
  align-items: center;
}

.confirm-btn {
  background-color: #45ba7e;
  margin-right: 15px;
  color: #fff;
}

.cancel-btn {
  background-color: #fff;
  margin-right: 5%;
}
</style>
