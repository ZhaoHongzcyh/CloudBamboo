// pages/taskDetails/taskdescription/taskdescription.js
const app = getApp();
const api = require("../../../api/common.js");
const library = require("../handle.js");
var WxParse = require('../../../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskId:null,
    description:null//任务描述
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      taskId:options.id
    })
    this.loadDescript(options.id)
  },
  loadDescript: function (id) {
    var address = app.ip + "tc/schedule/itemService/findBo";
    var obj = { id };
    api.request(obj, address, "post", true).then(res => {
      console.log("描述条目");
      var handle = library.handleChild(res);
      if (handle.status) {
        WxParse.wxParse('description', 'html', handle.data.itemBean.description, this, 5)
        // this.setData({
        //   description: handle.data.itemBean.description
        // })
      }
      else {
        console.log(handle);
      }
    })
  }
})