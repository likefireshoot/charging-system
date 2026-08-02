import { getValveType } from "@/api/map/map";
let markerTxt = {
  pointTxt(data, checkMarket) {
    let exception = "";

    if (data.exception == 0) {
      exception = `<div class="item"><h2>状态：</h2><p>正常</p></div>`;
    }
    if (data.exception == 1) {
      exception = `<div class="item"><h2>状态：</h2><p class="red">异常</p></div>`;
    }

    let stateDom = "";
    let closeDom = "";
    //压力计
    if (data.pointType == 0) {
      stateDom = `<div class="stateCard"><div class="item"><h2>压力值：</h2><p>${data.externInfo ? data.externInfo.pressure || 0 : 0}MPa</p></div></div>`;
    }
    //阀门
    if (data.pointType == 1) {
      if (data.externInfo) {
        let valveType = getValveType(data.externInfo.type || "");
        if (data.externInfo.status == "开") {
          stateDom = `<div class="stateCard">
            <div class="item"><h2>阀门：</h2><p>开阀</p></div>
            <div class="item"><h2>类型：</h2><p>${valveType}</p></div>
            <div class="item"><h2>口径：</h2><p>${data.externInfo.caliber || 0}</p></div>
            </div>`;
        } else {
          stateDom = `<div class="stateCard"><div class="item"><h2>阀门：</h2><img  class="exception" src="fault/close.svg"><p>关阀</p></div>
            <div class="item"><h2>类型：</h2><p>${valveType}</p></div>
            <div class="item"><h2>口径：</h2><p>${data.externInfo.caliber || 0}</p></div>
            </div>`;
          closeDom = `<img  class="exception" src="fault/close.svg"></img>`;
        }
      }
    }
    if (data.pointType == 7) {
      stateDom = `<div class="stateCard"><div class="item"><h2>深度：</h2><p>${data.externInfo ? data.externInfo.depth || 0 : 0}米</p></div>`;
    }
    //水泵
    if (data.pointType == 8) {
      stateDom = `<div class="stateCard">
        <div class="item"><h2>开关：</h2><p>${data.externInfo ? data.externInfo.status || 0 : 0}</p></div>
        <div class="item"><h2>电压：</h2><p>${data.externInfo ? data.externInfo.voltage || 0 : 0}V</p></div>
        <div class="item"><h2>电流：</h2><p>${data.externInfo ? data.externInfo.electricity || 0 : 0}A</p></div></div>
        `;
    }
    //水表
    if (data.pointType == 5) {
      stateDom = `<div class="stateCard">
            <div class="item"><h2>口径：</h2><p>${data.externInfo ? data.externInfo.caliber || 0 : 0}</p></div>
            </div>`;
    }
    //消防栓
    // if (data.pointType == 31) {
    //   stateDom = `<div class="stateCard"><div class="item"><h2>压力值：</h2><p>${data.externInfo ? data.externInfo.pressure || 0 : 0}MPa</p></div></div>`;
    // }
    // //四通
    // if (data.pointType == 30) {
    //   stateDom = `<div class="stateCard">
    //   <div class="item"><h2>①口径：</h2><p>${data.externInfo ? data.externInfo.caliber || 0 : 0}</p></div>
    //   <div class="item"><h2>②口径：</h2><p>${data.externInfo ? data.externInfo.caliber || 0 : 0}</p></div>
    //   <div class="item"><h2>③口径：</h2><p>${data.externInfo ? data.externInfo.caliber || 0 : 0}</p></div>
    //   <div class="item"><h2>④口径：</h2><p>${data.externInfo ? data.externInfo.caliber || 0 : 0}</p></div>
    //   </div>`;
    // }
    // //三通
    // if (data.pointType == 20) {
    //   stateDom = `<div class="stateCard">
    //   <div class="item"><h2>①口径：</h2><p>${data.externInfo ? data.externInfo.caliber || 0 : 0}</p></div>
    //   <div class="item"><h2>②口径：</h2><p>${data.externInfo ? data.externInfo.caliber || 0 : 0}</p></div>
    //   <div class="item"><h2>③口径：</h2><p>${data.externInfo ? data.externInfo.caliber || 0 : 0}</p></div>
    //   </div>`;
    // }
    // //弯头
    // if (data.pointType == 10) {
    //   stateDom = `<div class="stateCard">
    //   <div class="item"><h2>①口径：</h2><p>${data.externInfo ? data.externInfo.caliber || 0 : 0}</p></div>
    //   <div class="item"><h2>②口径：</h2><p>${data.externInfo ? data.externInfo.caliber || 0 : 0}</p></div>
    //   </div>`;
    // }
    return `<div class="custom-content-marker ${checkMarket ? (checkMarket.id == data.id ? "on" : "") : ""}">
          <div class="imgBox deviceIcon_${data.pointType}"> 
          <img class="icon" style="transform: rotate(${data.rotationAngle}deg);" src="device/icon${data.pointType}.svg"> 
          ${data.exception == 1 ? '<img  class="exception" src="fault/icon5.svg">' : ""}
          ${closeDom} 
          </div>
           <h2 class="name">${data.name}</h2>
           <div class="detailCard">
           <div class="item"><h1><font color="#46b97e">${data.name}</font></h1></div>
           <div class="item"><h2>位置：</h2><p>${data.city_town}</p></div>
         ${exception}
         ${stateDom}
         </div> 
         
        </div>`;
  },
  lineTxt(data) {
    // -------- 🎨 精美 UI 信息窗 --------
    let lenStr = data.lenStr;
    let diameter = data.diameter;
    let name = data.name || "未知管线";
    let length = data.length !== null && data.length !== undefined ? `${data.length} m` : lenStr;
    const html = `
      <div style="
        width: 240px;
        padding: 12px 16px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        color: #000;
        font-family: 'Segoe UI', sans-serif;
        line-height: 1.6;
        backdrop-filter: blur(4px);
        border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255, 255, 255, 0.95);
      ">
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px; color: #46b97e;">
          📍 ${name}
        </div>

        <div style="font-size: 18px; margin-top: 6px;">
          <b>📏 长度：</b> ${length}
        </div>

        <div style="font-size: 18px; margin-top: 6px;">
          <b>🧵 口径：</b> ${diameter} mm
        </div>
      </div>
    `;
    return html;
  },
};

export { markerTxt };
