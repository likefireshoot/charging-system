<template>

  <div class="selectDate">
    <div class="item">
      <selectCard2 width="130" :options="yearList" propValue="name" v-model:select="yearName" @selectItem="setYearItem"></selectCard2>
    </div>
    <div class="item">
      <selectCard2 width="130" :options="monthList" propValue="name" v-model:select="month" @selectItem="setMonthItem"></selectCard2>
    </div>
    <div class="item">
      <selectCard2 width="130" :options="dateList" propValue="name" v-model:select="date"  @selectItem="setDateItem"></selectCard2>
    </div>

  </div>

</template>

<script setup>
import { reactive, ref, computed, onMounted, onBeforeUnmount, getCurrentInstance } from "vue";
const emit = defineEmits(['selectDate']);
const nowDate=new Date();
let yearTxt=nowDate.getFullYear();
let monthTxt=nowDate.getMonth()<9?'0'+(parseInt(nowDate.getMonth())+1):(parseInt(nowDate.getMonth())+1);
let dateTxt=nowDate.getDate()<9?'0'+(parseInt(nowDate.getDate())):(parseInt(nowDate.getDate()));
let yearName = ref(`${yearTxt}年`);
let month =ref(`${monthTxt}月`);
let date = ref(`${dateTxt}日`);


const yearList = reactive(setYear(2020, 2050));
const monthList=setMonthList(12);
let prevDate=new Date(nowDate.getFullYear()+'-'+(parseInt(nowDate.getMonth()+1))+'-01').getTime()-86400000;
let dateList = reactive(setDateList(new Date(prevDate).getDate()));

const checkItem = reactive({
  year:yearTxt,
  month:monthTxt,
  date:dateTxt,
});
//年
function setYear(begin, end) {
  let list = new Array();
  for (let i = begin; i < end; i++) {
    list.push({ id: i, name: i + '年', value: i });
  }
  return list;
};
function setYearItem(item) {
  month.value = null;
  date.value = null;
  checkItem.year = item.value;
}

//月
function setMonthList() {
  let list = new Array();
  for (let i = 1; i < 13; i++) {
    i = i < 10 ? '0' + i : i;
    list.push({ id: i, name: i + '月', value: i  });
  }
  return list;
};



function setDateList(countDate) {
  let list = new Array();
  for (let i = 1; i <= countDate; i++) {
    i = i < 10 ? '0' + i : i;
    list.push({ id: i, name: i + '日', value: i });
  }
  return list;
};

function setMonthItem(item) {
  checkItem.month = item.value;
  let dateTime=new Date(checkItem.year+'-'+(parseInt(checkItem.month)+1)+'-01');
  if((parseInt(checkItem.month)+1)==13){
    dateTime=new Date((checkItem.year+1)+'-01-01');
  };
  let countDate=new Date(dateTime.getTime()-86400000).getDate();
  dateList=reactive(setDateList(countDate));
  date.value=null;
};

function setDateItem(item) {
  checkItem.date = item.value;


  emit('selectDate', [checkItem.year,checkItem.month,checkItem.date].join('-'));
};













</script>

<style lang="scss" scoped>
.selectDate {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  height: 40px;
  position: relative;

  .item {
    margin-left:10px;
    &:first-of-type{
      margin-left:0;
    }
  }
}
</style>