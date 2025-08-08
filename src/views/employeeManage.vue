<template>
  <div class="yuangong-container">
    <div class="search-box">
      <div class="search-content">
        <div class="search-input" style="margin-left: 10px" v-if="companyId === 1">
          <span>所属水厂</span>
          <el-select v-model="params.company" placeholder="请选择所属水厂">
            <el-option v-for="item in companyList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>账户</span>
          <el-input v-model="params.account" placeholder="请输入..." />
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>员工名称</span>
          <el-input v-model="params.staffName" placeholder="请输入..." />
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>职位</span>
          <el-select v-model="params.staffPostsId">
            <el-option v-for="item in postsList" :key="item.id" :label="item.name" :value="item.value"></el-option>
          </el-select>
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>角色</span>
          <el-select v-model="params.staffCharacterId">
            <el-option v-for="item in rolesList" :key="item.id" :label="item.name" :value="item.value"></el-option>
          </el-select>
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
        <div class="add-btn" style="width: 110px; margin-left: 10px" @click="add_dialogFormVisible = true" v-if="companyId === 1">
          <img src="@/assets/yuangong/icon6.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">新增水厂</span>
        </div>
        <div class="delete-btn" style="margin-left: 10px" @click="delete_click">
          <img src="@/assets/yuangong/icon4.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">删除</span>
        </div>
        <div class="edit-btn" style="margin-left: 10px" @click="edit_click">
          <img src="@/assets/yuangong/icon3.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">编辑</span>
        </div>
        <!-- <div class="export-in-btn" style="margin-left: 10px">
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
          :data="employeeData"
          row-key="staffId"
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
          <el-table-column property="account" label="账户" :width="accountWidth" align="center" />
          <el-table-column property="staffName" label="姓名" :width="workerNameWidth" align="center" />
          <el-table-column property="staffAddr" label="员工住址" :width="addressWidth" align="center" />
          <el-table-column property="staffPhone" label="手机号" :width="phoneWidth" align="center" />
          <el-table-column property="companyName" label="所属水厂" :width="companyWidth" align="center" />
          <el-table-column property="staffPostsId" label="职位" :width="postWidth" align="center" />
          <el-table-column property="staffCharacterId" label="角色" :width="roleWidth" align="center" />
          <!-- <el-table-column property="password" label="登录密码" :width="passwordWidth" align="center" /> -->
          <!-- <el-table-column property="lastLoginTime" label="上次登录时间" :width="lastLoginTimeWidth" align="center" /> -->
        </el-table>
      </div>
      <div class="page-box">
        <div class="demo-pagination-block">
          <el-pagination v-model:current-page="params.pageNo" v-model:page-size="params.pageSize" :page-sizes="[5, 10, 15]" layout="total,  prev, pager, next, jumper" :total="total" />
        </div>
      </div>
    </div>
    <!-- 新增厂家 -->
    <div class="add-dialog" v-if="add_dialogFormVisible">
      <div class="add-dialog-content">
        <div class="title">
          <div style="margin-left: 10px; display: flex; align-items: center">
            <img src="@/assets/fapiao/icon8.png" alt="" style="margin-right: 10px" />
            <span style="font-size: 18px">新增水厂</span>
          </div>
          <div style="margin-right: 10px; cursor: pointer" @click="add_dialogFormVisible = false">
            <img src="@/assets/close.png" alt="" />
          </div>
        </div>
        <div class="add-content">
          <div class="add-input">
            <span>水厂名称</span>
            <el-input v-model="addCompanyName" placeholder="请输入..." />
          </div>
        </div>
        <div class="btn">
          <div class="confirm-btn" @click="add_confirm">
            <el-icon style="margin-left: 15%"><Check /></el-icon>
            <span style="font-size: 16px; margin-left: 15%">确认</span>
          </div>
          <div class="cancel-btn" @click="add_dialogFormVisible = false">
            <el-icon style="margin-left: 15%; color: #45ba7e"><Close /></el-icon>
            <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">取消</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 新增按钮弹出框 -->
    <!-- <div class="edit-dialog" v-if="add_dialogFormVisible">
      <div class="edit-dialog-content">
        <div class="title">
          <div style="margin-left: 10px; display: flex; align-items: center">
            <img src="@/assets/yuangong/icon6.png" alt="" style="margin-right: 10px" />
            <span style="font-size: 18px">新增</span>
          </div>
          <div style="margin-right: 10px; cursor: pointer" @click="add_dialogFormVisible = false">
            <img src="@/assets/close.png" alt="" />
          </div>
        </div>
        <div class="edit-content">
          <div class="edit-input">
            <span>账户</span>
            <el-input v-model="addData.account" />
          </div>
          <div class="edit-input">
            <span>员工名称</span>
            <el-input v-model="addData.workerName" />
          </div>
          <div class="edit-input" style="margin-right: 0">
            <span>性别</span>
            <el-select v-model="addData.gender">
              <el-option label="男" value="1"></el-option>
              <el-option label="女" value="2"></el-option>
            </el-select>
          </div>
          <div class="edit-input">
            <span>员工住址</span>
            <el-input v-model="addData.address" />
          </div>
          <div class="edit-input">
            <span>手机号</span>
            <el-input v-model="addData.phone" />
          </div>
          <div class="edit-input" style="margin-right: 0">
            <span>职位</span>
            <el-select v-model="addData.post">
              <el-option v-for="item in postsList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </div>
          <div class="edit-input">
            <span>角色</span>
            <el-select v-model="addData.role">
              <el-option v-for="item in rolesList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </div>
          <div class="edit-input">
            <span>登录密码</span>
            <el-input v-model="addData.password" />
          </div>
          <div class="edit-input" style="margin-right: 0">
            <span>确认登陆密码</span>
            <el-input v-model="addData.againPassword" />
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
    </div> -->
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
    <div class="edit-dialog" v-if="edit_dialogFormVisible">
      <div class="edit-dialog-content-1">
        <div class="title">
          <div style="margin-left: 10px; display: flex; align-items: center">
            <img src="@/assets/yuangong/icon3.png" alt="" style="margin-right: 10px" />
            <span style="font-size: 18px">编辑</span>
          </div>
          <div style="margin-right: 10px; cursor: pointer" @click="edit_dialogFormVisible = false">
            <img src="@/assets/close.png" alt="" />
          </div>
        </div>
        <div class="edit-content-1">
          <div class="edit-input">
            <span>员工名称</span>
            <el-input v-model="editData.staffName" />
          </div>
          <div class="edit-input">
            <span>员工住址</span>
            <el-input v-model="editData.staffAddr" />
          </div>
          <div class="edit-input" style="margin-right: 0">
            <span>手机号</span>
            <el-input v-model="editData.staffPhone" />
          </div>
          <div class="edit-input">
            <span>职位</span>
            <el-select v-model="editData.staffPostsId">
              <el-option v-for="item in postsList" :key="item.id" :label="item.name" :value="item.name"></el-option>
            </el-select>
          </div>
          <div class="edit-input">
            <span>角色</span>
            <el-select v-model="editData.staffCharacterId">
              <el-option v-for="item in rolesList" :key="item.id" :label="item.name" :value="item.name"></el-option>
            </el-select>
          </div>
          <div class="edit-input" v-if="companyId === 1" style="margin-right: 0">
            <span>所属水厂</span>
            <el-select v-model="editData.companyName">
              <el-option v-for="item in companyList" :key="item.id" :value="item.id" :label="item.name"></el-option>
            </el-select>
          </div>
          <!-- <div class="edit-input">
            <span>登录密码</span>
            <el-input v-model="editData.password" />
          </div>
          <div class="edit-input">
            <span>确认登陆密码</span>
            <el-input v-model="editData.againPassword" />
          </div> -->
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
        account: null,
        staffName: null,
        staffPostsId: null,
        staffCharacterId: null,
        company: null,
        companyId: null, // 所属水厂ID
        pageNo: 1,
        pageSize: 50,
      },
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId, // 所属水厂ID
      addCompanyName: null, // 新增水厂名称
      postsList: [
        {
          id: 1,
          name: "经理",
          value: 1,
        },
        {
          id: 2,
          name: "员工",
          value: 0,
        },
      ],
      rolesList: [
        {
          id: 1,
          name: "管理员",
          value: 1,
        },
        {
          id: 2,
          name: "普通员工",
          value: 0,
        },
      ],
      companyList: [],
      employeeData: [],
      multipleSelection: [],
      // addData: {
      //   account: null,
      //   workerName: null,
      //   gender: null,
      //   address: null,
      //   phone: null,
      //   post: null,
      //   role: null,
      //   password: null,
      //   againPassword: null,
      // },
      editData: {
        staffName: null,
        companyName: null,
        staffAddr: null,
        staffPhone: null,
        staffPostsId: null,
        // password: null,
        // againPassword: null,
        staffCharacterId: null,
        staffId: null,
      },

      total: null,

      // 每列实际宽度
      selectionWidth: 0,
      indexWidth: 0,
      accountWidth: 0,
      workerNameWidth: 0,
      genderWidth: 0,
      addressWidth: 0,
      phoneWidth: 0,
      postWidth: 0,
      roleWidth: 0,
      //passwordWidth: 0,
      lastLoginTimeWidth: 0,
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
        this.getEmployeeData();
      },
    },
    edit_dialogFormVisible: {
      handler() {
        let params = {};
        params.pageNo = this.params.pageNo;
        params.pageSize = this.params.pageSize;
        // params.companyId = this.companyId;
        params.staffName = this.multipleSelection[0].staffName;
        params.staffId = this.multipleSelection[0].staffId;
        service
          .post("/staff/queryStaff", params)
          .then((response) => {
            if (response.code === 200) {
              this.editData = response.data.records[0];
              if (this.editData.staffPostsId === 1) {
                this.editData.staffPostsId = "经理";
              } else {
                this.editData.staffPostsId = "员工";
              }
              if (this.editData.staffCharacterId === 1) {
                this.editData.staffCharacterId = "管理员";
              } else {
                this.editData.staffCharacterId = "普通员工";
              }
              console.log(this.editData);
            } else {
              ElMessage.error(response.msg);
            }
          })
          .catch((error) => {
            ElMessage.error(error);
          });
      },
    },
  },
  computed: {
    // 每列的百分比宽度
    columnPercentages() {
      return {
        selection: 5,
        index: 7,
        account: 9,
        worker_name: 10,
        company: 10,
        address: 20,
        phone: 18,
        post: 10,
        role: 10,
        //password: 10,
        // last_login_time: 16,
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
    this.getCompanyList();
    this.getEmployeeData();
    this.userData = sessionStorage.getItem("userData");
    console.log(this.userData);
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
    // 计算列宽的函数
    calculateColumnWidths() {
      if (this.parentContainer) {
        const parentWidth = this.parentContainer.offsetWidth;
        this.selectionWidth = (this.columnPercentages.selection / 100) * parentWidth;
        this.indexWidth = (this.columnPercentages.index / 100) * parentWidth;
        this.accountWidth = (this.columnPercentages.account / 100) * parentWidth;
        this.workerNameWidth = (this.columnPercentages.worker_name / 100) * parentWidth;
        this.companyWidth = (this.columnPercentages.company / 100) * parentWidth;
        this.addressWidth = (this.columnPercentages.address / 100) * parentWidth;
        this.phoneWidth = (this.columnPercentages.phone / 100) * parentWidth;
        this.postWidth = (this.columnPercentages.post / 100) * parentWidth;
        this.roleWidth = (this.columnPercentages.role / 100) * parentWidth;
        //this.passwordWidth = (this.columnPercentages.password / 100) * parentWidth;
        // this.lastLoginTimeWidth = (this.columnPercentages.last_login_time / 100) * parentWidth;
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
        this.editData = this.multipleSelection[0];
        this.editData.id = this.multipleSelection[0].id;
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
    getEmployeeData() {
      //this.params.companyId = this.params.company ? this.params.company : this.companyId;
      if (this.companyId === 1) {
        if (this.params.company) {
          this.params.companyId = this.params.company; // 所属水厂ID
        }
      } else {
        this.params.companyId = this.companyId; // 所属水厂ID
      }
      console.log(this.params);
      let token = "";
      const userData = sessionStorage.getItem("userData");
      if (userData) {
        try {
          token = JSON.parse(userData).token;
        } catch (e) {
          console.error("解析userData失败", e);
        }
      }
      service
        .post("/staff/queryStaff", this.params, {
          headers: {
            Authorization: token,
            token: token,
          },
        })
        .then((response) => {
          if (response.code === 200) {
            this.total = response.data.total;
            this.employeeData = response.data.records.map((item) => {
              return {
                ...item,
                staffCharacterId: item.staffCharacterId ? "管理员" : "普通员工",
                staffPostsId: item.staffPostsId ? "经理" : "员工",
              };
            });
            console.log(this.employeeData);
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },
    getEmployeeDataByPage() {
      const params = {
        pageNo: this.params.pageNo,
        pageSize: this.params.pageSize,
        companyId: this.companyId,
      };
      service
        .post("/staff/queryStaff", params)
        .then((response) => {
          if (response.code === 200) {
            this.total = response.data.total;
            this.params.pageNo = response.data.current;
            this.employeeData = response.data.records.map((item) => {
              return {
                ...item,
                role_name: item.is_admin ? "管理员" : "普通员工",
              };
            });
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },
    search() {
      this.getEmployeeData();
    },
    clear() {
      this.params.account = null;
      this.params.staffName = null;
      this.params.staffPostsId = null;
      this.params.staffCharacterId = null;
      this.params.company = null;
      this.params.companyId = null;
    },
    reflush() {
      this.clear();
      let params = {
        pageNo: 1,
        pageSize: 50,
      };
      if (this.companyId === 1) {
        if (this.params.company) {
          params.companyId = this.params.company; // 所属水厂ID
        }
      } else {
        params.companyId = this.companyId; // 所属水厂ID
      }
      service
        .post("/staff/queryStaff", params)
        .then((response) => {
          if (response.code === 200) {
            this.total = response.data.total;
            this.params.pageNo = 1;
            this.employeeData = response.data.records.map((item) => {
              return {
                ...item,
                staffCharacterId: item.staffCharacterId ? "管理员" : "普通员工",
                staffPostsId: item.staffPostsId ? "经理" : "员工",
              };
            });
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },
    add_confirm() {
      if (this.addCompanyName === null || this.addCompanyName === "") {
        ElMessage.error("水厂名称不能为空！");
        return;
      }
      service
        .get(`/staff/addCompany?companyName=${this.addCompanyName}`)
        .then((response) => {
          if (response.code === 200) {
            ElMessage.success("新增水厂成功");
            this.add_dialogFormVisible = false;
            this.getCompanyList();
            this.addCompanyName = null; // 清空输入框
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },
    // addConfirm() {
    //   const validations = [
    //     {
    //       condition: this.addData.account === null,
    //       message: "员工账户不能为空！",
    //     },
    //     {
    //       condition: this.addData.workerName === null,
    //       message: "员工名称不能为空！",
    //     },
    //     {
    //       condition: this.addData.gender === null,
    //       message: "员工性别不能为空！",
    //     },
    //     {
    //       condition: this.addData.address === null,
    //       message: "员工住址不能为空！",
    //     },
    //     {
    //       condition: this.addData.phone === null,
    //       message: "员工手机号不能为空！",
    //     },
    //     {
    //       condition: !/^1[3-9]\d{9}$/.test(this.addData.phone),
    //       message: "员工手机号格式不正确！",
    //     },
    //     {
    //       condition: this.addData.post === null,
    //       message: "员工职位不能为空！",
    //     },
    //     {
    //       condition: this.addData.role === null,
    //       message: "员工角色不能为空！",
    //     },
    //     {
    //       condition: this.addData.password === null,
    //       message: "员工登录密码不能为空！",
    //     },
    //     {
    //       condition: this.addData.againPassword === null,
    //       message: "请再次输入密码",
    //     },
    //     {
    //       condition: this.addData.password !== this.addData.againPassword,
    //       message: "两次输入的密码不一致！",
    //     },
    //   ];
    //   for (const validation of validations) {
    //     if (validation.condition) {
    //       ElMessage.error(validation.message);
    //       return;
    //     }
    //   }
    //   ElMessage.success("编添加成功");
    //   this.add_dialogFormVisible = false;
    // },
    // add_cancel() {
    //   this.add_dialogFormVisible = false;
    //   this.addData = {
    //     account: null,
    //     workerName: null,
    //     gender: null,
    //     address: null,
    //     phone: null,
    //     post: null,
    //     role: null,
    //     password: null,
    //     againPassword: null,
    //   };
    // },
    editConfirm() {
      const validations = [
        {
          condition: this.editData.staffName === null || this.editData.staffName === "",
          message: "员工名称不能为空！",
        },

        {
          condition: this.editData.companyName === null || this.editData.companyName === "",
          message: "员工所属水厂不能为空！",
        },
        {
          condition: this.editData.staffAddr === null || this.editData.staffAddr === "",
          message: "员工住址不能为空！",
        },
        {
          condition: this.editData.staffPhone === null || this.editData.staffPhone === "",
          message: "员工手机号不能为空！",
        },
        {
          condition: !/^1[3-9]\d{9}$/.test(this.editData.staffPhone),
          message: "员工手机号格式不正确！",
        },
        {
          condition: this.editData.staffPostsId === null || this.editData.staffPostsId === "",
          message: "员工职位不能为空！",
        },
        {
          condition: this.editData.staffCharacterId === null || this.editData.staffCharacterId === "",
          message: "员工角色不能为空！",
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
        pageNo: this.params.pageNo,
        pageSize: this.params.pageSize,
        companyId: this.editData.companyId,
        staffName: this.editData.staffName,
        staffAddr: this.editData.staffAddr,
        staffPhone: this.editData.staffPhone,
        staffPostsId: null,
        staffCharacterId: null,
        staffId: this.editData.staffId,
      };
      console.log(this.editData.staffPostsId);
      for (let i = 0; i < this.postsList.length; i++) {
        if (this.editData.staffPostsId === this.postsList[i].name) {
          params.staffPostsId = this.postsList[i].value;
        }
      }
      for (let i = 0; i < this.rolesList.length; i++) {
        if (this.editData.staffCharacterId === this.rolesList[i].name) {
          params.staffCharacterId = this.rolesList[i].value;
        }
      }
      console.log(params);
      service
        .post("/staff/editStaff", params)
        .then((response) => {
          if (response.code === 200) {
            ElMessage.success("编辑成功");
            this.edit_dialogFormVisible = false;
            this.reflush();
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
      this.edit_dialogFormVisible = false;
    },
    deleteConfirm() {
      const ids = [];
      this.multipleSelection.forEach((item) => {
        ids.push(item.staffId);
      });
      const params = {
        ids: ids,
      };
      console.log(params);
      service
        .post("/staff/delStaff", params)
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
.add-dialog,
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

.add-dialog-content,
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

.add-dialog-content {
  width: 35%;
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
.edit-content-1 {
  width: 94%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
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
  width: 60%;
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
