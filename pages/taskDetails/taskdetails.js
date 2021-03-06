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
    edit:false,//是否具有编辑计划条目的权限
    powerId:null,
    power: {
      manager: null,
      adminGroups: null,//项目管理员组
      teamManager:null
    },//权限数据
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
    },//需要被展示的文件
    isShowMenuBtn:false,
    isPersonCreateTask:false,//是否是个人创建的任务
    isShowSubmit: true//是否显示发布按钮区域
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.popup = this.selectComponent("#popup");
    this.confirm = this.selectComponent("#confirm")
    this.setData({
      taskId:options.taskId,
      powerId:options.powerId
    })
  },

  onShow: function () {
    //this.searchPowerData(this.data.powerId);
    this.selectPlanChild(this.data.taskId);
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.onShow();
  },

  // 
  cancelmodel: function () {
    this.switchSubShow();
  },

  // 切换评论发布区域的隐藏与显示
  switchSubShow: function () {
    this.setData({ isShowSubmit: !this.data.isShowSubmit})
  },

  // 查询权限数据
  searchPowerData: function (id) {
    var isShowMenuBtn = false;
    var userid = wx.getStorageSync('tcUserId');
    var address = app.ip + "tc/taskService/findTaskBOById";
    api.request({ taskId: id }, address, "POST", true).then(res => {
      if (res.data.code == 200 && res.data.result) {
        var summaryBean = res.data.data.summaryBean;
        var power = {
          manager: summaryBean.manager,
          adminGroups: summaryBean.adminGroups,
          teamManager: summaryBean.teamManager
        }
        // 权限判定
        res.data.data.memberBeans.map((item,index)=>{
          if (item.relationType == 1 || item.relationType == 12 || item.relationType == 13 ){
            if (item.resourceId == userid){
              isShowMenuBtn = true;
            }
          }
        })
        this.setData({ power, isShowMenuBtn });
      }
      else {
        console.log("异常")
      }
    }).catch(e => {
      console.log(e);
    })
  },

  // 权限判断(旧方法)
  // handlePower: function () {
  //   var userId = wx.getStorageSync("tcUserId");
  //   var end = false;
  //   var power = this.data.power;
  //   for (var i = 0; i < power.adminGroups.length; i++) {
  //     if (userId == power.adminGroups[i]) {
  //       end = true;
  //     }
  //   }
  //   if (!end) {
  //     if (power.teamManager == userId){
  //       end = true;
  //     }
  //     if (!end) {
  //       if (userId == power.manager) {
  //         end = true;
  //       }
  //     }
  //   }
  //   return end;
  // },

  // 通过返回的新字段（edit）判断是否有权限
  handlePower: function (){
    var edit = this.data.edit;
    return edit;
  },

  // 弹框
  alert: function () {
    this.popup.showPopup()
  },

  // 根据ID查找计划条目
  selectPlanChild: function (id) {
    var userId = wx.getStorageSync('tcUserId');
    var isPersonCreateTask = false;
    var address = app.ip + "tc/schedule/itemService/findBo";
    var obj = { id };
    api.request(obj, address, "post", true).then(res => {
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        this.setData({ edit: res.data.data.edit, isShowMenuBtn: res.data.data.edit});
      }
      wx.stopPullDownRefresh();
      var handle = library.handleChild(res);
      if(handle.status){
        handle.data.arcList = api.cloudDiskDataClean(handle.data.arcList);
        handle.data.arcList = api.fileNameSort(handle.data.arcList);
        handle.data.arcList = this.setFileSrc(handle.data.arcList,app);
        handle.data.itemBean.startDate = handle.data.itemBean.startDate.split("T")[0];
        for(var i = 0; i < handle.data.actionList.length; i++){
          handle.data.actionList[i].createDate = handle.data.actionList[i].createDate.split("T")[0];
          if (handle.data.actionList[i].behType == 10001001 || handle.data.actionList[i].behType == null){
            if (handle.data.actionList[i].belongToResId == userId || handle.data.actionList[i].belongToResId == null){
              handle.data.actionList[i].edit = true;
            }
            else{
              var isProjectManager = wx.getStorageSync('isProjectManager')
              var pTeamManager = wx.getStorageSync('pTeamManager');
              if (userId == pTeamManager || isProjectManager) {
                handle.data.actionList[i].edit = true;
              }
              else {
                handle.data.actionList[i].edit = false;
              }
            }
          }
        }
        try{
          if (handle.data.itemBean.endDate != null){
            handle.data.itemBean.endDate = handle.data.itemBean.endDate.split("T")[0];
          }
          
        }
        catch(e){
          console.log(e);
        }
        if (userId == handle.data.itemBean.creatorId) {
          isPersonCreateTask = true;
        }
        this.setData({
          task:handle.data,
          isPersonCreateTask: isPersonCreateTask,
          showfile:{
            state:false,
            data: handle.data.arcList.slice(0, 2)
          },
          partAction: handle.data.actionList.slice(0,3)
        })
      }
      else{
        this.setData({alert:{state:false,content:res.data.message}});
        this.alert()
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
    if (power){
      wx.navigateTo({
        url: './editTask/editTask?id=' + this.data.taskId,
      })
    }
    else{
      let alert = this.data.alert;
      alert.content = '暂无权限编辑！'
      this.setData({alert});
      this.alert();
    }
  },

  // 复制任务
  copytask: function(){
    if(this.handlePower){
      wx.navigateTo({
        url: './copyTask/copytask?id=' + this.data.task.taskBean.id + "&taskid=" + this.data.task.itemBean.id,
      })
    }
    else{
      this.setData({alert:{content:"暂无权限复制！"}});
      this.alert();
    }
  },

  // 删除任务
  deleteTask: function () {
    var address = app.ip + "tc/schedule/itemService/delete";
    var obj = {id:this.data.task.itemBean.id};
    api.request(obj,address,"post",true).then(res=>{
      if(res.data.code == 200 && res.data.result){
        wx.navigateBack()
      }
      else{
        this.setData({alert:{content:"任务删除失败"}});
        this.alert();
      }
    })
  },

  // 展示所有任务动态
  showAllAction: function () {
    if (this.data.task.actionList.length > 3){
      this.setData({
        isShowAllAction: !this.data.isShowAllAction
      })
    }
  },

  // 显示所有文件
  showallfile: function () {
    var showfile = this.data.showfile;
    if (this.data.task.arcList.length < 3){
      return false;
    }
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
    this.setData({
      replyContent: reply
    })
  },

  // 编辑回复
  editreply: function(e){
    var num = e.detail.num;
    wx.navigateTo({
      url: './editreply/editreply?taskid=' + this.data.taskId + "&num=" + num,
    })
  },

  // 切换任务状态（已完成/未完成）
  switchStatus: function (e) {
    var item = e.currentTarget.dataset.item;
    var userId = wx.getStorageSync('tcUserId');
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
        alert:{content:"暂无权限切换状态"}
      })
      this.alert();
    }
  },

  // 发送切换(已完成/未完成)请求
  sendStatus: function (status) {
    var task = this.data.task;
    var itemBean = JSON.stringify(this.data.task.itemBean);
    itemBean = JSON.parse(itemBean);
    delete itemBean.endDate;
    delete itemBean.startDate;
    itemBean.status = status;
    var address = app.ip + "tc/schedule/itemService/update";
    api.sendDataByBody(itemBean,address,"post",true).then(res=>{
      if(res.data.code == 200 && res.data.result){
        task.itemBean.status = status;
        this.setData({
          task:task
        })
      }
      else{
        status = status == 0? 1:0;
        task.itemBean.status = status;
        // 弹框
        console.log(res);
        var alert = this.data.alert;
        alert.content = res.data.message || "状态更改失败";
        this.setData({
          alert:alert,
          task
        });
        this.alert();
      }
    })
  },

  // 附件下载
  downloadFile: function (e) {
    var id = e.detail.id;
    var address = app.ip + "tc/spaceService/downloadFileBatchUnlimitGet?arcIds=" + id;
    let downloadTask = wx.downloadFile({
      url:address,
      success:(res)=>{
        if(res.statusCode == 200){
          // 持久保存文件
          wx.saveFile({
            tempFilePath: res.tempFilePath,
            success:(res)=>{
              this.setData({
                alert:{content:"下载成功"}
              })
              this.alert()
            }
          })
        }
      }
    })
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

  // 打开对话弹框
  openConfirm: function (){
    this.confirm.show();
    this.switchSubShow();
  },

  // 删除任务请求
  deletetask: function () {
    this.confirm.hide();
    var address = app.ip + "tc/schedule/itemService/delete";
    var id = this.data.taskId;
    api.request({id},address,"POST",true).then(res=>{
      if(res.data.code == 200 && res.data.result){
        wx.navigateBack({
          delta: 1
        })
      }
      else{
        this.setData({
          alert:{content:"任务删除失败"}
        });
        this.alert();
      }
    }).catch(e=>{
      this.setData({
        alert: { content: "任务删除失败" }
      });
      this.alert();
    })
  },

  //确认删除
  sure:function () {
    var power = this.handlePower();
    if(power){
      this.deletetask();
    }
    else{
      if (this.data.task.itemBean.creatorId != wx.getStorageSync('tcUserId')){
        this.setData({
          alert: {
            content: "暂无权限！"
          }
        })
        this.alert();
        return false;
      }
      else{
        this.deletetask();
      }
    }
  },

  // 评论任务
  evaluate: function () {
    var address = app.ip + "tc/schedule/itemService/estimateItem";
    if(this.data.replyContent == null || this.data.replyContent == ""){
      this.setData({alert:{content:"评论内容为空",state:false}});
      this.alert();
      return false;
    }
    var obj = { id: this.data.taskId, descript: encodeURI(this.data.replyContent)};
    api.request(obj,address,"POST",true).then(res=>{
      if(res.data.code == 200 && res.data.result){
        var task = this.data.task;
        res.data.data.createDate = res.data.data.createDate.split("T")[0];
        res.data.data.edit = true;
        // res.data.data.behType = 10001001;
        task.actionList.unshift(res.data.data);
        this.setData({ task: task, isShowAllAction: true, replyContent:""})
      }
      else{
        this.setData({alert:{content:"评论失败"}});
        this.alert();
      }
    }).catch(e=>{
      this.setData({ alert: { content: "评论失败" } });
      this.alert();
    })
  }
})