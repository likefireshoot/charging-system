import service from "@/api/request";
import { ElMessage } from "element-plus";

export function editCompanyStatus(companyId) {
  return service({
    url: "/editCompanyStatus",
    method: "get",
    data: { companyId },
  });
}

function getValidFileName(fileName) {
  return (fileName || "图表数据").replace(/[\\/:*?"<>|]/g, "_");
}

function getValidSheetName(sheetName) {
  return getValidFileName(sheetName).slice(0, 31) || "图表数据";
}

function normalizeAxisOption(xAxis) {
  if (Array.isArray(xAxis)) {
    return xAxis.find((item) => Array.isArray(item?.data) && item.data.length) || xAxis[0] || {};
  }
  return xAxis || {};
}

function normalizeLegendData(legend) {
  if (Array.isArray(legend)) {
    return legend.flatMap((item) => (Array.isArray(item?.data) ? item.data : []));
  }
  return Array.isArray(legend?.data) ? legend.data : [];
}

function normalizeCellValue(value) {
  if (value && typeof value === "object") {
    if (value.value !== undefined) {
      return value.value;
    }
    if (value.name !== undefined) {
      return value.name;
    }
  }
  return value ?? "";
}

function buildChartTableRows(option, fileName) {
  const xAxisOption = normalizeAxisOption(option?.xAxis);
  const xAxisData = Array.isArray(xAxisOption?.data) ? xAxisOption.data : [];
  const seriesList = Array.isArray(option?.series) ? option.series : [];
  const legendData = normalizeLegendData(option?.legend);
  const maxRowCount = Math.max(
    xAxisData.length,
    ...seriesList.map((series) => (Array.isArray(series?.data) ? series.data.length : 0))
  );

  const timeColumnName = xAxisData.length ? (xAxisOption?.name || "时间") : "序号";
  const seriesHeaders = seriesList.map((series, index) => {
    if (series?.name) {
      return series.name;
    }
    if (legendData[index]) {
      return legendData[index];
    }
    if (seriesList.length === 1) {
      return fileName || "数据";
    }
    return `${fileName || "图表数据"}${index + 1}`;
  });
  const rows = [[timeColumnName, ...seriesHeaders]];

  for (let rowIndex = 0; rowIndex < maxRowCount; rowIndex += 1) {
    const axisValue = xAxisData[rowIndex] ?? rowIndex + 1;
    const row = [normalizeCellValue(axisValue)];

    seriesList.forEach((series) => {
      const seriesData = Array.isArray(series?.data) ? series.data : [];
      row.push(normalizeCellValue(seriesData[rowIndex]));
    });

    rows.push(row);
  }

  return rows;
}

export async function exportChartExcel(chart, fileName = "图表数据") {
  if (!chart || typeof chart.getOption !== "function") {
    ElMessage.error("图表尚未初始化");
    return;
  }

  const option = chart.getOption();
  const rows = buildChartTableRows(option, fileName);

  if (rows.length <= 1 || rows[0].length <= 1) {
    ElMessage.warning("当前图表暂无可导出的数据");
    return;
  }

  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  worksheet["!cols"] = rows[0].map((_, columnIndex) => {
    const columnWidth = rows.reduce((maxWidth, row) => {
      const cellValue = row[columnIndex] == null ? "" : String(row[columnIndex]);
      return Math.max(maxWidth, cellValue.length);
    }, 10);

    return {
      wch: Math.min(columnWidth + 2, 30),
    };
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, getValidSheetName(fileName));
  XLSX.writeFile(workbook, `${getValidFileName(fileName)}.xlsx`);
}

export const exportYearChartPNG = exportChartExcel;
