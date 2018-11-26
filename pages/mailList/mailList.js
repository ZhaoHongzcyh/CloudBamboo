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
  
  // 获取联系人列表
  getGroup:function(){
    // var address = app.ip + "tc/userContactService/getPersonContacts";
    var address = app.ip + "tc/userContactService/getPersonContacts2"
    api.request({ getGroupChat:"true"},address,"POST",true).then(res=>{
      if(res.data.code == 200 && res.data.result){
        console.log(res);
        let list = res.data.data.contactTeamList;
        let group = { id: '1234', teamName: '我的群组',members: res.data.data.companyList.length};
        list.push(group)
        this.setData({
          list: list//res.data.data.contactTeamList
        })
      }
      wx.stopPullDownRefresh();//关闭下拉刷新
    })
  },

  // 获取当前用户的分组
  getGroupInfo: function () {
    wx.navigateTo({
      url: '',
    })
  }
})