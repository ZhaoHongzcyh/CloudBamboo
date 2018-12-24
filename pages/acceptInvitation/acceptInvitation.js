// pages/acceptInvitation/acceptInvitation.js
const app = getApp();
const api = require("../../api/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    app:app,
    islogoing:false,
    shareScene:{},
    logoinCode:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getInvitationInfo();
  },
  
  // 获取登录code
  getLogoinCode: function () {
    wx.login({
      success: (res) => {
        this.setData({
          logoinCode: res.code
        })
        this.acceptInvitation(res.code);
        wx.stopPullDownRefresh();//关闭下拉刷新
      },
      fail: (e) => {
        wx.stopPullDownRefresh();//关闭下拉刷新
      }
    })
  },
    // 接受邀请
  acceptInvitation: function (code) {
    if(this.data.islogoing){
      var scene = {
        // inviterId: this.data.shareScene.initiator,
        departmentId: this.data.shareScene.departmentId,
        urlType:this.data.shareScene.urlType,
        code: this.data.logoinCode
      }
      var address = app.ip + "tc/weChat/authorizationCode/" + code;
      api.sendCode(scene, address, "get").then(res => {
        var handleInfo = api.handleLogoinInfo(res);
        if (handleInfo.code == '200') {
          app.globalData.sessionoverdue = false;
          app.globalData.isByAppEntry = false;
          wx.switchTab({
            url: '/pages/company/company'
          })
        }
        else {
          wx.switchTab({
            url: '/pages/myself/myself'
          })
          console.log("跳转失败")
        }
      })
    }
  },
  // 获取邀请人信息
  getInvitationInfo:function(){
    var address = app.ip + "tc/taskDepartmentService/dpmmInvite/" + app.globalData.Invitation.url;
    // wx.setClipboardData({
    //   data: address,
    //   success: () => { console.log(app.globalData.Invitation.url, "测试") },
    //   fail: (e) => { console.log(e); console.log("异常") }
    // })
    api.request({},address,"post",true).then(res=>{
      console.log("邀请人信息");
      console.log(address);
      console.log(res)
      
      if(res.data.code == 200 && res.data.result){
        this.setData({
          shareScene:res.data.data,
          islogoing:true
        })
      }
      else{
        wx.redirectTo({
          url: '/pages/company/company',
        })
      }
    }).catch(e=>{
      console.log(e);
    })
  }
})