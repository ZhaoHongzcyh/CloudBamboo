// pages/taskDetails/editPlan/editplan.js
const app = getApp();
const api = require("../../../api/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    startDate:null,
    endDate:null,
    plan:null,
    alert:{content:"计划更改失败"}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({planid:options.planid});
    this.popup = this.selectComponent("#popup");
  },

  onShow: function () {
    this.getPlanInfo(this.data.planid);
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.onShow();
  },
  
  // 弹框
  alert: function () {
    this.popup.showPopup()
  },

  // 设置开始时间
  setStartDate: function(e) {
    var plan = this.data.plan;
    console.log(e);
    plan.startDate = e.detail.value + "T00:00:00.000+0800" 
    this.setData({startDate:e.detail.value,plan:plan});
  },

  // 设置结束时间
  setEndDate: function(e) {
    var plan = this.data.plan;
    plan.endDate = e.detail.value + "T00:00:00.000+0800" 
    this.setData({endDate:e.detail.value,plan:plan})
  },

  // 获取计划条目信息
  getPlanInfo: function (id) {
    var address = app.ip + "tc/schedule/summaryService/findBo";
    api.request({id},address,"POST",true).then(res=>{
      console.log("计划条目信息");
      console.log(res);
      wx.stopPullDownRefresh();
      if(res.data.code == 200 && res.data.result){
        var endDate = null;
        if (res.data.data.summaryBean.endDate != null){
          endDate = res.data.data.summaryBean.endDate;
          console.log(endDate)
          endDate = endDate.split("T")[0]
        }
        this.setData({
          plan:res.data.data.summaryBean,
          startDate:res.data.data.summaryBean.startDate.split("T")[0],
          endDate: endDate
        })
      }
    })
  },

  // 获取任务计划名称
  getPlanName: function (e) {
    var plan = this.data.plan;
    plan.title = e.detail.value;
    this.setData({plan:plan})
  },

  // 确认修改任务计划
  changePlan: function () {
    var address = app.ip + "tc/schedule/summaryService/update"
    var plan = this.data.plan;
    api.sendDataByBody(plan,address,"POST",true).then(res=>{
      console.log("修改情况");
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        wx.navigateBack()
      }
      else{
        this.alert();
      }
    }).catch(e=>{
      this.alert();
    })
  }
})