// pages/taskDetails/copyTask/copytask.js
const app = getApp();
const api = require("../../../api/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    alert:{
      content:"复制失败"
    },
    taskId:null,//任务id
    sourceId:null,//源id
    planList:null//计划分类列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.popup = this.selectComponent("#popup");
    this.setData({
      taskId:options.id,
      sourceId:options.taskid
    });
  },

  onShow: function () {
    this.loadPlanList();
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.onShow();
  },

  // 弹框
  alert: function () {
    this.popup.showPopup();
  },
  
  // 加载计划列表
  loadPlanList: function(){
    var address = app.ip + "tc/schedule/summaryService/findBoListByResource";
    var obj = {
      resourceId:this.data.taskId,
      resourceType: 10010001
    }
    api.request(obj,address,"post",true).then(res=>{
      wx.stopPullDownRefresh();
      if(res.data.code == 200 && res.data.result){
        this.setData({
          planList: res.data.data.list
        })
      }
      else{
        this.setData({alert:{content:res.data.message}});
        this.alert();
      }
    }).catch(e=>{
      this.setData({alert:{content:'任务组列表加载失败'}});
      this.alert();
    })

  },

  // 复制任务
  copyTask: function (e) {
    var targetId = e.currentTarget.dataset.id;
    var address = app.ip + "tc/schedule/itemService/copy";
    var sourceId = this.data.sourceId;
  
    var obj = {
      id: sourceId,
      summaryId: targetId
    }
    api.request(obj,address,"post",true).then(res=>{
      if(res.data.code == 200 && res.data.result){
        wx.navigateBack({
          delta:2
        })
      }
      else{
        this.alert();
      }
    }).catch(e=>{
      this.setData({alert:{content:'网络异常'}});
      this.alert();
    })
  }
})