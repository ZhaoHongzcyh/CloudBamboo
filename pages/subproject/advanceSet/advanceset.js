// pages/subproject/advanceSet/advanceset.js
const app = getApp();
const api = require("../../../api/common.js");
const handle = require("../common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowState:false,
    taskId:null,
    summaryBean:null,
    isShowTransfer:false//是否显示转让采单
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      taskId:options.taskid
    })
  },
  
  onShow: function () {
    this.getProjectInfo();
  },

  // 获取项目详细信息
  getProjectInfo: function () {
    var address = app.ip + "tc/taskService/findTaskBOById";
    var obj = { taskId: this.data.taskId };
    api.request(obj, address, "POST", true).then(res => {
      var isShowState = false;
      console.log("项目详细信息");
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        if (res.data.data.summaryBean.tstate == 3 || res.data.data.summaryBean.tstate == 4){
          isShowState = true;
        }
        this.setData({
          isShowState: isShowState,
          summaryBean: res.data.data.summaryBean
        })
      }
    })
  },

  // 编辑项目状态
  editProjectState: function (state) {
    var summaryBean = this.data.summaryBean;
    summaryBean.tstate = state;
    var obj = {
      summaryBean: summaryBean
    }
    return obj;
  },

  // 状态请求
  request: function (obj) {
    var address = app.ip + "tc/taskService/addOrUpdateTask";
    api.request(obj, address, "POST", false).then(res => {
      console.log("完结项目");
      console.log(res);
      if (res.data.code == 200 && res.data.result) {
        wx.navigateBack({
          delta: 2
        })
      }
    })
  },
  // 完结项目
  endProject: function (e) {
    var click = e.currentTarget.dataset.click;
    if(!click){
      return false;
    }
    var obj = this.editProjectState(3);
    this.request(obj);
  },

  // 重启项目
  restartProject: function (e) {
    var click = e.currentTarget.dataset.click;
    if(!click){return false}
    var obj = this.editProjectState(2);
    this.request(obj);
  },

  // 中止项目
  suspension: function (e) {
    var click = e.currentTarget.dataset.click;
    if (!click) {
      return false;
    }
    var obj = this.editProjectState(4);
    this.request(obj);
  },

  // 复制项目
  copyProject: function () {
    wx.navigateTo({
      url: '/pages/subproject/copyProject/copyproject?taskid=' + this.data.taskId,
    })
  },

  // 删除项目
  delproject: function () {
    var obj = this.editProjectState(7);
    this.request(obj);
  },

  // 打开转让采单列表
  openTransfer: function () {
    this.setData({ isShowTransfer: !this.data.isShowTransfer});
  },

  // 打开转让对象页面
  transferObject: function (e) {
    var exit = parseInt(e.currentTarget.dataset.exit);//1:代表退出。0：代表不退出
    wx.navigateTo({
      url: '/pages/subproject/transfer/transfer?taskid=' + this.data.taskId + "&exit=" + exit,
    })
  }
})