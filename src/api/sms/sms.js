import service from "@/api/request";

// 获取短信配置详情
export function getSmsConfigDetail(smsConfigId) {
  return service({
    url: `/sms/getSmsConfigDetail/${smsConfigId}`,
    method: "get"
  });
}
