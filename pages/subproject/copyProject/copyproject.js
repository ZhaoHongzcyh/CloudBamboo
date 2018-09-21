// pages/subproject/copyProject/copyproject.js
const app = getApp();
const api = require("../../../api/common.js");
const handle = require("../common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    alert:null,
    name:null,
    summaryBean:null,
    taskId:null,
    arcSummaryBeans:null,
    copyScheduleSummary:false,//是否复制计划清单
    copyArc: false,//是否复制文档
    copyMember: false,//是否复制成员
    ownerId:null,//项目所属
    projectOwner: { ownerId:null,title:'个人项目'}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.popup = this.selectComponent("#popup");
    this.setData({
      taskId:options.taskid
    })
    this.getProjectInfo();
  },

  onShow: function () {
    
  },

  // 下拉刷新
  onPullDownRefresh: function (e) {
    this.getProjectInfo();
  },

  // 弹框
  alert: function () {
    this.popup.showPopup()
  },

  // 获取用户输入的项目名称
  getProjectName: function (e) {
    this.setData({
      name: e.detail.value
    })
  },

  // 获取项目详细信息
  getProjectInfo: function () {
    var address = app.ip + "tc/taskService/findTaskBOById";
    var obj = { taskId: this.data.taskId };
    api.request(obj, address, "POST", true).then(res => {
      wx.stopPullDownRefresh()
      if(res.data.code == 200 && res.data.result){
        var summaryBean = res.data.data.summaryBean;
        var arcSummaryBeans = res.data.data.arcSummaryBeans;
        this.setData({ summaryBean, arcSummaryBeans})
      }
    })
  },

  // 确定是否输入项目名称
  isInputProjectName: function (projectName) {
    if (projectName == null || projectName == "") {
      this.setData({ alert: { content: '项目名称不能为空' } });
      this.alert();
      return false;
    }
    else {
      var reg = /\s/img;
      var length = projectName.split("").length;
      var spacing = [];
      spacing = projectName.match(reg);
      if (spacing != null && length == spacing.length) {
        this.setData({ alert: { content: '项目名称不能为空' } });
        this.alert();
        return false;
      }
      else {
        return true;
      }
    }
  },

  // 复制项目
  copyProject: function () {
    if (!this.isInputProjectName(this.data.name)){
      return false;
    }
    var address = app.ip + "tc/taskService/copyTask";
    var obj = {
      taskId: this.data.taskId,
      title: encodeURI(this.data.name),
      ownerType: 10000003,
      copyScheduleSummary: this.data.copyScheduleSummary.toString(),//是否复制计划清单
      copyArc: this.data.copyArc.toString(),//是否复制文档
      copyMember: this.data.copyMember.toString()//是否复制成员
    }
    if(this.data.ownerId != null){
      obj.ownerId = this.data.ownerId;
      obj.ownerType= 40010001;
    }
    api.request(obj,address,"POST",true).then(res=>{
      if(res.data.code == 200 && res.data.result){
        this.setData({alert:{content:"已成功复制项目"}});
        this.alert();
        setTimeout(()=>{
          wx.navigateBack({
            delta:3
          })
        },1500)
      }
      else{
        this.setData({ alert: { content: "复制失败" } });
        this.alert();
      }
    })
  },

  // 是否复制计划清单
  copyScheduleSummary: function() {
    this.setData({ copyScheduleSummary: !this.data.copyScheduleSummary})
  },

  // 是否复制文件
  copyArc: function () {
    this.setData({ copyArc: !this.data.copyArc});
  },

  // 是否复制成员
  copyMember: function () {
    this.setData({ copyMember: !this.data.copyMember})
  },

  // 选择项目所属
  chooseProject: function () {
    var summaryBean = this.data.summaryBean;
    if (summaryBean.parentId != 0 ){
      return false;
    }
    wx.navigateTo({
      url: '../chooseProject/chooseproject?taskid=' + this.data.taskId + "&ownerid=" + this.data.ownerId,
    })
  }
})