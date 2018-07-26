const app = getApp();
const api = require("../../api/common.js");
Page({
  data:{
    url:{},//导航数据
    userinfo:{
      name:""
    },
    list:[]//待处理任务
  },
  onLoad:function(){
    this.popup = this.selectComponent("#popup");
    this.getTask();
    // 更新导航数据
    this.setData({
      url: app.globalData.tabbar
    })
  },
  // 打开app下载弹框
  alert: function () {
    this.popup.showPopup();
  },
  // 请求用户详细信息
  getUserInfo:function(){
    var address = app.ip + "tw/userService/getUserInfo";
    api.request({},address,"post",true).then(res=>{
      console.log(res);
      console.log("用户详细信息")
      var userinfo = {
        name:res.data.data.curUser.pname
      }
      this.setData({
        userinfo:userinfo
      })
    })
  },
  // 请求任务
  getTask:function(){
    var address = app.ip + "tc/schedule/itemService/findMyManageItemList";
    api.request({},address,"post",true).then(res=>{
      var list = api.handleTask(res);
      this.setData({
        list:list
      })
      // 请求用户信息
      this.getUserInfo();
    }).catch(e=>{
      console.log(e);
    })
  },
  // 导航跳转
  pageJump: function (e) {
    var index = e.currentTarget.dataset.index;
    var url = e.currentTarget.dataset.url;
    app.editTabBar(index);
    wx.redirectTo({
      url: url,
    })
  }
})