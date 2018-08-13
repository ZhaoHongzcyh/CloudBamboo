// pages/taskDetails/taskdetails.js
const app = getApp();
const library = require("./handle.js");
const api = require("../../api/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskId:null,
    task:null, //任务信息
    emergencyGrade:["闲置处理","正常处理","紧急处理"],
    relationPeople:[],//参与人信息
    isShowAllAction:false,//是否展示更多动态数据
    partAction:null,//部分动态
    replyContent:null,//回复内容
    calledPeople:null//在回复内容中被@的人员
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      taskId:options.id
    })
    this.selectPlanChild(options.id);
  },
  // 当页面重载
  onUnload: function(){
    console.log("页面重载")
    this.selectPlanChild(this.data.taskId);
  },
  // 根据ID查找计划条目
  selectPlanChild: function (id) {
    var address = app.ip + "tc/schedule/itemService/findBo";
    var obj = { id };
    api.request(obj, address, "post", true).then(res => {
      console.log("计划条目");
      console.log(res);
      var handle = library.handleChild(res);
      if(handle.status){
        handle.data.arcList = api.cloudDiskDataClean(handle.data.arcList);
        handle.data.arcList = api.fileNameSort(handle.data.arcList);
        handle.data.arcList = this.setFileSrc(handle.data.arcList,app);
        handle.data.itemBean.startDate = handle.data.itemBean.startDate.split("T")[0];
        try{
          handle.data.itemBean.endDate = handle.data.itemBean.endDate.split("T")[0];
        }
        catch(e){
          console.log(e);
        }
        this.setData({
          task:handle.data,
          partAction: handle.data.actionList.slice(0,3)
        })
        console.log(this.data.task)
      }
      else{
        console.log(handle);
      }
    })
  },
  // 设置文件云盘路径
  setFileSrc: function (fileAry,app) {
    var proxyUserToken = wx.getStorageSync("proxyUserToken");
    for(var i =  0; i < fileAry.length; i++){
      if (fileAry[i].atype == 7){
        var src = app.ip + "/tc/spaceService/showImg/" + proxyUserToken + "/" + fileAry[i].id + "/300/300"
        fileAry[i].src = src;
      }
    }
    return fileAry
  },
  // 获取任务参与人
  getParticipants: function() {
    wx.navigateTo({
      url: './participants/participants?id=' + this.data.taskId,
    })
  },
  // 查看任务描述
  watchDescript: function () {
    wx.navigateTo({
      url: './taskdescription/taskdescription?id=' + this.data.taskId,
    })
  },
  // 编辑任务
  edittask: function () {
    wx.navigateTo({
      url: './editTask/editTask?id=' + this.data.taskId,
    })
  },
  // 复制任务
  copytask: function(){
    wx.navigateTo({
      url: './copyTask/copytask?id=' + this.data.task.taskBean.id + "&taskid=" + this.data.task.itemBean.id,
    })
  },
  // 删除任务
  deleteTask: function () {
    var address = app.ip + "tc/schedule/itemService/delete";
    var obj = {id:this.data.task.itemBean.id};
    api.request(obj,address,"post",true).then(res=>{
      if(res.data.code == 200 && res.data.result){
        console.log("删除回复");
        console.log(res);
      }
      else{
        console.log("删除失败")
      }
    })
  },
  // 展示所有任务动态
  showAllAction: function () {
    this.setData({
      isShowAllAction: !this.data.isShowAllAction
    })
  },
  // 任务回复
  reply: function (e) {
    var reply = e.detail.value;
    var length = reply.length;
    console.log(e);
    if(reply[e.detail.cursor-1] == "@"){
      console.log("打开执行人与参与人列表");
      wx.navigateTo({
        url: './peopleList/peoplelist?taskid=' + this.data.task.itemBean.id + "&num=" + (e.detail.cursor - 1),
      })
    }
    else {
      console.log(reply);
    }
    var reg = /\<span*\<\/span$/g
    if(reply.match(reg)){
      var replyAry = reply.split("@");
      replyAry = replyAry.splice(0, replyAry.length - 1);
      reply = reply.replace(reg, replyAry.join("@"));
    }
    this.setData({
      replyContent: reply
    })
  }
})