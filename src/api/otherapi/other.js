import service from "@/api/request"; // 这里填写你 service 的路径

// 编辑公司状态（正常 <-> 停用）
export function editCompanyStatus(companyId) {
 
  return service({
    url: "/editCompanyStatus",
    method: "get",
    data: { "companyId":companyId }
  });
}
