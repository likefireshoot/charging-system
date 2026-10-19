import service from "@/api/request";

// Reuse the existing Authorization and 401 handling. A preview build can explicitly
// choose a local API without changing the production API used by other pages.
async function query(method, url, data) {
  const response = await service({ method, url, data, timeout: 15000,
    ...(process.env.VUE_APP_MAP_READONLY_API_BASE ? { baseURL: process.env.VUE_APP_MAP_READONLY_API_BASE } : {}) });
  if (Number(response.code) !== 200) throw new Error(response.msg || "查询失败");
  return response.data;
}
export const readonlyApi = {
  async regions(companyId) {
    const id = Number(companyId);
    if (!Number.isInteger(id) || id <= 0) throw new Error("登录信息缺少所属公司，请重新登录");
    const data = await query("get", "/device_display/getAllTown", id === 1 ? {} : { companyId: id });
    if (!Array.isArray(data)) throw new Error("区域响应格式异常");
    return data;
  },
  async devices(regionId) {
    const data = await query("post", "/device_display", { city_town: regionId, pointTypes: [] });
    if (!Array.isArray(data)) throw new Error("设备响应格式异常");
    return data;
  },
  async pipes(regionId) {
    const data = await query("get", "/DBAllDataGet", { city_town: regionId });
    if (data?.type !== "FeatureCollection" || !Array.isArray(data.features)) throw new Error("管线响应格式异常");
    return data.features;
  },
  async search(name) {
    const data = await query("post", "/device_display/getDevice", { name });
    if (!Array.isArray(data)) throw new Error("名称查询响应格式异常");
    return data;
  },
};
