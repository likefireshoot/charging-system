import service from "@/api/request";
import { readonlyApi } from "./readonlyApi";

async function write(url, data) {
  let response;
  try {
    response = await service({ method: "post", url, data, timeout: 15000, skipAutoMsg: true,
      ...(process.env.VUE_APP_MAP_READONLY_API_BASE ? { baseURL: process.env.VUE_APP_MAP_READONLY_API_BASE } : {}) });
  } catch (error) {
    if (url === "/device_display/map-add" && error.response?.status === 404)
      throw new Error("后端缺少地图设备接口，请重新构建并启动包含 MapDeviceWriteController 的后端");
    throw error;
  }
  if (Number(response.code) !== 200) throw new Error(response.msg || "设备保存失败");
  return response.data;
}
export const deviceApi = {
  ...readonlyApi,
  add: data => write("/device_display/map-add", data),
  revise: data => write("/device_display/revice", data),
  remove: id => write("/device_display/delDevicePoint", { devicePointIds: [id] }),
};
