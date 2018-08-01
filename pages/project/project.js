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
    urlLine:true,//路由切换，下划线样式
    progress:["草稿","未开始","进行中","完成","暂停","终止","撤销","删除"],
    check:function (num) {
      if (num > 0) {
        return "还剩" + nun + "天";
      }
      else if (num == null) {
        return "未设置";
      }
      else {
        return "超期" + num + "天";
      }
    }
  },
  onLoad:function(options){
    this.getProjectCompany();
    this.popup = this.selectComponent("#popup");
    // 更新导航数据
    this.setData({
      url: app.globalData.tabbar
    })
  },
  // 下拉刷新
  onPullDownRefresh: function (e) {
    this.onLoad();
  },
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
  // 请求个人项目信息
  getProjectPerson:function(){
    this.getProjectInfo('person');
    this.setData({
      urlLine:false,
      start:1
    })
  },
  // 请求公司项目
  getProjectCompany:function(){
    this.getProjectInfo('company')
    this.setData({
      urlLine:true,
      start:1
    })
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
      address = app.ip + "tc/taskService/findTaskBos"
    }
    else{
      // 请求公司项目
      obj = {start:0,pageSize:this.data.start * this.data.pageSize};
      console.log(obj)
      console.log("数据");
      console.log(this.data)
    }
    api.request(obj,address,"post",true).then(res=>{
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
    var userid = this.data.userId;
    console.log(res);
    if(res.data.code == 200 && data.length != 0){
      // 将数据排序
      for(var i = 0; i < data.length; i++){
        var obj = {
          isInProject:false,
          isShowCompany: false,
          summaryBean: data[i].summaryBean,
          taskBo: data[i].taskBo,
          isShowChild:true
        }
        console.log("测试");
        if(data[i].taskBo != null){
          for (var j = 0; j < data[i].taskBo.list.length; j++) {
            for (var k = 0; k < data[i].taskBo.list[j].memberBeans.length; k++) {
              data[i].taskBo.list[j].isShowChild = false;
              if (userid == data[i].taskBo.list[j].memberBeans[k].resourceId) {
                obj.isInProject = true;
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
        list:list
      })
      console.log("逻辑");
      console.log(this.data.list)
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
    console.log("个人项目");
    console.log(res);
    if(res.data.code == 200){
      for(var i = 0; i < data.list.length; i++){
        data.list[i].isShowChild = false;
        list.push(data.list[i])
      }
    }
    this.setData({
      list:list
    })
    console.log(list);
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
    var url = e.currentTarget.dataset.url;
    app.editTabBar(index);
    wx.redirectTo({
      url: url,
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
      console.log(ary[index].isShowChild);
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
  }
})