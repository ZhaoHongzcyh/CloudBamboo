// pages/subproject/chooseProject/chooseproject.js
const app = getApp();
const api = require("../../../api/common.js");
const handle = require("../common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    app:app,
    companyList:null,
    ownerId:null,
    userid:null,
    checked:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var userid = wx.getStorageSync('tcUserId');
    if(options.ownerid != null){
      this.setData({ ownerId: options.ownerid, userid,checked:false})
    }
  },

  onShow: function () {
    this.getProjectList();
  },

  // 获取项目列表
  getProjectList: function () {
    var obj = {
      taskId: wx.getStorageSync("defaultTaskTeam")
    }
    var address = app.ip + "tc/taskTeamService/findTaskTeam";
    api.request(obj, address, "post", true).then(res => {
      console.log("项目所属");
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        var companyList = res.data.data.list;
        companyList.map((item,index)=>{
          if(item.id == this.data.ownerId){
            item.checked = true;
          }
          else{
            item.checked = false;
          }
        })
        this.setData({
          companyList: companyList
        })
      }
    })
  },

  // 用户选择项目所属
  chooseAscription: function (e) {
    console.log(e);
    var owerId = e.currentTarget.dataset.id;
    var title = e.currentTarget.dataset.title;
    var page = getCurrentPages();
    var length = page.length;
    var prevPage = page[length - 2];
    var projectOwner = { ownerId: owerId,title:title};
    prevPage.setData({ ownerId: owerId, projectOwner});
    wx.navigateBack({});
  },

  // 复制到个人项目
  choosePerson: function () {
    var page = getCurrentPages();
    var length = page.length;
    var prevPage = page[length - 2];
    var projectOwner = { ownerId: null, title: '个人项目' };
    prevPage.setData({ ownerId: owerId, projectOwner });
    this.setData({ checked: true})
    wx.navigateBack({});
  }
})