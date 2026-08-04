import { reactive } from "vue";

// 本地开发调试开关：
//   showMeter = true  => 强制按 92 端口(抄表系统)显示
//   showCharge = true => 强制按 93 端口(收费系统)显示
// 两个都 false => 按真实访问端口判断（本地 8080 全显示）
// 切换效果只需改下面两行 true/false，无需注释代码
export const portSwitch = reactive({
  showMeter: true, // 开关A：显示92端口界面
  showCharge: false, // 开关B：显示93端口界面
});

export function getEffectivePort() {
  if (portSwitch.showMeter) return "92";
  if (portSwitch.showCharge) return "93";
  return window.location.port;
}
