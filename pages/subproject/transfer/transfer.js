// pages/subproject/transfer/transfer.js
const app = getApp();
const api = require("../../../api/common.js");
const handle = require("../common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    app:app,
    taskId:null,
    exit:null,
    memberlist:null,
    member:null,
    summaryBean:null,
    transferObj:null,//转让的对象信息
    alert:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.confirm = this.selectComponent("#confirm");
    this.popup = this.selectComponent("#popup");
    this.setData({
      taskId:options.taskid,
      exit: options.exit
    })
  },

  onShow: function () {
    this.getProjectInfo();
  },

  // 打开对话弹框
  openConfirm: function (e) {
    this.setData({ transferObj:e.currentTarget.dataset.item})
    this.confirm.show();
  },

  // 弹框
  alert: function () {
    this.popup.showPopup()
  },

  // 获取项目详细信息
  getProjectInfo: function () {
    var address = app.ip + "tc/taskService/findTaskBOById";
    var obj = { taskId: this.data.taskId };
    api.request(obj, address, "POST", true).then(res => {
      console.log("项目详细信息");
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        var summaryBean = res.data.data.summaryBean;
        var memberlist = res.data.data.memberBeans;
        var userid = wx.getStorageSync("tcUserId");
        memberlist.map((item,index)=>{
          if(item.resourceId == userid){
            memberlist.splice(index,1);
          }
        })
        this.setData({
          summaryBean, memberlist, member:memberlist
        })
      }
    }).catch(e=>{
      console.log("请求异常")
    })
  },

  // 通过用户输入的内容匹配成员列表
  matchMemberlist: function (e) {
    var user = e.detail.value;
    var member = this.data.member;
    var list = [];
    for(var i = 0; i < member.length; i++){
      var reg = new RegExp(user);
      if(reg.test(member[i].personName)){
        list.push(member[i])
      }
    }
    if(user == ""){
      list = member;
    }
    this.setData({memberlist:list})
  },

  // 用户确认是否转让项目
  // 转让项目
  transferProject: function (e) {
    var address = app.ip + "tc/taskService/updateTaskManager";
    var item = this.data.transferObj;
    var quitTask = this.data.exit == 1 ? true:false;
    var obj = {
      taskId:this.data.taskId,
      managerId:item.resourceId,
      quitTask: quitTask
    }
    api.request(obj,address,"POST",true).then(res=>{
      console.log("转让结果");
      console.log(res)
      if(res.data.code == 200 && res.data.result){
        wx.navigateBack({
          delta: 3
        })
      }
      else{
        this.setData({alert:{content:"转让失败"}});
        this.alert();
      }
    }).catch(e=>{
      this.setData({ alert: { content: "转让失败" } });
      this.alert();
    })
  }
})