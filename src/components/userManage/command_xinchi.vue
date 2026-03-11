<template>
  <!-- 命令下发弹出框-信驰 -->
  <div class="command-dialog" v-if="command_dialogFormVisible">
    <div class="command-dialog-content" v-if="commandType == '信驰'">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yonghu/icon5.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 20px">命令下发</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer; width: 50px" @click="closeCommandDialog">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="command-content">
        <div class="command-select">
          <el-input v-model="commandFilterText" placeholder="请输入命令名称..."
                    style="height: 40px; margin-bottom: 10px; margin-top: 10px"></el-input>
          <el-tree ref="commandTreeRef" style="width: 230px; height: 460px; overflow-y: auto"
                   :data="command_xinchi_data" :props="commandProps" default-expand-all
                   :filter-node-method="command_filterNode" @node-click="handleNodeClick"></el-tree>
        </div>
        <div class="command-params">
          <div class="set-params">
            <span style="font-size: 25px; margin-top: 10px; margin-bottom: 5px">设置参数</span>
            <div class="flex-container">
              <div style="width: 4px; height: 4px; background-color: #46b87d; margin-right: 5px"></div>
              <div style="width: 4px; height: 4px; background-color: #90d5b2; margin-right: 5px"></div>
              <div style="width: 4px; height: 4px; background-color: #c7ead7; margin-right: 5px"></div>
              <div style="width: 94%; height: 1px; background-color: #e9e9e9"></div>
            </div>
            <div class="set-content">
              <div v-if="node.id == '' || node.id == 1 || node.id == 2 || node.id >= 8" class="set-content-container">
                <div class="set-input" style="width: 100%; height: 175px; justify-content: center; align-items: center">
                  <img src="@/assets/yonghu/0.png" alt="" style="width: auto; height: 75%" />
                  <span>暂无参数...</span>
                </div>
              </div>
              <div v-else>
                <!-- <div class="set-content-container" v-if="node.label === '设置实时时钟'">
                  <div class="set-input" style="width: 100%">
                    <span>实时时钟</span>
                    <div style="width: 100%; display: flex; justify-content: space-between">
                      <el-input style="margin-right: 10px" v-model="params_set_tai.shishishizhong.year" placeholder="年"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_set_tai.shishishizhong.month" placeholder="月"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_set_tai.shishishizhong.day" placeholder="日"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_set_tai.shishishizhong.hour" placeholder="时"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_set_tai.shishishizhong.minute" placeholder="分"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_set_tai.shishishizhong.second" placeholder="秒"></el-input>
                    </div>
                  </div>
                </div>
                <div class="set-content-container" v-if="node.label === '设置网络参数'">
                  <div class="set-input">
                    <span>IP地址</span>
                    <el-input v-model="params_set_tai.wangluo.ip"></el-input>
                  </div>
                  <div class="set-input">
                    <span>端口号</span>
                    <el-input v-model="params_set_tai.wangluo.port"></el-input>
                  </div>
                </div> -->
                <div class="set-content-container" v-if="node.label === '设置周期上报参数'">
                  <div class="set-input">
                    <span>周期频率</span>
                    <el-select v-model="params_set_tai.zhouqishangbao.way">
                      <el-option label="每小时" value="5"></el-option>
                      <el-option label="每天" value="6"></el-option>
                      <el-option label="每周" value="7"></el-option>
                      <el-option label="每月" value="8"></el-option>
                    </el-select>
                  </div>
                  <div class="set-input">
                    <span>星期</span>
                    <el-input v-model="params_set_tai.zhouqishangbao.week" placeholder="有效值为0~7"></el-input>
                  </div>
                  <div class="set-input">
                    <span>周期间隔</span>
                    <el-input v-model="params_set_tai.zhouqishangbao.interval"></el-input>
                  </div>
                  <div class="set-input" style="width: 100%">
                    <span>开始时间</span>
                    <div style="width: 100%; display: flex; justify-content: space-between">
                      <el-input style="margin-right: 10px" v-model="params_set_tai.zhouqishangbao.year"
                                placeholder="年"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_set_tai.zhouqishangbao.month"
                                placeholder="月"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_set_tai.zhouqishangbao.day"
                                placeholder="日"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_set_tai.zhouqishangbao.hour"
                                placeholder="时"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_set_tai.zhouqishangbao.minute"
                                placeholder="分"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_set_tai.zhouqishangbao.second"
                                placeholder="秒"></el-input>
                    </div>
                  </div>
                </div>
                <div class="set-content-container" v-if="node.label === '阀门控制'">
                  <div class="set-input">
                    <span>阀门状态</span>
                    <el-select v-model="params_set_tai.famenstate">
                      <el-option label="开阀" value="1"></el-option>
                      <el-option label="关阀" value="0"></el-option>
                    </el-select>
                  </div>
                </div>
                <div class="set-content-container" v-if="node.label === '设置读数'">
                  <div class="set-input">
                    <span>读数</span>
                    <el-input v-model="params_set_tai.count" type="number"></el-input>
                  </div>
                </div>
                <!-- <div class="set-content-container" v-if="node.label === '设置失联检测参数'">
                  <div class="set-input">
                    <span>失联天数</span>
                    <el-input v-model="params_set_tai.shilianjiance.shilianDays"></el-input>
                  </div>
                  <div class="set-input">
                    <span>允许失联天数</span>
                    <el-input v-model="params_set_tai.shilianjiance.allowShilianDays"></el-input>
                  </div>
                </div> -->
              </div>
            </div>
          </div>
          <div class="get-params">
            <span style="font-size: 25px; margin-top: 10px; margin-bottom: 5px">返回值</span>
            <div class="flex-container">
              <div style="width: 4px; height: 4px; background-color: #46b87d; margin-right: 5px"></div>
              <div style="width: 4px; height: 4px; background-color: #90d5b2; margin-right: 5px"></div>
              <div style="width: 4px; height: 4px; background-color: #c7ead7; margin-right: 5px"></div>
              <div style="width: 94%; height: 1px; background-color: #e9e9e9"></div>
            </div>
            <div class="get-content">
              <div v-if="node.id <= 7" class="set-content-container">
                <div class="set-input" style="width: 100%; height: 175px; justify-content: center; align-items: center">
                  <img src="@/assets/yonghu/0.png" alt="" style="width: auto; height: 75%" />
                  <span>暂无返回值...</span>
                </div>
              </div>
              <!-- <div v-else style="overflow-y: auto">
                <div class="set-content-container" v-if="node.label == '获取表读数'">
                  <div class="set-input">
                    <span>表读数（m³）</span>
                    <el-input v-model="params_get_tai.biaodushu.count"></el-input>
                  </div>
                  <div class="set-input">
                    <span>总购买流量数</span>
                    <el-input v-model="params_get_tai.biaodushu.totalPurchaseFlow"></el-input>
                  </div>
                  <div class="set-input">
                    <span>总使用流量数</span>
                    <el-input v-model="params_get_tai.biaodushu.totalUsageFlow"></el-input>
                  </div>
                </div>
                <div class="set-content-container" v-if="node.label === '获取阀门状态'">
                  <div class="set-input">
                    <span>阀门状态</span>
                    <el-input v-model="params_get_tai.famenstate"></el-input>
                  </div>
                </div>
                <div class="set-content-container" v-if="node.label === '获取电池电压'">
                  <div class="set-input">
                    <span>电压（v）</span>
                    <el-input v-model="params_get_tai.dianya"></el-input>
                  </div>
                </div>
                <div class="set-content-container" v-if="node.label === '获取实时时钟'">
                  <div class="set-input" style="width: 100%">
                    <span>实时时钟</span>
                    <div style="width: 100%; display: flex; justify-content: space-between">
                      <el-input style="margin-right: 10px" v-model="params_get_tai.shishishizhong.year" placeholder="年" />
                      <el-input style="margin-right: 10px" v-model="params_get_tai.shishishizhong.month" placeholder="月" />
                      <el-input style="margin-right: 10px" v-model="params_get_tai.shishishizhong.day" placeholder="日" />
                      <el-input style="margin-right: 10px" v-model="params_get_tai.shishishizhong.hour" placeholder="时" />
                      <el-input style="margin-right: 10px" v-model="params_get_tai.shishishizhong.minute" placeholder="分" />
                      <el-input style="margin-right: 10px" v-model="params_get_tai.shishishizhong.second" placeholder="秒" />
                    </div>
                  </div>
                </div>
                <div class="set-content-container" v-if="node.label === '获取密集数据（增量）'">
                  <div class="set-input" style="width: 40%">
                    <span>采样间隔（分钟）</span>
                    <el-input v-model="params_get_tai.mijizengliang.interval"></el-input>
                  </div>
                  <div class="set-input" style="width: 40%">
                    <span>数据组数（组）</span>
                    <el-input v-model="params_get_tai.mijizengliang.count"></el-input>
                  </div>
                  <div class="set-input" style="width: 40%">
                    <span>第一组数据</span>
                    <el-input v-model="params_get_tai.mijizengliang.first"></el-input>
                  </div>
                  <div class="set-input" style="width: 40%">
                    <span>第二组数据</span>
                    <el-input v-model="params_get_tai.mijizengliang.second"></el-input>
                  </div>
                </div>
                <div class="set-content-container" v-if="node.label === '获取间隔数据（增量）'">
                  <div class="set-input" style="width: 40%">
                    <span>采样间隔（分钟）</span>
                    <el-input v-model="params_get_tai.mijizengliang.interval"></el-input>
                  </div>
                  <div class="set-input" style="width: 40%">
                    <span>数据组数（组）</span>
                    <el-input v-model="params_get_tai.mijizengliang.count"></el-input>
                  </div>
                  <div class="set-input" style="width: 40%">
                    <span>第一组数据</span>
                    <el-input v-model="params_get_tai.mijizengliang.first"></el-input>
                  </div>
                  <div class="set-input" style="width: 40%">
                    <span>第二组数据</span>
                    <el-input v-model="params_get_tai.mijizengliang.second"></el-input>
                  </div>
                </div>
                <div class="set-content-container" v-if="node.label === '获取间隔数据（累计）'">
                  <div class="set-input" style="width: 40%">
                    <span>采样间隔（分钟）</span>
                    <el-input v-model="params_get_tai.jiangeleiji.interval"></el-input>
                  </div>
                  <div class="set-input" style="width: 40%">
                    <span>数据组数（组）</span>
                    <el-input v-model="params_get_tai.jiangeleiji.count"></el-input>
                  </div>
                  <div class="set-input" style="width: 40%">
                    <span>第一组数据</span>
                    <el-input v-model="params_get_tai.jiangeleiji.first"></el-input>
                  </div>
                  <div class="set-input" style="width: 40%">
                    <span>第二组数据</span>
                    <el-input v-model="params_get_tai.jiangeleiji.second"></el-input>
                  </div>
                </div>
                <div class="set-content-container" v-if="node.label === '获取冻结数据（累计）'">
                  <div class="set-input" style="width: 40%">
                    <span>采样间隔（天）</span>
                    <el-input v-model="params_get_tai.dongjieleiji.interval"></el-input>
                  </div>
                  <div class="set-input" style="width: 40%">
                    <span>数据组数（组）</span>
                    <el-input v-model="params_get_tai.dongjieleiji.count"></el-input>
                  </div>
                  <div class="set-input" style="width: 40%">
                    <span>第一组数据</span>
                    <el-input v-model="params_get_tai.dongjieleiji.first"></el-input>
                  </div>
                  <div class="set-input" style="width: 40%">
                    <span>第二组数据</span>
                    <el-input v-model="params_get_tai.dongjieleiji.second"></el-input>
                  </div>
                </div> -->
              <!-- <div class="set-content-container" v-if="node.label === '获取历史事件记录'">
                  <div class="set-input">
                    <span>起始序号</span>
                    <el-input v-model="params_get_tai.lishijilu.start"></el-input>
                  </div>
                  <div class="set-input">
                    <span>读取条数</span>
                    <el-input v-model="params_get_tai.lishijilu.count"></el-input>
                  </div>
                  <div class="set-input">
                    <span>事件代码</span>
                    <el-input v-model="params_get_tai.lishijilu.eventCode"></el-input>
                  </div>
                  <div class="set-input" style="width: 100%">
                    <span>第一件事件</span>
                    <div class="set-input" style="width: 100%; display: flex; flex-direction: column">
                      <span>发生时间</span>
                      <div style="width: 100%; display: flex; justify-content: space-between">
                        <el-input v-model="params_get_tai.lishijilu.first.year" placeholder="年"></el-input>
                        <el-input v-model="params_get_tai.lishijilu.first.month" placeholder="月"></el-input>
                        <el-input v-model="params_get_tai.lishijilu.first.day" placeholder="日"></el-input>
                        <el-input v-model="params_get_tai.lishijilu.first.hour" placeholder="时"></el-input>
                        <el-input v-model="params_get_tai.lishijilu.first.minute" placeholder="分"></el-input>
                        <el-input v-model="params_get_tai.lishijilu.first.second" placeholder="秒"></el-input>
                      </div>
                    </div>
                    <div class="set-input">
                      <span>发生次数</span>
                      <el-input v-model="params_get_tai.lishijilu.first.count"></el-input>
                    </div>
                  </div>
                </div> -->
              <!-- <div class="set-content-container" v-if="node.label === '获取基站信息'">
                  <div class="set-input" style="width: 40%">
                    <span>CellID</span>
                    <el-input v-model="params_get_tai.jizhanxinxi.CellID"></el-input>
                  </div>
                  <div class="set-input" style="width: 40%">
                    <span>PCI</span>
                    <el-input v-model="params_get_tai.jizhanxinxi.PCI"></el-input>
                  </div>
                  <div class="set-input" style="width: 40%">
                    <span>RSRQ</span>
                    <el-input v-model="params_get_tai.jizhanxinxi.RSRQ"></el-input>
                  </div>
                  <div class="set-input" style="width: 40%">
                    <span>SNR</span>
                    <el-input v-model="params_get_tai.jizhanxinxi.SNR"></el-input>
                  </div>
                </div>
                <div class="set-content-container" v-if="node.label === '获取IMSI'">
                  <div class="set-input">
                    <span>IMSI</span>
                    <el-input v-model="params_get_tai.IMSI"></el-input>
                  </div>
                </div>
                <div class="set-content-container" v-if="node.label === '获取IMEI'">
                  <div class="set-input">
                    <span>IMEI</span>
                    <el-input v-model="params_get_tai.IMEI"></el-input>
                  </div>
                </div>
                <div class="set-content-container" v-if="node.label === '获取ICCID及CSQ'">
                  <div class="set-input">
                    <span>ICCID</span>
                    <el-input v-model="params_get_tai.ICCID"></el-input>
                  </div>
                  <div class="set-input">
                    <span>CSQ</span>
                    <el-input v-model="params_get_taiCSQ"></el-input>
                  </div>
                </div>
              </div> -->
            </div>
          </div>
          <div class="btns">
            <div class="confirm-btn" @click="commit_xinchi">
              <el-icon style="margin-left: -3%">
                <Check />
              </el-icon>
              <span style="font-size: 20px; margin-left: 5%">确认</span>
            </div>
            <div class="cancel-btn" @click="closeCommandDialog">
              <el-icon style="margin-left: -3%; color: #45ba7e">
                <Close />
              </el-icon>
              <span style="font-size: 20px; margin-left: 5%; color: #5a5a5a">取消</span>
            </div>
          </div>
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
    command_dialogFormVisible: {
      type: Boolean,
      default: false,
    },
    commandType: {
      type: String,
      default: "",
    },
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    const validateWay = (rule, value, callback) => {
      if (!value) {
        callback(new Error('周期频率不能为空'));
      } else {
        callback();
      }
    };
    const validateWeek = (rule, value, callback) => {
      if (value === '' || value === undefined || value === null) {
        callback(new Error('星期不能为空'));
      } else if (!/^\d+$/.test(value) || Number(value) < 0 || Number(value) > 7) {
        callback(new Error('星期有效值为0~7的整数'));
      } else {
        callback();
      }
    };
    const validateInterval = (rule, value, callback) => {
      if (value === '' || value === undefined || value === null) {
        callback(new Error('周期间隔不能为空'));
      } else if (!/^\d+$/.test(value) || Number(value) <= 0) {
        callback(new Error('周期间隔必须为正整数'));
      } else {
        callback();
      }
    };
    const validateYear = (rule, value, callback) => {
      if (value === '' || value === undefined || value === null) {
        callback(new Error('年份不能为空'));
      } else if (!/^\d+$/.test(value) || Number(value) < 1970 || Number(value) > 2099) {
        callback(new Error('年份必须为1970~2099的整数'));
      } else {
        callback();
      }
    };
    const validateMonth = (rule, value, callback) => {
      if (value === '' || value === undefined || value === null) {
        callback(new Error('月份不能为空'));
      } else if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 12) {
        callback(new Error('月份必须为1~12的整数'));
      } else {
        callback();
      }
    };
    const validateDay = (rule, value, callback) => {
      if (value === '' || value === undefined || value === null) {
        callback(new Error('日期不能为空'));
      } else if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 31) {
        callback(new Error('日期必须为1~31的整数'));
      } else {
        callback();
      }
    };
    const validateHour = (rule, value, callback) => {
      if (value === '' || value === undefined || value === null) {
        callback(new Error('小时不能为空'));
      } else if (!/^\d+$/.test(value) || Number(value) < 0 || Number(value) > 23) {
        callback(new Error('小时必须为0~23的整数'));
      } else {
        callback();
      }
    };
    const validateMinute = (rule, value, callback) => {
      if (value === '' || value === undefined || value === null) {
        callback(new Error('分钟不能为空'));
      } else if (!/^\d+$/.test(value) || Number(value) < 0 || Number(value) > 59) {
        callback(new Error('分钟必须为0~59的整数'));
      } else {
        callback();
      }
    };
    const validateSecond = (rule, value, callback) => {
      if (value === '' || value === undefined || value === null) {
        callback(new Error('秒数不能为空'));
      } else if (!/^\d+$/.test(value) || Number(value) < 0 || Number(value) > 59) {
        callback(new Error('秒数必须为0~59的整数'));
      } else {
        callback();
      }
    };

    // ========== 新增：阀门控制校验函数 ==========
    const validateFamenstate = (rule, value, callback) => {
      if (!value && value !== 0) { // 0是关阀有效值，需特殊处理
        callback(new Error('请选择阀门状态'));
      } else {
        callback();
      }
    };

    // ========== 新增：设置读数校验函数 ==========
    const validateCount = (rule, value, callback) => {
      if (value === '' || value === undefined || value === null) {
        callback(new Error('读数不能为空'));
      } else if (isNaN(value) || value <= 0) {
        callback(new Error('读数必须为正整数'));
      } else {
        callback();
      }
    };
    return {
      commandFilterText: "",
      //当前所选择到的子节点的信息
      node: {
        label: "",
        id: "",
        value: "",
      },
      commandProps: {
        children: "children",
        label: "label",
      },
      command_xinchi_data: [
        {
          id: 1,
          value: 1,
          label: "下发控制命令",
          children: [
            // {
            //   id: 3,
            //   value: 3,
            //   label: "设置实时时钟",
            // },
            // {
            //   id: 4,
            //   value: 4,
            //   label: "设置网络参数",
            // },
            {
              id: 5,
              value: 5,
              label: "设置周期上报参数",
            },
            {
              id: 6,
              value: 6,
              label: "阀门控制",
            },
            {

              id: 7,
              value: 7,
              label: "设置读数",

            }
            // {
            //   id: 7,
            //   value: 7,
            //   label: "设置失联检测参数",
            // },
          ],
        },
        // {
        //   id: 2,
        //   value: 2,
        //   label: "下发获取命令",
        //   children: [
        //     {
        //       id: 8,
        //       value: 8,
        //       label: "获取表读数",
        //     },
        //     {
        //       id: 9,
        //       value: 9,
        //       label: "获取阀门状态",
        //     },
        //     {
        //       id: 10,
        //       value: 10,
        //       label: "获取电池电压",
        //     },
        //     {
        //       id: 11,
        //       value: 11,
        //       label: "获取实时时钟",
        //     },
        //     {
        //       id: 12,
        //       value: 12,
        //       label: "获取密集数据（增量）",
        //     },
        //     {
        //       id: 13,
        //       value: 13,
        //       label: "获取间隔数据（增量）",
        //     },
        //     {
        //       id: 14,
        //       value: 14,
        //       label: "获取间隔数据（累计）",
        //     },
        //     {
        //       id: 15,
        //       value: 15,
        //       label: "获取冻结数据（累计）",
        //     },
        //     // {
        //     //   id: 16,
        //     //   value: 16,
        //     //   label: "获取历史事件记录",
        //     // },
        //     {
        //       id: 16,
        //       value: 16,
        //       label: "获取基站信息",
        //     },
        //     {
        //       id: 17,
        //       value: 17,
        //       label: "获取IMSI",
        //     },
        //     {
        //       id: 18,
        //       value: 18,
        //       label: "获取IMEI",
        //     },
        //     {
        //       id: 19,
        //       value: 19,
        //       label: "获取ICCID及CSQ",
        //     },
        //   ],
        // },
      ],
      params_set_tai: {
        wangluo: {
          ip: "",
          port: "",
        },
        count: '',
        chaobiaoPeizhi: {
          way: "",
          chaobiaoHour: null,
          chaobiaoMinute: null,
          uploadDate: null,
          uploadHour: null,
        },
        famenstate: "",
        shishishizhong: {
          year: "",
          month: "",
          day: "",
          hour: "",
          minute: "",
          second: "",
        },
        shilianjiance: {
          shilianDays: "",
          allowShilianDays: "",
        },
        zhouqishangbao: {
          way: "",
          week: null,
          interval: null,
          year: "",
          month: "",
          day: "",
          hour: "",
          minute: "",
          second: "",
        },

      },
      cycleReportRules: {
        way: [{ validator: validateWay, trigger: 'change' }],
        week: [{ validator: validateWeek, trigger: 'blur' }],
        interval: [{ validator: validateInterval, trigger: 'blur' }],
        year: [{ validator: validateYear, trigger: 'blur' }],
        month: [{ validator: validateMonth, trigger: 'blur' }],
        day: [{ validator: validateDay, trigger: 'blur' }],
        hour: [{ validator: validateHour, trigger: 'blur' }],
        minute: [{ validator: validateMinute, trigger: 'blur' }],
        second: [{ validator: validateSecond, trigger: 'blur' }]
      },
      valveControlRules: {
        famenstate: [{ validator: validateFamenstate, trigger: 'change' }]
      },
      readCountRules: {
        count: [{ validator: validateCount, trigger: 'blur' }]
      }
      // params_get_tai: {
      //   biaodushu: {
      //     count: "",
      //     totalPurchaseFlow: "",
      //     totalUsageFlow: "",
      //   },
      //   famenstate: "",
      //   dianya: "",
      //   shishishizhong: {
      //     year: "",
      //     month: "",
      //     day: "",
      //     hour: "",
      //     minute: "",
      //     second: "",
      //   },
      //   mijizengliang: {
      //     interval: "",
      //     count: "",
      //     first: "",
      //     second: "",
      //   },
      //   jiangezengliang: {
      //     interval: "",
      //     count: "",
      //     first: "",
      //     second: "",
      //   },
      //   jiangeleiji: {
      //     interval: "",
      //     count: "",
      //     first: "",
      //     second: "",
      //   },
      //   dongjieleiji: {
      //     interval: "",
      //     count: "",
      //     first: "",
      //     second: "",
      //   },
      //   lishijilu: {
      //     start: "",
      //     count: "",
      //     eventCode: "",
      //     first: {
      //       year: "",
      //       month: "",
      //       day: "",
      //       hour: "",
      //       minute: "",
      //       second: "",
      //       count: "",
      //     },
      //     second: {
      //       year: "",
      //       month: "",
      //       day: "",
      //       hour: "",
      //       minute: "",
      //       second: "",
      //       count: "",
      //     },
      //   },
      //   jizhanxinxi: {
      //     CellID: "",
      //     PCI: "",
      //     RSRQ: "",
      //     SNR: "",
      //   },
      //   IMSI: "",
      //   IMEI: "",
      //   ICCID: "",
      //   CSQ: "",
      // },
    };
  },

  watch: {
    commandFilterText(val) {
      this.$refs.commandTreeRef.filter(val);
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.commandTreeRef = this.$refs.commandTreeRef;
    });
  },

  methods: {
    command_filterNode(value, data) {
      if (!value) return true;
      return data.label.includes(value);
    },
    handleNodeClick(node) {
      this.node.id = node.id;
      this.node.value = node.value;
      this.node.label = node.label;
      console.log(this.node.id);
      console.log(this.node.value);
      console.log(this.node.label);
    },
    closeCommandDialog() {
      this.node.label = "";
      this.$emit("close");
    },
    /**
     * 将年、月、日、时、分、秒转换为 YYYY-MM-DD HH:MM:SS 格式的字符串
     */
    formatDateTime(year, month, day, hour, minute, second) {
      // 补零函数，确保个位数前有0
      const padZero = (num) => num.toString().padStart(2, "0");
      // 构建并返回格式化的日期时间字符串
      return `${year}-${padZero(month)}-${padZero(day)} ${padZero(hour)}:${padZero(minute)}:${padZero(second)}`;
    },
    commit_xinchi() {
      if (this.node.label === "设置周期上报参数") {
        if (!this.$refs.cycleReportForm) {
          ElMessage.error('表单未加载完成，请稍后重试');
          return;
        }
        this.$refs.cycleReportForm.validate((valid) => {
          if (valid) {
            const imei = this.data.imei;
            const status = this.params_set_tai.zhouqishangbao.way;
            const weeks = this.params_set_tai.zhouqishangbao.week;
            const cycleIntervals = this.params_set_tai.zhouqishangbao.interval;
            const { year, month, day, hour, minute, second } = this.params_set_tai.zhouqishangbao;
            // 调用格式化函数
            const time = this.formatDateTime(year, month, day, hour, minute, second);
            service
              .get(`/command/xinChi/xinChiSetCycleParametersCommand?imei=${imei}&status=${status}&weeks=${weeks}&cycleIntervals=${cycleIntervals}&time=${time}`)
              .then((res) => {
                if (res.code === 200) {
                  ElMessage.success("周期上报参数设置成功！");
                  // this.closeCommandDialog();
                } else {
                  ElMessage.error(res.msg);
                }
              })
              .catch((error) => {
                ElMessage.error(error.message || "设置周期上报参数失败!");
              });
          }
        });

      } else if (this.node.label === "阀门控制") {
        if (!this.$refs.valveControlForm) {
          ElMessage.error('表单未加载完成，请稍后重试');
          return;
        }
        this.$refs.valveControlForm.validate((valid) => {
          if (valid) {
            const imei = this.data.imei;
            const status = this.params_set_tai.famenstate;
            service
              .get(`/command/xinChi/xinChiValveCommand?imei=${imei}&status=${status}`)
              .then((res) => {
                if (res.code === 200) {
                  ElMessage.success("阀门设置成功");
                } else {
                  ElMessage.error(res.msg);
                }
              })
              .catch((error) => {
                ElMessage.error(error.msg);
              });
          }
        });

      } else if (this.node.label === "设置读数") {

        if (!this.$refs.readCountForm) {
          ElMessage.error('表单未加载完成，请稍后重试');
          return;
        }
        this.$refs.readCountForm.validate((valid) => {
          if (valid) {
            console.log("设置读数")
            const imei = this.data.imei;
            const count = this.params_set_tai.count;
            service
              .get(`/command/xinChi/xinChiSetReadCount?imei=${imei}&readCount=${count}`)
              .then((res) => {
                if (res.code === 200) {
                  ElMessage.success("表读数设置成功");
                } else {
                  ElMessage.error(res.msg);
                }
              })
              .catch((error) => {
                ElMessage.error(error.msg);
              });
          }
        });

      }
    },
  },
};
</script>

<style scoped>
.command-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 199;
  background-color: rgb(31 33 38 / 15%);
}

.command-dialog-content {
  width: 60%;
  height: 600px;
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

.command-content {
  width: 96%;
  height: 540px;
  background-color: #fff;
  border-radius: 5px;
  margin-top: 10px;
  margin-bottom: 10px;
  overflow-y: auto;
  padding: 0 10px;
  background: none;
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
}

.command-select {
  height: 100%;
  width: 210px;
  background-color: #fff;
  border-radius: 5px;
  padding: 0 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.command-params {
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 20px;
}

.set-params,
.get-params {
  background-color: #fff;
  border-radius: 5px;
  width: 98%;
  margin-bottom: 20px;
  padding-left: 10px;
  display: flex;
  flex-direction: column;
}

.set-content,
.get-content {
  width: 100%;
}

.set-content-container {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
}

.set-input {
  display: flex;
  justify-content: center;
  /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 31.5%;
  height: 75px;
  margin-right: 10px;
}

.set-input>span {
  font-size: 20px;
  color: #747374;
  margin-bottom: 5px;
}

.set-input>.el-input {
  height: 35px;
  width: 100%;
}

.flex-container {
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: 5px;
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

.btns {
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 0px;
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

<style lang="scss" scoped>
:deep(.el-tree) {
  .is-current {
    >.el-tree-node__content {
      background-color: var(--el-tree-node-hover-bg-color);
      color: white;
    }
  }
}
</style>
