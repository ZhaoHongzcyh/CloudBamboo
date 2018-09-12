// pages/mailList/mailList.js
const app = getApp();
const api = require("../../api/common.js");
Page({
  data: {
    url:{},//脚部导航数据
    equipment:{
      src:"/pages/mailList/img/equipment.png",
      title:"我的设备"
    },
    list:[],
    group:{
      src: "/pages/mailList/img/head.png",
      title: "我的群组",
      num: 0
    }
  },
  onLoad:function (options) {
    // 弹框
    this.popup = this.selectComponent("#company-popup");
  },
  // 下拉刷新
  onPullDownRefresh: function (e) {
    this.getGroup();
  },

  onShow: function () {
  },

  // app下载弹框
  alert: function () {
    this.popup.showPopup()
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getGroup();
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },
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
      if (jumpNum == length - 1){
        return false;
      }
      else{
        wx.navigateBack({
          delta: length - (jumpNum + 1)
        })
      }
    }
  },
  // 获取用户分组情况
  getGroup:function(){
    var address = app.ip + "tc/userContactService/getPersonContacts";
    api.request({},address,"post",true).then(res=>{
      if(res.data.code == 200 && res.data.result){
        this.setData({
          list:res.data.data
        })
      }
      wx.stopPullDownRefresh();//关闭下拉刷新
    })
  }
})