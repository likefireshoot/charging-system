import service from "@/api/request";
import { readonlyApi } from "./readonlyApi";

async function write(action, data) {
  let response;
  try {
    response = await service({ method: "post", url: `/map-pipe/${action}`, data, timeout: 15000, skipAutoMsg: true,
      ...(process.env.VUE_APP_MAP_READONLY_API_BASE ? { baseURL: process.env.VUE_APP_MAP_READONLY_API_BASE } : {}) });
  } catch (error) {
    if (error.response?.status === 404) throw new Error("后端缺少地图管线接口，请重新构建并启动包含 MapPipeWriteController 的后端");
    // The shared service rejects business errors as plain Error objects without
    // response. Only transport failures can mean a lost acknowledgement.
    if ((error.isAxiosError && !error.response) || error.response?.status >= 500) error.uncertain = true;
    throw error;
  }
  if (Number(response.code) !== 200) throw new Error(response.msg || "管线保存失败");
  return response.data;
}
export const pipeApi = { ...readonlyApi, add: data => write("add", data), revise: data => write("update", data), remove: data => write("delete", data) };
