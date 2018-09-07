// pages/addCompany/industry/industry.js
const app = getApp();
const api = require("../../../api/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    industry:null,
    industryTitle:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      industryTitle:options.title
    })
  },

  onShow: function () {
    this.getIndustry();
  },

  // 获取公司行业信息
  getIndustry: function () {
    var address = app.ip + "tc/SystemService/findDictionaryListByType";
    var obj = {
      typeStr: "T00009"
    }
    api.request(obj, address, "POST", true).then(res => {
      console.log("行业列表");
      console.log(res);
      var data = res.data.data;
      data.map((item,index)=>{
        if (item.name == this.data.industryTitle){
          item.select = true;
        }
        else{
          item.select = false;
        }
      })
      if (res.data.code == 200 && res.data.result) {
        this.setData({
          industry: res.data.data
        })
      }
    })
  },

  // 选择行业数据
  selectIndustry: function (e) {
    var item = e.currentTarget.dataset.item;
    var page = getCurrentPages();
    var length = page.length;
    var prevPage = page[length-2];
    prevPage.setData({
      industry:item
    })
    wx.navigateBack();
  },

  
})