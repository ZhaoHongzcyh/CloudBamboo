// pages/company/companyFile/companyfile.js
const app = getApp();
const api = require("../../../api/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCompanyFile();
  },

  // 获取公司文件
  getCompanyFile: function () {
    var address = app.ip + "tc/taskService/findByFolderIdToAuth";
    var obj = { taskId: wx.getStorageSync('defaultTaskTeam')};
    api.request(obj,address,"POST",true).then(res=>{
      console.log("公司文件");
      console.log(res);
    })
  }
})