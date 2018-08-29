// pages/subproject/ascription/ascription.js
const app = getApp();
const api = require("../../../api/common.js");
const handle = require("../common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    teamList:null//团队列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getProjectTeam();
  },
  // 获取项目归属团队列表
  getProjectTeam: function () {
    var address = app.ip + "tc/taskTeamService/findTaskTeam";
    api.request({}, address, "POST", true).then(res => {
      console.log("我的团队");
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        var data= res.data.data.list;
        data.checked = false;
        data.unshift({
          title: "个人项目",
          id: null
        })
        this.setData({teamList:res.data.data.list})
      }
    })
  },
  chooseCompany: function (e) {
    var index= e.currentTarget.dataset.index;
    var ownertype = e.currentTarget.dataset.ownertype;
    var id = e.currentTarget.dataset.id;
    var title = e.currentTarget.dataset.title;
    var teamList = this.data.teamList;
    for(var i = 0; i < teamList.length; i++){
      if(i == index){
        teamList[index].checked = true;
      }
      else{
        teamList[i].checked = false;
      }
    }
    this.setData({teamList});
    var page = getCurrentPages();
    var prevpage = page[page.length - 2];
    console.log(prevpage.data.project)
    var project = prevpage.data.project;
    project.ownerType = ownertype;
    project.ownerId = id;
    project.ownerName = title;
    prevpage.setData({project});
    wx.navigateBack();
  }
})