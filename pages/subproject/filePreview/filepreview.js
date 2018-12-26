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
    if(atype == 3 || atype == 2){
      options.filename = encodeURI(options.filename)
      src = app.filePreview + "tc/knowledge/previewPdf/?arcId=" + options.id + "&title=" + options.filename;
      // src = app.filePreview + "tc/office/open?m=readOnly&arcId=" + options.id + "&proxyUserToken=" + wx.getStorageSync('proxyUserToken');
      src = app.filePreview + "tc/knowledge/previewPdfWX/?arcId=" + options.id + "&title=" + options.filename;
    }
    else if(atype == 6 || atype == 5 || atype == 4){
      options.filename = encodeURI(options.filename)
      src = app.filePreview + "tc/knowledge/previewPdf/?arcId=" + options.id + "&title=" + options.filename;
      src = app.filePreview + "tc/knowledge/previewPdfWX/?arcId=" + options.id + "&title=" + options.filename;
      console.log(src)
    }
    return src;
  },

  // 文件下载https://xz.yzsaas.cn
  downloadFile: function (src) {
    wx.downloadFile({
      url:src,
      success:(res)=>{
        console.log("文件下载成功");
        console.log(res);
        wx.openDocument({
          filePath: res.tempFilePath,
          success: function(re){
            console.log(re);
          }
        })
      }
    })
  }
})