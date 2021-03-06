//logs.js
const app = getApp();
const util = require('../../utils/util.js')
const api = require("../../api/common.js");
Page({
  data: {
    newproject:{
      state:0,
      content:""
    },
    title:app.globalData.projectName,//项目名称
    description:null,//项目介绍
    startDate:"",
    endDate:"",
    showsleve:false,//是否展示项目级别选择框
    important:["普通","重要","非常重要"],
    selectimportant:0,//选择的重要程度
    ownerId:null,//新建项目所属组织ID
    ownerType: 10000003,//项目类型默认未个人项目
    defaultTeamId: wx.getStorageSync("defaultTaskTeam"),//默认的分组id
    projectGroup:"个人项目",
    showProjectGroup:false,//是否展示项目所属的选择列表
    company:[],//公司列表
    user: [
      {
        name: "我",
        role: 1,//1:管理员，0：普通用户
        head: "./img/head.png"//头像路径
      }
    ],
    sureAdd:{state:1,title:'完成'}
  },
  onLoad: function () {
    // 弹框
    this.popup = this.selectComponent("#popup");
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return util.formatTime(new Date(log))
      })
    })
    this.getStartDate();
    this.getProjectList();
    this.checkHeadUrl();
  },
  // 检查是否可以获得头像路径信息
  checkHeadUrl:function(){
    var tcUserId = wx.getStorageSync("tcUserId");
    var ary = this.data.user;
    if(tcUserId == "" || tcUserId == null){
      
    }
    else{
      ary[0].head = app.ip + "tc/spaceService/showPersonIcon/" + wx.getStorageSync("tcUserId") + "/100/100";
    }
    this.setData({
      user:ary
    })
  },

  // 下拉刷新
  onPullDownRefresh: function (e) {
    // this.onLoad()
    wx.stopPullDownRefresh();//关闭下拉刷新
  },

  getStartDate:function(){
    this.setData({
      startDate:api.nowTime()
    })
  },

  alert: function () {
    this.popup.showPopup()
  },

  // 删除成员
  delete: function (e) {
    var index = e.currentTarget.dataset.index;
    var user = this.data.user;
    user.splice(index, 1);
    this.setData({
      user: user
    })
  },

  // 验证数据是否合法
  validate:function(data){
    if (data.title && data.description){
      return true;
    }
    else{
      return false;
    }
  },

  // 发送新建项目请求
  addNewProject:function(e){
    if(this.data.sureAdd.state == 0){
      return false;
    }
    var address = app.ip + "tc/taskService/addOrUpdateTask";
    var endTime = "";
    if(this.data.endDate != ""){
      endTime = this.data.endDate + "T00:00:00.000+0800";
    }
    else{
      endTime = null;
    }
    if(this.data.title == "" || this.data.title == null){
      this.setData({
        newproject:{
          state:1,
          content:"请填写项目名称"
        }
      })
      setTimeout(()=>{
        this.setData({
          newproject:{state:0,content:""}
        })
      },1500)
      return false;
    }
     var obj = {
      "summaryBean": {
        "description": this.data.description,
        "title": this.data.title,
        "important": this.data.selectimportant,
        "ownerId": this.data.ownerId,
        "ownerType": this.data.ownerType,
        "startDate": this.data.startDate + "T00:00:00.000+0800",
        "endDate":endTime
        
      }
    }
    if(this.data.title == "" || this.data.title == null){
      return false;
    }
    this.setData({sureAdd:{state:0,title:'请稍后...'}})
    api.request(obj,address,"post",false).then(res=>{
      this.setData({ sureAdd: { state: 1, title: '完成' } })
      this.handleAddEnd(res);
    }).catch(e=>{
      console.log(e);
    })
  },

  // 项目添加成功之后
  handleAddEnd:function(res){
    if(res.data.code == 200 && res.data.result){
      wx.switchTab({
        url: '/pages/project/project',
      })
    }
    else{
      this.setData({
        newproject:{
          state:1,
          content: res.data.message
        }
      })
      setTimeout(()=>{
        this.setData({
          newproject:{
            state:0,
            content:""
          }
        })
      },1500)
    }
  },

  // 更新项目名称
  getProjectName:function(e){
    var value = e.detail.value;
    this.setData({
      title:value
    })
    app.globalData.projectName = value;
  },
  
  // 更新项目描述
  getProjectInfo:function(e){
    var description = e.detail.value;
    this.setData({
      description: description
    })
  },

  startDate:function(e){
   var value = e.detail.value;
   var data = value.split("-");
   var endDate = this.data.endDate;
   if(endDate != "" && endDate != null){
     endDate = endDate.split("-");
     for(var i = 0; i < data.length; i++){
       endDate[i] = parseInt(endDate[i]);
       data[i] = parseInt(data[i]);
     }
     if(data[0] > endDate[0]){
       endDate = "";
     }
     else if(data[1] > endDate[1]){
       endDate = "";
     }
     else if(data[2] > endDate[2]) {
       endDate = "";
     }
     else{
       endDate = endDate.join("-");
     }
   }
    this.setData({
      startDate:value,
      endDate:endDate
    })
  },

  setEndDate:function(e){
    var value = e.detail.value;
    this.setData({
      endDate:value
    })
  },

  // 弹出项目级别选择框
  switchsleve:function(e){
    this.setData({
      showsleve:true
    })
  },
  // 选择项目重要程度
  selectSeleve:function(e){
    var role = e.currentTarget.dataset.role;
    this.setData({
      showsleve:false,
      selectimportant:role
    })
  },
  // 请求项目所属列表数据
  getProjectList: function () {
    var obj = {
      taskId: wx.getStorageSync("defaultTaskTeam")
    }
    var address = app.ip + 'tc/taskTeamService/findTaskTeam'
    api.request(obj, address, "post", true).then(res => {
      var data = res.data.data.list
      var teamId = wx.getStorageSync("defaultTaskTeam");
      data.unshift({
        title: "个人项目",
        id:null,
        checked: true
      })
      for(var i = 0; i < data.length; i++){
        if(i != 0){
          data[i].checked = false;
        }
      }
      
      this.setData({
        company:data
      })
      this.getUserInfo();
    }).catch(e => {
      console.log(e);
    })
  },
  // 用于设置默认团队
  getUserInfo:function(){
    var address = app.ip + "tc/taskTeamService/findTaskTeam";
    api.request({},address,"post",true).then(res=>{
    })
  },
  // 切换项目所属
  switchProjectGroup:function(){
    this.setData({
      showProjectGroup:true
    })
  },
  // 选择默认团队
  selectGroup:function(e){
    var index = e.currentTarget.dataset.index;
    var id = e.currentTarget.dataset.id;
    var title = e.currentTarget.dataset.title;
    var ownerType = e.currentTarget.dataset.ownertype;
    var company = this.data.company;
    for(var i = 0; i < company.length; i++){
      if(company[i].id == id){
        company[i].checked = true;
      }
      else{
        company[i].checked = false;
      }
    }
    this.setData({
      showProjectGroup:false,
      ownerId:id,
      ownerType: ownerType,
      defaultTeamId:id,
      projectGroup:title,
      company: company
    })
  },
  // 隐藏注册弹框
  hideAlert: function () {
    this.setData({
      newproject: {
        state: 0,
        content: ""
      }
    })
  },
  // 隐藏项目级别选择列表
  cancelSleve:function(){
    this.setData({
      showsleve: false
    })
  }
})
