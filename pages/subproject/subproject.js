// pages/subproject/subproject.js
const app = getApp();
const api = require("../../api/common.js");
const handle = require("./common.js");

Page({
  data: {
    app:app,
    power:{
      manager:null,
      adminGroups:null,//项目管理员组
      teamManager:null//团队项目管理员组
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
        title:"任务组",
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
    isShowEditPlan:false,//是否显示编辑任务计划状态栏
    needEditPlanId:null,
    delPlanInfo:{title:null},
    selectPlanCondiction:null,//查询条件（任务筛选与截止时间）
    // ---------------------------------------------------文件模块相关数据---------------------------------------------
    isShowFileMenu:false,
    chooseFileList:[],//已选文件列表
    moreAction:false,//是否展示文件更多操作
    preview:false,//是否开启预览模式
    previewItem:null,//预览资源信息
    previewAtype:null,//预览资源类型
    isShowAddFile:false,//是否添加文件
    fileParentIdStack:[],//父文件夹ID堆栈
    isShowReturn:false,//是否显示文件夹返回按钮
    isShowReturnArea:false,//在文件预览时，是否显示返回按钮
    fileRename:null,//文件重命名姓名
    isShowUpImg:true,//是否显示上传附件的操作按钮
    
    //-------------------------------------------------------------------成员模块数据-----------------------------------------
    memberlist:null, 
    isCouldAdd:false,
    // ------------------------------------------------------------------设置模块数据------------------------------------------
    project:null,//用于存放单个项目的详细信息
    isOpenMenu: false,//是否打开功能区
    isCouldEditProject:false,
    projectMember:null,
    isShowBtn: false,//是否展示删除项目与退出项目按钮
    time:{startTime:null,endTime:null,createTime:null} 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ taskId: options.id});
    this.popup = this.selectComponent("#popup");
    this.confirm = this.selectComponent("#confirm");
    this.downapp = this.selectComponent("#downapp");
    this.newFolder = this.selectComponent("#newFolder");
    this.rename = this.selectComponent("#rename");
    this.searchPowerData(options.id)
  },

  onShow:function () {
    this.selectPlanList(this.data.taskId);
    this.setData({ isShowEditPlan:false})
    wx.stopPullDownRefresh();//关闭下拉刷新
    if (app.globalData.tasknum == 2){
      this.getProjectMember();
    }
    if (this.data.menu[3].select){
      this.getProjectInfo();
    }
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.onShow();
  },

  // 查询权限数据
  searchPowerData: function (id) {
    var address = app.ip + "tc/taskService/findTaskBOById";
    var userId = wx.getStorageSync('tcUserId');
    api.request({ taskId: id }, address, "POST", true).then(res => {
      if(res.data.code == 200 && res.data.result){
        var summaryBean = res.data.data.summaryBean;
        var memberBeans = res.data.data.memberBeans;
        wx.setStorageSync('pTeamManager', summaryBean.teamManager);

        // 判断用户是否为项目管理员（储存身份之后，在任务评论中根据该值决定是否渲染 ‘编辑’ 按钮）;
        var checkEnd = false;
        memberBeans.map((item,num)=>{
          if (item.resourceId == userId && item.relationType == 12){
            checkEnd = true;
          }
        })
        wx.setStorageSync('isProjectManager', checkEnd);

        var power = {
          manager:summaryBean.manager,
          adminGroups: summaryBean.adminGroups,
          teamManager: summaryBean.teamManager
        }
        this.setData({
          power:power,
          parentId: res.data.data.arcSummaryBeans[0].id
        });
      }
      else{
        console.log("异常")
      }
    }).catch(e=>{
      console.log(e);
    })
  },

  // 弹框
  alert: function () {
    this.popup.showPopup()
  },

  // app下载弹框
  downAppAlert:function () {
    this.downapp.showPopup();
  },

  // 打开对话弹框
  openConfirm: function () {
    this.confirm.show();
  },

  // 加载更多任务计划
  loadmoreplan: function (e) {
    let selectPlanCondiction = this.data.selectPlanCondiction;
    let taskSelect = this.data.taskSelect;
    let index = e.currentTarget.dataset.index;
    let id = e.currentTarget.dataset.id;
    let address = app.ip + "tc/schedule/itemService/findListByResource";
    let tasklist = this.data.taskList;
    tasklist = JSON.stringify(tasklist);
    tasklist = JSON.parse(tasklist);
    let start = tasklist[index].itemList.length;
    let head = { resourceId: id, start: start, pageSize: 20, orderType:"DESC"};
    if(selectPlanCondiction != null){
      if (selectPlanCondiction.timeType != undefined) {
        head.timeType = this.data.timeType;
      }
      else {
        if (taskSelect[0].status) {
          head.status = 0;
        }
        if (taskSelect[1].status) {
          head.status = 1;
        }
        if (taskSelect[0].status && taskSelect[1].status) {
          delete head.status;
        }
        if (taskSelect[2].status) {
          head.memberRelType = 1;
        }
        if (taskSelect[3].status) {
          head.memberRelType = 2;
        }
        if (taskSelect[2].status && taskSelect[3].status) {
          head.memberRelType = 0;
        }
      }
    }
    api.request(head,address,"POST",true).then(res=>{
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        let data = res.data.data.list;
        data = this.handleTask(data);
        let list = tasklist[index].itemList.concat(data);
        tasklist[index].itemList = list;
        // let hasDown = 0;
        // list.map((sub, num) => {
        //   if (sub.status == 1) {
        //     hasDown++
        //   }
        // })
        // tasklist[index].percent = hasDown + " / " + list.length;

        // 判断是否已经加载完所有数据
        if(data.length < 20){
          tasklist[index].isLoadedAllData = true;
        }
      }
    })
    setTimeout(()=>{
      this.setData({taskList:tasklist})
    },100)

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
      var dataLength = 0;
      if(res.data.code == 200 && res.data.result){
        let count = res.data.data.count;
        console.log(res);
        console.log("++++")
        data = res.data.data.list;
        dataLength = data.length - 1 > 0? data.length - 1 : 0;
        for(var i = 0; i < data.length; i++){
          // 用于初始化任务折叠效果
          if (i == dataLength){
            data[i].fold = true;//显示子任务
          }
          else{
            data[i].fole = false;//隐藏子任务
          }
          data.map((item,index)=>{
            // var hasDown = 0;
            // item.itemList.map((sub,num)=>{
            //   if(sub.status == 1){
            //     hasDown++
            //   }
            // })
            item.percent = item.finishedItems + "/" + item.itemCount;//hasDown  + " / " + item.itemList.length;

            // 用于判断加载更多的时候是否已经加载完毕所有数据（初始化为 未加载完）
            item.isLoadedAllData = false;
          })
          data[i].itemList = this.handleTask(data[i].itemList);

        }
        this.setData({
          taskList:data
        });
      }
      wx.stopPullDownRefresh();//关闭下拉刷新
    }).catch(e=>{
      console.log(e);
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
    if (this.data.isSwitchSelectTask){
      if (taskSelect[0].status) {
        obj.status = 0;
      }
      if (taskSelect[1].status) {
        obj.status = 1;
      }
      if (taskSelect[0].status && taskSelect[1].status){
        delete obj.status;
      }
      if(taskSelect[2].status){
        obj.memberRelType = 1;
      }
      if (taskSelect[3].status){
        obj.memberRelType = 2;
      }
      if (taskSelect[2].status && taskSelect[3].status){
        obj.memberRelType = 0;
      }
      // if (taskSelect[2].status || taskSelect[3].status]) {
      //   this.selectJoinTask(obj);
      //   return false;
      // }
    }
    
    if (this.data.isShowStopTime){
      if(this.data.timeType != null){
        obj = { timeType: this.data.timeType }
      }
      this.setData({
        isShowStopTime: false
      })
    }
    obj.resourceType = 10010001,
    obj.resourceId = this.data.taskId;
    obj.taskId = this.data.taskId;
    this.setData({ selectPlanCondiction: obj});
    api.request(obj,address,"post",true).then(res=>{
      console.log(res);
      console.log("__________________")
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

        // 任务完成进度
        data.map((item, index) => {
          // var hasDown = 0;
          // 用于判断加载更多的时候是否已经加载完毕所有数据（初始化为 未加载完）
          item.isLoadedAllData = false;
          
          //任务完成度计算
          // item.itemList.map((sub, num) => {
          //   if (sub.status == 1) {
          //     hasDown++
          //   }
          // })
          item.percent = item.finishedItems + "/" + item.itemCount;//hasDown + " / " + item.itemList.length;
        })

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

  // 查询我执行的任务（该函数未被调用）
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
  selectFile: function (e) {
    if(e != undefined){
      var atype = e.currentTarget.dataset.atype;
      if (atype == 7 || atype == 10 || atype == 9) {
        var previewItem = e.currentTarget.dataset.item;
        previewItem.src = encodeURI(previewItem.src);
        var previewAtype = e.currentTarget.dataset.atype;
        this.setData({
          previewAtype: previewAtype,
          previewItem: previewItem,
          preview: true
        })
        return false;
      }
      if (atype == 3 || atype == 4 || atype == 5 || atype == 6 || atype==2){
        wx.navigateTo({
          url: './filePreview/filepreview?filename=' + e.currentTarget.dataset.title + "&id=" + e.currentTarget.dataset.item.id + "&atype=" + e.currentTarget.dataset.item.atype
        })
        return false;
      }
      else if (atype == 8) {
        this.setData({ alert: { content: '该格式需前往下载 云竹协作APP 预览' } });
        this.alert();
        return false;
      }
      else if (atype == 11) {
        this.setData({ alert: { content: '该格式需前往下载 云竹协作APP 预览' } });
        this.alert();
        return false;
      }
      else if (atype == 1) {
        this.setData({ alert: { content: '该格式需前往下载 云竹协作APP 预览' } });
        this.alert();
        return false;
      }
      if(atype != 0){
        return false;
      }
      else{
        this.setData({ parentId: e.currentTarget.dataset.id})
      }
    }
    else{
      this.setData({
        fileParentIdStack:[]
      })
    }
    var address = app.ip + "tc/taskService/findTaskArcTreeByParent";
    var obj = { taskId: this.data.taskId, parentId: this.data.parentId};
    api.request(obj,address,"post",true).then(res=>{
      var file = handle.handleFile(res);
      if(file.status){
        var fileParentIdStack = this.data.fileParentIdStack;//父文件夹Id堆栈
        var isShowReturn = false;
        var title = e == undefined ? '首页' : e.currentTarget.dataset.title;
        title = title.length > 5 ? title.substring(0, 4) + '...' : title.substring(0, 4);
        var floderObj = { parentId: this.data.parentId,title:title};
        file = handle.fileList(app, api, file.data);
        // 判断文件是否可选择
        file.map((item,num)=>{
          if (this.isOtherreadFile(item)){
            item.isReadOnly = true;
          }
          else{
            item.isReadOnly = false;
          }
        })
        fileParentIdStack.push(floderObj);
        if (fileParentIdStack.length > 2 || fileParentIdStack.length == 2){
          isShowReturn = true;
        }
        this.setData({
          fileList: file,
          fileParentIdStack: fileParentIdStack,
          isShowReturn: isShowReturn
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
  },
  
  // 进入文件夹
  entryFolder: function (e) {
    var parentId = e.currentTarget.dataset.parentid;
    this.setData({
      parentId: parentId,
      chooseFileList:[]
    });
    this.selectFile(e);
  },

  // 切换菜单列表
  switchMenu: function (e) {
    var index = e.currentTarget.dataset.index;
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
      case 2:
        this.getProjectMember();
        break;
      case 3:
        this.getProjectInfo();
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
    var index = e.currentTarget.dataset.index;
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
    var manager = e.currentTarget.dataset.manager;
    var creatorid = e.currentTarget.dataset.creatorid;
    var userid = wx.getStorageSync("tcUserId");
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
    
    // 权限检测
    if(!this.handlePower()){
      if (manager == userid || creatorid == userid){
        this.sendTaskReq(obj, taskList, parentnum, selfnum, status);
      }
      else{
        status = status == 0 ? 1 : 0;
        taskList[parentnum].itemList[selfnum].status = status;
        this.setData({ taskList })
        this.alert();
        return false;
      }
    }
    else{
      this.sendTaskReq(obj, taskList, parentnum, selfnum, status);
    }
    
  },

  // 发送更改任务完成状态请求
  sendTaskReq: function (obj, taskList, parentnum, selfnum, status) {
    var address = app.ip + "tc/schedule/itemService/update";
    api.sendDataByBody(obj, address, "post", true).then(res => {
      if (res.data.code == 200 && res.data.result) {
        taskList[parentnum].itemList[selfnum].status = status;
        this.setData({ taskList })
      }
    })
  },

  // 权限判断
  handlePower: function () {
    var userId = wx.getStorageSync("tcUserId");
    var end = false;
    var power = this.data.power;
    if (power.adminGroups == null) { power.adminGroups = [];}
    for (var i = 0; i < power.adminGroups.length; i++){
      if (userId == power.adminGroups[i]){
        end = true;
      }
    }
    if(!end){
      if (power.teamManager == userId) { end = true;}
      if(!end){
        if(userId == power.manager){
          end = true;
        }
      }
    }
    return end;
  },

  // 滚动穿透问题(该函数虽无内容，但是有重要作用)
  stopmove:function (e) {
  },

  // 切换任务编辑状态栏的隐藏与显示
  switchEditStatus: function (e) {
    var needEditPlanId = e.currentTarget.dataset.sumid;
    var title = e.currentTarget.dataset.title;
    var delPlanInfo = this.data.delPlanInfo;
    if (needEditPlanId == undefined) { needEditPlanId = null; delPlanInfo = null;}
    else{
      delPlanInfo = {title:title,content:"确认要删除任务组 " + title +" ?将同时删除其中包含的任务"}
    }
    this.setData({ isShowEditPlan: !this.data.isShowEditPlan, needEditPlanId: needEditPlanId, delPlanInfo: delPlanInfo})
  },

  // 编辑任务计划
  editPlan: function () {
    if (this.handlePower()){
      wx.navigateTo({
        url: '/pages/taskDetails/editPlan/editplan?planid=' + this.data.needEditPlanId,
      })
    }
    else{
      var userid = wx.getStorageSync('tcUserId');
      // 检测该任务组是否是由本人创建
      var taskList = this.data.taskList;
      var checkEnd = false;
      taskList.map((item,index)=>{
        if (item.summaryBean.id == this.data.needEditPlanId){
          if (userid == item.summaryBean.creatorId){
            checkEnd = true;
          }
        }
      })
      if(checkEnd){
        wx.navigateTo({
          url: '/pages/taskDetails/editPlan/editplan?planid=' + this.data.needEditPlanId,
        })
      }
      else{
        this.setData({alert:{content:"权限不够"}});
        this.alert();
      }
      
    }
  },

  // 删除任务计划
  delPlan: function () {
    var id = this.data.needEditPlanId;
    if(this.handlePower()){
      this.delPlanReq(id)
    }
    else{
      var userid = wx.getStorageSync('tcUserId');
      // 检测该任务组是否是由本人创建
      var taskList = this.data.taskList;
      var checkEnd = false;
      taskList.map((item, index) => {
        if (item.summaryBean.id == this.data.needEditPlanId) {
          if (userid == item.summaryBean.creatorId) {
            checkEnd = true;
          }
        }
      })
      if (checkEnd) {
        this.delPlanReq(id);
      }
      else {
        this.setData({ alert: { content: "权限不够" } });
        this.alert();
      }
    }
  },

  // 删除任务计划请求
  delPlanReq: function (id) {
    var address = app.ip + "tc/schedule/summaryService/delete";
    api.request({ id }, address, "POST", true).then(res => {
      if (res.data.code == 200 && res.data.result) {
        this.confirm.hide();
        this.onShow();
      }
      else {
        this.setData({ alert: { content: "删除失败" } });
        this.alert();
      }
    })
  },

  // ----------------------------------------------------任务文件模块函数-----------------------------------------------
  // 监听用户选择文件/文件夹
  checkOutFile: function (e) {
    var num = e.currentTarget.dataset.num;
    e = e.detail.e;
    var fileList = this.data.fileList;
    var chooseFileList = this.data.chooseFileList;
    var end = false;
    chooseFileList.map((item,index)=>{
      if(item.id == e.currentTarget.dataset.id){
        end = true;
        chooseFileList.splice(index,1)
      }
    })
    if(!end){
      fileList[num].select = true;
      chooseFileList.push(e.currentTarget.dataset.item)
    }
    else{
      fileList[num].select = false;
    }
    this.setData({ chooseFileList, fileList});
  },

  // 新建文件夹弹框
  newFolderAlert: function () {
    this.newFolder.showModel();
  },

  // 更多操作
  moreFun: function () {
    this.setData({ moreAction: !this.data.moreAction})
  },

  // 返回文件列表
  returnFileList: function () {
    this.setData({ preview:false})
  },

  // 新增加一个文件菜单
  newAddFile: function () {
    this.setData({ isShowAddFile: !this.data.isShowAddFile})
  },

  // 确定是否输入文件夹名称
  isInputFolderName: function (folderName) {
    if (folderName == null || folderName == "") {
      this.setData({ alert: { content: '文件夹名称不能为空' } });
      this.alert();
      return false;
    }
    else {
      var reg = /\s/img;
      var length = folderName.split("").length;
      var spacing = [];
      spacing = folderName.match(reg);
      if (spacing != null && length == spacing.length) {
        this.setData({ alert: { content: '文件夹名称不能为空' } });
        this.alert();
        return false;
      }
      else{
        return true;
      }
    }
  },

  // 新增加一个文件夹
  newFolderName: function (e) {
    if(!this.isInputFolderName(e.detail.folderName)){
      return false;
    }
    var folderName = encodeURI(e.detail.folderName);
    var fileList = this.data.fileList;
    var address = app.ip + "tc/taskService/addArcFolder";
    var obj = { parentId: this.data.parentId, taskId: this.data.taskId, folder: folderName}
    api.request(obj,address,"POST",true).then(res=>{
      if(res.data.code == 200 && res.data.result){
        var file = handle.addFolder(app,api,res.data.data);
        file[0].isReadOnly = true;
        fileList.unshift(file[0]);
      }
      else if(res.data.code == 414){
        this.setData({alert:{content:res.data.message}});
        this.alert();
        
      }
      this.setData({ fileList: fileList, isShowAddFile:false})
      this.newFolder.hide();
    })
  },

  // 跳转到指定的文件夹
  jumpFile: function (e) {
    var fileParentIdStack = this.data.fileParentIdStack;
    var index = e.currentTarget.dataset.index;
    fileParentIdStack = fileParentIdStack.splice(0, index+1);
    var parentId = e.currentTarget.dataset.parentid;
    this.setData({ fileParentIdStack, parentId});
    this.getFileTree(parentId);
  },

  // 文件向上翻页
  uploadFolder: function (e) {
    var fileParentIdStack = this.data.fileParentIdStack;
    var idStackLength = fileParentIdStack.length;
    var currentParent = fileParentIdStack[idStackLength - 2];
    var parentId = currentParent.parentId;
    fileParentIdStack.splice(idStackLength-1,1);
    this.setData({
      fileParentIdStack
    });
    this.getFileTree(parentId);
  },

  // 通过parentId请求文件列表
  getFileTree: function (parentId) {
    var fileParentIdStack = this.data.fileParentIdStack;
    var address = app.ip + "tc/taskService/findTaskArcTreeByParent";
    var obj = { taskId: this.data.taskId, parentId: parentId };
    var isShowReturn = false;
    api.request(obj, address, "post", true).then(res => {
      var file = handle.handleFile(res);
      if (file.status) {
        file = handle.fileList(app, api, file.data);
        if (fileParentIdStack.length > 2 || fileParentIdStack.length == 2) {
          isShowReturn = true;
        }
        // 判断当前文件是否可被用户选中
        file.map((item, num) => {
          if (this.isOtherreadFile(item)) {
            item.isReadOnly = true;
          }
          else {
            item.isReadOnly = false;
          }
        })
        this.setData({
          fileList: file,
          isShowReturn: isShowReturn
        })
      }
    })
  },
  
  // 选取本地文件，进行上传操作
  readLocalFile: function () {
    var fileList = this.data.fileList;
    wx.chooseImage({
      count: 10,
      success: (res) => {
        this.uploadLocalFile(res.tempFilePaths, 0, 0, res.tempFilePaths.length);
      },
      fail: (err) => {
        console.log("文件选取失败")
      }
    })
    this.setData({
      isShowAddFile:false
    })
  },
  
  // 文件上传
  uploadLocalFile: function (ary,i,progress,upNum) {
    if(ary.length < i || ary.length == i){
      return true
    }
    var address = app.ip + "tc/taskService/uploadTaskArc";
    var currentProgress = 0;
    const uploadTask = wx.uploadFile({
      url: address,
      filePath: ary[i],
      name: 'file',
      header: {
        "content-type": "multipart/form-data",
        proxyUserToken: wx.getStorageSync("proxyUserToken"),
        taskId: this.data.taskId,
        parentId: this.data.parentId
      },
      success:(res)=>{
        try{
          res = JSON.parse(res.data);
        }
        catch(e){
          console.log(e);
        }
        if(res.result && res.code == 200){
          var file = res.data;
          var fileList = this.data.fileList;
          file = handle.fileList(app, api, file);
          file[0].isReadOnly = true;
          file = file[0];
          fileList.push(file);
          
          this.setData({ fileList});
        }
        this.uploadLocalFile(ary,i+1,progress+100,upNum);
      },
      fail:(e)=>{
        upNum = upNum - 1;
        currentProgress = Math.floor(progress/upNum);
        this.uploadLocalFile(ary, i + 1, progress, upNum);
      }
    })
    uploadTask.onProgressUpdate((res)=>{
      currentProgress = Math.floor((res.progress + progress)/upNum);
    })
  },

  // 文件全选/取消
  selectAll: function (e) {
    var state = e.currentTarget.dataset.state == 'true'? true : false;
    var fileList = this.data.fileList;
    var length = fileList.length;
    for (var i = 0; i < length; i++){
      fileList[i].select = state
    }
    if(!state){
      this.setData({ chooseFileList: [], fileList})
    }
    else{
      this.setData({ fileList, chooseFileList: fileList})
    }
  },

  // 文件下载操作
  downloadFile: function (chooseFileList,i){
    if(i == undefined){
      i = 0;
      chooseFileList = this.data.chooseFileList
    }
    // 判断是否已经下载完成
    if (chooseFileList.length == i){
      return false;
    }
    // 判断是否为文件夹
    if (chooseFileList[i].atype == 0){
      if (chooseFileList.length == i+1){
        return false;
      }
      else{
        i = i + 1;
      }
    }
    var id = chooseFileList[i].id
    // 判断文件大小是否超过小程序下载限制
    var asize = parseInt(chooseFileList[i].asize.split(".")[0]);
    var reg = /M/img;
    if (asize > 10 && reg.test(chooseFileList[i].asize )){
      this.setData({alert:{content:"文件太大，请下载App"}});
      this.alert();
      return false;
    }
    var address = app.ip + "tc/spaceService/downloadFileBatchUnlimitGet?arcIds=" + id;
    let downloadTask = wx.downloadFile({
      url: address,
      success: (res) => {
        if (res.statusCode == 200) {
          // 持久保存文件
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: (res) => {
              this.downloadFile(chooseFileList,i+1)
              this.setData({
                alert: { content: "下载成功" }
              })
              this.alert()
            },
            fail:(e)=>{
              this.setData({
                alert: { content: "下载失败" }
              })
              this.alert()
            }
          })
        }
      },
      fail:(err)=>{
        console.log(err);
      }
    })
  },

  // 删除操作
  delFile: function (e) {
     var address = app.ip + "tc/taskService/deleteTaskArc";
    var taskArcIds = [];
    var fileArcIds = [];
    var chooseFileList = this.data.chooseFileList;
    for (var i = 0; i < chooseFileList.length; i++) {
      if (chooseFileList[i].atype != 0){
        if ( this.isCouldDel(chooseFileList[i] ) ) {
          taskArcIds.push(chooseFileList[i].id);
        }
        else{
          this.setData({ alert: { content: "权限不够" } });
          this.alert();
        }
      }
      else{
        fileArcIds.push(chooseFileList[i].id);
      }
    }
    if (taskArcIds.length != 0) {
      api.sendDataByBody(taskArcIds, address, "POST", true).then(res => {
        if (res.data.code == 200 && res.data.result) {
          this.delFileList(taskArcIds);
        }
        else {
          this.setData({ alert: { content: "文件删除失败" } });
          this.alert();
        }
      }).catch(e => {
        this.setData({ alert: { content: "文件删除失败" } });
        this.alert();
      })
    }
    if (fileArcIds.length != 0){
      this.isCouldDelFolder(fileArcIds,0,[])
    }
  },

  // 检查是否可删除文件夹
  isCouldDelFolder: function (arcIds,index,couldDel) {
    var address = app.ip + "tc/taskService/isContainsOther";
    if (arcIds.length == 0 || arcIds.length == index){
      if (arcIds.length != 0){
        this.delCloudFolder(couldDel)
      }
      // 删除远程文件列表数据与本地文件列表数据
      return false;
    }
    api.sendDataByBody(arcIds, address, "POST", true).then(res => {
      if (res.data.code == 200 && res.data.result) {
        if (res.data.data == "true") {
          couldDel.push(arcIds[index]);
        }
        else {
          this.setData({ alert: { content: "已跳过无法删除的文件夹" } });
          this.alert();
        }
        this.delCloudFolder(arcIds, index+1, couldDel);
      }
    })
  },

  // 删除远程文件数据
  delCloudFolder: function (fileArcIds) {
    var address = app.ip + "tc/taskService/deleteTaskArc";
    api.sendDataByBody(fileArcIds, address, "POST", true).then(res => {
      if(res.data.code == 200 && res.data.result){
        var fileList = this.data.fileList;
        fileArcIds.map((item,index)=>{
          fileList.map((obj,num)=>{
            if(obj.id == item){
              fileList.splice(num,1)
            }
          })
        })
        this.setData({
          fileList, chooseFileList:[]
        })
      }
      else{
        this.setData({alert:{content:"文件夹删除失败"}});
        this.alert();
      }
    }).catch(e=>{
      this.setData({ alert: { content: "文件夹删除失败" } });
      this.alert()
    })

  },

  // 通过数组的方式删除本地文件列表数据
  delFileList: function (ary) {
    var fileList = this.data.fileList;
    ary.map((item,index)=>{
      fileList.map((obj,num)=>{
        if(item == obj.id){
          fileList.splice(num,1)
        }
      })
    })
    this.setData({
      fileList, chooseFileList:[]
    })
  },

  // 对文件操作权限进行判定
  CheckPermissions: function (obj) {
    /*
    privType:1  文件只读  4：文件未开启只读保护
    permissions: true:可以进行操作 false:权限不够
    obj:每条文件的详细信息
    */

    var userId = wx.getStorageSync("tcUserId");
    var permissions = false;//权限检查结果
    // 检查是否开启了只读保护
    if (obj.privType == 1){
      permissions = obj.ownerId == userId? true : false;
      // 判断是否是管理员
      if(!permissions){
        permissions = this.handlePower();
      }
    }
    if(obj.privType == 4){
      permissions = true;
    }
    return permissions;
  },

  // 判定是否具有删除文件权限
  isCouldDel: function (obj) {
    var permission = false;
    if(this.handlePower()){
      permission = true;
    }
    else{
      permission = obj.ownerId == wx.getStorageSync("tcUserId")? true : false;
    }
    return permission;
  },

  // 判断是否为别人的只读文件
  isOtherreadFile: function (obj) {
    var permission = false;
    if(this.handlePower()){
      permission = true;
    }
    else{
      if (obj.privType == 1){
        permission = obj.ownerId == wx.getStorageSync("tcUserId") ? true : false;
      }
      else{
        permission = true;
      }
    }
    return permission;
  },

  //切换文件预览工具栏
    switchFileReadAct: function () {
      this.setData({ isShowReturnArea: !this.data.isShowReturnArea})
    },

  // 文件预览下的 下载
  toobarDown: function () {
    if (this.data.previewItem.definedPriv){
      if(this.handlePower()){
        this.downloadFile([this.data.previewItem], 0)
      }
      else if (this.data.previewItem.ownerId == wx.getStorageSync("tcUserId")){
        this.downloadFile([this.data.previewItem], 0)
      }
      else{
        this.setData({ alert: { content: "只读文件，无法下载" } });
        this.alert();
        return false;
      }
      
    }
    else{
      this.downloadFile([this.data.previewItem], 0)
    }
  },

  // 对预览文件的删除操作
  delpreviewFile: function () {
    var address = app.ip + "tc/taskService/deleteTaskArc";
    var previewfile = this.data.previewItem;
    var taskArcIds = [];
    if(this.isCouldDel(previewfile)){
      taskArcIds.push(previewfile.id);
    }
    else{
      this.setData({alert:{content:"权限不够"}});
      this.alert();
      return false;
    }
    api.sendDataByBody(taskArcIds, address, "POST", true).then(res => {
      if(res.data.code == 200 && res.data.result){
        this.setData({
          preview:false
        })
        this.delLocalFile(previewfile)
      }
    })
  },

  // 删除本地文件列表中的数据
  delLocalFile: function (obj) {
    var fileList = this.data.fileList;
    fileList.map((item,index)=>{
      if(item.id == obj.id){
        fileList.splice(index,1);
      }
    })
    this.setData({
      fileList
    })
  },

  // 文件移动
  fileMove: function (fileid) {
    wx.navigateTo({
      url: './fileMove/fileMove?taskid=' + this.data.taskId + "&file=" + fileid,
    })
  },

  // 复制文件
  copyFile: function () {
    var chooseFileList = this.data.chooseFileList;
    var fileid = [];
    var permission = false;
    chooseFileList.map((item,index)=>{
      fileid.push(item.id);
    })
    this.appraisalFolder(fileid);
  },

  // 鉴定文件夹下方是否有被锁定的文件
  appraisalFolder: function (ary) {
    var address = app.ip + "tc/taskAuthorityService/isAuthorityByType";
    var arcIds = ary;
    var head = {
      auType: 4
    };
    api.customRequest(head,arcIds,address,"POST",true).then(res=>{
      if(res.data.code == 403 && !res.data.result){
        this.setData({alert:{content:'所选文件夹包含权限锁定文件'}});
        this.alert();
        return false;
      }
      else if(res.data.code == 200 && res.data.result){
        ary = ary.join(",")
        wx.navigateTo({
          url: './copyfile/copyfile?taskId=' + this.data.taskId + "&fileid=" + ary,
        })
      }
    })
  },

  // 鉴定是否有权限移动
  AppraisalPower: function (id) {
    var address = app.ip + "tc/taskService/isContainsOther";
    var arcIds = [];
    var userId = wx.getStorageSync("tcUserId");
    var chooseFileList = this.data.chooseFileList;
    var isHasFolder = false;//是否包含文件夹
    var isHasPower = true;//是否有权限移动
    var permission = this.handlePower();
    if(permission){
      // 移动
      for (var i = 0; i < chooseFileList.length; i++) {
        arcIds.push(chooseFileList[i].id)
      }
      this.fileMove(arcIds.join(","));
    }
    else{
      for (var i = 0; i < chooseFileList.length; i++) {
        if (chooseFileList[i].atype == 0){
          isHasFolder = true;
        }
        if (chooseFileList[i].creatorId != userId){
          isHasPower = false;
        }
        arcIds.push(chooseFileList[i].id)
      }
      if (!isHasPower){
        this.setData({alert:{content:"移动失败，权限不够"}});
        this.alert();
        return false;
      }
      if (isHasFolder){
        this.checkFolderContent(arcIds,address)
      }
      else{
        this.fileMove(arcIds.join(","));
      }
    }
  },

  // 检查文件夹下方是否存在别人的文件
  checkFolderContent: function (arcIds, address) {
    api.sendDataByBody(arcIds, address, "POST", true).then(res => {
      if (res.data.code == 200 && res.data.result) {
        if (res.data.data == "true") {
          this.fileMove(arcIds.join(","))
        }
        else {
          this.setData({ alert: { content: "移动失败，包含其他文件" } });
          this.alert();
        }
      }
    })
  },

  // 设置权限
  setPower: function () {
    var chooseFileList = this.data.chooseFileList;
    if (this.isCouldDel(chooseFileList[0])){
      wx.navigateTo({
        url: './setPower/setPower?taskid=' + this.data.taskId + "&fileid=" + chooseFileList[0].id,
      })
    }
    else{
      this.setData({alert:{content:'权限不够'}});
      this.alert();
    }
  },

  // 获取重名名信息
  getFileRename: function (e) {
    this.setData({fileRename:e.detail.folderName});
    this.fileRename();
  },

  // 文件重命名弹框
  renameAlert: function () {
    this.rename.showModel();
  },

  // 确定重命名
  fileRename: function () {
    var chooseFileList = this.data.chooseFileList;
    if (!this.isCouldDel(chooseFileList[0])){
      this.setData({alert:{content:"权限不够"}});
      this.alert()
    }
    else{
      var address = app.ip + "tc/taskService/updateTaskArcTitle";
      var obj = {
        arcId: chooseFileList[0].id,
        parentId: chooseFileList[0].parentId,
        title:encodeURI(this.data.fileRename)
      }
      api.request(obj,address,"POST",true).then(res=>{
        if(res.data.code ==200 && res.data.result){
          res.data.data.isReadOnly = true;
          this.handleRename(res.data.data,obj);
          this.rename.hide();
        }
        else{
          this.setData({alert:{content:"文件重命名失败"}});
          this.alert();
        }
      }).catch(e=>{
        this.setData({ alert: { content: "文件重命名失败" } });
        this.alert();
      })
    }
  },

  // 文件重命名成功处理函数
  handleRename: function (res,obj) {
    var fileList = this.data.fileList;
    for (var i = 0; i < fileList.length; i++){
      if (fileList[i].id == res.id){
        fileList[i] = handle.fileList(app,api,[res])[0]
      }
    }
    this.setData({ fileList, chooseFileList:[]})
  },

  // 附件上传按钮的隐藏与显示
  switchUpFileBtn: function () {
    this.setData({ isShowUpImg: !this.data.isShowUpImg})
  },
  
  // ----------------------------------------------------项目成员相关-------------------------------------------------------
  getProjectMember: function () {
    var address = app.ip + "tc/taskService/taskMemberManager";//旧接口
    address = app.ip + "tc/taskTeamService/findMemberByTask";
    var obj = {taskId:this.data.taskId};
    api.request(obj,address,"POST",true).then(res=>{
      console.log("成员")
      console.log(res);
      // return false;
      this.handleProjectMember(res);
    })
  },

  // 处理项目成员数据
  handleProjectMember: function (res) {
    var userid = wx.getStorageSync('tcUserId');
    var check = false;
    if(res.data.code == 200 && res.data.result){
      // var memberlist = res.data.data.memberBeanList;
      var memberlist = res.data.data;
      memberlist.map((item,index)=>{
        if (userid == item.id){
          if (item.type == 12 || item.type == 1){
            check = true;
          }
        }
      })
      console.log(check)
      let sortMember = [];//对数据进行排序
      let projectAdmin = [];//项目管理员
      let teamAdmin = [];//团队管理员
      let otherMember = [];
      memberlist.map((item,index)=>{
        if (item.type == 1){
          sortMember.unshift(item);
        }
        else if(item.type == 12){
          projectAdmin.push(item);
        }
        else if(item.type == 14){
          teamAdmin.push(item);
        }
        else{
          otherMember.push(item);
        }
      })

      projectAdmin.map((item,index)=>{
        sortMember.push(item);
      })

      teamAdmin.map((item, index) => {
        sortMember.push(item);
      })

      otherMember.map((item, index) => {
        sortMember.push(item);
      })
      console.log("状态" + check)
      this.setData({
        memberlist: sortMember,
        isCouldAdd: check
      })
    }
    else{
      this.setData({
        alert:{content:"数据加载异常，请稍后再试"}
      })
      this.alert()
    }
  },

  // 得到成员的详细信息
  getPersonInfo: function (e) {
    var item = e.currentTarget.dataset.item;
    var state = this.data.isCouldAdd? true:false;
    wx.navigateTo({
      url: './personinfo/personinfo?personid=' + item.id + "&isshowdelbtn=" + state,
    })
  },

  // 添加成员
  addmember: function (e) {
    var state = e.currentTarget.dataset.state;//0:删除成员，1：添加成员
    wx.navigateTo({
      url: './member/member?taskid=' + this.data.taskId + "&state=" + state,
    })
  },

  // -----------------------------------------------项目设置相关---------------------------------------------------
  // 获取项目详细信息
  getProjectInfo: function () {
    var time = this.data.time;
    // 进项权限判定，判定用户是否可以编辑项目信息
    var permission = this.handlePower();
    this.setData({ isCouldEditProject:permission});

    var address = app.ip + "tc/taskService/findTaskBOById";
    var obj = { taskId:this.data.taskId};
    api.request(obj,address,"POST",true).then(res=>{
      if(res.data.code == 200 && res.data.result){
        var project = res.data.data.summaryBean;
        time.createTime = project.createDate
        project.createDate = this.timeTurn(project.createDate )
        if(project.startDate != null){
          time.startTime = project.startDate.split("T")[1];
          project.startDate = project.startDate.split("T")[0];
          
        }
        if (project.endDate != null){
          time.endTime = project.endDate.split("T")[1];
          project.endDate = project.endDate.split("T")[0];
        }
        this.setData({
          project:res.data.data.summaryBean,
          projectMember: res.data.data.memberBeans,
          time:time
        })

        // 通过权限，决定渲染不同的按钮
        this.queryUserPower();
      }
      else{
        this.setData({
          alert: { content: "数据加载异常，请稍后再试" }
        })
        this.alert()
      }
    })
  },
  
  // 是否打开功能区
  openToolbarMenu: function () {
    // 判定是否为管理员与项目负责人
    var project = this.data.project;
    if (!this.data.isShowBtn){
      return false;
    }
    else{
      // 判断是否为公司负责人且非项目负责人
      if ( this.validatePower() ){
        return false;
      }
    }
    this.setData({ isOpenMenu: !this.data.isOpenMenu});
  },

  // 判定是否为公司负责人，但非项目负责人
  validatePower: function () {
    var userid = wx.getStorageSync('tcUserId');
    var project= this.data.project;
    if (project.teamManager == userid && userid != project.manager) {
      return true;
    }
    else{
      return false;
    }
  },

  // 获取项目级别
  getProjectLevel: function (e) {
    var level = e.currentTarget.dataset.level;
    var project = this.data.project;
    project.important = parseInt(level);
    this.setData({project})
    this.openToolbarMenu();
    var obj = this.handleTimeFormat(project);
    this.saveSummaryBean(obj);
  },

  // 设置项目开始时间
  setProjectStartDate: function (e) {
    var time = this.data.time;
    // 判定是否为管理员与项目负责人
    if (!this.data.isShowBtn) {
      return false;
    }
    if ( this.validatePower() ){
      return false;
    }
    time.startTime = null;
    var project = this.data.project;
    project.startDate = e.detail.value;
    this.setData({project,time})
    var obj = this.handleTimeFormat(project);
    this.saveSummaryBean(obj);
  },

  // 设置项目结束时间
  setProjectEndDate: function (e) {
    // 判定是否为管理员与项目负责人
    if (!this.data.isShowBtn) {
      return false;
    }
    if (this.validatePower()) {
      return false;
    }
    var time = this.data.time;
    time.endTime = null;
    var project = this.data.project;
    project.endDate = e.detail.value;
    this.setData({project,time})
    var obj = this.handleTimeFormat(project);
    this.saveSummaryBean(obj);
  },

  // 设置项目所属
  setProjectAscription: function () {
    // 判定是否为管理员与项目负责人
    if (!this.data.isShowBtn) {
      return false;
    }
    if (this.validatePower()) {
      return false;
    }
    wx.navigateTo({
      url: './ascription/ascription?taskid=' + this.data.taskId,
    })
  },

  // 编辑项目描述与项目标题
  editProjectInfo: function () {
    var userId = wx.getStorageSync('tcUserId');
    var pTeamManager = wx.getStorageSync('pTeamManager');
    var project = this.data.project;
    // 判断是否即是公司负责人也是项目负责人
    if (project.manager == userId){
      wx.navigateTo({
        url: './descript/descript?taskid=' + this.data.taskId,
      })
    }
    // 判定是否为管理员与项目负责人
    if (!this.data.isShowBtn) {
      return false;
    }
    if (this.validatePower()) {
      return false;
    }
    // 判断是否公司负责人
    if (userId == pTeamManager){
      return false;
    }
    wx.navigateTo({
      url: './descript/descript?taskid=' + this.data.taskId,
    })
  },
  
  // 管理员组
  adminTeam: function () {
    wx.navigateTo({
      url: './admin/admin?taskid=' + this.data.taskId,
    })
  },

  /*
    判断用户是否为普通管理员或项目负责人
    permisiion{
      0:普通管理员或者项目成员，可以退出项目
      1：项目负责人，可以删除项目
    }
 */
  queryUserPower: function () {
    var permission = null;//0:普通管理员
    var project = this.data.project;
    var userId = wx.getStorageSync("tcUserId");
    var projectMember = this.data.projectMember;
    for(var i = 0; i < projectMember.length; i++){
      if(projectMember[i].resourceId == userId){
        if(project.adminGroups.indexOf(userId) >= 0){
          permission = 1;
        }
        else{
          if (project.manager == userId || project.teamManager == userId) {
            permission = 1;
            break;
          }
        }
      }
      else{
        permission = 0;
      }
    }
    
    if(permission == 1){
      this.setData({ isShowBtn:true});
    }
    else{
      this.setData({ isShowBtn:false})
    }
  },

  // 项目的高级设置
  advancedSet: function () {
    // 判定是否为管理员与项目负责人
    if (!this.data.isShowBtn) {
      return false;
    }
    wx.navigateTo({
      url: './advanceSet/advanceset?taskid=' + this.data.taskId,
    })
  },

  // 保存project信息
  saveSummaryBean: function (summaryBean) {
    var address = app.ip + "tc/taskService/addOrUpdateTask";
    var obj = {
      summaryBean:summaryBean
    }
    api.request(obj,address,"POST",false).then(res=>{
      console.log(res);
    })
  },

  // 处理因为时间格式的原因，导致无法正确发送数据
  handleTimeFormat: function (summaryBean) {
    var time = this.data.time;
    summaryBean = JSON.stringify(summaryBean);
    summaryBean = JSON.parse(summaryBean);
    if(summaryBean.startDate != null){
      if(time.startTime == null){
        time.startTime = "00:00:00.000+0800"
      }
      summaryBean.startDate = summaryBean.startDate + "T" + time.startTime //api.getNowTime();
    }
    if (summaryBean.endDate != undefined && summaryBean.endDate != null){
      if(time.endTime == null){
        time.endTime = "00:00:00.000+0800";
      }
      summaryBean.endDate = summaryBean.endDate + "T" + time.endTime //api.getNowTime();
    }
    else{
      delete summaryBean.endDate;
    }
    summaryBean.createDate = time.createTime;//+ api.getNowTime();
    return summaryBean;
  },

  // 退出项目
  exitProject: function () {
    var address = app.ip + "tc/taskService/quitTask";
    var obj = {
      taskId: this.data.taskId
    }
    api.request(obj,address,"POST",true).then(res=>{
      if(res.data.code == 200 && res.data.result){
        wx.navigateBack()
      }
      else{
        this.setData({alert:{content:"退出失败"}});
        this.alert();
      }
    }).catch(e=>{
      this.setData({ alert: { content: "退出失败" } });
      this.alert();
    })
  },

  // 时间转化
  timeTurn: function (time) {
    time = time.split("T")[0] + " " + time.split("T")[1].split(".")[0];
    return time;
  }
})