<template>
  <!-- 命令下发弹出框-太阳能 -->
  <div class="command-dialog" v-if="command_dialogFormVisible">
    <div class="command-dialog-content" v-if="commandType == '太阳能'">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yonghu/icon5.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 18px">命令下发</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer; width: 50px" @click="closeCommandDialog">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="command-content">
        <div class="command-select">
          <el-input v-model="commandFilterText" placeholder="请输入命令名称..." style="height: 40px; margin-bottom: 10px; margin-top: 10px"></el-input>
          <el-tree
            ref="commandTreeRef"
            style="width: 210px; height: 460px; overflow-y: auto"
            :data="command_taiyangneng_data"
            :props="commandProps"
            default-expand-all
            :filter-node-method="command_filterNode"
            @node-click="handleNodeClick"
          ></el-tree>
        </div>
        <div class="command-params">
          <div class="set-params">
            <span style="font-size: 16px; margin-top: 10px; margin-bottom: 5px">设置参数</span>
            <div class="flex-container">
              <div style="width: 4px; height: 4px; background-color: #46b87d; margin-right: 5px"></div>
              <div style="width: 4px; height: 4px; background-color: #90d5b2; margin-right: 5px"></div>
              <div style="width: 4px; height: 4px; background-color: #c7ead7; margin-right: 5px"></div>
              <div style="width: 94%; height: 1px; background-color: #e9e9e9"></div>
            </div>
            <div class="set-content">
              <div v-if="node.id == '' || node.id == 1 || node.id == 2 || node.id >= 13" class="set-content-container">
                <div class="set-input" style="width: 100%; height: 175px; justify-content: center; align-items: center">
                  <img src="@/assets/yonghu/0.png" alt="" style="width: auto; height: 75%" />
                  <span>暂无参数...</span>
                </div>
              </div>
              <div v-else>
                <div class="set-content-container" v-if="node.label == '设置心跳上报间隔'">
                  <div class="set-input">
                    <span>心跳上报间隔(秒)</span>
                    <el-input v-model="params_set_tai.heartInterval"></el-input>
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
                </div>
                <div class="set-content-container" v-if="node.label === '设置抄表配置'">
                  <div class="set-input">
                    <span>上传方式</span>
                    <el-select v-model="params_set_tai.chaobiaoPeizhi.way">
                      <el-option label="历史上传" value="0"></el-option>
                      <el-option label="实时上传" value="1"></el-option>
                    </el-select>
                  </div>
                  <div class="set-input" style="width: 100%; flex-direction: row; justify-content: flex-start">
                    <div style="width: 24%; display: flex; flex-direction: column; margin-right: 15px">
                      <span style="font-size: 14px; color: #747374; margin-bottom: 5px">抄表间隔(小时)</span>
                      <el-input style="height: 35px; width: 100%" v-model="params_set_tai.chaobiaoPeizhi.chaobiaoHour"></el-input>
                    </div>
                    <div style="width: 24%; display: flex; flex-direction: column; margin-right: 15px">
                      <span style="font-size: 14px; color: #747374; margin-bottom: 5px">抄表间隔(分钟)</span>
                      <el-input style="height: 35px; width: 100%" v-model="params_set_tai.chaobiaoPeizhi.chaobiaoMinute"></el-input>
                    </div>
                    <div style="width: 24%; display: flex; flex-direction: column; margin-right: 15px">
                      <span style="font-size: 14px; color: #747374; margin-bottom: 5px">上传间隔(天)</span>
                      <el-input style="height: 35px; width: 100%" v-model="params_set_tai.chaobiaoPeizhi.uploadDate"></el-input>
                    </div>
                    <div style="width: 24%; display: flex; flex-direction: column; margin-right: 15px">
                      <span style="font-size: 14px; color: #747374; margin-bottom: 5px">上传间隔(小时)</span>
                      <el-input style="height: 35px; width: 100%" v-model="params_set_tai.chaobiaoPeizhi.uploadHour"></el-input>
                    </div>
                  </div>
                </div>
                <div class="set-content-container" v-if="node.label === '设置阀门维护配置'">
                  <div class="set-input">
                    <span>月洗阀次数</span>
                    <el-select v-model="params_set_tai.famenWeihu.count">
                      <el-option label="1次" value="1"></el-option>
                      <el-option label="2次" value="2"></el-option>
                      <el-option label="3次" value="3"></el-option>
                      <el-option label="4次" value="4"></el-option>
                    </el-select>
                  </div>
                  <div style="width: 100%" class="set-input" v-if="params_set_tai.famenWeihu.count >= 1">
                    <span>第一次洗阀时间</span>
                    <div style="width: 100%; display: flex; justify-content: space-between">
                      <el-input style="margin-right: 15px" v-model="params_set_tai.famenWeihu.first.day" placeholder="日"></el-input>
                      <el-input style="margin-right: 15px" v-model="params_set_tai.famenWeihu.first.hour" placeholder="时"></el-input>
                      <el-input style="margin-right: 15px" v-model="params_set_tai.famenWeihu.first.minute" placeholder="分"></el-input>
                    </div>
                  </div>
                  <div style="width: 100%" class="set-input" v-if="params_set_tai.famenWeihu.count >= 2">
                    <span>第二次洗阀时间</span>
                    <div style="width: 100%; display: flex; justify-content: space-between">
                      <el-input style="margin-right: 15px" v-model="params_set_tai.famenWeihu.second.day" placeholder="日"></el-input>
                      <el-input style="margin-right: 15px" v-model="params_set_tai.famenWeihu.second.hour" placeholder="时"></el-input>
                      <el-input style="margin-right: 15px" v-model="params_set_tai.famenWeihu.second.minute" placeholder="分"></el-input>
                    </div>
                  </div>
                  <div style="width: 100%" class="set-input" v-if="params_set_tai.famenWeihu.count >= 3">
                    <span>第三次洗阀时间</span>
                    <div style="width: 100%; display: flex; justify-content: space-between">
                      <el-input style="margin-right: 15px" v-model="params_set_tai.famenWeihu.third.day" placeholder="日"></el-input>
                      <el-input style="margin-right: 15px" v-model="params_set_tai.famenWeihu.third.hour" placeholder="时"></el-input>
                      <el-input style="margin-right: 15px" v-model="params_set_tai.famenWeihu.third.minute" placeholder="分"></el-input>
                    </div>
                  </div>
                  <div style="width: 100%" class="set-input" v-if="params_set_tai.famenWeihu.count >= 4">
                    <span>第四次洗阀时间</span>
                    <div style="width: 100%; display: flex; justify-content: space-between">
                      <el-input style="margin-right: 15px" v-model="params_set_tai.famenWeihu.fourth.day" placeholder="日"></el-input>
                      <el-input style="margin-right: 15px" v-model="params_set_tai.famenWeihu.fourth.hour" placeholder="时"></el-input>
                      <el-input style="margin-right: 15px" v-model="params_set_tai.famenWeihu.fourth.minute" placeholder="分"></el-input>
                    </div>
                  </div>
                </div>
                <div class="set-content-container" v-if="node.label === '设置水表配置'">
                  <div class="set-input">
                    <span>倍率</span>
                    <el-select v-model="params_set_tai.beilv">
                      <el-option label="0.1" value="0.1"></el-option>
                      <el-option label="1" value="1"></el-option>
                      <el-option label="10" value="10"></el-option>
                      <el-option label="100" value="100"></el-option>
                      <el-option label="1000" value="1000"></el-option>
                    </el-select>
                  </div>
                </div>
                <div class="set-content-container" v-if="node.label === '设置读数'">
                  <div class="set-input">
                    <span>读数</span>
                    <el-input v-model="params_set_tai.count"></el-input>
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
                <div class="set-content-container" v-if="node.label === '校时'">
                  <div class="set-input" style="width: 100%">
                    <span>校准的时间</span>
                    <div style="width: 100%; display: flex; justify-content: space-between">
                      <el-input style="margin-right: 10px" v-model="params_set_tai.jiaoshi.year" placeholder="年"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_set_tai.jiaoshi.month" placeholder="月"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_set_tai.jiaoshi.day" placeholder="日"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_set_tai.jiaoshi.hour" placeholder="时"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_set_tai.jiaoshi.minute" placeholder="分"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_set_tai.jiaoshi.second" placeholder="秒"></el-input>
                    </div>
                  </div>
                </div>
                <div class="set-content-container" v-if="node.label === '设置关阀圈数'">
                  <div class="set-input">
                    <span>关阀圈数</span>
                    <el-input v-model="params_set_tai.guanfa.count"></el-input>
                  </div>
                  <div class="set-input">
                    <span>系列号</span>
                    <el-input v-model="params_set_tai.guanfa.xiliehao"></el-input>
                  </div>
                </div>
                <div class="set-content-container" v-if="node.label === '设备还原'">
                  <div class="set-input" style="width: 100%; height: 175px; justify-content: center; align-items: center">
                    <img src="@/assets/yonghu/0.png" alt="" style="width: auto; height: 75%" />
                    <span>暂无参数...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="get-params">
            <span style="font-size: 16px; margin-top: 10px; margin-bottom: 5px">返回值</span>
            <div class="flex-container">
              <div style="width: 4px; height: 4px; background-color: #46b87d; margin-right: 5px"></div>
              <div style="width: 4px; height: 4px; background-color: #90d5b2; margin-right: 5px"></div>
              <div style="width: 4px; height: 4px; background-color: #c7ead7; margin-right: 5px"></div>
              <div style="width: 94%; height: 1px; background-color: #e9e9e9"></div>
            </div>
            <div class="get-content">
              <div v-if="node.id <= 12" class="set-content-container">
                <div class="set-input" style="width: 100%; height: 175px; justify-content: center; align-items: center">
                  <img src="@/assets/yonghu/0.png" alt="" style="width: auto; height: 75%" />
                  <span>暂无返回值...</span>
                </div>
              </div>
              <div v-else>
                <div class="set-content-container" v-if="node.label == '获取心跳上报间隔'">
                  <div class="set-input">
                    <span>心跳上报间隔(秒)</span>
                    <el-input v-model="params_get_tai.heartInterval"></el-input>
                  </div>
                </div>
                <div class="set-content-container" v-if="node.label === '获取网络参数'">
                  <div class="set-input">
                    <span>IP地址</span>
                    <el-input v-model="params_get_tai.wangluo.ip"></el-input>
                  </div>
                  <div class="set-input">
                    <span>端口号</span>
                    <el-input v-model="params_get_tai.wangluo.port"></el-input>
                  </div>
                </div>
                <div class="set-content-container" v-if="node.label === '获取心跳数据'">
                  <div class="set-input">
                    <span>电压(毫伏)</span>
                    <el-input v-model="params_get_tai.xintiaoshuju.dianya"></el-input>
                  </div>
                  <div class="set-input">
                    <span>IMSI</span>
                    <el-input v-model="params_get_tai.xintiaoshuju.imsi"></el-input>
                  </div>
                  <div class="set-input">
                    <span>蓝牙地址</span>
                    <el-input v-model="params_get_tai.xintiaoshuju.lanya"></el-input>
                  </div>
                  <div class="set-input" style="width: 100%">
                    <span>上传时间</span>
                    <div style="width: 100%; display: flex; justify-content: space-between">
                      <el-input style="margin-right: 10px" v-model="params_get_tai.xintiaoshuju.uploadtime.year" placeholder="年">年</el-input>
                      <el-input style="margin-right: 10px" v-model="params_get_tai.xintiaoshuju.uploadtime.month" placeholder="月">月</el-input>
                      <el-input style="margin-right: 10px" v-model="params_get_tai.xintiaoshuju.uploadtime.day" placeholder="日">日</el-input>
                      <el-input style="margin-right: 10px" v-model="params_get_tai.xintiaoshuju.uploadtime.hour" placeholder="时">时</el-input>
                      <el-input style="margin-right: 10px" v-model="params_get_tai.xintiaoshuju.uploadtime.minute" placeholder="分">分</el-input>
                      <el-input style="margin-right: 10px" v-model="params_get_tai.xintiaoshuju.uploadtime.second" placeholder="秒">秒</el-input>
                    </div>
                  </div>
                </div>
                <div class="set-content-container" v-if="node.label === '获取抄表配置'">
                  <div class="set-input">
                    <span>上传方式</span>
                    <el-input v-model="params_get_tai.chaobiaoPeizhi.way"></el-input>
                  </div>
                  <div class="set-input">
                    <span>抄数间隔（分钟）</span>
                    <el-input v-model="params_get_tai.chaobiaoPeizhi.chaobiaoMinuteay"></el-input>
                  </div>
                  <div class="set-input">
                    <span>上传间隔（小时）</span>
                    <el-input v-model="params_get_tai.chaobiaoPeizhi.uploadHour"></el-input>
                  </div>
                </div>
                <div class="set-content-container" v-if="node.label === '获取抄表数据'">
                  <div class="set-input">
                    <span>抄表数据个数</span>
                    <el-input v-model="params_get_tai.chaobiaodata.count"></el-input>
                  </div>
                  <div style="width: 100%" class="set-input" v-if="params_get_tai.chaobiaodata.count >= 1">
                    <span>第一次抄表时间</span>
                    <div style="width: 100%; display: flex; justify-content: space-between">
                      <el-input style="margin-right: 15px" v-model="params_get_tai.chaobiaodata.first.year"></el-input>
                      <el-input style="margin-right: 15px" v-model="params_get_tai.chaobiaodata.first.month"></el-input>
                      <el-input style="margin-right: 15px" v-model="params_get_tai.chaobiaodata.first.day"></el-input>
                      <el-input style="margin-right: 15px" v-model="params_get_tai.chaobiaodata.first.hour"></el-input>
                      <el-input style="margin-right: 15px" v-model="params_get_tai.chaobiaodata.first.minute"></el-input>
                      <el-input style="margin-right: 15px" v-model="params_get_tai.chaobiaodata.first.second"></el-input>
                    </div>
                    <div class="set-input">
                      <span>累计圈数</span>
                      <el-input v-model="params_get_tai.chaobiaodata.first.count"></el-input>
                    </div>
                    <div class="set-input">
                      <span>反转圈数</span>
                      <el-input v-model="params_get_tai.chaobiaodata.first.rollbackcount"></el-input>
                    </div>
                  </div>
                  <div style="width: 100%" class="set-input" v-if="params_get_tai.chaobiaodata.count >= 2">
                    <span>第二次抄表时间</span>
                    <div style="width: 100%; display: flex; justify-content: space-between">
                      <el-input style="margin-right: 15px" v-model="params_get_tai.chaobiaodata.second.year"></el-input>
                      <el-input style="margin-right: 15px" v-model="params_get_tai.chaobiaodata.second.month"></el-input>
                      <el-input style="margin-right: 15px" v-model="params_get_tai.chaobiaodata.second.day"></el-input>
                      <el-input style="margin-right: 15px" v-model="params_get_tai.chaobiaodata.second.hour"></el-input>
                      <el-input style="margin-right: 15px" v-model="params_get_tai.chaobiaodata.second.minute"></el-input>
                      <el-input style="margin-right: 15px" v-model="params_get_tai.chaobiaodata.second.second"></el-input>
                    </div>
                    <div class="set-input">
                      <span>累计圈数</span>
                      <el-input v-model="params_get_tai.chaobiaodata.second.count"></el-input>
                    </div>
                    <div class="set-input">
                      <span>反转圈数</span>
                      <el-input v-model="params_get_tai.chaobiaodata.second.rollbackcount"></el-input>
                    </div>
                  </div>
                </div>
                <div class="set-content-container" v-if="node.label === '获取阀门状态'">
                  <div class="set-input">
                    <span>阀门状态</span>
                    <el-input v-model="params_get_tai.famenstate"></el-input>
                  </div>
                </div>
                <div class="set-content-container" v-if="node.label === '获取本地时间'">
                  <div class="set-input" style="width: 100%">
                    <span>当前时间</span>
                    <div style="width: 100%; display: flex; justify-content: space-between">
                      <el-input style="margin-right: 10px" v-model="params_get_tai.localtime.year" placeholder="年"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_get_tai.localtime.month" placeholder="月"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_get_tai.localtime.day" placeholder="日"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_get_tai.localtime.hour" placeholder="时"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_get_tai.localtime.minute" placeholder="分"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_get_tai.localtime.second" placeholder="秒"></el-input>
                    </div>
                  </div>
                </div>
                <div class="set-content-container" v-if="node.label === '获取阀门维护配置'">
                  <div class="set-input">
                    <span>月洗阀次数</span>
                    <el-input v-model="params_set_tai.famenWeihu.count"></el-input>
                  </div>
                  <div style="width: 100%" class="set-input" v-if="params_get_tai.famenWeihu.count >= 1">
                    <span>第一次洗阀时间</span>
                    <div style="width: 100%; display: flex; justify-content: space-between">
                      <el-input style="margin-right: 15px" v-model="params_get_tai.famenWeihu.first.day" placeholder="日"></el-input>
                      <el-input style="margin-right: 15px" v-model="params_get_tai.famenWeihu.first.hour" placeholder="时"></el-input>
                      <el-input style="margin-right: 15px" v-model="params_get_tai.famenWeihu.first.minute" placeholder="分"></el-input>
                    </div>
                  </div>
                  <div style="width: 100%" class="set-input" v-if="params_get_tai.famenWeihu.count >= 2">
                    <span>第二次洗阀时间</span>
                    <div style="width: 100%; display: flex; justify-content: space-between">
                      <el-input style="margin-right: 15px" v-model="params_get_tai.famenWeihu.second.day" placeholder="日"></el-input>
                      <el-input style="margin-right: 15px" v-model="params_get_tai.famenWeihu.second.hour" placeholder="时"></el-input>
                      <el-input style="margin-right: 15px" v-model="params_get_tai.famenWeihu.second.minute" placeholder="分"></el-input>
                    </div>
                  </div>
                  <div style="width: 100%" class="set-input" v-if="params_get_tai.famenWeihu.count >= 3">
                    <span>第三次洗阀时间</span>
                    <div style="width: 100%; display: flex; justify-content: space-between">
                      <el-input style="margin-right: 15px" v-model="params_get_tai.famenWeihu.third.day" placeholder="日"></el-input>
                      <el-input style="margin-right: 15px" v-model="params_get_tai.famenWeihu.third.hour" placeholder="时"></el-input>
                      <el-input style="margin-right: 15px" v-model="params_get_tai.famenWeihu.third.minute" placeholder="分"></el-input>
                    </div>
                  </div>
                  <div style="width: 100%" class="set-input" v-if="params_get_tai.famenWeihu.count >= 4">
                    <span>第四次洗阀时间</span>
                    <div style="width: 100%; display: flex; justify-content: space-between">
                      <el-input style="margin-right: 15px" v-model="params_get_tai.famenWeihu.fourth.day" placeholder="日"></el-input>
                      <el-input style="margin-right: 15px" v-model="params_get_tai.famenWeihu.fourth.hour" placeholder="时"></el-input>
                      <el-input style="margin-right: 15px" v-model="params_get_tai.famenWeihu.fourth.minute" placeholder="分"></el-input>
                    </div>
                  </div>
                </div>
                <div class="set-content-container" v-if="node.label === '获取设备状态'">
                  <div class="set-input">
                    <span>重启次数：</span>
                    <el-input v-model="params_get_tai.reboot"></el-input>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="btns">
            <div class="confirm-btn" @click="commit_taiyangneng">
              <el-icon style="margin-left: 15%"><Check /></el-icon>
              <span style="font-size: 16px; margin-left: 15%">确认</span>
            </div>
            <div class="cancel-btn" @click="closeCommandDialog">
              <el-icon style="margin-left: 15%; color: #45ba7e"><Close /></el-icon>
              <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">取消</span>
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
      command_taiyangneng_data: [
        {
          id: 1,
          value: 1,
          label: "下发控制命令",
          children: [
            // {
            //   id: 3,
            //   value: 3,
            //   label: "设置心跳上报间隔",
            // },
            // {
            //   id: 4,
            //   value: 4,
            //   label: "设置网络参数",
            // },
            // {
            //   id: 5,
            //   value: 5,
            //   label: "设置抄表配置",
            // },
            // {
            //   id: 6,
            //   value: 6,
            //   label: "设置阀门维护配置",
            // },
            // {
            //   id: 7,
            //   value: 7,
            //   label: "设置水表配置",
            // },
            // {
            //   id: 8,
            //   value: 8,
            //   label: "设置读数",
            // },
            {
              id: 9,
              value: 9,
              label: "阀门控制",
            },
            // {
            //   id: 10,
            //   value: 10,
            //   label: "校时",
            // },
            // {
            //   id: 11,
            //   value: 11,
            //   label: "设置关阀圈数",
            // },
            // {
            //   id: 12,
            //   value: 12,
            //   label: "设备还原",
            // },
          ],
        },
        //{
        //   id: 2,
        //   value: 2,
        //   label: "下发获取命令",
        //   children: [
        //     {
        //       id: 13,
        //       value: 13,
        //       label: "获取心跳上报间隔",
        //     },
        //     {
        //       id: 14,
        //       value: 14,
        //       label: "获取网络参数",
        //     },
        //     {
        //       id: 15,
        //       value: 15,
        //       label: "获取心跳数据",
        //     },
        //     {
        //       id: 16,
        //       value: 16,
        //       label: "获取抄表配置",
        //     },
        //     {
        //       id: 17,
        //       value: 17,
        //       label: "获取抄表数据",
        //     },
        //     {
        //       id: 18,
        //       value: 18,
        //       label: "获取阀门状态",
        //     },
        //     {
        //       id: 19,
        //       value: 19,
        //       label: "获取本地时间",
        //     },
        //     {
        //       id: 20,
        //       value: 20,
        //       label: "获取阀门维护配置",
        //     },
        //     {
        //       id: 21,
        //       value: 21,
        //       label: "获取设备状态",
        //     },
        //   ],
        // },
      ],
      params_set_tai: {
        heartInterval: null,
        wangluo: {
          ip: "",
          port: "",
        },
        chaobiaoPeizhi: {
          way: "",
          chaobiaoHour: null,
          chaobiaoMinute: null,
          uploadDate: null,
          uploadHour: null,
        },
        famenWeihu: {
          count: "",
          first: {
            day: "",
            hour: "",
            minute: "",
          },
          second: {
            day: "",
            hour: "",
            minute: "",
          },
          third: {
            day: "",
            hour: "",
            minute: "",
          },
          fourth: {
            day: "",
            hour: "",
            minute: "",
          },
        },
        beilv: "",
        count: null,
        famenstate: "",
        jiaoshi: {
          year: "",
          month: "",
          day: "",
          hour: "",
          minute: "",
          second: "",
        },
        guanfa: {
          count: "",
          xiliehao: "",
        },
      },
      params_get_tai: {
        heartInterval: "",
        wangluo: {
          ip: "",
          port: "",
        },
        xintiaoshuju: {
          dianya: "",
          imsi: "",
          lanya: "",
          uploadtime: {
            year: "",
            month: "",
            day: "",
            hour: "",
            minute: "",
            second: "",
          },
        },
        chaobiaoPeizhi: {
          way: "",
          chaobiaoMinute: "",
          uploadHour: "",
        },
        chaobiaodata: {
          count: "",
          first: {
            year: "",
            month: "",
            day: "",
            hour: "",
            minute: "",
            second: "",
            count: "",
            rollbackcount: "",
          },
          second: { year: "", month: "", day: "", hour: "", minute: "", second: "", count: "", rollbackcount: "" },
        },
        famenstate: "",
        localtime: {
          year: "",
          month: "",
          day: "",
          hour: "",
          minute: "",
          second: "",
        },
        famenWeihu: {
          count: "",
          first: {
            day: "",
            hour: "",
            minute: "",
          },
          second: {
            day: "",
            hour: "",
            minute: "",
          },
          third: {
            day: "",
            hour: "",
            minute: "",
          },
          fourth: {
            day: "",
            hour: "",
            minute: "",
          },
        },
        reboot: "",
      },
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
    commit_taiyangneng() {
      if (this.node.label === "设置心跳上报间隔") {
        const imei = this.data.imei;
        const formData = new FormData();
        const intervalValue = parseInt(this.params_set_tai.heartInterval, 10);
        console.log("intervalValue:", intervalValue);
        formData.append("imei", imei);
        formData.append("interval", intervalValue);
        service
          .post("/solarEnergy/waterMeterSetBeatInterval80H", formData)
          .then((response) => {
            if (response.code === 200) {
              ElMessage.success("设置心跳上报间隔成功");
            } else {
              ElMessage.error(response.msg);
            }
          })
          .catch((error) => {
            ElMessage.error(error);
          });
      } else if (this.node.label === "设置网络参数") {
        ElMessage.error("暂未开通");
      } else if (this.node.label === "设置抄表配置") {
        const imei = this.data.imei;
        const uploadForm = this.params_set_tai.chaobiaoPeizhi.way;
        const readHour = this.params_set_tai.chaobiaoPeizhi.chaobiaoHour;
        const readMinute = this.params_set_tai.chaobiaoPeizhi.chaobiaoMinute;
        const uploadDay = this.params_set_tai.chaobiaoPeizhi.uploadDate;
        const uploadHour = this.params_set_tai.chaobiaoPeizhi.uploadHour;
        if (uploadForm === "") {
          ElMessage.error("请设置上传方式");
          return;
        }
        if (readHour === null || readMinute === null) {
          ElMessage.error("请设置抄表时间");
          return;
        }
        if (uploadDay === null || uploadHour === null) {
          ElMessage.error("请设置上传时间");
          return;
        }
        service
          .get(`/command/solarEnergy/solarEnergySetReadConfig?imei=${imei}&uploadForm=${uploadForm}&readHour=${readHour}&readMinute=${readMinute}&uploadDay=${uploadDay}&uploadHour=${uploadHour}`)
          .then((response) => {
            if (response.code === 200) {
              ElMessage.success("设置抄表配置成功");
            } else {
              ElMessage.error(response.msg);
            }
          })
          .catch((error) => {
            ElMessage.error(error);
          });
      } else if (this.node.label === "设置阀门维护配置") {
        const imei = this.data.imei;
        const washingFrequency = this.params_set_tai.famenWeihu.count;
        if (washingFrequency === "") {
          ElMessage.error("请设置阀门维护次数");
          return;
        }
        // 构建请求参数对象
        const requestData = {
          imei: imei,
          washingFrequency: washingFrequency,
        };
        // 根据维护次数添加对应的时间设置
        if (washingFrequency >= 1) {
          requestData.firstWashingTime = {
            day: this.params_set_tai.famenWeihu.first.day,
            hour: this.params_set_tai.famenWeihu.first.hour,
            minute: this.params_set_tai.famenWeihu.first.minute,
          };
          requestData.secondWashingTime = {
            day: 0,
            hour: 0,
            minute: 0,
          };
          requestData.thirdWashingTime = {
            day: 0,
            hour: 0,
            minute: 0,
          };
          requestData.fourthWashingTime = {
            day: 0,
            hour: 0,
            minute: 0,
          };
        }
        if (washingFrequency >= 2) {
          requestData.secondWashingTime = {
            day: this.params_set_tai.famenWeihu.second.day,
            hour: this.params_set_tai.famenWeihu.second.hour,
            minute: this.params_set_tai.famenWeihu.second.minute,
          };
          requestData.thirdWashingTime = {
            day: 0,
            hour: 0,
            minute: 0,
          };
          requestData.fourthWashingTime = {
            day: 0,
            hour: 0,
            minute: 0,
          };
        }
        if (washingFrequency >= 3) {
          requestData.thirdWashingTime = {
            day: this.params_set_tai.famenWeihu.third.day,
            hour: this.params_set_tai.famenWeihu.third.hour,
            minute: this.params_set_tai.famenWeihu.third.minute,
          };
          requestData.fourthWashingTime = {
            day: 0,
            hour: 0,
            minute: 0,
          };
        }
        if (washingFrequency >= 4) {
          requestData.fourthWashingTime = {
            day: this.params_set_tai.famenWeihu.fourth.day,
            hour: this.params_set_tai.famenWeihu.fourth.hour,
            minute: this.params_set_tai.famenWeihu.fourth.minute,
          };
        }
        if (requestData.washingFrequency == null) {
          ElMessage.error("请设置阀门维护次数");
          return;
        }
        if (requestData.firstWashingTime.day === "" || requestData.firstWashingTime.hour === "" || requestData.firstWashingTime.minute === "") {
          ElMessage.error("请设置第一次阀门维护时间");
          return;
        }
        if (requestData.secondWashingTime.day === "" || requestData.secondWashingTime.hour === "" || requestData.secondWashingTime.minute === "") {
          ElMessage.error("请设置第二次阀门维护时间");
          return;
        }
        if (requestData.thirdWashingTime.day === "" || requestData.thirdWashingTime.hour === "" || requestData.thirdWashingTime.minute === "") {
          ElMessage.error("请设置第三次阀门维护时间");
          return;
        }
        if (requestData.fourthWashingTime.day === "" || requestData.fourthWashingTime.hour === "" || requestData.fourthWashingTime.minute === "") {
          ElMessage.error("请设置第四次阀门维护时间");
          return;
        }
        service
          .post("/command/solarEnergy/solarEnergySetMaintenance", requestData)
          .then((response) => {
            if (response.code === 200) {
              ElMessage.success("设置阀门维护配置成功");
            } else {
              ElMessage.error(response.msg);
            }
          })
          .catch((error) => {
            ElMessage.error(error);
          });
      } else if (this.node.label === "设置水表配置") {
        const imei = this.data.imei;
        const multiplier = this.params_set_tai.beilv;
        if (multiplier === "") {
          ElMessage.error("请设置水表倍数");
          return;
        }
        service
          .get(`/command/solarEnergy/solarEnergySetMultiplier?imei=${imei}&multiplier=${multiplier}`)
          .then((response) => {
            if (response.code === 200) {
              ElMessage.success("设置水表配置成功");
            } else {
              ElMessage.error(response.msg);
            }
          })
          .catch((error) => {
            ElMessage.error(error);
          });
      } else if (this.node.label === "设置读数") {
        const imei = this.data.imei;
        const read_count = this.params_set_tai.count;
        if (read_count === null) {
          ElMessage.error("请设置读数");
          return;
        }
        service
          .get(`/command/solarEnergy/solarEnergySetReadCount?imei=${imei}&count=${read_count}`)
          .then((response) => {
            if (response.code === 200) {
              ElMessage.success("设置读数成功");
            } else {
              ElMessage.error(response.msg);
            }
          })
          .catch((error) => {
            ElMessage.error(error);
          });
      } else if (this.node.label === "阀门控制") {
        const imei = this.data.imei;
        if (this.params_set_tai.famenstate === "") {
          ElMessage.error("请设置阀门状态");
          return;
        }
        const status = this.params_set_tai.famenstate;

        service
          .get(`/command/solarEnergy/solarEnergyValveCommand?imei=${imei}&status=${status}`)
          .then((response) => {
            if (response.code === 200) {
              ElMessage.success("设置阀门状态成功");
            } else {
              ElMessage.error(response.msg);
            }
          })
          .catch((error) => {
            ElMessage.error(error);
          });
      } else if (this.node.label === "校时") {
        const imei = this.data.imei;
        // 从params_set_tai.jiaoshi对象中获取各时间参数
        const { year, month, day, hour, minute, second } = this.params_set_tai.jiaoshi;
        if (year === "" || month === "" || day === "" || hour === "" || minute === "" || second === "") {
          ElMessage.error("所有的参数均不能为空！");
          return;
        }
        // 调用格式化函数
        const time = this.formatDateTime(year, month, day, hour, minute, second);
        service
          .get(`/command/solarEnergy/solarEnergySetCalibrationTime?imei=${imei}&time=${time}`)
          .then((response) => {
            if (response.code === 200) {
              ElMessage.success("设置校时成功");
            } else {
              ElMessage.error(response.msg);
            }
          })
          .catch((error) => {
            ElMessage.error(error);
          });
      } else if (this.node.label === "设置关阀圈数") {
        const imei = this.data.imei;
        const count = this.params_set_tai.guanfa.count;
        const order_number = this.params_set_tai.guanfa.xiliehao;
        if (count === "" || order_number === "") {
          ElMessage.error("所有的参数均不能为空！");
          return;
        }
        service
          .get(`/command/solarEnergy/solarEnergySetCloseCycle?imei=${imei}&closeCircle=${count}&serialNumber=${order_number}`)
          .then((response) => {
            if (response.code === 200) {
              ElMessage.success("设置关阀圈数成功");
            } else {
              ElMessage.error(response.msg);
            }
          })
          .catch((error) => {
            ElMessage.error(error);
          });
      } else if (this.node.label === "设备还原") {
        const imei = this.data.imei;
        service
          .get(`/command/solarEnergy/solarEnergyReSetDevice?imei=${imei}`)
          .then((response) => {
            if (response.code === 200) {
              ElMessage.success("设备还原成功");
            } else {
              ElMessage.error(response.msg);
            }
          })
          .catch((error) => {
            ElMessage.error(error);
          });
      } else if (this.node.label === "获取心跳上报间隔") {
        const imei = this.data.imei;
        const formData1 = new FormData();
        const formData2 = new FormData();
        formData1.append("imei", imei);
        formData1.append("command_type", 1);
        formData2.append("imei", imei);
        service
          .post("/solarEnergy/waterMeterGetGeneralCommand", formData1)
          .then((response) => {
            if (response.code === 200) {
              ElMessage.success("获取心跳上报间隔成功");
            } else {
              ElMessage.error(response.msg);
            }
          })
          .catch((error) => {
            ElMessage.error(error);
          });
        service.post("/solarEnergy/waterMeterGetBeatInterval00H", formData2).then((response) => {
          if (response.code === 200) {
            ElMessage.success("获取心跳上报间隔成功");
            this.params_get_tai.heartInterval = response.data[0].intervalSecs;
            //this.params_get_tai.heartInterval = 1;
            console.log(this.params_get_tai.heartInterval);
          } else {
            ElMessage.error(response.msg);
          }
        }); // .catch((error) => {
        //   ElMessage.error(error);
        // });
      } else if (this.node.label === "获取网络参数") {
        ElMessage.error("暂未开通");
      } else if (this.node.label === "获取心跳数据") {
        const imei = this.data.imei;
        const formData1 = new FormData();
        const formData2 = new FormData();
        formData1.append("imei", imei);
        formData1.append("command_type", 3);
        formData2.append("imei", imei);
        service
          .post("/solarEnergy/waterMeterGetGeneralCommand", formData1)
          .then((response) => {
            if (response.code === 200) {
              ElMessage.success("获取心跳数据成功");
            } else {
              ElMessage.error(response.msg);
            }
          })
          .catch((error) => {
            ElMessage.error(error);
          });

        service.post("/solarEnergy/waterMeterGetBeatData06H", formData2).then((response) => {
          if (response.code === 200) {
            ElMessage.success("获取心跳数据成功");
            this.params_get_tai.xintiaoshuju.dianya = response.data[0].batteryVoltage;
            this.params_get_tai.xintiaoshuju.lanya = response.data[0].bluetoothAddress;
          } else {
            ElMessage.error(response.msg);
          }
        });
        // .catch((error) => {
        //   ElMessage.error(error);
        // });
      } else if (this.node.label === "获取抄表配置") {
        ElMessage.error("暂未开通");
      } else if (this.node.label === "获取抄表数据") {
        ElMessage.error("暂未开通");
      } else if (this.node.label === "获取阀门状态") {
        const imei = this.data.imei;
        const formData1 = new FormData();
        const formData2 = new FormData();
        formData1.append("imei", imei);
        formData1.append("command_type", 6);
        formData2.append("imei", imei);
        service.post("/solarEnergy/waterMeterGetGeneralCommand", formData1).then((response) => {
          if (response.code === 200) {
            ElMessage.success("获取阀门状态成功");
          } else {
            ElMessage.error(response.msg);
          }
        });
        // .catch((error) => {
        //   ElMessage.error(error);
        // });
        service.post("/solarEnergy/waterMeterGetOpenClose0EH", formData2).then((response) => {
          if (response.code === 200) {
            ElMessage.success("获取阀门状态成功");
            this.params_get_tai.famenstate = response.data[0].valveStatus;
          } else {
            ElMessage.error(response.msg);
          }
        });
        // .catch((error) => {
        //   ElMessage.error(error);
        // });
      } else if (this.node.label === "获取本地时间") {
        ElMessage.error("暂未开通");
      } else if (this.node.label === "获取阀门维护配置") {
        ElMessage.error("暂未开通");
      } else if (this.node.label === "获取设备状态") {
        ElMessage.error("暂未开通");
      }
    },
  },
};
</script>

<style>
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
  padding: 5px;
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
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 31.5%;
  height: 75px;
  margin-right: 10px;
}

.set-input > span {
  font-size: 14px;
  color: #747374;
  margin-bottom: 5px;
}

.set-input > .el-input {
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
    > .el-tree-node__content {
      background-color: var(--el-tree-node-hover-bg-color);
      color: white;
    }
  }
}
</style>
