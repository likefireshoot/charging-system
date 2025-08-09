<template>
  <div class="yuangong-container">
    <div class="search-box">
      <div class="search-content">
        <div class="search-input" style="margin-left: 10px">
          <span>角色编号</span>
          <el-input v-model="params.roleId" placeholder="请输入..." />
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>角色名称</span>
          <el-input v-model="params.roleName" placeholder="请输入..." />
        </div>
      </div>
      <div class="buttons">
        <div class="sercah-btn" @click="search">
          <img src="@/assets/yonghu/icon16.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 16px; margin-left: 15%">搜索</span>
        </div>
        <div class="clear-btn" @click="clear">
          <img src="@/assets/yuangong/icon4.png" alt="" style="margin-left: 10px" />
          <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">清空</span>
        </div>
      </div>
    </div>
    <div class="yuangong-info">
      <div class="command-box">
        <div class="add-btn" style="margin-left: 10px" @click="add_dialogFormVisible = true" v-if="staffPermissionIds.includes(36)">
          <img src="@/assets/yuangong/icon6.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">新增</span>
        </div>
        <div class="delete-btn" style="margin-left: 10px" @click="delete_click" v-if="staffPermissionIds.includes(37)">
          <img src="@/assets/yuangong/icon4.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">删除</span>
        </div>
        <div class="edit-btn" style="margin-left: 10px" @click="edit_click" v-if="staffPermissionIds.includes(38)">
          <img src="@/assets/yuangong/icon3.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">编辑</span>
        </div>
        <!-- <div class="export-in-btn" style="margin-left: 10px; width: 110px">
          <img src="@/assets/yuangong/icon1.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">模板下载</span>
          <input ref="fileInput" type="file" accept=".xls,.xlsx" style="display: none" />
        </div>
        <div class="export-in-btn" style="margin-left: 10px">
          <img src="@/assets/yuangong/icon1.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">导入</span>
          <input ref="fileInput" type="file" accept=".xls,.xlsx" style="display: none" />
        </div> -->
        <div class="export-out-btn" style="margin-left: 10px" @click="exportExcel">
          <img src="@/assets/yuangong/icon2.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">导出</span>
        </div>
        <div class="reflush" style="margin-left: 10px" @click="reflush">
          <img src="@/assets/yonghu/icon15.png" alt="" />
        </div>
      </div>
      <div class="yuangong-table">
        <el-table
          ref="multipleTableRef"
          :data="roleData"
          row-key="roleId"
          style="width: auto; height: 100%; table-layout: fixed; overflow-x: auto; overflow-y: auto"
          border
          :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
          @selection-change="handleSelectionChange"
          id="yuangong-table"
        >
          <el-table-column type="selection" :selectable="selectable" :width="selectionWidth" align="center" />
          <el-table-column label="序号" :width="indexWidth" align="center" fixed="left" #default="scope">
            {{ scope.$index + 1 + (params.pageNo - 1) * params.pageSize }}
          </el-table-column>
          <el-table-column property="roleId" label="角色编号" :width="roleIdWidth" align="center" />
          <el-table-column property="roleName" label="角色名称" :width="roleNameWidth" align="center" />
          <el-table-column property="permissionContent" label="权限内容" :width="permissionsWidth" align="center" />
        </el-table>
      </div>
      <div class="page-box">
        <div class="demo-pagination-block">
          <el-pagination v-model:current-page="params.pageNo" v-model:page-size="params.pageSize" :page-sizes="[5, 10, 15]" layout="total,  prev, pager, next, jumper" :total="total" />
        </div>
      </div>
    </div>
    <!-- 新增按钮弹出框 -->
    <div class="add-role-dialog" v-if="add_dialogFormVisible">
      <div class="add-role-dialog-content">
        <div class="title">
          <div style="margin-left: 10px; display: flex; align-items: center">
            <img src="@/assets/yuangong/icon6.png" alt="" style="margin-right: 10px" />
            <span style="font-size: 18px">新增</span>
          </div>
          <div style="margin-right: 10px; cursor: pointer" @click="add_dialogFormVisible = false">
            <img src="@/assets/close.png" alt="" />
          </div>
        </div>
        <div class="add-role-content">
          <div class="edit-input" style="width: 30%">
            <span>角色名称</span>
            <el-input v-model="addData.roleName" />
          </div>
          <div class="edit-input" style="width: 50%; margin-right: 0">
            <span>权限内容</span>
            <el-select v-model="addData.permissionList" multiple clearable collapse-tags placeholder="请选择权限内容" popper-class="custom-header" :max-collapse-tags="1">
              <template #header>
                <el-checkbox class="user-checkbox" v-model="checkAll" :indeterminate="indeterminate" @change="handleCheckAll"> 全选 </el-checkbox>
              </template>
              <el-option v-for="item in permissionList" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </div>
        </div>
        <div class="btn">
          <div class="confirm-btn" @click="addConfirm">
            <el-icon style="margin-left: 15%"><Check /></el-icon>
            <span style="font-size: 16px; margin-left: 15%">确认</span>
          </div>
          <div class="cancel-btn" @click="add_cancel">
            <el-icon style="margin-left: 15%; color: #45ba7e"><Close /></el-icon>
            <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">取消</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 删除按钮弹出框 -->
    <div class="delete-dialog" v-if="delete_dialogFormVisible">
      <div class="delete-dialog-content">
        <div class="title">
          <div style="margin-left: 10px; display: flex; align-items: center">
            <img src="@/assets/yuangong/icon4.png" alt="" style="margin-right: 10px" />
            <span style="font-size: 18px">删除</span>
          </div>
          <div style="margin-right: 10px; cursor: pointer" @click="delete_dialogFormVisible = false">
            <img src="@/assets/close.png" alt="" />
          </div>
        </div>
        <div class="delete-content">
          <el-icon style="margin-right: 10px; margin-top: 35px; font-size: 40px; color: #f33125" align-self="center"><WarningFilled /></el-icon>
          <span style="margin-top: 5px">删除后不可恢复，确认删除数据吗？</span>
        </div>
        <div class="btn">
          <div class="confirm-btn" @click="deleteConfirm">
            <el-icon style="margin-left: 15%"><Check /></el-icon>
            <span style="font-size: 16px; margin-left: 15%">确认</span>
          </div>
          <div class="cancel-btn" @click="delete_dialogFormVisible = false">
            <el-icon style="margin-left: 15%; color: #45ba7e"><Close /></el-icon>
            <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">取消</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 编辑按钮弹出框 -->
    <div class="add-dialog" v-if="edit_dialogFormVisible">
      <div class="add-role-dialog-content">
        <div class="title">
          <div style="margin-left: 10px; display: flex; align-items: center">
            <img src="@/assets/yuangong/icon3.png" alt="" style="margin-right: 10px" />
            <span style="font-size: 18px">编辑</span>
          </div>
          <div style="margin-right: 10px; cursor: pointer" @click="edit_dialogFormVisible = false">
            <img src="@/assets/close.png" alt="" />
          </div>
        </div>
        <div class="add-role-content">
          <div class="edit-input" style="width: 30%">
            <span>角色名称</span>
            <el-input v-model="editData.roleName" />
          </div>
          <div class="edit-input" style="width: 50%; margin-right: 0">
            <span>权限内容</span>
            <el-select v-model="editData.permissionList" multiple clearable collapse-tags placeholder="请选择权限内容" popper-class="custom-header" :max-collapse-tags="1">
              <template #header>
                <el-checkbox class="user-checkbox" v-model="editCheckAll" :indeterminate="editIndeterminate" @change="handleEditCheckAll"> 全选 </el-checkbox>
              </template>
              <el-option v-for="item in permissionList" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </div>
        </div>
        <div class="btn">
          <div class="confirm-btn" @click="editConfirm">
            <el-icon style="margin-left: 15%"><Check /></el-icon>
            <span style="font-size: 16px; margin-left: 15%">确认</span>
          </div>
          <div class="cancel-btn" @click="edit_dialogFormVisible = false">
            <el-icon style="margin-left: 15%; color: #45ba7e"><Close /></el-icon>
            <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">取消</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import service from "@/api/request";
import { ElMessage } from "element-plus";
import axios from "axios";
export default {
  data() {
    return {
      params: {
        roleId: null,
        roleName: null,
        pageNo: 1,
        pageSize: 50,
      },
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId, // 所属水厂ID
      staffPermissionIds: JSON.parse(sessionStorage.getItem("userData")).staffPermissionIds,
      addCompanyName: null, // 新增水厂名称
      addRegion: {
        companyId: null,
        regionName: null,
      },
      companyList: [],
      roleData: [],
      multipleSelection: [],
      addData: {
        roleName: null,
        permissionList: [],
      },
      editData: {
        roleId: null,
        roleName: null,
        permissionList: [],
      },
      checkAll: false,
      indeterminate: false,
      editCheckAll: false,
      editIndeterminate: false,
      permissionList: [],

      total: null,

      // 每列实际宽度
      selectionWidth: 0,
      indexWidth: 0,
      roleIdWidth: 0,
      roleNameWidth: 0,
      permissionsWidth: 0,
      companyWidth: 0,
      // 父容器元素
      parentContainer: null,
      // ResizeObserver 实例
      resizeObserver: null,

      //弹出框显示与否
      delete_dialogFormVisible: false,
      add_dialogFormVisible: false,
      edit_dialogFormVisible: false,

      //表格勾选行
      selection: [],
      userData: {
        id: null,
        username: null,
      },
    };
  },
  watch: {
    "params.pageNo": {
      handler() {
        this.getRoleData();
      },
    },
    "addData.permissionList": {
      handler(val) {
        if (val.length === 0) {
          this.checkAll = false;
          this.indeterminate = false;
        } else if (val.length === this.permissionList.length) {
          this.checkAll = true;
          this.indeterminate = false;
        } else {
          this.indeterminate = true;
        }
      },
    },
    "editData.permissionList": {
      handler(val) {
        if (val.length === 0) {
          this.editCheckAll = false;
          this.editIndeterminate = false;
        } else if (val.length === this.permissionList.length) {
          this.editCheckAll = true;
          this.editIndeterminate = false;
        } else {
          this.editIndeterminate = true;
        }
      },
    },
  },
  computed: {
    // 每列的百分比宽度
    columnPercentages() {
      return {
        selection: 5,
        index: 9,
        roleId: 11,
        roleName: 11,
        permissions: 62,
      };
    },
  },
  mounted() {
    // 获取父容器元素
    this.parentContainer = document.querySelector(".yuangong-table");
    // 初始化列宽
    this.calculateColumnWidths();

    // 创建 ResizeObserver 实例并监听父容器宽度变化
    this.resizeObserver = new ResizeObserver(this.calculateColumnWidths);
    if (this.parentContainer) {
      this.resizeObserver.observe(this.parentContainer);
    }
    this.userData = sessionStorage.getItem("userData");
    console.log(this.userData);
    this.getRoleData();
    this.getRoleList();
  },
  beforeUnmount() {
    // 组件卸载时取消监听
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
  methods: {
    selectable() {
      return true; // 目前允许所有行选择，你可以加上你的业务逻辑
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handleCheckAll(val) {
      this.indeterminate = false;
      if (val) {
        this.addData.permissionList = this.permissionList.map((_) => _.id);
      } else {
        this.addData.permissionList = [];
      }
    },
    handleEditCheckAll(val) {
      this.editIndeterminate = false;
      if (val) {
        this.editData.permissionList = this.permissionList.map((_) => _.id);
      } else {
        this.editData.permissionList = [];
      }
    },
    // 计算列宽的函数
    calculateColumnWidths() {
      if (this.parentContainer) {
        const parentWidth = this.parentContainer.offsetWidth;
        this.selectionWidth = (this.columnPercentages.selection / 100) * parentWidth;
        this.indexWidth = (this.columnPercentages.index / 100) * parentWidth;
        this.roleIdWidth = (this.columnPercentages.roleId / 100) * parentWidth;
        this.roleNameWidth = (this.columnPercentages.roleName / 100) * parentWidth;
        this.permissionsWidth = (this.columnPercentages.permissions / 100) * parentWidth;
      }
    },
    delete_click() {
      if (this.multipleSelection.length > 0) {
        this.delete_dialogFormVisible = true;
      } else {
        ElMessage.error("请选择需要删除的数据");
      }
    },
    edit_click() {
      if (this.multipleSelection.length > 0) {
        console.log(this.multipleSelection[0]);
        this.edit_dialogFormVisible = true;
        this.editData.roleId = this.multipleSelection[0].roleId;
        this.editData.roleName = this.multipleSelection[0].roleName;
        this.editData.permissionList = this.multipleSelection[0].permissionIds;
        console.log(this.editData);
      } else {
        ElMessage.error("请选择需要编辑的员工数据");
      }
    },
    getCompanyList() {
      service
        .get("/getAllCompany")
        .then((response) => {
          if (response.code === 200) {
            this.companyList = response.data.map((item) => {
              return {
                id: item.companyId,
                name: item.companyName,
              };
            });
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    getRoleList() {
      service
        .get("/role/permissions")
        .then((res) => {
          if (res.code === 200) {
            this.permissionList = res.data.map((item) => ({
              id: item.permissionId,
              label: item.permissionName,
            }));
          }
        })
        .catch((err) => {
          ElMessage.error(err);
        });
    },
    getRoleData() {
      const filteredParams = Object.fromEntries(Object.entries(this.params).filter(([_, value]) => value !== null && value !== ""));
      service
        .post("/role/list", filteredParams)
        .then((res) => {
          if (res.code === 200) {
            const list = Array.isArray(res.data?.list) ? res.data.list : [];
            this.roleData = list.map((role, idx) => {
              try {
                const originalPermissionContent = role.permissions?.map((p) => p.permissionName).join("、") || "";
                const permissionIds = role.permissions?.map((p) => p.permissionId) || [];
                console.log(originalPermissionContent);
                console.log(permissionIds);

                return {
                  ...role,
                  permissionContent: "首页、用户管理、报表统计、通知管理、通知管理-短信记录、" + originalPermissionContent,
                  permissionIds,
                };
              } catch (e) {
                console.error("第", idx, "条数据出错:", role, e);
                throw e; // 继续往外抛，让外层 catch 触发
              }
            });
            console.log("123");
            this.total = res.data.total;
            console.log("123");
            this.params.pageNo = res.data.currentPages;
          }
        })
        .catch((err) => {
          ElMessage.error("1");
        });
    },
    search() {
      this.getRoleData();
    },
    clear() {
      this.params.roleId = null;
      this.params.roleName = null;
    },
    reflush() {
      this.clear();
      let params = {
        pageNo: 1,
        pageSize: 50,
      };
      service
        .post("/role/list", params)
        .then((res) => {
          if (res.code === 200) {
            // 从返回结果里取 list，没拿到就兜底空数组
            const list = Array.isArray(res.data?.list) ? res.data.list : [];
            this.roleData = list.map((role) => {
              const originalPermissionContent = role.permissions?.map((p) => p.permissionName).join("、") || "";
              return {
                ...role,
                permissionContent: "首页、用户管理、报表统计、通知管理、通知管理-短信记录、" + originalPermissionContent,
                permissionIds: role.permissions?.map((p) => p.permissionId) || [],
              };
            });
            this.total = res.data.total;
            this.params.pageNo = 1;
          }
        })
        .catch((err) => {
          ElMessage.error(err);
        });
    },
    addConfirm() {
      if (this.addData.roleName == null || this.addData.roleName == "") {
        ElMessage.error("角色名称不能为空！");
        return;
      }
      if (this.addData.permissionList.length == 0) {
        ElMessage.error("权限内容不能为空！");
        return;
      }
      let params = {
        roleName: this.addData.roleName,
        permissionIds: this.addData.permissionList,
      };
      service
        .post("/role/add", params)
        .then((res) => {
          if (res.code == 200) {
            ElMessage.success("添加成功");
            this.add_dialogFormVisible = false;
            this.add_cancel();
            this.getRoleData();
          }
        })
        .catch((err) => {
          ElMessage.error(err);
        });
    },
    add_cancel() {
      this.add_dialogFormVisible = false;
      this.addData = {
        roleName: null,
        permissionList: [],
      };
    },
    editConfirm() {
      const validations = [
        {
          condition: this.editData.roleName === null || this.editData.roleName === "",
          message: "角色名称不能为空！",
        },

        {
          condition: this.editData.permissionList.length === 0,
          message: "权限内容不能为空！",
        },
      ];
      for (const validation of validations) {
        if (validation.condition) {
          ElMessage.error(validation.message);
          return;
        }
      }
      console.log(this.editData);
      let params = {
        roleId: this.editData.roleId,
        roleName: this.editData.roleName,
        permissionIds: this.editData.permissionList,
      };

      service
        .post("/role/edit", params)
        .then((res) => {
          if (res.code === 200) {
            ElMessage.success("编辑成功");
            this.edit_dialogFormVisible = false;
            this.getRoleData();
          }
        })
        .catch((err) => {
          ElMessage.error(err);
        });
    },
    deleteConfirm() {
      const roleIds = [];
      this.multipleSelection.forEach((item) => {
        roleIds.push(item.roleId);
      });
      if (roleIds.includes(7) || roleIds.includes(8)) {
        ElMessage.warning("超级管理员和普通员工不能被删除！");
        this.multipleSelection = [];
        this.reflush();
        this.delete_dialogFormVisible = false;
        return;
      }
      service
        .delete(`/role/delete?roleIds=${roleIds}`)
        .then((response) => {
          if (response.code === 200) {
            ElMessage.success("删除成功");
            this.delete_dialogFormVisible = false;
            this.multipleSelection = [];
            this.reflush();
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },
    exportExcel() {
      let url = "";
      let params = {};

      if (this.companyId === 1) {
        if (this.params.company) {
          params.companyId = this.params.company; // 所属水厂ID
          url = `/staff/exportStaff?companyId=${params.companyId}`; // 后端接口地址
        } else {
          url = `/staff/exportStaff?`; // 后端接口地址
        }
      } else {
        params.companyId = this.companyId; // 所属水厂ID
        url = `/staff/exportStaff?companyId=${params.companyId}`;
      }
      // 调用后端接口
      axios({
        url: url, // 后端接口地址
        method: "GET",
        responseType: "blob", // 指定响应类型为二进制流
      })
        .then((response) => {
          if (response.status !== 200) {
            throw new Error("导出失败: " + response.statusText);
          }

          // 获取 Blob 对象
          const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

          if (blob.size === 0) {
            ElMessage.warning("内容为空，无法下载");
            return;
          }

          // 创建一个链接元素
          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob); // 创建 Blob URL
          link.download = "员工数据列表.xlsx"; // 设置下载文件名
          document.body.appendChild(link);
          link.click(); // 触发下载
          document.body.removeChild(link); // 移除链接元素
          window.URL.revokeObjectURL(link.href); // 释放 Blob URL
        })
        .catch((error) => {
          console.error("导出失败:", error);
          ElMessage.error("导出失败: " + error.message);
        });
    },
  },
};
</script>

<style scoped>
:deep(.el-table__body tr:nth-child(odd)) {
  background-color: #edf8f2;
}

:deep(.el-table__body tr:nth-child(even)) {
  background-color: #ffffff;
}

:deep(.el-table__body tr:hover > td) {
  background-color: #fbf2cb !important;
}

/* 修改勾选框选中时的背景颜色和边框颜色 */
:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #45bb81;
  border-color: #45bb81;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner::after) {
  border-color: #fff;
}

:deep(.el-input) {
  --el-color-primary: #46b97e;
}

:deep(.el-select .el-select__wrapper) {
  height: 35px;
}

:deep(.el-select) {
  --el-color-primary: #46b97e;
}

:deep(.el-pagination) {
  --el-color-primary: #46b97e;
}

:deep(.el-tree) {
  --el-fill-color-light: #46b97e;
  --el-fill-color-blank: #e8f3ed;
  --el-text-color-primary: #fff;
}

:deep(.el-tree-node__content) {
  height: 40px;
  line-height: 40px;
  border-radius: 5px;
  margin: 0 10px;
}

/* 设置鼠标滑过选项时的字体颜色 */
:deep(.el-tree-node__content:hover) {
  color: #fff;
}

.yuangong-container {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  width: 100%;
  height: 98%;
  padding: 0px 20px;
}

.search-box {
  margin-top: 15px;
  margin-bottom: 20px;
  width: 100%;
  height: 112px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  background-color: #fff;
}

.search-content {
  display: flex;
  width: 75%;
  height: 100%;
}

.search-input {
  display: flex;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 25%;
  height: 100%;
  margin-right: 20px;
}

.search-input > span {
  font-size: 14px;
  margin-bottom: 5px;
}

.time-input {
  display: flex;
}

.time-input > span {
  font-size: 14px;
  margin-bottom: 5px;
  align-self: center;
  margin-left: 5px;
  margin-right: 5px;
}

.buttons {
  display: flex;
  width: 240px;
  height: 100%;
  align-items: center;
  margin-left: 100px;
}

.buttons > * {
  width: 120px;
}

.sercah-btn,
.clear-btn {
  display: flex;
  align-items: center;
  height: 32px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  color: #fff;
}

.sercah-btn {
  background-color: #45ba7e;
  margin-right: 50px;
}
.clear-btn {
  background-color: #fff;
  border: 2px solid #f2f2f2;
  margin-right: 10px;
}

.yuangong-info {
  width: 100%;
  height: calc(100% - 150px);
  margin-bottom: 0px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  background-color: #fff;
  position: relative;
}

.command-box {
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  margin-top: 15px;
  margin-bottom: 10px;
}

.command-box > * {
  margin-right: 20px;
}

.add-btn,
.delete-btn,
.edit-btn,
.export-in-btn,
.export-out-btn {
  display: flex;
  align-items: center;
  width: 80px; /* 设置按钮的宽度 */
  height: 32px; /* 设置按钮的高度 */
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  background-color: #fff;
  border: 2px solid #f2f2f2;
}

.reflush {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px; /* 设置按钮的宽度 */
  height: 32px; /* 设置按钮的高度 */
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  background-color: #fff;
  border: 2px solid #f2f2f2;
}

.yuangong-table,
.page-box {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.yuangong-table {
  height: calc(98% - 110px);
}

.page-box {
  height: 65px;
  position: absolute;
  bottom: 0;
}

/* 删除弹出框 */
.add-role-dialog,
.delete-dialog,
.edit-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 199;
  background-color: rgb(31 33 38 / 15%);
}

.add-role-dialog-content,
.delete-dialog-content,
.edit-dialog-content-1 {
  width: 50%;
  border: 1px solid #fafafa;
  background-color: #fafafa;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.add-role-dialog-content {
  width: 60%;
  height: 250px;
  margin-top: -210px;
}
.delete-dialog-content {
  width: 35%;
  height: 300px;
  margin-top: -150px;
}

.edit-dialog-content-1 {
  height: 420px;
  width: 60%;
  margin-top: -210px;
}

.title {
  width: 100%;
  background-color: #fff;
  border-radius: 5px 5px 0 0;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  height: 45px;
  line-height: 40px;
  text-align: center;
  display: flex;
  justify-content: space-between;
}

.delete-content,
.edit-content-1,
.add-role-content {
  width: 94%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
}

.add-role-content {
  height: 100px;
  background-color: #fff;
  border-radius: 5px;
  margin-top: 15px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 2%;
}

.delete-content {
  height: 150px;
  background-color: #fff;
  border-radius: 5px;
  margin-top: 25px;
}

.edit-content-1 {
  width: 90%;
  height: 250px;
  background-color: #fff;
  border-radius: 5px;
  margin-top: 15px;
  margin-bottom: 5px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
  padding: 1%;
}

.edit-input {
  display: flex;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 31%;
  height: 80px;
  margin-right: 3.5%;
}

.edit-input > span {
  font-size: 16px;
  margin-bottom: 5px;
}

.edit-input > .el-input {
  height: 35px;
  width: 100%;
}

.add-content {
  border: 1px solid #fff;
  background-color: #fff;
  border-radius: 5px;
  width: 90%;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: 20px;
  padding: 0 3%;
}

.add-input {
  display: flex;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 45%;
  height: 100%;
}

.add-input > span {
  font-size: 15px;
  margin-bottom: 5px;
  color: #575556;
}

.add-input > .el-input {
  height: 35px;
  width: 100%;
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
