// pages/subproject/editAdmin/editadmin.js
const app = getApp();
const api = require("../../../api/common.js");
const handle = require("../common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    app:app,
    state:null,//0:代表删除管理员 1：添加管理员
    taskId:null,
    memberlist:null,//项目成员列表
    member:null,
    project:null,
    isShowRadio:null//是否显示单选框
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var permission = false;
    if(options.state == 1){
      permission = true;
    }
    this.setData({
      state:options.state,
      taskId:options.taskid,
      isShowRadio:permission
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
      console.log("项目详细信息");
      console.log(res);
      if (res.data.code == 200 && res.data.result) {
        var project = res.data.data.summaryBean;
        var member = JSON.stringify(res.data.data.memberBeans);
        member = JSON.parse(member);
        this.setData({
          project: res.data.data.summaryBean,
          
        })
        member = this.checkIsAdmin(member);
        this.setData({
          memberlist: member,
          member: member
        })
      }
    })
  },

  // 匹配用户输入的内容
  matchUser: function (e) {
    var user = e.detail.value;
    var list = [];
    var member = this.data.member;
    var memberlist = this.data.memberlist;
    for(var i = 0; i < member.length; i++){
      var reg = new RegExp(user);
      if ( reg.test(member[i].personName) ){
        list.push(member[i] );
      }
    }
    if(user  == ""){
      console.log(memberlist)
      list = member;
    }
    list = this.checkIsAdmin(list)
    this.setData({
      memberlist:list
    })
  },

  // 判定是否已经被设置为管理员
  checkIsAdmin: function (list) {
    var adminGroups = this.data.project.adminGroups;
    for(var i = 0; i < list.length; i++){
      list[i].initSelect = false;
      list[i].checked = false;
      for (var j = 0; j < adminGroups.length; j++){
        if (list[i].resourceId == adminGroups[j]){
          list[i].initSelect = true;
        }
      }
    }
    return list;
  },

  // 添加成员
  addMember: function (e) {
    var index = e.currentTarget.dataset.index;
    var memberlist = this.data.memberlist;
    var adminGroups = this.data.project.adminGroups;
    var project = this.data.project;

    if (memberlist[index].checked){
      memberlist[index].checked = false;
      adminGroups.map((item,num)=>{
        if (item == memberlist[index].resourceId){
          adminGroups.splice(num,1)
        }
      })
      console.log(adminGroups)
    }
    else{
      memberlist[index].checked = true;
      adminGroups.push(memberlist[index].resourceId);
      console.log(adminGroups);
    }
    project.adminGroups = adminGroups;
    this.setData({
      memberlist, project
    })
  }
})