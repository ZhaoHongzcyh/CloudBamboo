// pages/addTask/addtask.js
const app = getApp();
const api = require("../../api/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskName:null,//任务计划名称
    startDate:null,//任务开始时间
    endDate:"",
    resourceId:null//所属资源ID
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.setData({
      resourceId: options.resourceId
    })
    this.getStartDate()
  },
  // 初始化任务开始时间
  getStartDate: function () {
    this.setData({
      startDate: api.nowTime()
    })
  },
  // 得到用户输入的任务计划名称
  getTaskName: function (e) {
    var taskName = e.detail.value;
    this.setData({
      taskName:taskName
    })
  },
  // 设置开始时间
  startDate: function (e) {
    var value = e.detail.value;
    this.setData({
      startDate: value,
      endDate:""
    })
  },
  // 设置结束时间
  endDate: function (e) {
    console.log("结束")
    var value = e.detail.value;
    this.setData({
      endDate:value
    })
  },
  submit: function(){
    var address = app.ip + "tc/schedule/summaryService/add";
    var scheduleSummaryBean = {
      title: encodeURI(this.data.taskName),
      resourceType: 10010001,//所属资源类型
      resourceId: this.data.resourceId,//所属资源ID
      startDate: this.data.startDate + "T00:00:00.000+0800"//开始时间
    };
    if(this.data.endDate != ""){
      scheduleSummaryBean.endDate = this.data.endDate + "T00:00:00.000+0800";
    }
    var obj = {scheduleSummaryBean}
    console.log(scheduleSummaryBean);
    api.sendDataByBody(scheduleSummaryBean,address,"post",true).then(res=>{
      console.log(obj)
      console.log("新建任务");
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        
      }
      else{

      }
    }).catch(e=>{
      console.log(e);
    })
  }
})