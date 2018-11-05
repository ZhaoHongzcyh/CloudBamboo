const app = getApp();
const api = require("../../api/common.js");
Page({
  data:{
    start:1,//当前需要加载的页数(公司项目)
    pageSize:20,//每一页加载的数据长度(公司项目)
    personPage:{start:1,pageSize:20},//个人项目分页配置
    loadMore:false,//是否加载更多
    url:{},//脚步导航数据
    userId: wx.getStorageSync("tcUserId"),//用于计算用户是否在某项目中
    list:[],
    personProjectList:[],//个人项目列表
    companyProjectList:[],//公司项目列表
    urlLine:true,//路由切换，下划线样式
    urlRouter:[true,false,false],//路由切换，下划线样式
    progress:["草稿","未开始","进行中","完成","暂停","终止","撤销","删除"],
    content:null,

    // 我的任务数据
    listtask:[],
    userinfo: {
      name: ""
    },
    app: app,
    headimg: null,
    url: {}//导航数据
  },
  
  onLoad:function(options){
    this.popup = this.selectComponent("#popup");
    this.entry = this.selectComponent("#entry");
    // this.getTask();
  },
  
  onShow: function () {
    if (this.data.urlRouter[0]){
      this.setData({ companyProjectList:[],list:[]});
      this.getProjectCompany();
      
    }
    else if(this.data.urlRouter[1]){
      this.getProjectPerson();
    }
    else{
      this.getTask();
    }
  },

  // 下拉刷新
  onPullDownRefresh: function (e) {
    this.onShow();
  },

  // 上拉触底事件
  onReachBottom: function () {
    if(this.data.urlRouter[0]){
      this.getProjectInfo("company");
    }
  },

  // 加载更多
  loadMore:function(){
    this.setData({
      loadMore:true
    });
    if (this.data.urlLine){
      // 请求公司数据
      this.getProjectInfo('company')
    }
    else{
      // 请求个人数据
      this.getProjectInfo('person');
    }
    // 请求更多数据
    setTimeout(()=>{
      this.setData({
        loadMore:false
      })
    },2000)
  },

  // 打开app下载弹框
  alert:function(){
    this.popup.showPopup();
  },

  // 是否成员提醒
  entryalert: function () {
    this.entry.showPopup();
  },

  // 请求个人项目信息
  getProjectPerson:function(){
    var urlRouter = [false,true,false];
    this.setData({
      // urlLine:false,
      start:1,
      urlRouter: urlRouter
    })
    this.getProjectInfo('person');
  },

  // 请求公司项目
  getProjectCompany:function(){
    var urlRouter = [true,false,false];
    this.setData({
      // urlLine:true,
      start:1,
      urlRouter: urlRouter
    })
    this.getProjectInfo('company')
  },

  // 请求项目信息
  getProjectInfo:function(core = 'company'){
    // 新旧接口不变，接口数据量减少，子项目分页通过另外的接口获取
    var obj = {};
    var address = app.ip + 'tc/taskTeamService/listMyTeamTask'
    // 请求个人项目
    if(core == 'person'){
      obj = {
        ownerType: 10000003,
        start:0,
        pageSize: this.data.personPage.pageSize
      }
      this.setData({
        list: this.data.personProjectList
      })
      address = app.ip + "tc/taskService/findTaskBos"
    }
    else{
      // 请求公司项目
      this.setData({
        list: this.data.companyProjectList
      })
      obj = { 
        start: this.data.companyProjectList.length, 
        pageSize: this.data.start * this.data.pageSize, 
        dateType:1
      };
    }
    api.request(obj,address,"post",true).then(res=>{
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        this.setData({
          start: this.data.start + 1
        })
        if (this.data.urlRouter[0]) {
          this.handleNewProject(res);
          // this.handleProject(res);旧接口数据处理方法
        }
        else if(this.data.urlRouter[1]) {
          this.handlePerson(res);
        }
      }
      else{
        if(res.data.message == "" || res.data.message == undefined){
          res.data.message == '项目信息加载失败!'
        }
        this.setData({ content: res.data.message })
        this.entryalert();
      }
      wx.stopPullDownRefresh();//关闭下拉刷新
    }).catch(e=>{
      wx.stopPullDownRefresh();//关闭下拉刷新
      console.log(e);
    })
  },
  
  // 公司项目新接口测试
  handleNewProject: function (res) {
    var list = this.data.list;
    var userid = wx.getStorageSync('tcUserId');
    if(res.data.code == 200 && res.data.result){
      let companylist = res.data.data;
      companylist.map((item,index)=>{
        if( index == 0){
          item.isShowCompany = true;//默认展开第一项;
        }
        else{
          item.isShowCompany = false;
        }

        // 添加一个字符串用于表示当前已经加载的页数
        item.taskBo.nowPage = 1;
        // 是否显示展示更多按钮
        var length = item.taskBo.list.length;
        item.taskBo.list.map((task,num)=>{
          if (length < this.data.pageSize - 1 || num < length - 1){
            task.isLoadMore = false;
          }
          else{
            task.isLoadMore = true;
          }
        })
        item.taskBo.list = this.resetManagerName(item.taskBo.list,item.summaryBean.title);
      });
      companylist = list.concat(companylist);
      this.setData({ list: companylist, companyProjectList:companylist});
    }
  },

  // 新接口测试
  loadMoreProject: function (e) {
    var companylist = this.data.list;
    var id = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    var address = app.ip + "tc/taskTeamService/listMyTeamTaskByTaskPage";
    var nowPage = e.currentTarget.dataset.nowpage;
    var obj = { taskId: id, start: companylist[index].taskBo.list.length, pageSize: this.data.pageSize, dateType:1};

    api.request(obj,address,"POST",true).then(res=>{
      companylist[index].taskBo.nowPage = nowPage + 1;
      companylist[index].taskBo.list = companylist[index].taskBo.list.concat(res.data.data.list);
      let list = companylist[index].taskBo.list;
      let length = list.length;
      let newDataLength = res.data.data.list.length;

      list = this.resetManagerName(list, companylist[index].summaryBean.title);
      list.map((item,num)=>{
        // 判断是否应该显示加载按钮
        if (num < length - 1 || newDataLength < this.data.pageSize - 1){
          item.isLoadMore = false;
        }
        else{
          item.isLoadMore = true;
        }
      })

      this.setData({ list: companylist, companyProjectList: companylist});
    })
  },
  
  // 重新设置负责人姓名
  resetManagerName: function (list,companyName = "") {
    console.log("---")
    console.log(list);
    if ( Array.isArray(list) ){
      var splitStr = companyName + "-";
      list.map((item,index)=>{
        try{
          var ary = item.summaryBean.managerName.split(splitStr);
          if (ary.length == 2) {
            item.summaryBean.managerName = ary[1];
          }
          else {
            item.summaryBean.managerName = ary[0];
          }
        }
        catch(e){
          item.summaryBean.managerName = item.summaryBean.managerName;
        }
      })
      return list;
    }
    else{
      console.log('list is not a array' );
    }
  },
   
  // 加载更多个人项目
  loadMorePersonProject: function () {
    var list = this.data.list;
    var personPage = this.data.personPage;
    var address = app.ip + "tc/taskService/findTaskBos";
    var obj = {
      ownerType: 10000003,
      start:list.length,
      pageSize: personPage.pageSize
    }
    api.request(obj,address,"POST",true).then(res=>{
      if(res.data.code == 200 && res.data.result){
        let loadList = res.data.data.list;
        let length = loadList.length;
        let checkEnd = false;
        if(length < this.data.personPage.pageSize){
          checkEnd = false;
        }
        else{
          checkEnd = true;
        }
        list = list.concat(res.data.data.list);
        length = list.length;
        list.map((item,index)=>{
          if(index < length - 1){
            item.loadMore = false;
          }
          else{
            item.loadMore = checkEnd;
          }
        })
        this.setData({list})
      }
    })
  },

  // 处理请求公司项目之后的信息(该方法已被废弃，待测试完新版本(1.2.1)之后该方法将被删除)
  handleProject:function(res){
    var data = res.data.data
    var list = [];
    var userid = wx.getStorageSync('tcUserId');
    if(res.data.code == 200 && data.length != 0){
      // 将数据排序
      for(var i = 0; i < data.length; i++){
        var obj = {
          // isInProject:false,
          isShowCompany: false,
          summaryBean: data[i].summaryBean,
          taskBo: data[i].taskBo,
          isShowChild:true
        }
        if(data[i].taskBo != null){
          for (var j = 0; j < data[i].taskBo.list.length; j++) {
            data[i].taskBo.list[j].isInProject = false
            for (var k = 0; k < data[i].taskBo.list[j].memberBeans.length; k++) {
              data[i].taskBo.list[j].isShowChild = false;
              if (userid == data[i].taskBo.list[j].memberBeans[k].resourceId) {
                data[i].taskBo.list[j].isInProject = true
              }
              var companyName = data[i].summaryBean.title + '-'
              if (data[i].taskBo.list[j].summaryBean.managerName == null){
                data[i].taskBo.list[j].summaryBean.managerName = ""
                continue;
              }
              if (data[i].taskBo.list[j].summaryBean.managerName.split(companyName).length == 2){
                data[i].taskBo.list[j].summaryBean.managerName = data[i].taskBo.list[j].summaryBean.managerName.split(companyName)[1];
              }
            }
            
          }
        }

        if(obj.taskBo == null){
            list.push(obj)
        }
        else{
          list.unshift(obj)
        }
      }
      list[0].isShowCompany = true;
      this.setData({
        list:list,
        companyProjectList:list
      })
    }
    else if(res.data.code == 402){
      wx.redirectTo({
        url: '/pages/index/index',
      })
    }
  },

  // 处理请求个人项目信息
  handlePerson:function(res){
    var personPage = this.data.personPage;
    var list = [];
    var data = res.data.data;
    if(res.data.code == 200){
      var length = data.list.length;
      for(var i = 0; i < data.list.length; i++){
        data.list[i].isShowChild = false;
        data.list[i].loadMore = false;
        if (data.list[i].summaryBean.managerName == null){
          data.list[i].summaryBean.managerName = '';
        }
        if(i < personPage.pageSize - 1 || length < personPage.pageSize){
          data.list[i].loadMore = false;
        }
        else{
          data.list[i].loadMore = true;
        }
        list.push(data.list[i])
      }
    }
    this.setData({
      list:list,
      personProjectList:list
    })
  },

  // 跳转到添加新项目
  jump:function(){
    wx.navigateTo({
      url: '/pages/addNewProject/addNewProject',
    })
  },

  // 折叠与展开项目列表
  watchProject:function(e){
    var index = e.currentTarget.dataset.index;
    var ary = this.data.list;
    ary[index].isShowCompany = !ary[index].isShowCompany;
    this.setData({
      list:ary
    })
  },

  // 折叠与展开子项目
  watchChild:function(e){
    var index = e.currentTarget.dataset.index;
    var childIndex = e.currentTarget.dataset.childindex;
    var ary = this.data.list;
    ary[index].isShowChild = !ary[index].isShowChild;
    if (ary[index].taskBo){
      ary[index].taskBo.list[childIndex].isShowChild = !ary[index].taskBo.list[childIndex].isShowChild;
    }
    else{
      ary[index].isShowChild = !(ary[index].isShowChild);
    }
    this.setData({
      list: ary
    })
  },

  // 个人项目的折叠于展开
  watchPersonChild:function(e){
    var index = e.currentTarget.dataset.index;
    var ary = this.data.list;
    ary[index].isShowChild = !(ary[index].isShowChild);
    this.setData({
      list: ary
    })
  },
  
  // 获取项目详细信息（判断是否拥有进入权限）
  entryProject: function (e) {
    var id = e.currentTarget.dataset.id;
    this.isCouldEntryProject(id);
  },

  // 检查用户权限(entryProject方法的替代品，如果可行，1.2.1[包括]以后的版本将采用该方法且不再使用entryProject方法)
  isCouldEntryProject: function (id) {
    var address = app.ip + "tc/taskService/isGetIntoTask";
    var obj = {taskId:id};
    api.request(obj,address,"POST",true).then(res=>{
      let powerData = res.data.data;
      if(res.data.code == 200 && res.data.result){
        
        if(powerData.isGetInto == 1){
          wx.navigateTo({
            url: '/pages/subproject/subproject?id=' + id,
          })
        }
        else{
          if(powerData.isGetInto == 0){
            this.setData({ content: '无法访问,因为你还不是该项目成员' })
            this.entryalert();
            return false;
          }
          var content = '项目已完结，如需操作请联系负责人重启项目'
          if(powerData.state == 4){
            content = '项目已中止，如需操作请联系负责人重启项目'
          }
          this.setData({ content: content })
          this.entryalert();
          return false;
        }
      }
      else{
        this.setData({ content: '权限检测失败，暂时无法查看项目信息' });
        this.entryalert();
      }
    })
  },
  // --------------------------------------我的任务-------------------------------------
  getMyTask: function () {
    this.setData({
      urlRouter:[false,false,true]
    });
    this.getTask();
  },

  // 请求任务
  getTask: function () {
    // 更新用户头像
    this.setData({
      headimg: app.ip + "tc/spaceService/showPersonIcon/" + wx.getStorageSync("tcUserId") + "/100/100"
    });
    var address = app.ip + "tc/schedule/itemService/findMyManageItemList";
    api.request({}, address, "post", true).then(res => {
      if(res.data.code == 200 && res.data.result) {
        var list = api.handleTask(res);
        this.setData({
          listtask: list
        })
      }
    }).catch(e => {
      console.log(e);
    })
  },

  // 进入任务详情页面
  entryTask: function (e) {
    var id = e.currentTarget.dataset.id;
    var powerid = e.currentTarget.dataset.taskid;
    wx.navigateTo({
      url: '/pages/taskDetails/taskdetails?taskId=' + id + "&powerId=" + powerid,
    })
  },
})