// pages/subproject/admin/admin.js
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
    project:null,
    memberlist:null,
    adminGroups: null,//项目管理员组
    teamAdminGroups: null,//团队/项目团队管理员组
    isShowBtn:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
      console.log("项目详细信息");
      console.log(res);
      if (res.data.code == 200 && res.data.result) {
        var project = res.data.data.summaryBean;
        this.setData({
          project: res.data.data.summaryBean
        })
        // 处理管理员组
        this.handleAdmin(res.data.data.summaryBean,res.data.data.memberBeans);
      }
    })
  },

  // 处理管理员组
  handleAdmin: function (summaryBean,member) {
    console.log("---------------------")
    var adminTeam = [];
    var teamAdmin = [];
    var adminGroups = summaryBean.adminGroups;//项目管理员组
    var teamAdminGroups = summaryBean.teamAdminGroups;//团队/项目团队管理员组
    console.log(teamAdminGroups);
    console.log(adminGroups);
    // 权限判断
    this.judge(teamAdminGroups);
    // 项目管理员组
    for (var i = 0; i < adminGroups.length; i++){
      var obj = {
        id: adminGroups[i],
        name: null,
        item:null
      }
      for(var j = 0; j < member.length; j++){
        if (member[j].resourceId == adminGroups[i]){
          obj.name = member[j].personName;
          obj.item = member[j]
          adminTeam.push(obj)
        }
      }
    }

    // 团队。项目团队管理员组
    for (var i = 0; i < teamAdminGroups.length; i++) {
      var obj = {
        id: teamAdminGroups[i],
        name: null,
        item: null
      }
      for (var j = 0; j < member.length; j++) {
        if (member[j].resourceId == teamAdminGroups[i]) {
          obj.name = member[j].personName;
          obj.item = member[j];
          teamAdmin.push(obj)
        }
      }
    }
    this.setData({
      adminGroups: adminTeam,
      teamAdminGroups: teamAdmin
    })
    console.log(this.data)
  },
  
  // 判断是否为非 项目管理员、成员
  judge: function (teamAdminGroups) {
    var permission = false;
    var userid = wx.getStorageSync("tcUserId");
    for (var i = 0; i < teamAdminGroups.length; i++){
      if (userid == teamAdminGroups[i]){
        permission = true
      }
    }
    if(!permission){
      permission = userid == this.data.project.manager? true:false;
    }
    this.setData({
      isShowBtn: permission
    })
  },

  // 添加或移除管理组成员
  managerMember: function (e) {
    var state = e.currentTarget.dataset.state;
    if(state == "add"){
      wx.navigateTo({
        url: '/pages/subproject/editAdmin/editadmin?state=1&taskid=' + this.data.taskId,
      })
    }
    else{
      wx.navigateTo({
        url: '/pages/subproject/editAdmin/editadmin?state=0&taskid=' + this.data.taskId,
      })
    }
  }
})
