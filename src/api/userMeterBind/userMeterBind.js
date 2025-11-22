import service from "@/api/request"; // 你的 axios 封装

// // 参数示例
// const data = {
//   priceId: 123,
//   userIdList: [1, 2, 3]
// };

export function multiEditUserBindMeterInfo(data) {
  return service({
    url: "/userManage/userCharge/multiEditUserBindMeterInfo",
    method: "post",
    data // axios 会自动把对象转成 JSON
  });
}

// // 调用示例
// multiEditUserBindMeterInfo(data)
//   .then(res => {
//     console.log("修改成功", res);
//   })
//   .catch(err => {
//     console.error("修改失败", err);
//   });
