import service from "@/api/request";

// 查询价格管理列表
export function queryPriceMg(params) {
  return service({
    url: "/price/queryPriceMg",
    method: "post",
    data: params
  });
}
