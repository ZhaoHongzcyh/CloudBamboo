// pages/subproject/descript/deacript.js
const app = getApp();
const api = require("../../../api/common.js");
const handle = require("../common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    project:null,
    taskId:null,
    alert:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.popup = this.selectComponent("#popup");
    this.setData({
      taskId: options.taskid
    })
  },

  onShow: function () {
    this.getProjectInfo();
  },

  // 弹框
  alert: function () {
    this.popup.showPopup()
  },

  // 获取项目详细信息
  getProjectInfo: function () {
    var address = app.ip + "tc/taskService/findTaskBOById";
    var obj = { taskId: this.data.taskId };
    api.request(obj, address, "POST", true).then(res => {
      if (res.data.code == 200 && res.data.result) {
        var project = res.data.data.summaryBean;
        this.setData({
          project: res.data.data.summaryBean
        })
      }
    })
  },

  // 修改项目名称
  changeProjectName: function (e) {
    var project = this.data.project;
    project.title = e.detail.value;
    this.setData({project})
  },

  // 修改项目描述
  changeProjectDescript: function (e) {
    var project = this.data.project;
    project.description = e.detail.value;
    this.setData({project})
  },
  
  // 保存项目信息
  saveProjectInfo: function () {
    var page =getCurrentPages();
    var prevPage = page[ page.length - 2 ];
    var prevProject = prevPage.data.project;
    var project = this.data.project;
    prevProject.title = project.title;
    prevProject.description = project.description;
    prevPage.setData({
      project:prevProject
    });
    wx.navigateBack();
  },

  // 保存project信息
  saveSummaryBean: function () {
    var summaryBean = this.data.project;
    var address = app.ip + "tc/taskService/addOrUpdateTask";
    var obj = {
      summaryBean: summaryBean
    }
    api.request(obj, address, "POST", false).then(res => {
      if(res.data.code == 200 && res.data.result){
        this.saveProjectInfo();
      }
      else{
        this.setData({alert:{content:"编辑失败"}});
        this.alert()
      }
    }).catch(e=>{
      this.setData({ alert: { content: "编辑失败" } });
      this.alert()
    })
  },
})