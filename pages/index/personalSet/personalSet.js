// pages/index/personalSet/personalSet.js
const app = getApp();
const api = require("../../../api/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    app:app,
    userinfo:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取弹框节点
    this.popup = this.selectComponent("#popup");
  },

  onShow: function () {
    this.getUserInfo();
  },

  // 弹框
  alert: function () {
    this.popup.showPopup()
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.onShow();
  },

  // 获取用户详细信息
  getUserInfo: function () {
    var address = app.ip + "tw/userService/getUserInfo";
    api.request({},address,"POST",true).then(res=>{
      wx.stopPullDownRefresh();
      if(res.data.code == 200 && res.data.result){
        this.setData({ userinfo: res.data.data.curUser})
      }
      else{
        this.setAlert(res.data.message);
      }
    }).catch(e=>{
      console.log(e);
      // this.setAlert('无法获取用户资料');
    })
  },

  // 查看个人详细信息
  userinfo: function () {
    wx.navigateTo({
      url: '../personalInfo/userinfo',
    })
  },

  // 密码修改
  changePwd: function () {
    wx.navigateTo({
      url: '../changePwd/changepwd',
    })
  },

  // 使用帮助
  useHelp: function () {
    wx.navigateTo({
      url: '/pages/Agreement/Agreement?state=2',
    })
  },

  // 关于我们
  aboutUs: function () {
    wx.navigateTo({
      url: '/pages/Agreement/Agreement?state=3',
    })
  },

  // 设置alert的内容
  setAlert: function (txt) {
    this.setData({ alert: { content: txt } });
    this.alert();
  },
})