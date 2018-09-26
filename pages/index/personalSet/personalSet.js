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
    this.getUserInfo();
  },

  // 获取用户详细信息
  getUserInfo: function () {
    var address = app.ip + "tw/userService/getUserInfo";
    api.request({},address,"POST",true).then(res=>{
      console.log("用户信息");
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        this.setData({ userinfo: res.data.data.curUser})
      }
    }).catch(e=>{
      console.log("用户信息异常")
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
  }
})