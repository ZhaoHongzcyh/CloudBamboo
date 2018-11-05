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
    listConfig:{},
    companyList:[],//公司列表
    AdvertisementImgUrls:[]
  },

  onLoad:function(options){
    this.setData({
      listConfig:listConfig.listConfig
    })
    this.getTurnImg();
  },

  onShow: function () {
    this.getCompanyInfo();
    // this.getUserTeam();
  },

  // 获取广告轮播图信息
  getTurnImg: function () {
    var address = app.ip + "tc/knowledgeService/findArcSummarys";
    var obj = { folderId: 17, category: 17};
    api.request(obj,address,"POST",true).then(res=>{
      if(res.data.code == 200 && res.data.result){
        let AdvertisementImgUrls = res.data.data.list;
          AdvertisementImgUrls.map((item,index)=>{
            item.src = app.ip + "tc/spaceService/downloadFileImgUnlimitGet/" + item.resource + "/0/0"
        })
        this.setData({
          AdvertisementImgUrls
        })
      }
      else{
        console.log("广告获取失败")
      }
    })
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
  
  // 广告阅读
  readAdver: function (e) {
    var descript = e.currentTarget.dataset.descript;
    if(descript == null || descript == ""){
      return false;
    }
    wx.navigateTo({
      url: '/pages/Agreement/Agreement?state=4&src=' + descript,
    })
  },

  // 查询公司信息
  getCompanyInfo:function(){
    // var defaultTaskTeam = wx.getStorageSync('defaultTaskTeam');
    // var obj = { taskId: defaultTaskTeam};
    var obj = {};
    var address = app.ip + "tc/taskTeamService/findTaskTeam";
    api.request(obj,address,"post",true).then(res=>{
      if(res.data.code == 402){//session 过期，重定向到登录页面
        wx.redirectTo({
          url: '/pages/index/index',
        })
      }
      var isGetCompany = true;
      var handleInfo = company.handleUserInfo(res);
      // var handleInfo = company.handleCompany(res);
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
  },

  // 跳转到考勤打卡界面】
  workPlatform: function (e) {
    var address;
    var platform = e.currentTarget.dataset.txticon;
    if (platform == 'checkwork'){
      address = "./checkWork/checkwork";
    }
    else{
      this.alert();
      return false;
    }
    wx.navigateTo({
      url: address,
    })
  }
})