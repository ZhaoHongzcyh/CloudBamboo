// pages/taskDetails/planTeam/planteam.js
const app = getApp();
const api = require("../../../api/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskid:null,
    plan:null,
    planid:null,
    title:null,
    options:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.setData({taskid:options.taskId,planid:options.planid,options:options});
  },
  onShow: function(){
    this.getPlanList(this.data.taskid);
  },
  // 获取任务计划列表
  getPlanList: function (id) {
    var address = app.ip + "tc/schedule/summaryService/findBoListByResource";
    var obj = {
      resourceType: 10010001,
      resourceId: id,
      orderType: "DESC"
    }
    api.request(obj, address, "post", true).then(res => {
      console.log("列表");
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        var plan = res.data.data.list;
        for(var i = 0; i < plan.length; i++){
          if(plan[i].summaryBean.id == this.data.planid){
            plan[i].select = true;
          }
          else{
            plan[i].select = false;
          }
        }
        console.log("___________");
        console.log(this.data.planid);
        console.log(plan)
        this.setData({plan})
      }
      else{
        console.log("计划清单加载失败")
      }
    })
  },
  // 获取任务计划的信息
  getPlanInfo: function (e) {
    var item = e.currentTarget.dataset.item;
    var index = e.currentTarget.dataset.index;
    var plan = this.data.plan;
    plan[index].select = true;
    for(var i = 0; i < plan.length; i++){
      plan[i].select = false;
      if(i == index){
        plan[i].select = true;
      }
    }
    this.setData({
      plan:plan,
      planid:item.summaryBean.id,
      title:item.summaryBean.title
    });
    this.backTo();
  },
  // 返回上一级列表
  backTo: function() {
    var task = null;
    var options = this.data.options;
    var page = getCurrentPages();
    var prevPage = page[page.length - 2];
    
    if(options.page == 'edit'){
      task = prevPage.data.task;
      task.scheduleSummaryBean.title = this.data.title;
      console.log(task);
      console.log("设置")
      prevPage.setData({
        task:task,
        planid: this.data.planid,
      })
    }
    else{
      prevPage.setData({
        planid: this.data.planid,
        title: this.data.title,
      })
    }
    wx.navigateBack();
  }
})