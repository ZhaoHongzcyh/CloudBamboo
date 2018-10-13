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
    isGetCompany:false,//是否已经请求到公司数据
    isManager:false,//是否为公司负责人
    time:{
      today:"",
      month:""
    },
    listConfig:{},
    attendance:{
      goWork:{
        time:"00:00",
        status:true,
        title:"上班打卡",
        code:0
      },
      offWork:{
        time:"00:00",
        status:true,
        title:"下班打卡",
        code:0
      }
    },//考勤配置：status:打卡按钮是否可点击
    companyList:[]//公司列表
  },

  onLoad:function(options){
    this.setData({
      listConfig:listConfig.listConfig
    })
  },

  onShow: function () {
    this.getCompanyInfo();
    setTimeout(()=>{
      this.getWorkAttendance();
    },1000)
    // this.getUserTeam();
    this.flushTime();
  },

  // 下拉刷新
  onPullDownRefresh: function (e) {
    this.onLoad();
    this.onShow();
    // this.getCompanyId();
  },

  // app下载弹框
  alert: function () {
    this.popup = this.selectComponent("#company-popup");
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
    var taskId = wx.getStorageSync("defaultTaskTeam");
    if(taskId == null) {
      return false;
    }
    var obj = {
      taskId: taskId
    }
    var address = app.ip + "tc/taskMemberService/findTaskMembershipAttendanceBean";
    api.request(obj,address,"POST",true).then(res=>{
      console.log("考勤");
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
    var address = app.ip + "tc/taskTeamService/findTaskTeam";
    api.request(obj,address,"post",true).then(res=>{
      console.log("公司信息")
      console.log(res);
      if(res.data.code == 402){//session 过期，重定向到登录页面
        wx.redirectTo({
          url: '/pages/index/index',
        })
      }
      var isGetCompany = true;
      var handleInfo = company.handleUserInfo(res);
      console.log("处理结果");
      console.log(handleInfo);
      if (handleInfo.isGetCompany == false) {
        isGetCompany = false;
        this.setData({
          isGetCompany: isGetCompany,
          isManager: false
        })
      }
      else{
        this.setData({
          company: {
            name: handleInfo.cname.split(";")[0],
            cicon: handleInfo.cicon
          },
          isGetCompany: isGetCompany,
          isManager: handleInfo.isManager
        });
      }
      
      wx.stopPullDownRefresh();//关闭下拉刷新
    }).catch(e=>{
      wx.stopPullDownRefresh();//关闭下拉刷新
    })
  },

  getUserTeam:function(){
    var obj = {};
    var address = app.ip + "tc/taskTeamService/findTaskTeam";
    api.request(obj,address,"post",true).then(res=>{

    }).catch(e=>{
      wx.stopPullDownRefresh();//关闭下拉刷新
    })
  },

  // 切换公司
  switchCompany:function(){
    // 在这里做是否为公司负责人的判断（国庆之后在开发与发布）
    if(this.data.isManager){
      // 这里跳转的页面应该是公司高级设置页面，而非公司切换列表页面（国庆之后开发）
      wx.navigateTo({
        url: './manageCompany/manageCompany',
      })
      // wx.navigateTo({
      //   url: '/pages/companyList/companyList',
      // })
    }
    else{
      wx.navigateTo({
        url: '/pages/companyList/companyList',
      })
    }
    
  },
  
  // 添加公司
  addCompany:function(){
    wx.navigateTo({
      url: '/pages/addCompany/addCompany'
    })
  },

  // 获取公司ID
  getCompanyId:function(){
    var address = app.ip + "tw/userService/getUserInfo";
    api.request({},address,"post",true).then(res=>{

    })
  },

  // 公司文件
  jumpToCompanyFile: function () {
    wx.navigateTo({
      url: './companyFile/companyfile',
    })
  }
})