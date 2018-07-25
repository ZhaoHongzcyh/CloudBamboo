const app = getApp();
const api = require("../../api/common.js");
Page({
  data:{
    userinfo:{
      name:""
    },
    list:[]//待处理任务
  },
  onLoad:function(){
    this.popup = this.selectComponent("#popup");
    this.getTask();
  },
  // 打开app下载弹框
  alert: function () {
    this.popup.showPopup();
  },
  // 请求用户详细信息
  getUserInfo:function(){
    var address = app.ip + "tw/userService/getUserInfo";
    api.request({},address,"post",true).then(res=>{
      console.log(res);
      console.log("用户详细信息")
      var userinfo = {
        name:res.data.data.curUser.pname
      }
      this.setData({
        userinfo:userinfo
      })
    })
  },
  // 请求任务
  getTask:function(){
    var address = app.ip + "tc/schedule/itemService/findMyManageItemList";
    api.request({},address,"post",true).then(res=>{
      var list = api.handleTask(res);
      this.setData({
        list:list
      })
      // 请求用户信息
      this.getUserInfo();
    }).catch(e=>{
      console.log(e);
    })
  }
})