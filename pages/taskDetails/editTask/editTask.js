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
    planid:null,//任务所属任务计划id
    taskObj:{},//任务对象
    mission:null,//责任人信息
    isShowRange:false,//是否展示可见范围列表
    isShowLevel:false,//是否显示任务紧急列表
    range:["所有成员可见","仅参与人可见"],
    rangenum:0,
    alert:{
      content:"更新失败"
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.popup = this.selectComponent("#popup");
    this.setData({
      taskId: options.id
    })
    this.selectPlan(this.data.taskId)
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.selectPlan(this.data.taskId)
  },

  // 弹框
  alert: function () {
    this.popup.showPopup()
  },

  // 根据ID查找任务
  selectPlan: function (id) {
    var address = app.ip + "tc/schedule/itemService/findBo";
    var obj = { id };
    api.request(obj, address, "post", true).then(res => {
      wx.stopPullDownRefresh();
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
            list[i].selected = true;
          }
          else{
            list[i].selected = false;
          }
            member.push(list[i]);
            memberid.push(list[i].personId)
          // }
          if(list[i].relationType == 1){
            this.setData({
              mission:list[i]
            })
          }
        }
        // 清洗云盘数据
        handle.data.arcList = api.cloudDiskDataClean(handle.data.arcList);
        handle.data.arcList = api.fileNameSort(handle.data.arcList);
        this.setData({
          task: handle.data,
          startDate: handle.data.itemBean.startDate.split("T")[0],
          endDate: handle.data.itemBean.endDate,
          memberlist:member,
          memberid: memberid,
          hasSelectId: memberid,
          taskObj:handle.data.itemBean,
          resourceId: handle.data.itemBean.resourceId,
          projectId:handle.data.taskBean.id,
          planid: handle.data.itemBean.resourceId
        })
      }
      else {
        console.log(handle);
      }
    })
  },

  // 任务计划列表
  toPlanTeam: function () {
    wx.navigateTo({
      url: '../planTeam/planteam?taskId=' + this.data.task.taskBean.id + "&planid=" + this.data.planid + "&page=edit",
    })
  },

  // 修改任务名称
  changeTaskName: function(e){
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
    var endDate = e.detail.value;
    var taskObj = this.data.taskObj;
    taskObj.endDate = endDate + "T00:00:00.000+0800";
    this.setData({
      taskObj:taskObj,
      endDate: endDate
    })
  },
  // 选择改变执行人采单
  switchImplementer: function () {
    wx.setNavigationBarTitle({title:'更改执行人'})
    this.setData({
      searchMatch:[],
      isChangeImplement: !this.data.isChangeImplement
    })
    this.searchMember()
  },
  // 更改执行人
  changeExecutor: function (e) {
    wx.setNavigationBarTitle({ title: '编辑任务' })
    var item = e.currentTarget.dataset.item;
    var memberlist = this.data.memberlist;
    var mission = this.data.mission;
    mission.personId = item.personId;
    mission.personName = item.personName; 
    this.setData({
        mission: mission,
        searchMatch:[],
        isChangeImplement: !this.data.isChangeImplement
    })
  },
  // 选择添加参与人采单
  swithAddMember: function () {
    wx.setNavigationBarTitle({ title: '添加参与人' })
    this.setData({
      isAddMember: !this.data.isAddMember,
      searchMatch: [],
    })
    this.searchMember();
  },
  // 匹配执行人
  matchMember: function (e) {
    var value = e.detail.value;
    var memberlist = this.data.memberlist;
    var searchMatch = [];
    for(var i = 0; i < memberlist.length; i++){
      var reg = new RegExp(value);
      if(reg.test(memberlist[i].personName)){
        searchMatch.push(memberlist[i]);
      }
    }
    if(value == ""){
      searchMatch = [];
    }
    this.setData({
      searchMatch
    })
  },
  // 确定添加参与人
  sureAdd: function() {
    wx.setNavigationBarTitle({ title: '编辑任务' })
    var scheduleItemBean = this.data.taskObj;
    scheduleItemBean.manager = this.data.mission.personId;
    var participant = [];//参与人

    this.data.memberlist.map((item, index) => {
      if (item.personId != this.data.mission.personId && item.selected) {
        participant.push(item.personId);
      }
    })
    if (participant.length > 0) {
      scheduleItemBean.participant = participant;
    }
    else {
      // scheduleItemBean.participant = [this.data.mission.personId];
      scheduleItemBean.participant = [];
    }
    this.setData({
      hasSelectId: this.data.memberid,
      isAddMember: !this.data.isAddMember,
      taskObj: scheduleItemBean
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
    var taskId = this.data.projectId;
    var address = app.ip + "tc/taskService/taskMemberManager";
    var obj = { taskId};
    api.request(obj,address,"post",true).then(res=>{
      // this.matchSearch(res,searchStr);
      this.matchSearch(res);
    })
  },
  // 整理参与人搜索结果数据
  matchSearch: function(res){
    if(res.data.code == 200 && res.data.result){
      var data = res.data.data.memberBeanList;
      this.selectHasInTask(data);
    }
    else if(res.data.message == ""){
      return {status:false,msg:"搜索失败"};
    }
    else{return {status:false,msg:res.data.message}}
  },
  // 选择参与人
  selectMember: function(e){
    var hasSelectId = this.data.memberid;
    hasSelectId = JSON.stringify(hasSelectId);
    hasSelectId = JSON.parse(hasSelectId);
    // hasSelectId = hasSelectId.split(",")
    var selectId = e.currentTarget.dataset.selectid;
    var index = e.currentTarget.dataset.index;
    var searchMatch = this.data.searchMatch;
    if (hasSelectId.indexOf(selectId) < 0){
      hasSelectId.push(selectId);
      for (var i = 0; i < searchMatch.length; i++) {
        if (searchMatch[i].personId == selectId) {
          searchMatch[i].selected = true;
        }
      }
    }
    else{
      for (var i = 0; i < hasSelectId.length; i++){
        if (hasSelectId[i] == selectId){
          hasSelectId.splice(i,1);
          break;
        }
      }
      for(var i = 0; i < searchMatch.length; i++){
        if(searchMatch[i].personId == selectId){
          searchMatch[i].selected = false;
        }
      }
    }
    // 更改memberlist数据状态
    var memberlist = this.data.memberlist;
    for(var i = 0; i < memberlist.length; i++){
      if(memberlist[i].personId == selectId){
        memberlist[i].selected = !memberlist[i].selected;
      }
    }
    var memberid = hasSelectId;
    this.setData({
      searchMatch, memberid,
      memberlist:memberlist
      })
  },
  // 勾选已经在任务中的人员
  selectHasInTask: function (data) {
    var memberlist = this.data.memberlist;
    for(var i = 0; i < data.length; i++){
      var obj = {
        personId:data[i].resourceId,
        personName:data[i].personName,
        selected:false,
        relationType:2
      }
      if (data[i].resourceId != this.data.mission.personId) {
        // 验证是否存在相同的用户
        var end = false;
        for(var j = 0; j < memberlist.length; j++){
          if(memberlist[j].personId == obj.personId){
            end = true;
          }
        }
        if(!end){
          memberlist.push(obj);
        }
      }
    }
    memberlist = this.removalEval(memberlist)
    this.setData({
      memberlist
    })
  },

  // 去除memberlist相同的人员
  removalEval: function (memberlist) {
    var memberary = []
    memberlist.map((item,index)=>{
      var check = false;
      memberary.map((obj,num)=>{
        if(obj.personId == item.personId){
          check = true;
        }
      })
      if(!check){
        memberary.push(item)
      }
    })
    return memberary;
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
    scheduleItemBean.manager = this.data.mission.personId;
    

    if (scheduleItemBean.endDate != null && scheduleItemBean.endDate.split("T").length < 2){
      scheduleItemBean.endDate = scheduleItemBean.endDate + "T00:00:00.000+0800";
    }
    if (scheduleItemBean.startDate != null && scheduleItemBean.startDate.split("T").length < 2) {
      scheduleItemBean.startDate = scheduleItemBean.startDate + "T00:00:00.000+0800";
    }
    scheduleItemBean.resourceId = this.data.planid;
    // scheduleItemBean.participant = this.data.hasSelectId
    var address = app.ip + "tc/schedule/itemService/update";
    api.sendDataByBody(scheduleItemBean,address,"post",true).then(res=>{
      if(res.data.code == 200 && res.data.result){
        wx.navigateBack();
      }
      else{
        this.alert();
      }
    }).catch(e=>{
      this.alert();
    })
  },
  // 选择文件
  chooseFile: function () {
    var tempFilePath = this.data.tempFilePath;
    wx.chooseImage({
      count: 1,
      success: (res) => {
        this.upImg(res.tempFilePaths[0]);
      },
      fail: (err) => {
        console.log("文件选取失败")
      }
    })
  },

  // 处理文件上传数据
  handleUploadData: function (data) {
    var tempFilePath = this.data.tempFilePath;
    for (var i = 0; i < data.length; i++) {
      var obj = {
        src: data[i],
        name: "文件",
        progress: 0
      }
      tempFilePath.push(obj);
    }
    this.setData({
      tempFilePath: tempFilePath
    })
  },

  // 上传图片
  upImg: function (src) {
    var token = wx.getStorageSync("proxyUserToken");
      // 开始上传文件
      var uploadTask = wx.uploadFile({
        url: app.ip + "tc/schedule/itemService/uploadLocalArc",
        filePath: src,
        header: {
          "content-type": "multipart/form-data",
          proxyUserToken: token,
          id: this.data.task.itemBean.id
        },
        name: "file",
        success: (res) => {
          res.data = JSON.parse(res.data);
          var task = this.data.task;
          var file = res.data.data;
          file = api.cloudDiskDataClean(file);
          file = api.fileNameSort(file);
          file = file[0]
          task.arcList.push(file)
          // 将文件重命名
          
          this.setData({
            task
          })
          // task.artList.push(res.data)
        }
      })
      // 监听上传进度
      uploadTask.onProgressUpdate(res => {
        // data[index].progress = res.progress;
        // this.setData({
        //   tempFilePath: data
        // })
        // console.log(res.progress);
      })
    },
    // 删除图片
  deletefile: function (e) {
    var detail = e.detail;
    var address = app.ip + "tc/schedule/itemService/deleteItemArc";
    var arcIds = [detail.id]
    // var head = { proxyUserToken: wx.getStorageSync("proxyUserToken"), 'content-type':"application/x-www-form-urlencoded"};
    api.customRequest({}, arcIds,address,"POST",true).then(res=>{
      var task = JSON.stringify(this.data.task);
      task = JSON.parse(task);
      var index = null
      if(res.data.code == 200 && res.data.result){
        for (var i = 0; i < task.arcList.length; i++){
          if (task.arcList[i].id == detail.id){
            index = i;
          }
        }
        task.arcList.splice(index,1);
        this.setData({
          task:task
        })
      }
      else{
        this.setData({alert:{content:res.data.message}});
        this.alert();
      }
    }).catch(e=>{
      this.setData({alert:{content:'图片删除失败'}});
      this.alert();
    })
  },

    // 控制可见范围
  controlRange: function (e) {
    this.setData({
      isShowRange: !this.data.isShowRange
    })
  },

  selectRange: function (e) {
    var role = e.currentTarget.dataset.role;
    var taskObj = this.data.taskObj;
    taskObj.visibilityType = role
    this.setData({
      rangenum:parseInt(role),
      isShowRange: !this.data.isShowRange
    });
  },

  // 控制优先等级列表是否可见
  controlLevel: function () {
    this.setData({ isShowLevel: !this.data.isShowLevel})
  },

  // 设置优先等级
  selectLevel: function (e) {
    var role = e.currentTarget.dataset.role;
    var taskObj = this.data.taskObj;
    
    var task = this.data.task;
    task.itemBean.emergencyGrade = role;
    taskObj.emergencyGrade = role;
    this.setData({
      taskObj: taskObj,
      task:task,
      isShowLevel: !this.data.isShowLevel
    });
  },

  // 添加在线文件
  addOnlineFile: function () {
    this.setData({alert:{content:'云竹协作更多功能，请下载App'}});
    this.alert();
  }
})