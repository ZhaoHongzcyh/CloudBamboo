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
    isShowTransfer:false,//是否显示转让采单
    validatManager: true,//默认成员项目负责人也是公司负责人,个人项目的项目负责人则为公司负责人
    alert:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.popup = this.selectComponent("#popup");
    this.setData({
      taskId:options.taskid
    })
  },
  
  onShow: function () {
    this.getProjectInfo();
  },

  // 弹框
  alert: function () {
    this.popup.showPopup()
  },

  // 获取项目详细信息
  getProjectInfo: function () {
    var validatManager = false;
    var userid = wx.getStorageSync('tcUserId');
    var address = app.ip + "tc/taskService/findTaskBOById";
    var obj = { taskId: this.data.taskId };
    api.request(obj, address, "POST", true).then(res => {
      var isShowState = false;
      if(res.data.code == 200 && res.data.result){
        let summaryBean = res.data.data.summaryBean;

        // 判断项目的状态（中止，完结，暂停）
        if (summaryBean.tstate == 3 || summaryBean.tstate == 4){
          isShowState = true;
        }
        // 判断用户身份
        //validatManager使用二进制标识身份（第一位：是否是公司负责人，第二位：是否是项目负责人）
        if (summaryBean.teamManager == userid && summaryBean.manager == userid){
          validatManager = "11";//
        }
        else if(summaryBean.teamManager != userid && summaryBean.manager == userid){
          validatManager = "01";
        }
        else if(summaryBean.teamManager == userid && summaryBean.manager != userid){
          validatManager = "10";
        }
        else if (summaryBean.teamManager != userid && summaryBean.manager != userid){
          validatManager = "00";
        }
        this.setData({
          isShowState: isShowState,
          summaryBean: summaryBean,
          validatManager: validatManager
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
      if (res.data.code == 200 && res.data.result) {
        wx.navigateBack({
          delta: 2
        })
      }
      else{
        if(res.data.message == null || res.data.message == ""){
          res.data.message = '操作失败，请稍后!'
        }
        this.setData({alert:{content:res.data.message}});
        this.alert();
      }
    })
  },
  // 完结项目
  endProject: function (e) {
    var click = e.currentTarget.dataset.click;
    if(!click){
      if (this.data.validatManager == '10'){

      }
      else{
        return false;
      }
      
    }
    // var obj = this.editProjectState(3);
    this.changeProjectState(3);
  },

  // 重启项目
  restartProject: function (e) {
    var click = e.currentTarget.dataset.click;
    if(!click){return false}
    this.changeProjectState(2);
  },

  // 中止项目
  suspension: function (e) {
    var click = e.currentTarget.dataset.click;
    if (!click) {
      if (this.data.validatManager == '10') {

      }
      else {
        return false;
      }
    }
    this.changeProjectState(4);
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
    wx.navigateTo({
      url: '/pages/subproject/transfer/transfer?taskid=' + this.data.taskId + "&exit=0",
    })
    // 不让用户选择是否退出，需要退出直接手动退出。
    // this.setData({ isShowTransfer: !this.data.isShowTransfer});
  },

  // 打开转让对象页面
  transferObject: function (e) {
    var exit = parseInt(e.currentTarget.dataset.exit);//1:代表退出。0：代表不退出
    wx.navigateTo({
      url: '/pages/subproject/transfer/transfer?taskid=' + this.data.taskId + "&exit=" + exit,
    })
  },

  // 修改项目状态
  changeProjectState: function (tstate) {
    var address = app.ip + "tc/taskService/updateTaskTState";
    var obj = { taskId: this.data.taskId, tstate};
    api.request(obj,address,"POST",true).then(res=>{
      if (res.data.code == 200 && res.data.result) {
        wx.navigateBack({
          delta: 2
        })
      }
      else {
        if (res.data.message == null || res.data.message == "") {
          res.data.message = '操作失败，请稍后!'
        }
        this.setData({ alert: { content: res.data.message } });
        this.alert();
      }
    })
  }
})