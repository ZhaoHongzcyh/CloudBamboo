// pages/taskDetails/newTask/newtask.js
const app = getApp();
const api = require("../../../api/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    planid:null,
    title:null,
    taskId:null,//项目id
    emergencyGrade: ["闲置处理", "正常处理", "紧急处理"],//紧急状态
    task:null,
    matchList:null,//执行人列表
    addMemberList: null,//参与人列表
    searchList:null,//搜索列表
    Implement:null,//执行人
    isShowImplement:false,//是否展示执行人选择
    isShowAddMember: false//是否展示参与人
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      planid:options.planid,
      title:options.title,
      taskId:options.id
    })
    console.log("添加任务");
    console.log(this.data);
  },
  // 获取执行人信息
  implementer: function(){
    var address = app.ip + "tc/taskService/taskMemberManager";
    var taskId = this.data.taskId;
    var obj = {taskId};
    api.request(obj,address,"post",true).then(res=>{
      console.log("执行人");
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        this.setData({
          isShowImplement: true,
          task: res.data.data
        })
      }
      else if(res.data.message != null || res.data.message != ""){
        console.log(res.data.message);
      }
      else{
        console.log("加载错误");
      }
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
  // 获取参与人列表
  getAddMemberList: function () {
    this.setData({
      isShowAddMember:true
    })
    var address = app.ip + "tc/taskService/taskMemberManager";
    var taskId = this.data.taskId;
    var obj = { taskId };
    api.request(obj,address,"post",true).then(res=>{
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
        searchList.push(this.data.addMemberList[i]);
      }
    }
    this.setData({
      searchList:searchList
    })
  }
})