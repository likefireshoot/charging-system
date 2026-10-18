import service from "@/api/request";

/**
 * 蓝牙卡表（35D2）后台接口
 *
 * 蓝牙卡表不具备远传功能，充值必须现场通过手机蓝牙写入表端。
 * 本模块在「收费」与「写表」之间增加指令/回执机制：
 *   收费仍写入 recharge_record（账务只有一套），同时生成待写表任务，
 *   由手机蓝牙端现场写表后回写结果。
 */

// ==================== 档案 ====================

/** 分页查询蓝牙卡表档案 */
export function queryBtMeter(params) {
  return service.post("/btMeter/query", params);
}

/** 新增/编辑蓝牙卡表档案 */
export function saveBtMeter(params) {
  return service.post("/btMeter/save", params);
}

/** 删除蓝牙卡表档案 */
export function deleteBtMeter(params) {
  return service.post("/btMeter/delete", params);
}

/** 档案详情 */
export function getBtMeterDetail(meterCode) {
  return service.get(`/btMeter/detail/${meterCode}`);
}

// ==================== 充值 / 阀控 ====================

/** 充值收费并生成写表任务 */
export function recharge(params) {
  return service.post("/btMeter/recharge", params);
}

/** 下发阀控任务：0 强制开阀，1 强制关阀，2 取消强制 */
export function valve(params) {
  return service.post("/btMeter/valve", params);
}

/** 下发清零任务：将表恢复为出厂状态（开户前必做） */
export function zero(params) {
  return service.post("/btMeter/zero", params);
}

/** 下发校时任务：同步表内时钟（开户前必做） */
export function clock(params) {
  return service.post("/btMeter/clock", params);
}

/** 下发设置任务：费率/报警/保底参数（开户前必做） */
export function setting(params) {
  return service.post("/btMeter/setting", params);
}

/** 开户指令：清零/校时/设置之后执行，且只能一次（含用户号，支持纯开户） */
export function openAccount(params) {
  return service.post("/btMeter/open", params);
}

// ==================== 写表任务 ====================

/** 分页查询写表任务 */
export function queryTask(params) {
  return service.post("/btMeter/task/query", params);
}

/** 作废写表任务 */
export function cancelTask(taskId, operateStaff) {
  return service.post(
    "/btMeter/task/cancel",
    {},
    { params: { taskId, operateStaff } }
  );
}

// ==================== 回执 / 统计 ====================

/** 查询表端回执 */
export function queryReceipt(params) {
  return service.get("/btMeter/receipt/query", { params });
}

/** 概览统计 */
export function getBtStat(companyId) {
  return service.get("/btMeter/stat", { params: { companyId } });
}

// ==================== JetsonHardNX 表厂 API 联调 ====================

/** 查看表厂 API 配置状态（不暴露密钥） */
export function getJetsonStatus() {
  return service.get("/btMeter/jetson/status");
}

/** 测试表厂 API 认证是否通过 */
export function testJetsonAuth() {
  return service.post("/btMeter/jetson/testAuth", {});
}

/** 解析蓝牙广播数据 */
export function parseBroadcast(hex) {
  return service.get("/btMeter/jetson/parseBroadcast", { params: { hex } });
}

/** 解析水表上报命令 */
export function parseCommand(hex) {
  return service.get("/btMeter/jetson/parseCommand", { params: { hex } });
}

/** 生成阀门控制命令 */
export function buildValve(valveType, addr) {
  return service.get("/btMeter/jetson/buildValve", {
    params: { valveType, addr },
  });
}

/** 生成 NB 写卡数据（蓝牙充值组帧） */
export function buildNbWrite(params) {
  return service.post("/btMeter/jetson/buildNbWrite", params);
}

// ==================== 抄表任务（读表任务） ====================
// BtReadTaskVO.status：0 待读 / 1 已读 / 2 失败 / 9 作废

/** 创建抄表任务 */
export function createReadTask(params) {
  return service.post("/btMeter/readTask/create", params);
}

/** 分页查询抄表任务 */
export function queryReadTask(params) {
  return service.post("/btMeter/readTask/query", params);
}

/** 取消抄表任务 */
export function cancelReadTask(taskId, operateStaff) {
  return service.post(
    "/btMeter/readTask/cancel",
    {},
    { params: { taskId, operateStaff } }
  );
}

/** 重置抄表任务为待读 */
export function resetReadTask(taskId, operateStaff) {
  return service.post(
    "/btMeter/readTask/reset",
    {},
    { params: { taskId, operateStaff } }
  );
}

/** 重置写表任务为待写表 */
export function resetTask(taskId, operateStaff) {
  return service.post(
    "/btMeter/task/reset",
    {},
    { params: { taskId, operateStaff } }
  );
}
