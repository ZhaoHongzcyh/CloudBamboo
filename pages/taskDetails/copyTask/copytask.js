// pages/taskDetails/copyTask/copytask.js
const app = getApp();
const api = require("../../../api/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskId:null//任务id
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      taskId:options.id
    });
    this.loadPlanList();
  },
  // 加载计划列表
  loadPlanList: function(){
    var address = app.ip + "tc/schedule/summaryService/findBoListByResource";
    var obj = {
      resourceId:this.data.taskId,
      resourceType: 10010001
    }
    api.request(obj,address,"post",true).then(res=>{
      console.log("计划清单");
      console.log(res);
    })

  }
})