// pages/taskDetails/taskdetails.js
const app = getApp();
const library = require("./handle.js");
const api = require("../../api/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    app:app,
    alert:{
      state:false,
      content:"权限不够"
    },
    doloading:[],//正在进行下载的文件
    taskId:null,
    task:null, //任务信息
    timeline:null,//时间轴数据
    emergencyGrade:["闲置处理","正常处理","紧急处理"],
    relationPeople:[],//参与人信息
    isShowAllAction:false,//是否展示更多动态数据
    partAction:null,//部分动态
    replyContent:null,//回复内容
    calledPeople:null,//在回复内容中被@的人员
    showfile:{
      state:false,
      data:null
    }//需要被展示的文件
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.popup = this.selectComponent("#popup");
    this.setData({
      taskId:options.id
    })
    this.selectPlanChild(options.id);
  },
  // 弹框
  alert: function () {
    this.popup.showPopup()
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
        for(var i = 0; i < handle.data.actionList.length; i++){
          handle.data.actionList[i].createDate = handle.data.actionList[i].createDate.split("T")[0];
        }
        try{
          handle.data.itemBean.endDate = handle.data.itemBean.endDate.split("T")[0];
        }
        catch(e){
          console.log(e);
        }
        this.setData({
          task:handle.data,
          showfile:{
            state:false,
            data: handle.data.arcList.slice(0, 2)
          },
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
    // 查询权限
    var power = this.handlePower();
    if(power){
      wx.navigateTo({
        url: './editTask/editTask?id=' + this.data.taskId,
      })
    }
    else{
      this.alert();
    }
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
  // 显示所有文件
  showallfile: function () {
    var showfile = this.data.showfile;
    if(showfile.state){
      this.setData({
        showfile:{
          state:false,
          data:this.data.task.arcList.slice(0,2)
        }
      })
    }
    else{
      this.setData({
        showfile:{
          state: true,
          data:this.data.task.arcList
        }
      })
    }
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
    this.setData({
      replyContent: reply
    })
  },
  // 权限判定
  handlePower: function () {
    var personid = wx.getStorageSync("tcUserId");//this.data.task.itemBean.manager;
    var creatorId = this.data.task.itemBean.manager;//创建者id；
    if (creatorId == personid){
      return true;
    }
    else{
      return false;
    }
  },
  // 切换任务状态（已完成/未完成）
  switchStatus: function (e) {
    // 权限判定
    var status = e.currentTarget.dataset.status;
    status = status == 0 ? 1 : 0; 
    var power = this.handlePower();
    if(power){
      this.sendStatus(status);
    }
    else{
      var task = this.data.task;
      task.itemBean.status = status == 0 ? 1 : 0;
      this.setData({
        task:task,
        alert:{content:"权限不够"}
      })
      this.alert();
    }
  },
  // 发送切换(已完成/未完成)请求
  sendStatus: function (status) {
    var itemBean = JSON.stringify(this.data.task.itemBean);
    itemBean = JSON.parse(itemBean);
    delete itemBean.endDate;
    delete itemBean.startDate;
    itemBean.status = status;
    var address = app.ip + "tc/schedule/itemService/update";
    api.sendDataByBody(itemBean,address,"post",true).then(res=>{
      console.log("状态修改结果");
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        var task = this.data.task
        task.itemBean.status = status;
        this.setData({
          task:task
        })
      }
      else{
        // 弹框
        var alert = this.data.alert;
        alert.content = "状态更改失败";
        this.setData({
          alert:alert
        });
        this.alert();
      }
    })
  },
  // 附件下载
  downloadFile: function (e) {
    console.log(e);
    var id = e.detail.id;
    var address = app.ip + "tc/spaceService/downloadFileBatchUnlimitGet?arcIds=" + id;
    let downloadTask = wx.downloadFile({
      url:address,
      success:(res)=>{
        console.log("文件下载");
        console.log(res);
        if(res.statusCode == 200){
          // 持久保存文件
          wx.saveFile({
            tempFilePath: res.tempFilePath,
            success:(res)=>{
              console.log("保存成功");
              console.log(res.savedFilePath);
              this.setData({
                alert:{content:"下载成功"}
              })
              this.alert()
            }
          })
        }
      }
    })
    // 文件下载进度监听
  },
  // 判断文件是否正处于下载中
  fileIsDownloading: function (id) {
    var downloading = this.data.downloading;
    if(downloading.indexOf(id) < 0){
      downloading.push(id);
      this.setData({
        downloading
      })
      return true;
    }
    else{
      // 调用提示信息
      return false;
    }
  },
  // 计划条目评价
  evaluate: function (e) {
    console.log(e);
    console.log("评价")
    var address = app.ip + "tc/schedule/itemService/estimateItem";
    var head = {
      id: this.data.taskId
    };
    var personid = [];
    console.log(this.data.calledPeople);
    if(this.data.calledPeople != null){
      for (var i = 0; i < this.data.calledPeople.length; i++) {
        personid.push(this.data.calledPeople[i].personId);
      }
    }
    var body = { personIds: personid, descript: encodeURI(this.data.replyContent)}
    api.customRequest(head,body,address,"post",true).then(res=>{
      console.log("评论");
      console.log(res);
    }).catch(e=>{
      console.log(e);
    })
  }
})