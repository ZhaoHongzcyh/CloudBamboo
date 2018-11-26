// 获取应用实例
const app = getApp();
const api = require("../../api/common.js");
Page({
  data:{
    url:{},//脚步导航数据
    sortRule:"name",//文件排序规则：name:按照文件名排序，time:按照时间排序
    fileData:[],//文件数据
    filelist:null,//文件列表数据
    parentIdStack:[],//父文件夹Id
    selectedFile:[],
    selectnum:0,
    selectStatus:[],//文件是否被选中的状态
    input:"请输入关键字搜索文件或文件夹",
    more:false,//用户是否选择了更多操作
    sortRule:null,//排序规则
    folderId:1,//排序规则的父文件夹
    isShowSortRule: false,//是否打开文件排序选项菜单
    alert:{content:null}
  },

  onLoad:function(options){
    // 弹框节点
    this.popup = this.selectComponent("#popup");
    this.model = this.selectComponent("#model");
  },

  onShow: function () {
    this.setData({ parentIdStack: []})
    this.getFileList();
    this.setData({ isShowSortRule: false})
  },

  // 下拉刷新
  onPullDownRefresh: function (e) {
    this.onLoad();
    this.onShow();
    this.setData({
      selectnum:0,
      more: false
    })
  },

  // 显示弹框
  alert: function () {
    this.popup.showPopup()
  },

  alertinfo: function () {
    this.model.showPopup()
  },

  // 获取文件列表
  getFileList:function(){
    var address = app.ip + "tc/IArcSumManagerService/findArcSummarysdate";
    var obj = {
      ownerType: 10000003,
      ownerId:wx.getStorageSync("tcUserId"),
      folderId:1
    }
    api.request(obj,address,"post",true).then(res=>{
      var selectStatus = [];
      var dat = api.cloudDiskDataClean(res.data.data.list);
      var list = api.fileNameSort(dat);

      // 将选中状态设置为false
      for(var i = 0; i<list.length; i++){
        selectStatus.push(false);
      }
      this.setData({
        fileData:list,
        filelist: list,
        selectStatus: selectStatus
      })
      wx.stopPullDownRefresh();//关闭下拉刷新
    }).catch(e=>{
      console.log(e)
    })
  },

  select:function(e){
    var index = e.currentTarget.dataset.index;
    var selectStatus = this.data.selectStatus;
    var ary = this.data.selectedFile;
    var num = ary.indexOf(e.detail.e.currentTarget.dataset.id);
    if (ary.indexOf(e.detail.e.currentTarget.dataset.id) == -1){
      ary.push(e.detail.e.currentTarget.dataset.id);
      selectStatus[index] = true;
    }
    else{
      ary.splice(num,1);
      selectStatus[index] = false;
    }
    this.setData({
      selectedFile:ary,
      selectnum:ary.length,
      selectStatus: selectStatus
    });
    // 隐藏或者显示底部导航栏
    if (ary.length > 0) {
      wx.hideTabBar({})
    }
    else {
      wx.showTabBar({})
    }
  },

  // 全选
  selectAll:function(){
    var length = this.data.fileData.length;
    var selectStatus = [];
    var fileData = this.data.fileData;
    var ary = [];
    for(var i = 0; i< length; i++){
      selectStatus.push(true);
    }
    for (var i = 0; i < fileData.length; i++){
      ary.push(fileData[i].id)
    }
    this.setData({
      selectedFile:ary,
      selectStatus:selectStatus,
      selectnum:length
    })
    // 隐藏或者显示底部导航栏
    if(length > 0){
      wx.hideTabBar({})
    }
    else{
      wx.showTabBar({})
    }
  },

  // 取消
  cancel:function(){
    var selectStatus = [];
    var length = this.data.fileData.length;
    for(var i = 0; i<length; i++){
      selectStatus.push(false);
    }
    this.setData({
      selectedFile:[],
      selectStatus:selectStatus,
      selectnum:0
    })
    wx.showTabBar({});
  },

  // 更多
  moreFun:function(){
    this.setData({
      more:true
    })
  },
  
  // 取消更多
  cancelmore:function(){
    this.setData({
      more:false
    })
  },

  // 进入文件夹
  entryFolder: function (e) {
    var item = e.currentTarget.dataset.item;
    var parentIdStack = this.data.parentIdStack;
    var obj = {
      id:item.id,
      title:item.title
    }
    if(item.atype == 0){
      parentIdStack.push(obj);
      this.setData({ parentIdStack})
      this.searchFileList();
      
    }
  },

  // 查询文件列表数据
  searchFileList: function (id) {
    var parentIdStack = this.data.parentIdStack;
    var length = parentIdStack.length;
    var address = app.ip + "tc/IArcSumManagerService/findArcSummarysdate";
    this.setData({
      folderId: parentIdStack[length - 1].id
    })
    this.jump(parentIdStack[length - 1].id);
  },

  // 跳转到指定目录
  jump: function (id) {
    var address = app.ip + "tc/IArcSumManagerService/findArcSummarysdate";
    var obj = {
      ownerType: 10000003,
      ownerId: wx.getStorageSync("tcUserId"),
      folderId: id
    }
    api.request(obj, address, "POST", true).then(res => {
      var selectStatus = [];
      var dat = api.cloudDiskDataClean(res.data.data.list);
      var list = api.fileNameSort(dat);

      // 将选中状态设置为false
      for (var i = 0; i < list.length; i++) {
        selectStatus.push(false);
      }
      this.setData({
        fileData: list,
        filelist: list,
        selectStatus: selectStatus
      })
      wx.stopPullDownRefresh();//关闭下拉刷新
    }).catch(e => {
      console.log(e)
    })
  },

  // 跳转到指定文件夹
  jumpFolder: function (e) {
    var parentIdStack = this.data.parentIdStack;
    var index = e.currentTarget.dataset.index;
    if(index == 0){
      this.jump(1);
    }
    else{
      var id = parentIdStack[index - 1].id;
      this.jump(id);
    }
    parentIdStack.splice(index);
    if (parentIdStack.length == 0){
      this.setData({ folderId: 1})
    }
    this.setData({ parentIdStack})
  },

  // 上一级文件夹
  upFolder: function (e) {
    var parentIdStack = this.data.parentIdStack;
    var length = parentIdStack.length;
    var id = parentIdStack[length - 2].id;
    this.jump(id);
    parentIdStack.splice(length - 1);
    this.setData({ parentIdStack})
  },

  // 文件夹模糊搜索
  fuzzySearch: function (e) {
    var file = e.detail.value;
    var fileAry = [];
    var filelist = this.data.filelist;
    filelist.map((item,index)=>{
      var reg = new RegExp(file,"i");
      if(reg.test(item.title)){
        fileAry.push(item);
      }
    })
    if(file == ""){
      fileAry = filelist;
    }
    this.setData({ fileData: fileAry})
  },

  // 排序菜单的状态切换
  switchSortMenu: function () {
    this.setData({
      isShowSortRule: !this.data.isShowSortRule
    })
  },

  // 文件排序
  fileSort: function (e) {
    var sortRule = e.currentTarget.dataset.sort;
    this.setData({ sortRule});
    var address = app.ip + "tc/knowledgeService/showArcList";
    var obj = { parentId: this.data.folderId, start: 0, pageSize:100};
    if(sortRule != "null"){
      obj.sortFields = sortRule; 
    };
    api.request(obj,address,"POST",true).then(res=>{
      console.log("排序");
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        var selectStatus = [];
        var dat = api.cloudDiskDataClean(res.data.data.list);

        // 将选中状态设置为false
        for (var i = 0; i < dat.length; i++) {
          selectStatus.push(false);
        }
        console.log(dat);
        var list = [];
        dat = list.concat(dat.file,dat.folder);
        this.setData({
          fileData: dat,
          filelist: dat,
          selectStatus: selectStatus
        })
      }
      else{
        this.setData({alert:{content:'排序失败'}});
        this.alertinfo();
      }
    }).catch(e=>{
      this.setData({ alert: { content: '排序失败' } });
      this.alertinfo();
    })
  }
})