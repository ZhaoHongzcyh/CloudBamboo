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
      src: this.getSrc(options)
    })
  },

  // 根据文件类型返回不同的src
  getSrc: function (options) {
    var atype = options.atype;
    var src = null;
    if(atype == 3){
      src = app.filePreview + "tc/office/open?m=readOnly&arcId=" + options.id + "&proxyUserToken=" + wx.getStorageSync('proxyUserToken');
    }
    else if(atype == 6 || atype == 5){
      src = app.filePreview + "tc/knowledge/previewPdf/?arcId=" + options.id + "&title=" + options.filename;
    }
    return src;
  }
})