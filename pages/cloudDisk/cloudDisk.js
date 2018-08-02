// 获取应用实例
const app = getApp();
const api = require("../../api/common.js");
Page({
  data:{
    url:{},//脚步导航数据
    sortRule:"name",//文件排序规则：name:按照文件名排序，time:按照时间排序
    fileData:[],//文件数据
    selectedFile:[],
    selectnum:0,
    selectStatus:[],//文件是否被选中的状态
    input:"请输入关键字搜索文件或文件夹",
    more:false//用户是否选择了更多操作
  },
  onLoad:function(options){
    this.getFileList();
    // 弹框节点
    this.popup = this.selectComponent("#popup");
    // 更新导航数据
    this.setData({
      url: app.globalData.tabbar
    })
  },
  // 下拉刷新
  onPullDownRefresh: function (e) {
    this.onLoad();
    this.setData({
      selectnum:0,
      more: false
    })
  },
  // 显示弹框
  alert: function () {
    this.popup.showPopup()
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
  getSearchContent:function(e){
    // console.log(e);
  },
  pageJump: function (e) {
    var index = e.currentTarget.dataset.index;
    var url = e.currentTarget.dataset.url;
    app.editTabBar(index);
    wx.redirectTo({
      url: url,
    })
  }
})