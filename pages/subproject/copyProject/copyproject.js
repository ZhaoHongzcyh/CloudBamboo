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
    copyMember: false//是否复制成员
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.popup = this.selectComponent("#popup");
    this.setData({
      taskId:options.taskid
    })
  },

  onShow: function () {
    this.getProjectInfo();
  },

  // 弹框
  alert: function () {
    this.popup.showPopup()
  },

  // 获取用户输入的项目名称
  getProjectName: function (e) {
    console.log(e);
    this.setData({
      name: e.detail.value
    })
  },

  // 获取项目详细信息
  getProjectInfo: function () {
    var address = app.ip + "tc/taskService/findTaskBOById";
    var obj = { taskId: this.data.taskId };
    api.request(obj, address, "POST", true).then(res => {
      console.log("详细信息");
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        var summaryBean = res.data.data.summaryBean;
        var arcSummaryBeans = res.data.data.arcSummaryBeans;
        this.setData({ summaryBean, arcSummaryBeans})
      }
    })
  },

  // 复制项目
  copyProject: function () {
    var address = app.ip + "tc/taskService/copyTask";
    var obj = {
      taskId: this.data.taskId,
      title: encodeURI(this.data.name),
      ownerType: 10000003,
      copyScheduleSummary: this.data.copyScheduleSummary.toString(),//是否复制计划清单
      copyArc: this.data.copyArc.toString(),//是否复制文档
      copyMember: this.data.copyMember.toString()//是否复制成员
    }
    console.log(obj);
    // return false;
    api.request(obj,address,"POST",true).then(res=>{
      console.log("复制结果");
      console.log(res);
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
  }
})