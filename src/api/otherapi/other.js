import service from "@/api/request"; // 这里填写你 service 的路径

// 编辑公司状态（正常 <-> 停用）
export function editCompanyStatus(companyId) {

  return service({
    url: "/editCompanyStatus",
    method: "get",
    data: { "companyId": companyId }
  });
}


export function exportYearChartPNG(chart, pngName) {
  console.log("fajdlfjaldfjaldfjkal")
  if (!chart) {
    this.$message.error("图表还未初始化");
    return;
  }
  const img = chart.getDataURL({
    type: "png",
    backgroundColor: "#fff",
  });
  const a = document.createElement("a");
  a.href = img;
  a.download = pngName + ".png";
  a.click();
}