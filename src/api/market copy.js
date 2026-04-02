

let markerTxt = {
    pointTxt(data, checkMarket) {
        let exception = '';
        if (data.exception == 0) {
            exception = `<div class="item"><h2>状态：</h2>`;
            if (data.externInfo) {

                // if(data.externInfo.pressure){
                //     exception += `<p class="red">${pressure}MPa</p>'}`
                // }

                // if(data.externInfo.status){
                //     exception += `${data.externInfo.status == '开' ? '' : '<img  src="fault/close.png" />'}${data.externInfo.status == "开" ? '<p>开启</p>' : ' <p class="red">关阀</p>'}`
                // }

             }else{
                exception += `<p>正常</p>`
              
            }

            exception += `</div>`;
        }

        if(checkMarket){
            console.log(checkMarket.id == data.id );
        }
       

        return `<div class="custom-content-marker ${checkMarket ? checkMarket.id == data.id ? 'on' : '' : ''}">
          <div class="imgBox deviceIcon_${data.pointType}">
             <img class="icon" style="transform: rotate(${data.rotationAngle}deg);" src="device/icon${data.pointType}.svg">
             ${data.exception == 1 ? '<img  class="exception" src="fault/icon5.svg">' : ''}
             ${data.exception == 0 && data.status == "关" ? '<img  class="exception" src="fault/close.svg">' : ''}
          </div>
           <h2 class="name">${data.name}</h2>
           <div class="detailCard">
           <div class="item"><h1><font color="#46b97e">${data.name}</font></h1></div>
           <div class="item"><h2>位置：</h2><p>${data.city_town}</p></div>
           ${exception}
           ${data.exception == 1 ? '<div class="item"><h2>状态：</h2><img src="fault/icon5.png" /><p>异常</p></div>' : ''}
           ${data.pointTypes == 8 ? '<div  class="item"><h2>电压：' + (data.externInfo.voltage || 0) + 'V</h2></div>' : ''}
           ${data.pointTypes == 8 ? '<div class="item"><h2>电流：' + (data.externInfo.electricity || 0) + 'A</h2></div>' : ''}
           ${data.pointTypes == 0 ? '<div class="item"><h2>压力：' + (data.externInfo.voltage || 0) + 'MPa</h2></div>' : ''}
           
           
           
           
         </div> 
         
        </div>`;
    }
}




export { markerTxt };