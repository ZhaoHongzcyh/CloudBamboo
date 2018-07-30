const app = getApp();
var listConfig = require("./listConfig.js");
const api = require("../../api/common.js");
const company = require("../../api/company.js");
Page({
  data:{
    url:{},//脚部导航数据
    company:{
      name:"公司名称",
      logo:"./img/company.png"
    },
    time:{
      today:"",
      month:""
    },
    listConfig:{},
    attendance:{
      goWork:{
        time:"00:00",
        status:true,
        title:"未打卡"
      },
      offWork:{
        time:"00:00",
        status:true,
        title:"未打卡"
      }
    },//考勤配置：status:打卡按钮是否可点击
    companyList:[]//公司列表
  },
  onReady:function(){
    // 弹框
    this.popup = this.selectComponent("#company-popup");
  },
  onLoad:function(options){
    this.setData({
      listConfig:listConfig.listConfig
    })
    this.getWorkAttendance();
    this.getCompanyInfo();
    this.getUserTeam();
    this.flushTime();
    // 更新导航数据
    this.setData({
      url: app.globalData.tabbar
    })
  },
  // 下拉刷新
  onPullDownRefresh: function (e) {
    this.onLoad();
    this.getCompanyId();
  },
  // app下载弹框
  alert: function () {
    this.popup.showPopup()
  },
  // 更新时间
  flushTime:function(){
    var time = api.getData();
    this.setData({
      time:time
    })
  },
  // 请求考勤打卡情况
  getWorkAttendance:function(){
    var obj = {
      taskId:wx.getStorageSync("defaultTaskTeam")
    }
    var address = app.ip + "tc/taskMemberService/findTaskMembershipAttendanceBean";
    api.request(obj,address,"post",true).then(res=>{
      console.log("考情")
      console.log(res);
      if(res.data.code == 200){
        var obj = api.handleAttendance(res.data.data);
        this.setData({
          attendance:obj
        })
      }
    }).catch(e=>{
      console.log(e);
      wx.stopPullDownRefresh();//关闭下拉刷新
    })
  },
  // 查询公司信息
  getCompanyInfo:function(){
    var obj = {};
    //tw/userService/getUserInfo
    //tc/taskTeamService/findTaskTeam
    var address = app.ip + "tc/taskTeamService/findTaskTeam";
    api.request(obj,address,"post",true).then(res=>{
      console.log("公司")
      console.log(res);
      if(res.data.code == 402){//session 过期，重定向到登录页面
        wx.redirectTo({
          url: '/pages/index/index',
        })
      }
      var handleInfo = company.handleUserInfo(res);
      this.setData({
        company:{
          name:handleInfo.cname.split(";")[0],
          cicon: handleInfo.cicon
        }
      });
      wx.stopPullDownRefresh();//关闭下拉刷新
    }).catch(e=>{
      console.log(e);
      wx.stopPullDownRefresh();//关闭下拉刷新
    })
  },
  getUserTeam:function(){
    var obj = {};
    var address = app.ip + "tc/taskTeamService/findTaskTeam";
    api.request(obj,address,"post",true).then(res=>{
      console.log("团队信息");
      console.log(res)
    }).catch(e=>{
      wx.stopPullDownRefresh();//关闭下拉刷新
    })
  },
  // 切换公司
  switchCompany:function(){
    wx.redirectTo({
      url: '/pages/companyList/companyList',
    });
  },
  // 添加公司
  addCompany:function(){
    wx.navigateTo({
      url: '/pages/addCompany/addCompany'
    })
  },
  // 导航跳转
  pageJump: function (e) {
    var index = e.currentTarget.dataset.index;
    var url = e.currentTarget.dataset.url;
    app.editTabBar(index);
    wx.redirectTo({
      url: url
    })
  },
  // 获取公司ID
  getCompanyId:function(){
    var address = app.ip + "tw/userService/getUserInfo";
    api.request({},address,"post",true).then(res=>{
      console.log("获取公司ID");
      console.log(res);
    })
  }
})