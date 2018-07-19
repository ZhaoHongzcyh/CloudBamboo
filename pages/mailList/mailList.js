// pages/mailList/mailList.js
const app = getApp();
Page({
  data: {
    equipment:{
      src:"/pages/mailList/img/equipment.png",
      title:"我的设备"
    },
    list:[
      {
        src:"/pages/mailList/img/head.png",
        title:"我的好友",
        num:2
      },
      {
        src: "/pages/mailList/img/head.png",
        title: "自定义分组",
        num: 0
      },
      {
        src: "/pages/mailList/img/head.png",
        title: "陌生人",
        num: 0
      }
    ],
    group:{
      src: "/pages/mailList/img/head.png",
      title: "我的群组",
      num: 1
    }
  },
  onLoad:function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  }
})