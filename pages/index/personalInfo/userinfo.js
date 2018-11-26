// pages/index/personalInfo/userinfo.js
const app = getApp();
const api = require("../../../api/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    app:app,
    userinfo: null,
    alert:null,
    userheadimg:null
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
    this.setData({ userheadimg: null})
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
    api.request({}, address, "POST", true).then(res => {
      console.log(res);
      wx.stopPullDownRefresh();
      if (res.data.code == 200 && res.data.result) {
        let userinfo = res.data.data.curUser;
        this.setData({ 
          userinfo: userinfo,
          userheadimg: app.ip + 'tc/spaceService/showPersonIcon/' + userinfo.id + '/100/100'
        })
      }
      else{
        this.setAlert(res.data.message);
      }
    }).catch(e => {
      this.setAlert("无法获取个人信息");
    })
  },

  // 编辑客户信息
  editUserInfo: function () {
    wx.navigateTo({
      url: '../editUser/editUser',
    })
  },

  // 设置alert的内容
  setAlert: function (txt) {
    this.setData({ alert: { content: txt } });
    this.alert();
  },
})