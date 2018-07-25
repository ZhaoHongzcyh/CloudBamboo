const app = getApp();
const api = require("../../api/common.js");
Page({
  data:{
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
  },
  // 打开app下载弹框
  alert:function(){
    this.popup.showPopup();
  },
  // 请求个人项目信息
  getProjectPerson:function(){
    this.getProjectInfo('person');
    this.setData({
      urlLine:false
    })
  },
  // 请求公司项目
  getProjectCompany:function(){
    this.getProjectInfo('company')
    this.setData({
      urlLine:true
    })
  },
  // 请求项目信息
  getProjectInfo:function(core){
    var obj = {};
    var address = app.ip + 'tc/taskTeamService/listMyTeamTask'
    // 请求公司项目
    if(core == 'person'){
      obj.ownerType = 10000003;
      address = app.ip + "tc/taskService/findTaskBos"
    }
    else{
      // 请求个人项目
    }
    api.request(obj,address,"post",true).then(res=>{
      console.log("项目列表");
      console.log(res);
      if(this.data.urlLine){
        this.handleProject(res);
      }
      else{
        this.handlePerson(res);
      }
    }).catch(e=>{
      console.log(e);
    })
  },
  // 处理请求公司项目之后的信息
  handleProject:function(res){
    var data = res.data.data
    var list = [];
    if(res.data.code == 200 && res.data.data.length != 0){
      // 将数据排序
      for(var i = 0; i < res.data.data.length; i++){
        if(res.data.data[i].taskBo == null){
            list.push(res.data.data[i])
        }
        else{
          list.unshift(res.data.data[i])
        }
      }
      this.setData({
        list:list
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
    var list = [];
    if(res.data.code == 200){
      for(var i = 0; i < res.data.data.list.length; i++){
        list.push(res.data.data.list[i])
      }
    }
    this.setData({
      list:list
    })
  },
  // 跳转到添加新项目
  jump:function(){
    wx.navigateTo({
      url: '/pages/addNewProject/addNewProject',
    })
  }
})