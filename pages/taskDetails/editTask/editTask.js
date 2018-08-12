// pages/taskDetails/editTask/editTask.js
const app = getApp();
const api = require("../../../api/common.js");
const library = require("../handle.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    app:app,
    taskId:null,
    projectId:null,
    task:null,//任务信息
    startDate:null,//任务开始时间
    endDate:null,//结束时间
    emergencyGrade: ["闲置处理", "正常处理", "紧急处理"],//紧急状态
    isAddMember: false,//是否添加参与人
    isChangeImplement:false,//是否更改执行人
    memberlist:[],//参与人
    memberid:[],//参与人id
    hasSelectId:[],//用户勾选的参与人id
    searchMatch:[],//搜索人员匹配结果
    resourceId:null,
    title:null,//任务名称
    taskObj:{}//任务对象
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      taskId: options.id
    })
    this.selectPlan(options.id)
  },
  // 根据ID查找任务
  selectPlan: function (id) {
    var address = app.ip + "tc/schedule/itemService/findBo";
    var obj = { id };
    api.request(obj, address, "post", true).then(res => {
      console.log("编辑任务");
      console.log(res);
      var handle = library.handleChild(res);
      if (handle.status) {
        if (handle.data.itemBean.endDate != null) {
          handle.data.itemBean.endDate = handle.data.itemBean.endDate.split("T")[0]
        }
        // 将参与人整理到单独的数组中，方便管理
        var member = [];//参与人
        // 将参与人id统计
        var memberid = [];//参与人id集合
        var list = handle.data.memberList;
        for (var i = 0; i < list.length; i++){
          if(list[i].relationType == 2){
            member.push(list[i]);
            memberid.push(list[i].personId)
          }
        }
        this.setData({
          task: handle.data,
          startDate: handle.data.itemBean.startDate.split("T")[0],
          endDate: handle.data.itemBean.endDate,
          memberlist:member,
          memberid: memberid,
          hasSelectId: memberid,
          taskObj:handle.data.itemBean,
          resourceId: handle.data.itemBean.resourceId,
          projectId:handle.data.taskBean.id
        })
      }
      else {
        console.log(handle);
      }
    })
  },
  // 修改任务名称
  changeTaskName: function(e){
    console.log(e);
    var taskName = e.detail.value;
    var taskObj = this.data.taskObj;
    taskObj.title = taskName
    this.setData({
      taskObj:taskObj
    })
  },
  // 设置开始时间
  startDate: function (e) {
    var startDate = e.detail.value;
    var taskObj = this.data.taskObj;
    taskObj.startDate = startDate + "T08:53:34.892+0800";
    this.setData({
      taskObj:taskObj,
      startDate:startDate,
      endDate:null
    })
  },
  // 设置结束时间
  setendDate: function(e){
    console.log("结束hi时间")
    var endDate = e.detail.value;
    var taskObj = this.data.taskObj;
    taskObj.endDate = endDate + "T08:53:34.892+0800";
    this.setData({
      taskObj:taskObj,
      endDate: endDate
    })
  },
  // 设置可见范围
  setWatchArea: function (e) {
    console.log(e);
    var taskObj = this.data.taskObj;
    if(e.detail.value){
      taskObj.visibilityType = 1;
    }
    else{
      taskObj.visibilityType = 0;
    }
    this.setData({
      taskObj:taskObj
    })
  },
  // 选择改变执行人采单
  switchImplementer: function () {
    this.setData({
      isChangeImplement: !this.data.isChangeImplement
    })
  },
  // 选择添加参与人采单
  swithAddMember: function () {
    this.setData({
      isAddMember: !this.data.isAddMember
    })
  },
  // 确定添加参与人
  sureAdd: function() {
    this.setData({
      hasSelectId:this.data.memberid,
      isAddMember: !this.data.isAddMember
    })
  },
  // 取消添加参与人
  cancelAdd: function() {
    this.setData({
      isAddMember: !this.data.isAddMember
    })
  },
  // 搜索联系人
  searchMember: function(e){
    var searchStr = e.detail.value;
    var taskId = this.data.projectId;
    // console.log(searchStr);
    var address = app.ip + "tc/taskService/taskMemberManager";
    var obj = { taskId};
    api.request(obj,address,"post",true).then(res=>{
      this.matchSearch(res,searchStr);
    })
  },
  // 匹配搜索结果
  matchSearch: function(res,input){
    console.log("项目");
    console.log(res);
    if(res.data.code == 200 && res.data.result){
      var data = res.data.data.memberBeanList;
      var searchMatch = []//匹配结果
      data.map((item,index)=>{
        if(item.relationType != 1){
          // 通过输入的内容匹配
          if(item.personName.indexOf(input) != -1){
            console.log("成功")
            if(input == null || input == ""){

            }
            else{
              if (this.data.memberid.indexOf(item.resourceId) < 0){
                item.selected = false;
              }
              else{
                item.selected = true;
              }
              searchMatch.push(item);
            }
          }
        }
      })
      
      this.setData({
        searchMatch: searchMatch
      })
      console.log(searchMatch)
      console.log(this.data.memberid);
      // console.log(this.data.memberlist);
    }
    else if(res.data.message == ""){
      return {status:false,msg:"搜索失败"};
    }
    else{return {status:false,msg:res.data.message}}
  },
  // 选择参与人
  selectMember: function(e){
    var hasSelectId = this.data.memberid;
    // hasSelectId = hasSelectId.split(",")
    var selectId = e.currentTarget.dataset.selectid;
    var index = e.currentTarget.dataset.index;
    var searchMatch = this.data.searchMatch;
    searchMatch[index].selected = !searchMatch[index].selected;
    if (hasSelectId.indexOf(selectId) < 0){
      hasSelectId.push(selectId)
    }
    else{
      console.log("取消")
      for (var i = 0; i < hasSelectId.length; i++){
        if (hasSelectId[i] == selectId){
          hasSelectId.splice(i,1);
          break;
        }
      }
    }
    var memberid = hasSelectId;
    this.setData({searchMatch, memberid})
  },
  // 修改执行人
  modifyExecutor: function (e) {
    this.setData({
      isChangeImplement: !this.data.isChangeImplement
    })
  },
  // 修改任务
  modifyTask: function(){
    var scheduleItemBean = this.data.taskObj;
    // scheduleItemBean.participant = this.data.hasSelectId
    console.log(scheduleItemBean)
    var address = app.ip + "tc/schedule/itemService/update";
    api.sendDataByBody(scheduleItemBean,address,"post",true).then(res=>{
      console.log("修改任务");
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        var pages = getCurrentPages();
        var prevPage = pages[pages.length - 2];
        var task = prevPage.data.task
        task.itemBean = scheduleItemBean
        task.itemBean.startDate = task.itemBean.startDate.split("T")[0];
        task.itemBean.endDate = task.itemBean.endDate.split("T")[0];
        prevPage.setData({
          task: task
        })
        wx.navigateBack();
      }
    })
  }
})