// pages/company/checkWork/checkwork.js
const dataConfig = require("./config.js");
const app = getApp();
const api = require("../../../api/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    year:null,
    month:null,
    dataConfig: dataConfig,
    days_style:[],
    checkwork:[],
    // --------------------------当日考勤数据-------------------------
    time: {
      today: "",
      month: ""
    },
    attendance: {
      goWork: {
        time: "00:00",
        status: true,
        title: "上班打卡",
        code: 0
      },
      offWork: {
        time: "00:00",
        status: true,
        title: "下班打卡",
        code: 0
      }
    },//考勤配置：status:打卡按钮是否可点击
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 计算当日考勤信息
    this.flushTime();
    this.getWorkAttendance();
    this.isLeapYear();
    this.getTimeData();
    this.calendarCss();
    this.getMonthWork();
  },

  // app下载弹框
  alert: function () {
    this.popup = this.selectComponent("#company-popup");
    this.popup.showPopup()
  },
  
  // 更新时间
  flushTime: function () {
    var time = api.getData();
    this.setData({
      time: time
    })
  },

  // 请求考勤打卡情况
  getWorkAttendance: function () {
    var taskId = wx.getStorageSync("defaultTaskTeam");
    if (taskId == null) {
      return false;
    }
    var obj = {
      taskId: taskId
    }
    var address = app.ip + "tc/taskMemberService/findTaskMembershipAttendanceBean";
    api.request(obj, address, "POST", true).then(res => {
      if (res.data.code == 200) {
        var obj = api.handleAttendance(res.data.data);
        this.setData({
          attendance: obj
        })
      }
    }).catch(e => {
      console.log(e);
      wx.stopPullDownRefresh();//关闭下拉刷新
    })
  },

  // 判断是否为闰年
  isLeapYear: function () {
    var dataConfig = this.data.dataConfig;
    var data = new Date();
    var year = data.getFullYear();
    var checkEnd = false;
    if(year % 4 == 0){
      if(year % 100 == 0){
        checkEnd = false;
      }
      else{
        checkEnd = true;//闰年
        dataConfig[11].count = 29;
      }
    }
    if(checkEnd){
      this.setData({ dataConfig: dataConfig});
    }
  },

  // 获取时间相关参数
  getTimeData: function () {
    var data = new Date();
    this.setData({
      month: data.getMonth() + 1,
      year: data.getFullYear()
    })
  },

  // 日历样式
  calendarCss: function () {
    var dat = new Date();
    var dataConfig = this.data.dataConfig;
    var month = dat.getMonth() + 1;
    var today = dat.getDate();
    var days_count;
    dataConfig.map((item,index)=>{
      if(item.month == month) {
        days_count = item.count;
      }
    });
    let days_style = new Array;
    for (let i = 1; i <= days_count; i++) {
      const date = new Date(this.data.year, this.data.month - 1, i);
      if (date.getDay() == 0) {
        days_style.push({
          month: 'current', day: i, color: '#f488cd',checkword:[true,true]
        });
      } else {

        days_style.push({
          month: 'current', day: i, color: '#a18ada', checkword: [true, true]
        });
      }
    }
    days_style.push(
      { month: 'current', day: today, color: 'white', background: '#b49eeb', checkword: [false, true] }
      // { month: 'current', day: 17, color: 'white', background: '#f5a8f0' },
      // { month: 'current', day: 20, color: 'white', background: '#aad4f5' },
      // { month: 'current', day: 25, color: 'white', background: '#84e7d0' },
    );
    this.setData({
      days_style: days_style
    })
  },

  // 获取每个月的考勤信息
  getMonthWork: function () {
    var platform = [];
    var taskId = wx.getStorageSync("defaultTaskTeam");
    var address = app.ip + "tc/taskMemberService/findTaskMembershipStatistics";
    var obj = {taskId}
    api.request(obj,address,"POST",true).then(res=>{
      if(res.data.code == 200 && res.data.result){
        this.handleWorkType(res.data.data);
      }
    })
    // this.setData({ checkwork: platform})
  },

  // 处理请求的本月考勤情况
  handleWorkType: function (worklist) {
    var platform = [];
    worklist.map((item,index)=>{
      var obj = {
        go: (item.workType == 3 || item.workType == 0)? false:true,
        down: (item.closingType == 3 || item.closingType == 0)? false:true
      }
      platform.push(obj);
    })
    this.setData({
      checkwork: platform
    })
  },

  // 当用户点击几下/上个月的时候
  nextMonth: function (e) {
    var data = e.detail.currentYear + "-" + e.detail.currentMonth + "-" + "01" + "T00:00:00.000+0800";
    this.queryWorkByDate(data);
  },

  // 查询指定时间考勤信息
  queryWorkByDate: function (data) {
    var taskId = wx.getStorageSync("defaultTaskTeam");
    var address = app.ip + "tc/taskMemberService/findTaskMembershipStatistics";
    var obj = { taskId, queryDate: data};
    api.request(obj, address, "POST", true).then(res => {
      if (res.data.code == 200 && res.data.result) {
        this.handleWorkType(res.data.data);
      }
    })
  }
})