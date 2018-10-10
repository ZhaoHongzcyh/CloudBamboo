// pages/company/manageCompany/manageCompany.js
const app = getApp();
const api = require("../../../api/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    app:app,
    adminGroup: null,
    allGroup:[],
    alert:{content:''},
    showModel: false
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
    this.confirm = this.selectComponent("#confirm");
  },

  // 打开对话弹框
  openConfirm: function () {
    this.confirm.show();
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
      if(res.data.result && res.data.code == 200){
        this.setData({allGroup: res.data.data.list});
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
  },

  // 查看全部管理组成员
  watchAllAdmin: function () {
    wx.navigateTo({
      url: '../watchAdmin/watchadmin',
    })
  },

  // 删除公司
  delCompany: function () {
    var address = app.ip + "tc/taskTeamService/deleteTaskTeam";
    var defaultTaskTeam = wx.getStorageSync('defaultTaskTeam');
    var obj = { taskId: defaultTaskTeam}
    api.request(obj,address,"POST",true).then(res=>{
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        wx.setStorageSync('defaultTaskTeam', null)
      }
      wx.navigateBack()
    })
  },

  // 用户转让公司
  transferCompany: function () {
    var userid = wx.getStorageSync('tcUserId');
    var allGroup = this.data.allGroup;
    if(allGroup.length < 2){
      this.setData({alert:{content:'暂无更多公司成员!'}});
      this.alert();
    }
    else{
      this.transferAlert();
    }
  },

  // 无法转让弹框
  alert: function () {
    this.popup = this.selectComponent("#popup");
    this.popup.showPopup();
  },

  // 公司转让弹框
  transferAlert: function () {
    this.setData({ showModel: !this.data.showModel})
  },

  // 跳转到转让页面
  jumpTransferPage: function (e) {
    var state = e.currentTarget.dataset.state;
    wx.navigateTo({
      url: '../transfer/transfer?state=' + state,
    })
  },

  // 切换公司
  switchCompany: function () {
    wx.navigateTo({
      url: '/pages/companyList/companyList',
    })
  },

  // 添加成员
  addMember: function () {
    wx.navigateTo({
      url: '../watchAdmin/watchadmin?source=1',
    })
  }
})