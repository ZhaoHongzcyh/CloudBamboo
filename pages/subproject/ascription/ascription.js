// pages/subproject/ascription/ascription.js
const app = getApp();
const api = require("../../../api/common.js");
const handle = require("../common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    teamList:null,//团队列表
    taskId:null,
    summaryBean:null,
    alert:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.popup = this.selectComponent("#popup");
    this.setData({
      taskId:options.taskid
    })
  },

  onShow: function () {
    this.getProjectTeam();
    this.getProjectInfo();
  },

  // 弹框
  alert: function () {
    this.popup.showPopup()
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
    var summaryBean = this.data.summaryBean;
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
    summaryBean.ownerType = ownertype;
    summaryBean.ownerId = id;
    this.setData({ teamList, summaryBean});
    this.setProject(summaryBean);
  },

  // 获取项目详细信息
  getProjectInfo: function () {
    var address = app.ip + "tc/taskService/findTaskBOById";
    var obj = { taskId: this.data.taskId };
    api.request(obj, address, "POST", true).then(res => {
      console.log("项目详细信息");
      console.log(res);
      if (res.data.code == 200 && res.data.result) {
        var summaryBean = res.data.data.summaryBean;
        this.setData({
          summaryBean
        })
      }
    }).catch(e => {
      console.log("请求异常")
    })
  },

  // 设置项目所属
  setProject: function (obj){
    var address = app.ip + "tc/taskService/addOrUpdateTask";
    obj = {
      summaryBean:obj
    }
    api.request(obj, address, "POST", false).then(res => {
      console.log("完结项目");
      console.log(res);
      if (res.data.code == 200 && res.data.result) {
        wx.navigateBack({
          delta: 2
        })
      }
      else{
        this.setData({alert:{content:"更改失败"}});
        this.alert();
      }
    }).catch(e=>{
      this.setData({ alert: { content: "更改失败" } });
      this.alert();
    })
  }
})