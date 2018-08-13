// pages/taskDetails/copyTask/copytask.js
const app = getApp();
const api = require("../../../api/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskId:null,//任务id
    sourceId:null,//源id
    planList:null//计划分类列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("复制");
    console.log(options);
    this.setData({
      taskId:options.id,
      sourceId:options.taskid
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
      if(res.data.code == 200 && res.data.result){
        this.handlePlanList(res.data.data.list);
        this.setData({
          planList: res.data.data.list
        })
      }
      else{
        console.log("异常")
      }
    })

  },
  // 处理计划清单数据
  handlePlanList: function (res) {
    
  },
  // 复制任务
  copyTask: function (e) {
    console.log(e);
    var targetId = e.currentTarget.dataset.id;
    var address = app.ip + "tc/schedule/itemService/copy";
    var sourceId = this.data.sourceId;
  
    var obj = {
      id: sourceId,
      summaryId: targetId
    }
    console.log(obj);
    api.request(obj,address,"post",true).then(res=>{
      console.log("复制信息");
      console.log(res);
    })
  }
})