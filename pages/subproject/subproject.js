// pages/subproject/subproject.js
const app = getApp();
const api = require("../../api/common.js");
const handle = require("./common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    app:app,
    power:{
      manager:null,
      adminGroups:null,//项目管理员组
      teamAdminGroups:null//团队项目管理员组
    },//权限数据
    alert:{
      content:"权限不够"
    },
    item:{
      atype:0,
      title:"文件夹",
      asize:"0",
      createDate:"2018-8-7"
    },
    taskId:null,
    menu:[
      {
        title:"任务",
        select:true
      },
      {
        title: "文件",
        select: false
      },
      {
        title: "成员",
        select: false
      },
      {
        title: "设置",
        select: false
      }
    ],
    taskSelect:[
      {
        src:"./img/notdown.png",
        title:"未完成的任务",
        status:false
      },
      {
        src: "./img/hasdown.png",
        title: "已完成的任务",
        status: false
      },
      {
        src: "./img/mydo.png",
        title: "我执行的任务",
        status: false
      },
      {
        src: "./img/myadd.png",
        title: "我参与的任务",
        status: false
      }
    ],
    
    stopTime:[
      {
        title:"所有时间",
        state: "all",
        timeType:null
      },
      {
        title: "今天",
        state:"today",
        timeType:1,
      },
      {
        title:"明天",
        state:"tomorrow",
        timeType:2
      },
      {
        title:"本周",
        state:"afterWeek",
        timeType:3
      },
      {
        title: "本周以后",
        state:"afterOneWeek",
        timeType:0
      }
    ],//截止时间
    isSwitchSelectTask: false,//是否执行任务筛选
    isShowStopTime: false,//是否显示截止时间选择器
    taskList:[],//任务列表数据
    parentId:0,//文档父ID，默认为0
    funList: ["switchMenu","selectFile"],
    fileList:[],//文件列表
    timeType:null,//截止时间类型

    // ---------------------------------------------------文件模块相关数据---------------------------------------------
    isShowFileMenu:false,
    chooseFileList:[],//已选文件列表
    moreAction:false//是否展示文件更多操作
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ taskId: options.id})
    this.popup = this.selectComponent("#popup");
    this.searchPowerData(options.id)
  },

  onShow:function () {
    this.selectPlanList(this.data.taskId);
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.onLoad();
  },

  // 查询权限数据
  searchPowerData: function (id) {
    var address = app.ip + "tc/taskService/findTaskBOById";
    api.request({ taskId: id }, address, "POST", true).then(res => {
      console.log("项目权限");
      console.log(res);
      console.log(res.data.code,res.data.result)
      if(res.data.code == 200 && res.data.result){
        var summaryBean = res.data.data.summaryBean;
        var power = {
          manager:summaryBean.manager,
          adminGroups: summaryBean.adminGroups,
          teamAdminGroups: summaryBean.teamAdminGroups
        }
        this.setData({power});
      }
      else{
        console.log("异常")
      }
    }).catch(e=>{
      console.log(e);
      console.log("数据请求异常")
    })
  },
  // 弹框
  alert: function () {
    this.popup.showPopup()
  },

  // 查找计划清单
  selectPlanList: function(id) {
    var address = app.ip + "tc/schedule/summaryService/findBoListByResource";
    var obj = {
      resourceType: 10010001,
      resourceId:id,
      orderType:"DESC"
    }
    api.request(obj,address,"post",true).then(res=>{
      var data = null;
      if(res.data.code == 200 && res.data.result){
        data = res.data.data.list;
        for(var i = 0; i < data.length; i++){
          // 用于初始化任务折叠效果
          if(i == 0){
            data[i].fold = true;//显示子任务
          }
          else{
            data[i].fole = false;//隐藏子任务
          }
          data[i].itemList = this.handleTask(data[i].itemList)
        }
        console.log("任务列表");
        console.log(res);
        this.setData({
          taskList:data
        });
      }
    })
  },
  
  handleTask: function (ary) {
    var list = [];
    var dat = new Date();
    var year = dat.getFullYear();
    var month = dat.getMonth() + 1;
    var today = dat.getDate();
    if (month < 10) {
      month = "0" + "" + month;
    }
    if (today < 10) {
      today = "0" + "" + today;
    }
    var today = Number(year + month + today);
      for (var i = 0; i < ary.length; i++) {
        if (ary[i].endDate != null) {
          var str = ary[i].endDate.split("T");
          str = str[0].split("-");
          ary[i].endTime = str.join("");
          if (Number(str.join("")) >= today) {
            ary[i].isTimeOut = false;
          }
          else {
            ary[i].isTimeOut = true;
          }
          str = str[1] + "月" + str[2] + "日";
          ary[i].endDate = str;
        }
        list.push(ary[i]);
      }
    return list;
  },

  // 查询所有计划条目，然后筛选
  selectAllPlan: function () {
    var address = app.ip + "tc/schedule/summaryService/findBoListByResource";
    var obj = {};
    var taskSelect = this.data.taskSelect;
    var isComplete = null;
    if (this.data.isSwitchSelectTask){
      if (taskSelect[0].status) {
        isComplete = 0;
        obj = { status: 0 }
      }
      else if (taskSelect[1].status) {
        isComplete = 1;
        obj = { status: 1 }
      }
      if (taskSelect[1].status && taskSelect[0].status) {
        obj = {}
      }
      if (taskSelect[2].status) {
        this.selectJoinTask(obj);
        return false;
      }
    }
    
    if (this.data.isShowStopTime){
      obj = {timeType:this.data.timeType}
      this.setData({
        isShowStopTime: false
      })
    }
    obj.resourceType = 10010001,
    obj.resourceId = this.data.taskId;
    obj.taskId = this.data.taskId;
    console.log("请求")
    console.log(obj);
    api.request(obj,address,"post",true).then(res=>{
      console.log("统计条目");
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        var data = res.data.data.list;
        for (var i = 0; i < data.length; i++) {
          if(i == 0){
            data[i].fold = true;
          }
          else{
            data[i].fold = false;
          }
          data[i].itemList = this.handleTask(data[i].itemList)
        }
        this.setData({
          taskList:res.data.data.list
        })
        this.closeAllSelect();//关闭筛选框
      }
      else{
        this.setData({ alert: { content: "筛选失败" } });
        this.alert();
      }
    }).catch(e=>{
      this.setData({alert:{content:"筛选失败"}});
      this.alert();
    })
  },
  // 查询我执行的任务
  selectJoinTask: function(obj) {
    obj.taskId = this.data.taskId
    var address = app.ip + "tc/schedule/itemService/findMyManageItemList";
    api.request(obj,address,"post",true).then(res=>{
      if(res.data.code == 200 && res.data.result){
        var taskList = this.data.taskList;
        var list = res.data.data.list;
        list = this.handleTask(list)
        for (var i = 0; i < taskList.length; i++) {
          taskList[i].itemList = [];
        }

        for (var i = 0; i < list.length; i++) {
          for (var j = 0; j < taskList.length; j++) {
            if (list[i].resourceId == taskList[j].summaryBean.id) {
              taskList[j].itemList.push(list[i]);
            }
          }
        }
        this.setData({ taskList });
        this.closeAllSelect();//关闭筛选框
      }
      else{
        this.setData({alert:{content:"数据筛选失败"}});
        this.alert();
      }
    }).catch(e=>{
      this.setData({ alert: { content: "数据筛选失败" } });
      this.alert();
    })
  },
  // 通过截至时间筛选
  selectTaskByTime: function(e){
    var timeType = e.currentTarget.dataset.timetype;
    this.setData({
      timeType:timeType
    });
    this.selectAllPlan();
  },

  // 任务筛选
  switchSelectTask: function () {
    this.setData({
      isShowStopTime:false,
      isSwitchSelectTask: !this.data.isSwitchSelectTask
    })
  },
  // 关闭所有筛选器
  closeAllSelect: function () {
    this.setData({
      isShowStopTime: false,
      isSwitchSelectTask: false
    })
  },
  // 截止时间
  switchStopTime: function () {
    this.setData({
      isShowStopTime: !this.data.isShowStopTime,
      isSwitchSelectTask: false
    })
  },

  // 获取任务筛选的条件
  getSelectCondiction: function (e) {
    var index = e.currentTarget.dataset.index;
    var taskSelect = JSON.stringify(this.data.taskSelect);//深度复制
    taskSelect = JSON.parse(taskSelect);
    taskSelect[index].status = !taskSelect[index].status;
    this.setData({taskSelect})
  },

  // 重置筛选条件
  resetChoose: function () {
    var taskSelect = this.data.taskSelect;
    taskSelect.map((item,index)=>{
      item.status = false;
    });
    this.setData({ taskSelect})
  },
  
  // 通过项目id查找任务
  selectTask:function () {
    var address = app.ip + "tc/schedule/itemService/findMyManageItemList";
    var obj = { taskId: this.data.taskId};
    api.request(obj, address, "post", true).then(res => {
      var task = handle.handleTask(res);
      if(task.status){
        var list = api.handleTask(res);
        
        this.setData({
          taskList:list
        })
      }
      else{
        wx.showToast({
          title: task.msg,
        })
      }
    })
  },
  
  // 通过项目id查找文件列表
  selectFile: function () {
    var address = app.ip + "tc/taskService/findTaskArcTree";
    var obj = { taskId: this.data.taskId, parentId: this.data.parentId};
    api.request(obj,address,"post",true).then(res=>{
      console.log("文件列表");
      var file = handle.handleFile(res);
      if(file.status){
        file = api.cloudDiskDataClean(file.data);
        file = api.fileNameSort(file);
        file.map((item,index)=>{
          item.select = false;
        })
        console.log(file)
        this.setData({
          fileList:file
        })
      }
      else{
        console.log("数据加载失败");
      }
    })
  },

  // 获得任务详情
  getPlanInfo: function (e) {
    var parentTitle = e.currentTarget.dataset.parenttitle;
    var id = e.currentTarget.dataset.singleid;
    wx.navigateTo({
      url: '/pages/taskDetails/taskdetails?taskId=' + id + "&powerId=" + this.data.taskId,
    });
    return false;
    var tcUserId = wx.getStorageSync("tcUserId");
    // 判断用户是否可以进入该任务
    var address = app.ip + "tc/schedule/itemService/isGetIntoItem";
    api.request({id},address,"post",true).then(res=>{
      if(res.data.code == 200 && res.data.result){
        for(var i = 0; i < res.data.data.memberList.length; i++){
          if (tcUserId == res.data.data.memberList[i].personId){
            //  wx.navigateTo({
            //   url: '/pages/taskDetails/taskdetails?id=' + id + "&taskId=" + this.data.taskId,
            // })
            return false;
          }
        }
        this.alert();
      }
      else{
        this.setData({
          alert:{content:"加载失败"}
        })
        this.alert();
      }
    })
    
  },
  
  // 进入文件夹
  entryFolder: function (e) {
    var parentId = e.currentTarget.dataset.parentid;
    console.log(parentId)
    this.setData({
      parentId: parentId
    });
    this.selectFile();
  },

  // 切换菜单列表
  switchMenu: function (e) {
    var index = e.currentTarget.dataset.index;
    console.log(index);
    var menu = this.data.menu
    for(var i = 0; i < menu.length; i++){
      if(index == i){
        menu[i].select = true;
      }
      else{
        menu[i].select = false;
      }
    }
    this.setData({
      menu:menu
    })
    // 通过不同采单，调用不同的函数
    switch(index){
      case 0:
        this.selectPlanList(this.data.taskId);
        break;
      case 1:
        this.selectFile();
        break;
      default :
      break;
    }
  },

  // 新建任务计划
  addTaskPlan: function () {
    wx.navigateTo({
      url: '/pages/addTask/addtask?resourceId=' + this.data.taskId,
    })
  },
  // 新建任务
  newTask: function (e) {
    var title = e.currentTarget.dataset.title;
    var id = e.currentTarget.dataset.planid;
    wx.navigateTo({
      url: '/pages/taskDetails/newTask/newtask?planid=' + id + "&title=" + title +"&id=" + this.data.taskId,
    })
  },
  // 任务折叠效果
  fold: function (e) {
    console.log(e);
    var index = e.currentTarget.dataset.index;
    var taskList = this.data.taskList;
    var taskList = this.data.taskList;
    for(var i = 0; i < taskList.length; i++){
      if(i == index){
        taskList[i].fold = !taskList[i].fold;
      }
    }
    this.setData({
      taskList:taskList
    })
  },

  // 切换任务状态(已完成/未完成)
  switchTaskState: function (e) {
    var taskid = e.currentTarget.dataset.taskid;
    var parentnum = e.currentTarget.dataset.parentsnum;
    var selfnum = parseInt(e.currentTarget.dataset.selfnum);
    var taskList = this.data.taskList;
    var status = e.currentTarget.dataset.status;
    status = status == 0 ? 1 : 0;
    var obj = taskList[parentnum].itemList[selfnum];
    obj.status = status;
    obj = JSON.stringify(obj);
    obj = JSON.parse(obj);
    delete obj.endDate;
    delete obj.endTime;
    delete obj.isTimeOut;
    // 发送更改状态请求，
    var address = app.ip + "tc/schedule/itemService/update";
    // 权限检测
    if(!this.handlePower()){
      status = status == 0 ? 1 : 0;
      taskList[parentnum].itemList[selfnum].status = status;
      this.setData({ taskList })
      this.alert();
      return false;
    }
    api.sendDataByBody(obj, address, "post", true).then(res => {
      if(res.data.code == 200 && res.data.result){
        taskList[parentnum].itemList[selfnum].status = status;
        this.setData({taskList})
      }
    })
  },

  // 权限判断
  handlePower: function () {
    var userId = wx.getStorageSync("tcUserId");
    var end = false;
    var power = this.data.power;
    console.log("鉴别");
    console.log(power);
    for (var i = 0; i < power.adminGroups.length; i++){
      if (userId == power.adminGroups[i]){
        end = true;
      }
    }
    if(!end){
      for (var i = 0; i < power.teamAdminGroups.length; i++){
        if (userId == power.teamAdminGroups[i]){
          end = true;
        }
      }
      if(!end){
        if(userId == power.manager){
          end = true;
        }
      }
    }
    return end;
  },

  // 滚动穿透问题
  stopmove:function (e) {
  },

  // ----------------------------------------------------任务文件模块函数-----------------------------------------------
  // 监听用户选择文件/文件夹
  checkOutFile: function (e) {
    var num = e.currentTarget.dataset.num;
    e = e.detail.e;
    console.log(e);
    var fileList = this.data.fileList;
    var chooseFileList = this.data.chooseFileList;
    var end = false;
    console.log(num);
    chooseFileList.map((item,index)=>{
      if(item.id == e.currentTarget.dataset.id){
        end = true;
      }
    })
    console.log(fileList[num])
    if(!end){
      fileList[num].select = true;
      chooseFileList.push(e.currentTarget.dataset.item)
    }
    else{
      fileList[num].select = false;
    }
    this.setData({ chooseFileList, fileList});
  },
  // 更多操作
  moreFun: function () {
    this.setData({ moreAction: !this.data.moreAction})
  }
})