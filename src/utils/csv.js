/**
 * 前端 CSV 导出（P1-8）。
 * 不依赖后端导出端点，直接把当前列表数据导出为带 BOM 的 CSV（Excel 中文不乱码）。
 *
 * @param {string} filename 文件名（不带扩展名）
 * @param {Array<{label:string, prop:string|function}>} columns 列定义
 * @param {Array<object>} rows 数据行
 */
export function exportToCsv(filename, columns, rows) {
  const escape = (v) => {
    if (v == null) return "";
    const s = String(v);
    if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const headerLine = columns.map((c) => escape(c.label)).join(",");
  const dataLines = rows.map((row) =>
    columns
      .map((c) => escape(typeof c.prop === "function" ? c.prop(row) : row[c.prop]))
      .join(",")
  );
  const csv = "﻿" + [headerLine, ...dataLines].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
