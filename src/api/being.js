let formatDate = date => {
    let year = date.getFullYear()
    let month = date.getMonth()+1  
    let day = date.getDate()
    let hour = date.getHours()
    let minute = date.getMinutes()
    let second = date.getSeconds()
    return `${[year, month, day].map(formatNumber).join('-')}`
}


let formatDateTime = date => {
    let year = date.getFullYear()
    let month = date.getMonth()+1 
    let day = date.getDate()
    let hour = date.getHours()
    let minute = date.getMinutes()
    let second = date.getSeconds()
    return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute,second].map(formatNumber).join(':')}`
}



let formatDate2 = date => {
    let year = date.getFullYear()
    let month = date.getMonth() +1
    let day = date.getDate()
    let hour = date.getHours()
    let minute = date.getMinutes()
    let second = date.getSeconds()
    return `${[year, month, day].map(formatNumber).join('-')}`
}

let formatDateTime2 = date => {
    let year = date.getFullYear()
    let month = date.getMonth() +1
    let day = date.getDate()
    let hour = date.getHours()
    let minute = date.getMinutes()
    let second = date.getSeconds()
    return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute,second].map(formatNumber).join(':')}`
}

let formatTime = date => {
    let year = date.getFullYear()
    let month = date.getMonth() +1
    let day = date.getDate()
    let hour = date.getHours()
    let minute = date.getMinutes()
    let second = date.getSeconds()
    return `${[hour, minute,second].map(formatNumber).join(':')}`
}

let formatHourMinute = date => {
    let year = date.getFullYear()
    let month = date.getMonth() +1
    let day = date.getDate()
    let hour = date.getHours()
    let minute = date.getMinutes()
    let second = date.getSeconds()
    return `${[hour, minute].map(formatNumber).join(':')}`
}


let setTime= (t)=>{
    let h = parseInt(t / 60 / 60 % 24);
    let m = parseInt(t / 60 % 60);
    let s = parseInt(t % 60);
    h = h < 10 ? '0' + h : h
    m = m < 10 ? '0' + m : m
    s = s < 10 ? '0' + s : s
    return `${h}:${m}:${s}`
}



function splitArray(array, size) {
    var result = [];
    for (var i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }


let formatNumber = n => {
    n = n.toString()
    return n[1] ? n : `0${n}`
}

export {formatDate,formatDateTime,formatDate2,formatDateTime2,setTime,formatTime,splitArray,formatHourMinute}
