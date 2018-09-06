// pages/subproject/filePreview/filepreview.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    src:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      src: app.ip + "tc/spaceService/downloadFileBatchUnlimitGet?arcId=" + options.id
      // src:"http://zcyhcx.applinzi.com"
    })
  }
})