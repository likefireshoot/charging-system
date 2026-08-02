export function getPipeColor(diameter) {
  if (!diameter) return "#e49c16ff"; // 默认颜色

  if ((diameter == 50)) return "#4caf50"; // 红色：大口径
  if ((diameter == 100)) return "#2196f3"; // 橙色
  if ((diameter == 150)) return "#d32f2f"; // 绿色
  return "#4caf50"; // 绿色：小管径
}


// 根据类型，返回阀门的类型
export function getValveType(type) {
  if (type == 1) return "进水阀";
  if (type == 2) return "放空阀";
  if (type == 3) return "落水阀";
  return "未知类型";
}
