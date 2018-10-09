// pages/company/watchAdmin/watchadmin.js
const app = getApp();
const api = require("../../../api/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    app:app,
    allMember:null,
    allGroup:null,
    adminGroup:null,
    addOrReduce: false,//是否显示添加与删除成员界面
    isAddMember: true,//是否是进行成员添加操作
    chooseMember:[],//需要被添加的管理组成员
    source:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.source = 1){
      this.setData({
        source:options.source
      })
    }
  },

  onShow: function () {
    this.getManagerGroup();
  },

  // 获取公司管理组成员
  getManagerGroup: function () {
    var address = app.ip + "tc/taskMemberService/findPageTaskMember";
    var defaultTaskTeam = wx.getStorageSync('defaultTaskTeam');
    var obj = {
      memberRelTypes: 13,
      taskId: defaultTaskTeam
    };
    api.request(obj, address, "POST", true).then(res => {
      console.log(res);
      if (res.data.result && res.data.code == 200) {
        let data = res.data.data.list;
        for(var i = 0; i < data.length; i++){
          data[i].selfType = data[i].relationType;
        }
        this.setData({allMember: data});
        this.handleAdminGroup(data);
        if(this.data.source != null){
          this.addMember();
        }
      }
    }).catch(e => {
      console.log(e);
    })
  },

  // 处理公司管理员数据
  handleAdminGroup: function (list) {
    var adminGroup = [];
    list.map(item => {
      if (item.relationType == 13) {
        adminGroup.push(item);
      }
    })
    this.setData({ adminGroup });
  },

  // 切换添加与删除界面的显示与否
  switchModel: function () {
    this.setData({ addOrReduce: !this.data.addOrReduce});
  },

  // 添加成员
  addMember: function () {
    this.setData({ allGroup: this.data.allMember, isAddMember: true});
    this.switchModel();
  },

  // 单选框添加
  sureAddMember: function (e) {
    var index= e.currentTarget.dataset.index;
    var chooseMember = this.data.chooseMember;
    var allMember = this.data.allMember;
    var allGroup = this.data.allGroup;
    var item = e.currentTarget.dataset.item;
    var id = item.id;
    if (item.selfType == 13){
      return false;
    }
    else{
      let checkend = false;
      chooseMember.map((pky,num)=>{
        if(pky == id){
          checkend = true;
          chooseMember.splice(num,1);
          item.relationType = item.selfType;
        }
      })
      if(!checkend){
        chooseMember.push(id);
        item.relationType = 13;
      }
      allGroup[index] = item;
      for(var i = 0; i < allMember.length; i++){
        if(allMember[i].id == item.id){
          allMember[i] = item;
        }
      }
      this.setData({ allGroup, chooseMember, allMember});
    }
    console.log(chooseMember)
  },

  // 模糊搜索
  search: function (e) {
    var content = e.detail.value;
    var allGroup = [];
    var allMember = this.data.allMember;
    allMember.map((item)=>{
      var reg = new RegExp(content, 'ig');
      if(reg.test(item.pname)){
        allGroup.push(item);
      }
    })
    if(content == ''){
      allGroup = allMember;
    }
    this.setData({allGroup});
  },

  // 添加管理人员
  sureAdd: function (e) {
    var address = app.ip + "tc/taskTeamService/editAdminGroup";
    var defaultTaskTeam = wx.getStorageSync('defaultTaskTeam');
    var memberIds = this.data.chooseMember;
    var obj = {
      taskId: defaultTaskTeam
    };
    console.log(memberIds);
    api.customRequest(obj, memberIds,address,"POST",true).then(res=>{
      console.log("添加管理员")
      console.log(res)
      if(res.data.code == 200 && res.data.result){
        this.getManagerGroup();
        this.switchModel();
      }
    })
  }
})