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
    isShowEditPlan:false,//是否显示编辑任务计划状态栏
    needEditPlanId:null,
    delPlanInfo:{title:null},
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

    // ------------------------------------------------------------------设置模块数据------------------------------------------
    project:null,//用于存放单个项目的详细信息
    isOpenMenu: false,//是否打开功能区
    isCouldEditProject:false,
    projectMember:null,
    isShowBtn: false,//是否展示删除项目与退出项目按钮    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ taskId: options.id});
    this.popup = this.selectComponent("#popup");
    this.confirm = this.selectComponent("#confirm");
    this.newFolder = this.selectComponent("#newFolder");
    this.rename = this.selectComponent("#rename");
    this.searchPowerData(options.id)
  },

  onShow:function () {
    this.selectPlanList(this.data.taskId);
    this.setData({ isShowEditPlan:false})
    wx.stopPullDownRefresh();//关闭下拉刷新
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.onShow();
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
  // 打开对话弹框
  openConfirm: function () {
    this.confirm.show();
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
  selectFile: function (e) {
    if(e != undefined){
      console.log(e);
      console.log("测试通过")
      var atype = e.currentTarget.dataset.atype;
      console.log(atype);
      if (atype == 7 || atype == 10 || atype == 9) {
        var previewItem = e.currentTarget.dataset.item;

        var previewAtype = e.currentTarget.dataset.atype;
        this.setData({
          previewAtype: previewAtype,
          previewItem: previewItem,
          preview: true
        })
        return false;
      }
      if(atype != 0){
        return false;
      }
      else{
        this.setData({ parentId: e.currentTarget.dataset.id})
      }
    }
    var address = app.ip + "tc/taskService/findTaskArcTreeByParent";
    var obj = { taskId: this.data.taskId, parentId: this.data.parentId};
    api.request(obj,address,"post",true).then(res=>{
      console.log("文件列表");
      var file = handle.handleFile(res);
      console.log(res)
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
      parentId: parentId,
      chooseFileList:[]
    });
    this.selectFile(e);
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
      case 2:
        // this.getProjectInfo();
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
    console.log(e);
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

  // 切换任务编辑状态栏的隐藏与显示
  switchEditStatus: function (e) {
    var needEditPlanId = e.currentTarget.dataset.sumid;
    var title = e.currentTarget.dataset.title;
    var delPlanInfo = this.data.delPlanInfo;
    if (needEditPlanId == undefined) { needEditPlanId = null; delPlanInfo = null;}
    else{
      delPlanInfo = {title:title,content:"确认要删除任务计划 " + title +" ?,将同时删除其中包含的任务计划"}
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
      this.setData({alert:{content:"权限不够"}});
      this.alert();
    }
  },
  sure:function(){

  },
  // 删除任务计划
  delPlan: function () {
    var address = app.ip + "tc/schedule/summaryService/delete";
    var id = this.data.needEditPlanId;

    if(this.handlePower()){
      api.request({ id }, address, "POST", true).then(res => {
        console.log("删除任务");
        console.log(res);
        if(res.data.code == 200 && res.data.result){
          this.confirm.hide();
          this.onShow();
        }
        else{
          this.setData({ alert: { content: "删除失败" } });
          this.alert();
        }
      })
    }
    else{
      this.setData({ alert: { content: "权限不够" } });
      this.alert();
    }
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
        chooseFileList.splice(index,1)
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
  // 新增加一个文件夹
  newFolderName: function (e) {
    console.log(e);
    var folderName = e.detail.folderName;
    var fileList = this.data.fileList;
    var address = app.ip + "tc/taskService/addArcFolder";
    var obj = { parentId: this.data.parentId, taskId: this.data.taskId, folder: folderName}
    api.request(obj,address,"POST",true).then(res=>{
      console.log("新建文件夹");
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        var file = handle.addFolder(app,api,res.data.data);
        fileList.unshift(file[0]);
      }
      this.setData({ fileList: fileList, isShowAddFile:false})
      this.newFolder.hide();
    })
  },
  // 跳转到指定的文件夹
  jumpFile: function (e) {
    console.log(e);
    var fileParentIdStack = this.data.fileParentIdStack;
    var index = e.currentTarget.dataset.index;
    fileParentIdStack = fileParentIdStack.splice(0, index+1)
    var parentId = e.currentTarget.dataset.parentid;
    this.setData({ fileParentIdStack});
    this.getFileTree(parentId);
  },
  // 通过parentId请求文件列表
  getFileTree: function (parentId) {
    var fileParentIdStack = this.data.fileParentIdStack;
    var address = app.ip + "tc/taskService/findTaskArcTreeByParent";
    var obj = { taskId: this.data.taskId, parentId: parentId };
    var isShowReturn = false;
    api.request(obj, address, "post", true).then(res => {
      console.log("通过id查找文件树");
      var file = handle.handleFile(res);
      console.log(res)
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
          fileParentIdStack: fileParentIdStack,
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
        console.log("上传结果");
        console.log(res);
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
          file = file[0];
          fileList.push(file);
          
          this.setData({ fileList});
        }
        this.uploadLocalFile(ary,i+1,progress+100,upNum);
      },
      fail:(e)=>{
        console.log("文件上传失败");
        unNum = upNum - 1;
        currentProgress = Math.floor(progress/upNum);
        this.uploadLocalFile(ary, i + 1, progress, upNum);
      }
    })
    uploadTask.onProgressUpdate((res)=>{
      console.log("上传进度" + res.progress);
      currentProgress = Math.floor((res.progress + progress)/upNum);
      console.log(currentProgress);
    })
  },
  // 文件全选/取消
  selectAll: function (e) {
    var state = e.currentTarget.dataset.state == 'true'? true : false;
    console.log(e);
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
    if (asize > 10){
      this.setData({alert:{content:"文件太大，请下载App"}});
      this.alert();
    }
    var address = app.ip + "tc/spaceService/downloadFileBatchUnlimitGet?arcIds=" + id;
    console.log("开始下载");
    let downloadTask = wx.downloadFile({
      url: address,
      success: (res) => {
        console.log("文件下载");
        console.log(res);
        if (res.statusCode == 200) {
          // 持久保存文件
          wx.saveFile({
            tempFilePath: res.tempFilePath,
            success: (res) => {
              this.downloadFile(chooseFileList,i+1)
              console.log("保存成功");
              console.log(res.savedFilePath);
              this.setData({
                alert: { content: "下载成功" }
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
        // 跳过对文件夹的操作
      }
    }
    if (taskArcIds.length == 0){
      return false;
    }
    else{
      api.sendDataByBody(taskArcIds, address, "POST", true).then(res => {
        console.log("文件删除");
        console.log(res);
      })
    } 
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
  // 检查文件夹中是否含有只读文件
  checkFolderHasOnlyReadFile: function (obj) {
    var permissions = false;
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
    if (!this.data.previewItem.isReadOnly){
      this.setData({alert:{content:"权限不够"}});
      this.alert();
    }
    else{
      this.downloadFile([this.data.previewItem], 0)
    }
  },
  // 文件移动
  fileMove: function (fileid) {
    wx.navigateTo({
      url: './fileMove/fileMove?taskid=' + this.data.taskId + "&file=" + fileid,
    })
  },
  // 鉴定是否有权限移动
  AppraisalPower: function (id) {
    var address = app.ip + "tc/taskService/isContainsOther";
    var arcIds = [];
    var userId = wx.getStorageSync("tcUserId");
    var chooseFileList = this.data.chooseFileList;
    console.log(chooseFileList);
    var isHasFolder = false;//是否包含文件夹
    var isHasPower = true;//是否有权限移动
    var permission = this.handlePower();
    if(permission){
      // 移动
      console.log("管理员权限")
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
      console.log("结果")
      console.log(isHasFolder,isHasPower);
      if (!isHasPower){
        this.setData({alert:{content:"移动失败，权限不够"}});
        this.alert();
        return false;
      }
      if (isHasFolder){
        api.sendDataByBody(arcIds, address, "POST", true).then(res => {
          console.log("鉴定结果");
          console.log(res);
          if(res.data.code == 200 && res.data.result){
            if(res.data.data == "true"){
              this.fileMove(arcIds.join(","))
            }
            else{
              this.setData({ alert: { content: "移动失败，包含其他文件" } });
              this.alert();
            }
          }
        })
      }
      else{
        this.fileMove(arcIds.join(","));
      }
    }
  },
  // 设置权限
  setPower: function () {
    var chooseFileList = this.data.chooseFileList;
    wx.navigateTo({
      url: './setPower/setPower?taskid=' + this.data.taskId + "&fileid=" + chooseFileList[0].id,
    })
  },
  // 获取重名名信息
  getFileRename: function (e) {
    console.log(e);
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
      console.log(chooseFileList[0])
      var obj = {
        arcId: chooseFileList[0].id,
        parentId: chooseFileList[0].parentId,
        title:encodeURI(this.data.fileRename)
      }
      api.request(obj,address,"POST",true).then(res=>{
        console.log("文件重命名");
        console.log(res);
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
        console.log(e);
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
  // ------------------------------------------------------------项目设置相关-----------------------------------------------------------
  // 获取项目详细信息
  getProjectInfo: function () {
    // 进项权限判定，判定用户是否可以编辑项目信息
    var permission = this.handlePower();
    this.setData({ isCouldEditProject:permission});

    var address = app.ip + "tc/taskService/findTaskBOById";
    var obj = { taskId:this.data.taskId};
    api.request(obj,address,"POST",true).then(res=>{
      console.log("项目详细信息");
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        var project = res.data.data.summaryBean;
        project.createDate = project.createDate.split("T")[0];
        if(project.startDate != null){
          project.startDate = project.startDate.split("T")[0];
        }
        if (project.endDate != null){
          project.endDate = project.endDate.split("T")[0];
        }
        this.setData({
          project:res.data.data.summaryBean,
          projectMember: res.data.data.memberBeans
        })

        // 通过权限，决定渲染不同的按钮
        this.queryUserPower();
      }
    })
  },
  
  // 是否打开功能区
  openToolbarMenu: function () {
    this.setData({ isOpenMenu: !this.data.isOpenMenu})
  },
  // 获取项目级别
  getProjectLevel: function (e) {
    var level = e.currentTarget.dataset.level;
    var project = this.data.project;
    project.important = parseInt(level);
    this.setData({project})
    this.openToolbarMenu();
    var obj = this.handleTimeFormat(project);
    this.saveSummaryBean(project);
  },
  // 设置项目开始时间
  setProjectStartDate: function (e) {
    var project = this.data.project;
    project.startDate = e.detail.value;
    this.setData({project})
    console.log(e);
  },
  // 设置项目结束时间
  setProjectEndDate: function (e) {
    var project = this.data.project;
    project.endDate = e.detail.value;
    this.setData({project})
    console.log(project);
  },
  // 设置项目所属
  setProjectAscription: function () {
    wx.navigateTo({
      url: './ascription/ascription',
    })
  },
  // 编辑项目描述与项目标题
  editProjectInfo: function () {
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
    console.log("权限判定")
    var permission = null;//0:普通管理员
    var project = this.data.project;
    var userId = wx.getStorageSync("tcUserId");
    var projectMember = this.data.projectMember;
    for(var i = 0; i < projectMember.length; i++){
      if(projectMember[i].resourceId == userId){
        if(project.adminGroups.indexOf(userId) > 0){
          permission = 0;
        }
        else{
          if (project.manager == userId) {
            permission = 1;
            console.log(8230948320947230984723098740)
            // return false;
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
      console.log("保存结果");
      console.log(res);
    })
  },

  // 处理因为时间格式的原因，导致无法正确发送数据
  handleTimeFormat: function (summaryBean) {
    summaryBean = JSON.stringify(summaryBean);
    summaryBean = JSON.parse(summaryBean);
    if(summaryBean.startDate != null){
      summaryBean.startDate = summaryBean.startDate + api.getNowTime();
    }
    if(summaryBean.endDate != null){
      summaryBean.endDate = summaryBean.endtDate + api.getNowTime();
    }
    summaryBean.createDate = summaryBean.createDate + api.getNowTime();
    return summaryBean;
  }
})