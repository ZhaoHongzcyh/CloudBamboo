const app = getApp();
var listConfig = require("./listConfig.js");
const api = require("../../api/common.js");
const company = require("../../api/company.js");
Page({
  data:{
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
        time:"--:--",
        status:true,
        title:"未打卡"
      },
      offWork:{
        time:"--:--",
        status:true,
        title:"未打卡"
      }
    },//考勤配置：status:打卡按钮是否可点击
    companyList:[]//公司列表
  },
  onReady:function(){
    this.popup = this.selectComponent("#company-popup");
  },
  onLoad:function(){
    this.setData({
      listConfig:listConfig.listConfig
    })
    this.getWorkAttendance();
    this.getCompanyInfo();
    this.getUserTeam();
    this.flushTime();
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
    })
  },
  // 查询公司信息
  getCompanyInfo:function(){
    var obj = {};
    var address = app.ip + "tw/userService/getUserInfo";
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
      })
    }).catch(e=>{
      console.log(e);
    })
  },
  // tc/taskTeamService/findTaskTeam
  getUserTeam:function(){
    var obj = {};
    var address = app.ip + "tc/taskTeamService/findTaskTeam";
    api.request(obj,address,"post",true).then(res=>{
      console.log("团队信息");
      console.log(res)
    })
  },
  // 切换公司
  switchCompany:function(){
    wx.navigateTo({
      url: '/pages/companyList/companyList',
    });
  },
  // 添加公司
  addCompany:function(){
    wx.navigateTo({
      url: '/pages/addCompany/addCompany'
    })
  }
})