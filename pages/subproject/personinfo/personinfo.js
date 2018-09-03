// pages/subproject/personinfo/personinfo.js
const app = getApp();
const api = require("../../../api/common.js");
const handle = require("../common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    app:app,
    resourceId:null,
    person:null,//联系人详情信息
    team:null,
    alert:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.confirm = this.selectComponent("#confirm");
    this.popup = this.selectComponent("#popup");
    this.setData({
      resourceId: options.personid
    })
  },

  onShow: function () {
    this.getUserInfo();
  },

  // 打开对话弹框
  openConfirm: function () {
    this.confirm.show();
  },

  // 弹框
  alert: function () {
    this.popup.showPopup()
  },

  // 获取用户详细信息
  getUserInfo: function () {
    var address = app.ip + "tc/userContactService/findContactsById";
    var obj = { personId: this.data.resourceId};
    api.request(obj,address,"POST",true).then(res=>{
      console.log("联系人信息");
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        this.setData({
          person:res.data.data.person,
          team:res.data.data.team
        })
      }
      else{

      }
    })
  },

  // 拨打电话
  callphone: function (e) {
    var phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },

  // 删除联系人
  delconnect: function () {
    if(this.data.team == null){
      this.setData({alert:{content:"该联系人不在通讯录中!或者已被删除"}});
      this.alert();
      return false;
    }
    var address = app.ip + "tc/userContactService/deletePersonFromTeam";
    var obj = {
      teamId: this.data.team.id,
      perId:this.data.person.id
    }
   api.request(obj,address,"POST",true).then(res=>{
     console.log("删除结果");
     console.log(res);
     if(res.data.code == 200 && res.data.result){
       this.setData({alert:{content:"删除成功"}});
       this.alert();
       setTimeout(()=>{
         wx.navigateBack()
       },1800)
     }
   }) 
  }
})