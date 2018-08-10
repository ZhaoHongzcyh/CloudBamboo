// pages/subproject/subproject.js
const app = getApp();
const api = require("../../api/common.js");
const handle = require("./common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
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
        title: "动态",
        select: false
      },
      {
        title: "记账",
        select: false
      }
    ],
    taskSelect:[
      {
        src:"",
        title:"未完成的任务",
        status:false
      },
      {
        src: "",
        title: "已完成的任务",
        status: false
      },
      {
        src: "",
        title: "我执行的任务",
        status: false
      },
      {
        src: "",
        title: "我参与的任务",
        status: false
      }
    ],
    
    stopTime:[
      {
        title:"所有时间",
        state: "all"
      },
      {
        title: "今天",
        state:"today"
      },
      {
        title:"明天",
        state:"tomorrow"
      },
      {
        title:"本周",
        state:"afterWeek"
      },
      {
        title: "本周以后",
        state:"afterOneWeek"
      }
    ],//截止时间
    isSwitchSelectTask: false,//是否执行任务筛选
    isShowStopTime: false,//是否显示截止时间选择器
    taskList:[],//任务列表数据
    parentId:0,//文档父ID，默认为0
    funList: ["switchMenu","selectFile"],
    fileList:[]//文件列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      taskId: options.id
    })
    this.selectTask();
    this.selectPlanList(options.id);
  },
  // 查找计划清单
  selectPlanList: function(id) {
    var address = app.ip + "tc/schedule/summaryService/findBoListByResource";
    var obj = {
      resourceType: 10010001,
      resourceId:id
    }
    api.request(obj,address,"post",true).then(res=>{
      console.log("计划清单");
      console.log(res);
      var data = null;
      if(res.data.code == 200 && res.data.result){
        data = res.data.data.list;
        for(var i = 0; i < data.length; i++){
          data[i].itemList = this.handleTask(data[i].itemList)
        }
        if (this.data.isSwitchSelectTask || this.data.isShowStopTime) {//判断是否存在筛选条件
          // 通过筛选条件筛选任务
        }
        this.setData({
          taskList:data
        });
        console.log("设置");
        console.log(data);
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
          //list.unshift(ary[i])
        }
        else {
          //list.push(ary[i]);
        }
        list.push(ary[i]);
      }
    return list;
  },

  // 通过 任务筛选条件  筛选任务
  selectTaskByTask: function (data,taskCondiction,timeCondiction) {
    if (taskCondiction){
      // 通过任务条件筛选
      var taskSelect = this.data.taskSelect;
    }
    else{
      // 通过任务截止时间筛选
    }
  },

  // 任务筛选
  switchSelectTask: function () {
    this.setData({
      isShowStopTime:false,
      isSwitchSelectTask: !this.data.isSwitchSelectTask
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
    this.setData({
      taskSelect
    })
  },

  // 重置筛选条件
  resetChoose: function () {
    var taskSelect = this.data.taskSelect;
    taskSelect.map((item,index)=>{
      item.status = false;
    });
    this.setData({
      taskSelect
    })
  },
  
  // 通过项目id查找任务
  selectTask:function () {
    var address = app.ip + "tc/schedule/itemService/findMyManageItemList";
    var obj = { taskId: this.data.taskId};
    api.request(obj, address, "post", true).then(res => {
      console.log("项目任务");
      console.log(res);
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
        console.log(file);
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
    console.log(e);
    var parentTitle = e.currentTarget.dataset.parenttitle;
    var id = e.currentTarget.dataset.singleid;
    wx.navigateTo({
      url: '/pages/taskDetails/taskdetails?id=' + id,
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
  }
})