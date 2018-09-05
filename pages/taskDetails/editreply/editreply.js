// pages/taskDetails/editreply/editreply.js
const app = getApp();
const api = require("../../../api/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskId:null,
    num:null,//计划条目下标
    actionlist:null,
    alert:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.popup = this.selectComponent("#popup");
    this.setData({
      taskId:options.taskid,
      num:options.num
    })
  },

  onShow: function() {
    this.searchPlan(this.data.taskId);
  },

  // 弹框
  alert: function () {
    this.popup.showPopup()
  },

  // 通过taskid查找计划条目
  searchPlan: function (id) {
    var address = app.ip + "tc/schedule/itemService/findBo";
    var obj = { id };
    api.request(obj, address, "POST", true).then(res => {
      console.log("计划条目");
      console.log(res)
      if(res.data.code == 200 && res.data.result){
        this.setData({
          actionlist:res.data.data.actionList
        })
      }
      else{

      }
    })
  },

  // 获取用户输入的内容
  getInput: function (e) {
    var actionlist = this.data.actionlist;
    var num = this.data.num;
    actionlist[num].descript = e.detail.value;
    this.setData({
      actionlist
    })
  },
  // 保存评论信息
  savedescript: function () {
    var reply = this.data.actionlist;
    var address = app.ip + "tc/schedule/itemService/updateActionItem";
    var num = this.data.num;
    var actionId = reply[num].id;
    var descript = encodeURI(reply[num].descript);
    var obj = {
      actionId, descript
    }
    api.request(obj,address,"POST",true).then((res)=>{
      console.log("修改评论");
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        wx.navigateBack();
      }
      else{
        this.setData({alert:{content:'评论修改失败'}});
        this.alert();
      }
    }).catch(e=>{
      console.log(e);
      this.setData({ alert: { content: '评论修改失败' } });
      this.alert();
    })
  }
})