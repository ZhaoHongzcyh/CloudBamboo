const app = getApp();
const api = require("../../api/common.js");
Page({
  data:{
    start:1,//当前需要加载的页数
    pageSize:20,//每一页加载的数据长度
    loadMore:false,//是否加载更多
    url:{},//脚步导航数据
    userId: wx.getStorageSync("tcUserId"),//用于计算用户是否在某项目中
    list:[],
    personProjectList:[],//个人项目列表
    companyProjectList:[],//公司项目列表
    urlLine:true,//路由切换，下划线样式
    progress:["草稿","未开始","进行中","完成","暂停","终止","撤销","删除"],
    content:null
  },
  
  onLoad:function(options){
    this.popup = this.selectComponent("#popup");
    this.entry = this.selectComponent("#entry");
  },
  
  onShow: function () {
    if (this.data.urlLine){
      this.getProjectCompany();
    }
    else{
      this.getProjectPerson();
    }
  },

  // 下拉刷新
  onPullDownRefresh: function (e) {
    this.onLoad();
  },

  // 上拉触底事件
  // onReachBottom: function () {
  //   this.loadMore();
  // },

  // 上拉触顶
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
    this.setData({
      urlLine:false,
      start:1,
      list:[]
    })
    this.getProjectInfo('person');
  },
  // 请求公司项目
  getProjectCompany:function(){
    this.setData({
      urlLine:true,
      start:1
    })
    this.getProjectInfo('company')
  },
  // 请求项目信息
  getProjectInfo:function(core){
    var obj = {};
    var address = app.ip + 'tc/taskTeamService/listMyTeamTask'
    // 请求个人项目
    if(core == 'person'){
      obj = {
        ownerType: 10000003,
        start:0,
        pageSize: this.data.start * this.data.pageSize
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
      obj = {start:0,pageSize:this.data.start * this.data.pageSize};
    }
    api.request(obj,address,"post",true).then(res=>{
      console.log("公司项目")
      console.log(res);
      this.setData({
        start: this.data.start + 1
      })
      if(this.data.urlLine){
        
        this.handleProject(res);
      }
      else{
        this.handlePerson(res);
      }
      wx.stopPullDownRefresh();//关闭下拉刷新
    }).catch(e=>{
      console.log(e);
    })
  },
  // 处理请求公司项目之后的信息
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
      console.log("公司");
      console.log(list);
    }
    else if(res.data.code == 402){
      wx.redirectTo({
        url: '/pages/index/index',
      })
    }
  },
  // 处理请求个人项目信息
  handlePerson:function(res){
    var list = [];
    var data = res.data.data;
    if(res.data.code == 200){
      for(var i = 0; i < data.list.length; i++){
        data.list[i].isShowChild = false;
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
  // 导航跳转
  pageJump: function (e) {
    var index = e.currentTarget.dataset.index;
    var url = e.currentTarget.dataset.url.slice(1);
    var jumpUrl = e.currentTarget.dataset.url, jumpNum = null;
    var page = getCurrentPages();
    var length = page.length;
    app.editTabBar(index);
    for (var i = 0; i < length; i++) {
      if (page[i].route == url) {
        jumpNum = i;
      }
    }
    console.log("页面堆栈" + jumpNum);
    if (jumpNum == null) {
      wx.navigateTo({
        url: jumpUrl,
      })
    }
    else {
      if (jumpNum == length - 1) {
        return false;
      }
      else {
        wx.navigateBack({
          delta: length - (jumpNum + 1)
        })
      }
    }
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
  // 获取项目详细信息
  entryProject: function (e) {
    var id = e.currentTarget.dataset.id;
    var summaryBean = e.currentTarget.dataset.item;
    var isgetinto = e.currentTarget.dataset.isgetinto;
    console.log(summaryBean)
    if (summaryBean.tstate == 3 || summaryBean.tstate == 4){
      if (wx.getStorageSync('tcUserId') != summaryBean.manager){
        var content = '项目已完结，如需操作请联系负责人重启项目'
        if (summaryBean.tstate == 4){
          content = '项目已中止，如需操作请联系负责人重启项目'
        }
        this.setData({ content: content })
        this.entryalert();
        return false;
      }
    }
    if (parseInt(isgetinto) == 0) {
      this.setData({ content: '无法访问,因为你还不是该项目成员' })
      this.entryalert();
      return false;
    }
    wx.navigateTo({
      url: '/pages/subproject/subproject?id=' + id,
    })
  }
})