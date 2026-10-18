import service from "@/api/request";

async function query(url, data, signal) {
  const response = await service({ method: "post", url, data, signal, timeout: 15000, skipAutoMsg: true,
    ...(process.env.VUE_APP_MAP_READONLY_API_BASE ? { baseURL: process.env.VUE_APP_MAP_READONLY_API_BASE } : {}) });
  if (Number(response.code) !== 200) throw new Error(response.msg || "轨迹查询失败");
  return response.data;
}
export const trackApi = {
  async staff(companyId, signal) {
    if (!Number.isSafeInteger(Number(companyId)) || Number(companyId) <= 0) throw new Error("登录信息缺少所属公司");
    const data = await query("/staff/queryStaff", { pageNo: 1, pageSize: 1000, companyId: Number(companyId) === 1 ? null : Number(companyId),
      account: null, staffName: null, staffPostsId: null, staffCharacterId: null }, signal);
    if (!Array.isArray(data?.records)) throw new Error("人员响应格式异常");
    return data.records;
  },
  async tracks(data, signal) {
    const records = await query("/getUserTrack", data, signal);
    if (!Array.isArray(records)) throw new Error("轨迹响应格式异常");
    return records;
  },
  async sources(signal) {
    const response = await fetch(`${process.env.BASE_URL}map-config/track-coordinate-sources.json`, { signal, cache: "no-store" });
    if (!response.ok) throw new Error("轨迹来源登记加载失败");
    const data = await response.json();
    if (data?.version !== 1 || !data.tracks || typeof data.tracks !== "object" || Array.isArray(data.tracks)) throw new Error("轨迹来源登记格式异常");
    return data;
  },
};
