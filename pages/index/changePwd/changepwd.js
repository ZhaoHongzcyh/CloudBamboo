// pages/index/changePwd/changepwd.js
const app = getApp();
const api = require("../../../api/common.js");
const util = require("../../../utils/index/MD5.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isCouldClick:false,//用户是否可点击
    oldpwd:null,
    newpwd:null,
    sureNewPwd:null,
    userinfo:null,
    isShowTxt:false,
    alertInfo:null
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
    this.checkBtnState();
  },

  // 新密码
  newpwd: function (e) {
    this.setData({
      newpwd: e.detail.value
    })
    this.checkBtnState();
  },

  // 确认新密码
  sureNewPwd: function (e) {
    this.setData({
      sureNewPwd: e.detail.value
    })
    this.checkBtnState()
  },

  // 验证按钮是否可被点击
  checkBtnState: function () {
    var newpwd = (this.data.newpwd != null && (this.data.newpwd.length > 6 || this.data.newpwd.length == 6))? true:false;
    var oldpwd = (this.data.oldpwd != null && this.data.oldpwd.length > 0)? true:false;
    var sureNewPwd = (this.data.sureNewPwd != null && this.data.sureNewPwd.length > 0)? true:false;
    if (oldpwd && newpwd && sureNewPwd){
      if(this.data.sureNewPwd == this.data.newpwd){
        this.setData({ isCouldClick: true });
      }
      else{
        this.setData({ isCouldClick: false });
      }
    }
    else{
      this.setData({ isCouldClick: false });
    }
  },

  // 确认修改密码
  submitNewPwd: function () {
    var pwdReg = /^[0-9a-zA-Z]{6,20}$/img;
    if (!this.data.isCouldClick){
      return false;
    }
    else{
      this.setData({ isShowTxt: true, alertInfo:'修改中。。。'})
    }
    var userid = wx.getStorageSync('tcUserId'),
    address = app.ip + "tw/itOrgManagerService/updateOrgPersonBeanByPid",
    oldpwd = this.data.oldpwd,
    password = this.data.newpwd.toString(),
    obj = {
      pid: userid,
      oldPassword:util.hexMD5(oldpwd),
      password: password//util.hexMD5(this.data.newpwd)
    };
    console.log(obj);
    if(!obj.password.match(pwdReg)){
      this.setData({ alertInfo: '密码只能为数字与字母' });
      setTimeout(() => { this.setData({ isShowTxt:false})},1500);
      return false;
    }
    api.request(obj,address,"POST",true).then(res=>{
      if(res.data.code == 200 && res.data.result){
        wx.clearStorageSync();
        app.globalData.sessionoverdue = true;
        this.setData({alertInfo: '修改成功，将自动重新登录' });
        setTimeout(()=>{
          wx.switchTab({
            url: '/pages/index/index',
          })
        },1500)
      }
      else{
        this.setData({ alertInfo:'密码修改失败' });
        setTimeout(()=>{
          this.setData({ isShowTxt: false})
        },1500)
      }
    })
  }
})