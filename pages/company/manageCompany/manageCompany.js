// pages/company/manageCompany/manageCompany.js
const app = getApp();
const api = require("../../../api/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    app:app,
    adminGroup: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getManagerGroup();
  },

  // 获取公司管理组成员
  getManagerGroup: function ( ) {
    var address = app.ip + "tc/taskMemberService/findPageTaskMember";
    var defaultTaskTeam = wx.getStorageSync('defaultTaskTeam');
    var obj = {
      memberRelTypes: 13,
      taskId: defaultTaskTeam
    };
    api.request(obj,address,"POST",true).then(res=>{
      console.log(res);
      if(res.data.result && res.data.code == 200){
        this.handleAdminGroup( res.data.data.list);
      }
    }).catch(e=>{
      console.log(e);
    })
  },

  // 处理公司管理员数据
  handleAdminGroup: function (list) {
    var adminGroup = [];
    list.map(item=>{
      if (item.relationType == 13){
        adminGroup.push(item);
      }
    })
    this.setData({adminGroup});
  }
})