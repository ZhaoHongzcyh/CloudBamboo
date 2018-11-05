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
    alert:null,
    state:null,//0:代表删除管理员 1：添加管理员
    taskId:null,
    memberlist:null,//项目成员列表
    member:null,
    project:null,
    isShowRadio:null,//是否显示单选框
    delObj:null,//需要被删除的对象
    isShowSubmit:false//是否显示添加对象按钮
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.popup = this.selectComponent("#popup");
    this.confirm = this.selectComponent("#confirm");
    var permission = false;
    if(options.state == 1){
      permission = true;
      wx.setNavigationBarTitle({title:'添加管理组成员'});
    }
    else{
      wx.setNavigationBarTitle({ title: '删除管理组成员' });
    }
    this.setData({
      state:options.state,
      taskId:options.taskid,
      isShowRadio:permission
    })
  },

  onShow: function () {
    if(this.data.isShowRadio){
      this.getProjectInfo();
    }
    else{
      this.getAdminList();
    }
  },

  // 弹框
  alert: function () {
    this.popup.showPopup()
  },

  // 打开对话弹框
  openConfirm: function (e) {
    this.setData({
      delObj:e.currentTarget.dataset.item
    })
    this.confirm.show();
  },

  // 获取项目详细信息
  getProjectInfo: function () {
    var userid = wx.getStorageSync('tcUserId');
    var address = app.ip + "tc/taskService/findTaskBOById";
    var obj = { taskId: this.data.taskId };
    api.request(obj, address, "POST", true).then(res => {
      if (res.data.code == 200 && res.data.result) {
        let memberlist = [];
        var project = res.data.data.summaryBean;
        var member = JSON.stringify(res.data.data.memberBeans);
        member = JSON.parse(member);
        this.setData({ project: res.data.data.summaryBean,})
        member = this.checkIsAdmin(member);
        member.map((item,index)=>{
          if(item.resourceId != userid){
            memberlist.push(item);
          }
        })
        this.setData({
          memberlist: memberlist,
          member: memberlist
        })
      }
    })
  },

  // 当操作是删除管理员的时候，获取的管理员列表
  getAdminList: function () {
    var address = app.ip + "tc/taskService/findTaskBOById";
    var obj = { taskId: this.data.taskId };
    api.request(obj,address,"POST",true).then(res=>{
      if(res.data.code == 200 && res.data.result){
        this.handleDelList(res.data.data);
      }
    })
  },

  // 处理删除用户列表
  handleDelList: function( obj ) {
    var member = obj.memberBeans;
    var adminGroups = obj.summaryBean.adminGroups;
    var teamAdminGroups = obj.summaryBean.teamAdminGroups;
    // adminGroups = adminGroups.concat(teamAdminGroups);
    var memberlist = [];
    for (var i = 0; i < adminGroups.length; i++){
      for(var j = 0; j < member.length; j++){
        if (member[j].resourceId == adminGroups[i]){
          memberlist.push(member[j]);
        }
      }
    }
    this.setData({
      memberlist:memberlist,
      member:memberlist,
      project:obj.summaryBean
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
      list = member;
    }
    // list = this.checkIsAdmin(list)
    this.setData({
      memberlist:list
    })
  },

  // 判定是否已经被设置为管理员
  checkIsAdmin: function (list) {
    var adminGroups = this.data.project.adminGroups;
    // var teamAdminGroups = this.data.project.teamAdminGroups;
    for(var i = 0; i < list.length; i++){
      list[i].initSelect = false;
      list[i].checked = false;
      for (var j = 0; j < adminGroups.length; j++){
        if (list[i].resourceId == adminGroups[j]){
          list[i].initSelect = true;
        }
      }
      // for (var j = 0; j < teamAdminGroups.length; j++) {
      //   if (list[i].resourceId == teamAdminGroups[j]) {
      //     list[i].initSelect = true;
      //   }
      // }
    }
    return list;
  },

  // 添加成员
  addMember: function (e) {
    var isShowSubmit = false;//是否显示添加按钮
    var index = e.currentTarget.dataset.index;
    var memberlist = this.data.memberlist;
    var adminGroups = this.data.project.adminGroups;
    var project = this.data.project;
    if(memberlist[index].initSelect){
      return false;
    }
    if (memberlist[index].checked){
      memberlist[index].checked = false;
      adminGroups.map((item,num)=>{
        if (item == memberlist[index].resourceId){
          adminGroups.splice(num,1)
        }
      })
    }
    else{
      if(adminGroups.indexOf(memberlist[index].resourceId) < 0){
        memberlist[index].checked = true;
        adminGroups.push(memberlist[index].resourceId);
      }
    }
    project.adminGroups = adminGroups;
    for(var i = 0; i < memberlist.length; i++){
      if(memberlist[i].checked){
        isShowSubmit = true
      }
    }
    this.setData({
      memberlist, project, isShowSubmit
    })
  },

  // 删除用户
  delAdminUser: function (e) {
    // var userObj = e.currentTarget.dataset.item;
    var userObj = this.data.delObj;
    var address = app.ip + "tc/taskService/addOrUpdateTask";
    var summaryBean = JSON.stringify(this.data.project);
    summaryBean = JSON.parse(summaryBean);
    var memberlist = this.data.memberlist;
    var adminGroupId = [];
    var delid = null
    for(var i = 0; i < memberlist.length; i++){
      if(memberlist[i].resourceId != userObj.resourceId){
        adminGroupId.push(memberlist[i].resourceId)
      }
      else{
        delid = memberlist[i].resourceId;
      }
    }
    // summaryBean.teamAdminGroups.map((item,index)=>{
    //   if (item == userObj.resourceId){
    //     summaryBean.teamAdminGroups.splice(index,1);
    //   }
    // })
    summaryBean.adminGroups = adminGroupId;
    var obj = {
      summaryBean: summaryBean
    }
    api.request(obj,address,"POST",false).then(res=>{
      if(res.data.code == 200 && res.data.result){
        memberlist.map((item,index)=>{
          if(item.resourceId == delid){
            memberlist.splice(index,1)
          }
        })
        this.setData({memberlist});
        this.confirm.hide();
        wx.navigateBack();
      }
      else{
        this.setData({ alert: { content: "删除失败" } });
        this.alert()
      }
    }).catch(e=>{
      this.setData({ alert: { content: "删除失败" } });
      this.alert()
    })
  },
  
  // 添加管理员用户
  addAdminUser: function () {
    var address = app.ip + "tc/taskService/addOrUpdateTask";
    var obj = {
      summaryBean: this.data.project
    }
    api.request(obj,address,"POST",false).then(res=>{
      if(res.data.code == 200 && res.data.result){
        // this.setData({alert:{content:"添加成功"}});
        wx.navigateBack();
      }
      else{
        this.setData({alert:{content:"添加失败"}})
      }
      this.alert();
    }).catch(e=>{
      this.setData({ alert: { content: "添加失败" } })
      this.alert()
    })
  }
})