let markerTxt = {
  pointTxt(data, checkMarket) {
    let exception = '';

    if (data.exception == 0) {
        exception = `<div class="item"><h2>状态：</h2><p>正常</p></div>`;
    }
    if (data.exception == 1) {
        exception = `<div class="item"><h2>状态：</h2><p class="red">异常</p></div>`;
    }
  

    let stateDom='';
    let closeDom='';
    if(data.pointType==0){
        stateDom=`<div class="stateCard"><div class="item"><h2>压力值：</h2><p>${data.externInfo?data.externInfo.pressure || 0 :0}MPa</p></div></div>`
    }
    if(data.pointType==1){
        if (data.externInfo.status=='开') {
            stateDom = `<div class="stateCard"><div class="item"><h2>阀门：</h2><p>开阀</p></div></div>`
          }else {
            stateDom = `<div class="stateCard"><div class="item"><h2>阀门：</h2><img  class="exception" src="fault/close.svg"><p>关阀</p></div></div>`;
            closeDom=`<img  class="exception" src="fault/close.svg"></img>`;
            
          }
    }
    if(data.pointType==7){
        stateDom=`<div class="stateCard"><div class="item"><h2>深度：</h2><p>${data.externInfo?data.externInfo.depth || 0 :0}米</p></div>`
    }
    if(data.pointType==8){
        stateDom=`<div class="stateCard">
        <div class="item"><h2>开关：</h2><p>${data.externInfo?data.externInfo.status || 0 :0}</p></div>
        <div class="item"><h2>电压：</h2><p>${data.externInfo?data.externInfo.voltage || 0 :0}V</p></div>
        <div class="item"><h2>电流：</h2><p>${data.externInfo?data.externInfo.electricity || 0 :0}A</p></div></div>
        `
    }
    return `<div class="custom-content-marker ${ checkMarket ? (checkMarket.id == data.id ? 'on' : '') : '' }">
          <div class="imgBox deviceIcon_${data.pointType}"> 
          <img class="icon" style="transform: rotate(${ data.rotationAngle }deg);" src="device/icon${data.pointType}.svg"> 
          ${ data.exception == 1 ? '<img  class="exception" src="fault/icon5.svg">' : '' }
          ${closeDom} 
          </div>
           <h2 class="name">${data.name}</h2>
           <div class="detailCard">
           <div class="item"><h1><font color="#46b97e">${ data.name }</font></h1></div>
           <div class="item"><h2>位置：</h2><p>${data.city_town}</p></div>
         ${exception}
         ${stateDom}
         </div> 
         
        </div>`
  },
}

export { markerTxt }
