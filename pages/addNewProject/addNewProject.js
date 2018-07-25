//logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    user: [
      {
        name: "admin",
        role: 1,//1:管理员，0：普通用户
        head: "./img/head.png"//头像路径
      }
    ]
  },
  onLoad: function () {
    // 弹框
    this.popup = this.selectComponent("#popup");
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return util.formatTime(new Date(log))
      })
    })
  },
  alert: function () {
    this.popup.showPopup()
  },
  // 删除成员
  delete: function (e) {
    var index = e.currentTarget.dataset.index;
    var user = this.data.user;
    user.splice(index, 1);
    this.setData({
      user: user
    })
  }
})
