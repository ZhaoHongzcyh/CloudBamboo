// pages/index/changePwd/changepwd.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isCouldClick:false,//用户是否可点击
    oldpwd:null,
    newpwd:null,
    sureNewPwd:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  // 填写当前密码
  oldPwd: function (e) {
    this.setData({
      oldpwd: e.detail.value
    })
  },

  // 新密码
  newpwd: function (e) {
    this.setData({
      newpwd: e.detail.value
    })
  },

  // 确认新密码
  sureNewPwd: function (e) {
    this.setData({
      sureNewPwd: e.detail.value
    })
  },

  // 验证按钮是否可被点击
  checkBtnState: function () {
    var newpwd = this.data.newpwd;
  }
})