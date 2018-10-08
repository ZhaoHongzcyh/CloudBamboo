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
    uploadId:null,//文件上传id
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
    alert:{
      content:"新建任务失败"
    },
    task:null,
    taskName:null,//用户输入的任务名称
    startDate:api.nowTime(),//开始时间
    endDate:null,//结束时间
    tempFilePath:[],//本地上传文件列表
    emergency:1,//任务紧急程度
    matchList:null,//执行人列表
    addMemberList: null,//参与人列表
    memberlist:null,
    searchList:null,//搜索列表
    Implement:null,//执行人
    visibilityType:0,//可见范围
    visibility:["所有成员可见","参与人可见"],
    isShowReadPower:false,//是否展示成员可见列表
    isShowImplement:false,//是否展示执行人选择
    isShowAddMember: false,//是否展示参与人
    isShowEmergency:false,//是否展示任务紧急程度
    isHasSubmit: false,//避免点击多次造成多次添加同一个任务
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.popup = this.selectComponent("#popup");
    this.downapp = this.selectComponent("#downapp");
    this.setData({
      planid:options.planid,
      title:options.title,
      taskId:options.id
    });
    this.initImplementer();
  },

  // 弹框
  alert: function () {
    this.popup.showPopup()
  },

  // app下载弹框
  downAppAlert: function () {
    this.downapp.showPopup();
  },

  // 初始化执行人信息
  initImplementer:function(){
    var address = app.ip + "tc/taskService/taskMemberManager";
    var taskId = this.data.taskId;
    var userId = wx.getStorageSync('tcUserId');
    var obj = { taskId };
    api.request(obj, address, "post", true).then(res => {
      var Implement = null;
      var memberBeanList = null;
      if (res.data.code == 200 && res.data.result) {
        memberBeanList = res.data.data.memberBeanList
        for (var i = 0; i < memberBeanList.length; i++) {
          // if (memberBeanList[i].relationType == 1) {
          if (memberBeanList[i].resourceId == userId){
            Implement = memberBeanList[i]
          }
        }
        this.setData({
          Implement: Implement,
          memberlist: memberBeanList
        })
        this.getAddMemberList();
      }
      else if (res.data.message != null || res.data.message != "") {
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
    wx.setNavigationBarTitle({title:'更改执行人'})
    var address = app.ip + "tc/taskService/taskMemberManager";
    var taskId = this.data.taskId;
    var obj = {taskId};
    api.request(obj,address,"post",true).then(res=>{
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

  // 取消选择紧急程度
  cancelUrgency: function () {
    this.setData({
      isShowEmergency:false
    })
  },

  // 显示/关闭成员是否可见选项
  switchPowerMenu: function () {
    this.setData({
      isShowReadPower: !this.data.isShowReadPower
    })
  },

  // 设置可见范围
  setvisibilityType: function (e) {
    var visibilityType = e.currentTarget.dataset.visibilitytype;
    this.setData({
      visibilityType: visibilityType
    });
    this.switchPowerMenu();
  },

  // 匹配用于搜索的内容
  matchList: function (e) {
    var value = e.detail.value;
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
    if (this.data.isShowAddMember){
      wx.setNavigationBarTitle({ title: '新建任务' })
      var participant = [];//参与人
      for (var i = 0; i < this.data.addMemberList.length; i++) {
        if (this.data.addMemberList[i].selected) {
          participant.push(this.data.addMemberList[i].resourceId);
        }
      }
      this.setData({
        isShowAddMember: !this.data.isShowAddMember,
        participant: participant
      })
    }
    else{
      wx.setNavigationBarTitle({title:'添加参与人'})
      this.setData({
        isShowAddMember: !this.data.isShowAddMember
      })
    }
    this.chooseAddMember();
  },

  // 获取参与人列表
  getAddMemberList: function () {
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
    wx.setNavigationBarTitle({title:'新建任务'})
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
    // var addMemberList = this.data.addMemberList;
    var memberlist = this.data.memberlist;
    var memberAry = [];
    if (Implement == null) {
      return false;
    }
    else{
      for (var i = 0; i < memberlist.length; i++) {
        // if (addMemberList[i].relationType == 1){
        //   addMemberList[i].relationType = 2;
        // }
        // if (addMemberList[i].id == Implement.id){
        //   console.log("选择");
        //   console.log(Implement)
        //   addMemberList[i].relationType = 1;
        // }
        if (Implement.resourceId != memberlist[i].resourceId){
          memberAry.push(memberlist[i] )
        }
        // addMemberList[i].selected = false;
      }
    }
    this.setData({
      // addMemberList:addMemberList
      addMemberList: memberAry
    })
  },

  // 匹配用户输入的参与人内容
  matchAddMember: function (e) {
    var value = e.detail.value;
    var searchList = [];
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
    if(value == ""){
      searchList = [];
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

  // 选择文件
  chooseFile: function (){
    var tempFilePath = this.data.tempFilePath;
    wx.chooseImage({
      count:10,
      sizeType:"original",
      success:(res)=>{
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
      var obj = {
        src:data[i],
        name:"文件",
        progress:0
      }
      tempFilePath.push(obj);
    }
    this.setData({
      tempFilePath:tempFilePath
    })
  },

  // 上传图片
  upImg: function (index=0) {
    var data = this.data.tempFilePath;
    var token = wx.getStorageSync("proxyUserToken");
    if(index < data.length){
      // 开始上传文件
      var uploadTask = wx.uploadFile({
        url: app.ip + "tc/schedule/itemService/uploadLocalArc",
        filePath: data[index].src,
        header: {
          "content-type": "multipart/form-data",
          proxyUserToken: token,
          id: this.data.uploadId
        },
        name: "file",
        success: (res)=>{
          try{
            res.data = JSON.parse(res.data);
            data[index].name = res.data.data[0].title;
          }
          catch(e){
            data[index].progress = "上传失败";
            this.setData({alert:{content:"抱歉，附件上传失败！请检查网络或重试"}});
            this.alert();
          }
          // 将文件重命名
          
          // this.setData({
          //   tempFilePath: data
          // })
          this.upImg(index+1);
        }
      })

      // 监听上传进度
      uploadTask.onProgressUpdate(res=>{
        data[index].progress = res.progress;
        this.setData({
          tempFilePath:data
        })
      })
    }
    else{
      wx.navigateBack();
    }
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
    var address = app.ip + "tc/schedule/itemService/add";
    var participant = [];//参与人
    if (this.data.isHasSubmit){
      return false;
    }
    else{
      this.setData({ isHasSubmit: true});
    }
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
    
    if(obj.title != null){
      obj.title = obj.title.replace(/\s+/g, "");
      if(obj.title == ""){
        this.setData({ alert: { content: '任务名称不能为空' } });
        this.alert();
        return false;
      }
    }
    else{
      this.setData({ alert: { content: '任务名称不能为空' } });
      this.alert();
      return false;
    }

    // 判断是否设置截止时间
    if(this.data.endDate != null){
      obj.endDate = this.data.endDate + "T00:00:00.000+0800";
    }

    api.sendDataByBody(obj,address,"post",true).then(res=>{
      this.setData({ isHasSubmit: false});
      if(res.data.code == 200 && res.data.result){
        this.setData({
          uploadId:res.data.data.itemBean.id
        })
        // 调用文件上传
        if(this.data.tempFilePath.length > 0){
          this.upImg();
        }
        else{
          wx.navigateBack();
        }
        
      }
      else{
        this.setData({alert:{content:res.data.message}});
        this.alert();
      }
    }).catch(e=>{
      this.setData({alert:{content:'任务添加失败'}});
      this.alert();
    })
  },
  
  // 任务计划列表
  toPlanTeam: function () {
    wx.navigateTo({
      url: '../planTeam/planteam?taskId=' + this.data.taskId + "&planid=" + this.data.planid,
    })
  },

  // 添加在线附件
  addOnlineFile: function () {
    this.setData({alert:{content:''}})
  }
})