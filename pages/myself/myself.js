const app = getApp();
const api = require("../../api/common.js");
Page({
  data:{
    app:app,
    headimg: app.ip + "tc/spaceService/showPersonIcon/"+ wx.getStorageSync("tcUserId") + "/100/100",
    url:{},//导航数据
    userinfo:{
      name:""
    },
    list:[]//待处理任务
  },
  onLoad:function(){
    this.popup = this.selectComponent("#popup");
    
    // 更新导航数据
    this.setData({
      url: app.globalData.tabbar
    })
  },

  onShow: function () {
    if(wx.getStorageSync('myselfList') != ""){
      this.setData({
        list: wx.getStorageSync('myselfList')
      })
    }
    this.getTask();
    console.log("页面")
    var page = getCurrentPages();
    console.log(page)
  },

  // 打开app下载弹框
  alert: function () {
    this.popup.showPopup();
  },
  // 请求用户详细信息
  getUserInfo:function(){
    var address = app.ip + "tw/userService/getUserInfo";
    api.request({},address,"post",true).then(res=>{
      var userinfo = {
        name:res.data.data.curUser.pname
      }
      this.setData({
        userinfo:userinfo
      })
      wx.stopPullDownRefresh()
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
      wx.setStorageSync("myselfList",list)
      // 请求用户信息
      this.getUserInfo();
    }).catch(e=>{
      console.log(e);
    })
  },
  // 导航跳转
  pageJump: function (e) {
    var index = e.currentTarget.dataset.index;
    var url = e.currentTarget.dataset.url.slice(1);
    var jumpUrl = e.currentTarget.dataset.url, jumpNum = null;
    var page = getCurrentPages();
    var length = page.length;
    app.editTabBar(index);
    for (var i = 0; i < length; i++) {
      if (page[i].route == url) {
        jumpNum = i;
      }
    }
    console.log("页面堆栈" + jumpNum);
    if (jumpNum == null) {
      wx.navigateTo({
        url: jumpUrl,
      })
    }
    else {
      if (jumpNum == length - 1) {
        return false;
      }
      else {
        wx.navigateBack({
          delta: length - (jumpNum + 1)
        })
      }
    }
  },
  // 下拉刷新
  onPullDownRefresh: function (e) {
    this.onLoad();
    this.setData({
      headimg: app.ip + "tc/spaceService/showPersonIcon/" + wx.getStorageSync("tcUserId") + "/100/100"
    })
  },
  // 点击状态栏的弹框
  radioAlert:function(e){
    console.log(e);
  }
})