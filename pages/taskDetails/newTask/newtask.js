// pages/taskDetails/newTask/newtask.js
const app = getApp();
const api = require("../../../api/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    app: app,
    planid:null,
    title:null,
    taskId:null,//项目id
    emergencyGrade: [
      {
        title:"闲置处理",
        state:0
      },
      {
        title:"正常处理",
        state:1
      },
      {
        title:"紧急处理",
        state:2
      }
    ],
    task:null,
    taskName:null,//用户输入的任务名称
    startDate:api.nowTime(),//开始时间
    endDate:null,//结束时间
    tempFilePath:[],//本地上传文件列表
    emergency:1,//任务紧急程度
    matchList:null,//执行人列表
    addMemberList: null,//参与人列表
    searchList:null,//搜索列表
    Implement:null,//执行人
    visibilityType:0,//可见范围
    isShowImplement:false,//是否展示执行人选择
    isShowAddMember: false,//是否展示参与人
    isShowEmergency:false//是否展示任务紧急程度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      planid:options.planid,
      title:options.title,
      taskId:options.id
    });
    this.initImplementer();
  },
  // 初始化执行人信息
  initImplementer:function(){
    var address = app.ip + "tc/taskService/taskMemberManager";
    var taskId = this.data.taskId;
    var obj = { taskId };
    api.request(obj, address, "post", true).then(res => {
      console.log("初始化执行人");
      console.log(res);
      var Implement = null;
      var memberBeanList = null;
      if (res.data.code == 200 && res.data.result) {
        memberBeanList = res.data.data.memberBeanList
        for (var i = 0; i < memberBeanList.length; i++) {
          if (memberBeanList[i].relationType == 1) {
            Implement = memberBeanList[i]
          }
        }
        console.log(Implement)
        this.setData({
          Implement: Implement
        })
        this.getAddMemberList();
      }
      else if (res.data.message != null || res.data.message != "") {
        console.log(res.data.message);
      }
      else {
        console.log("加载错误");
      }
    })
  },
  // 获取任务名称
  getTaskName: function (e) {
    var taskName = e.detail.value;
    this.setData({
      taskName:taskName
    })
  },
  // 获取执行人信息
  implementer: function(){
    var address = app.ip + "tc/taskService/taskMemberManager";
    var taskId = this.data.taskId;
    var obj = {taskId};
    api.request(obj,address,"post",true).then(res=>{
      console.log("执行人");
      console.log(res);
      var Implement = null;
      var memberBeanList = null;
      if(res.data.code == 200 && res.data.result){
        memberBeanList = res.data.data.memberBeanList
        for (var i = 0; i < memberBeanList.length; i++){
          if (memberBeanList[i].relationType == 1){
            Implement = memberBeanList[i]
          }
        }
        this.setData({
          isShowImplement: true,
          task: res.data.data,
          Implement: Implement
        })
        this.getAddMemberList();
      }
      else if(res.data.message != null || res.data.message != ""){
        console.log(res.data.message);
      }
      else{
        console.log("加载错误");
      }
    })
  },
  // 设置开始时间
  setStartDate: function (e) {
    this.setData({
      startDate:e.detail.value
    })
  },
  // 设置结束时间
  setEndDate: function (e) {
    this.setData({
      endDate:e.detail.value
    })
  },
  // 设置任务紧急程度
  setEmergencyGrade: function (e) {
    this.setData({
      isShowEmergency:true
    })
  },
  // 获取用户选择的紧急程度
  getEmergencyGrade: function (e) {
    var state = e.currentTarget.dataset.state;
    this.setData({
      emergency:state,
      isShowEmergency:false
    })
  },
  // 匹配用于搜索的内容
  matchList: function (e) {
    var value = e.detail.value;
    console.log(value)
    
    var matchList = [];
    var task = this.data.task;
    for (var i = 0; i < task.memberBeanList.length; i++){
      var reg= new RegExp(value);
      if(reg.test(task.memberBeanList[i].personName) || reg.test(task.memberBeanList[i].username)){
        matchList.push(task.memberBeanList[i])
      }
    }
    if(value == ""){
      matchList = [];
    }
    this.setData({
      matchList
    })
  },
  // 显示参与人列表
  showAddMember: function () {
    this.setData({
      isShowAddMember: !this.data.isShowAddMember
    })
  },
  // 获取参与人列表
  getAddMemberList: function () {
    var address = app.ip + "tc/taskService/taskMemberManager";
    var taskId = this.data.taskId;
    var obj = { taskId };
    api.request(obj,address,"post",true).then(res=>{
      console.log("参与人列表");
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        this.setData({
          addMemberList:res.data.data.memberBeanList
        })
        this.chooseAddMember();
      }
      else if(res.data.message != "" || res.data.message != undefined){

      }
      else{

      }
    }) 
  },
  // 设置执行人
  setImplement: function (e) {
    var item = e.currentTarget.dataset.item;
    this.setData({
      Implement:item,
      isShowImplement: false,
      matchList: null
    })
  },
  // 搜索参与人
  searchAddMember: function (e) {
    var value = e.detail.value;
  },
  // 打开参与人列表
  chooseAddMember: function () {
    var Implement = this.data.Implement;
    var addMemberList = this.data.addMemberList;
    if (Implement == null) {

    }
    else{
      for (var i = 0; i < addMemberList.length; i++) {
        if (addMemberList[i].relationType == 1){
          addMemberList[i].relationType = 2;
        }
        if (addMemberList[i].id == Implement.id){
          console.log("选择");
          console.log(Implement)
          addMemberList[i].relationType = 1;
        }
        addMemberList[i].selected = false;
      }
    }
    this.setData({
      addMemberList:addMemberList
    })
  },
  // 匹配用户输入的参与人内容
  matchAddMember: function (e) {
    var value = e.detail.value;
    var searchList = [];
    console.log("列表");
    console.log(this.data.addMemberList);
    for(var i = 0; i < this.data.addMemberList.length; i++){
      var reg = new RegExp(value);
      if (reg.test(this.data.addMemberList[i].personName) || reg.test(this.data.addMemberList[i].username)) {
        var strObj = JSON.stringify(this.data.addMemberList[i]);
        strObj = JSON.parse(strObj);
        // 是否匹配到执行人？隐藏执行人：显示成员；
        if (strObj.resourceId != this.data.Implement.resourceId){
          searchList.push(strObj);
        }
      }
    }
    this.setData({
      searchList:searchList
    })
  },
  // 选择参与人
  selectAddMember: function (e) {
    var item = e.currentTarget.dataset.item;
    var addMemberList = this.data.addMemberList;
    var searchList = this.data.searchList;
    console.log(addMemberList);
    for (var i = 0; i < addMemberList.length; i++){
      if (addMemberList[i].id == item.id && !addMemberList[i].selected){
        addMemberList[i].selected = true;
      }
      else if (addMemberList[i].id == item.id && addMemberList[i].selected){
        addMemberList[i].selected = false;
      }
    }
    // 同步searchList
    if(searchList != null ){
      for (var i = 0; i < searchList.length; i++) {

        if (searchList[i].id == item.id && !searchList[i].selected) {
          searchList[i].selected = true;
        }
        else if (searchList[i].id == item.id && searchList[i].selected) {
          searchList[i].selected = false;
        }
      }
    }
    this.setData({ addMemberList, searchList})
  },
  // 文件上传
  uploadFile: function (){
    var tempFilePath = this.data.tempFilePath;
    wx.chooseImage({
      count:6,
      success:(res)=>{
        console.log("文件列表");
        console.log(res);
        this.handleUploadData(res.tempFilePaths);
      },
      fail:(err)=>{
        console.log("文件选取失败")
      }
    })
  },
  // 处理文件上传数据
  handleUploadData: function (data) {
    var tempFilePath = this.data.tempFilePath;
    for(var i = 0; i < data.length; i++){
      tempFilePath.push(data[i]);
    }
    this.setData({
      tempFilePath:tempFilePath
    })
  },
  // 删除图片
  deleteImg: function (e) {
    var index = e.currentTarget.dataset.index;
    var tempFilePath = this.data.tempFilePath;
    // 删除指定项
    tempFilePath.splice(index,1);
    this.setData({
      tempFilePath:tempFilePath
    })
  },
  // 添加任务
  addTask: function (e) {
    console.log("执行人");
    console.log(this.data.Implement);
    var address = app.ip + "tc/schedule/itemService/add";
    var participant = [];//参与人
    console.log(this.data.addMemberList);
    for(var i = 0; i < this.data.addMemberList.length; i++){
      if(this.data.addMemberList[i].selected){
        participant.push(this.data.addMemberList[i].resourceId);
      }
    }
    var obj = {
        title:this.data.taskName,
        status:0,
        resourceType: 40020001,
        resourceId: this.data.planid,//所属资源id
        startDate: this.data.startDate + "T00:00:00.000+0800",
        manager: this.data.Implement.resourceId,//责任人
        participant: participant,//参与人
        visibilityType: this.data.visibilityType,//0：所有成员可见，1：参与人可见
        emergencyGrade: this.data.emergency,//任务紧急等级
      }

    // 判断是否设置截止时间
    if(this.data.endDate != null){
      obj.endDate = this.data.endDate + "T00:00:00.000+0800";
    }

    api.sendDataByBody(obj,address,"post",true).then(res=>{
      console.log("任务添加结果");
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        // 返回上一级，并将新添加的数据添加到任务列表中
        var page = getCurrentPages();
        var prevpage = page[page.length - 2];
        var taskList = prevpage.data.taskList;
        for(var i = 0; i < taskList.length; i++){
          if(taskList[i].summaryBean.id == res.data.data.itemBean.resourceId){
            res.data.data.itemBean.managerName = this.data.Implement.personName;
            res.data.data.itemBean.endDate = prevpage.handleTask([res.data.data.itemBean])[0].endDate;
            
            taskList[i].itemList.push(res.data.data.itemBean);
            break;
          }
        }
        
        // return false;
        prevpage.setData({
          taskList:taskList
        })
        wx.navigateBack();
      }
      else{

      }
    })
  }
})