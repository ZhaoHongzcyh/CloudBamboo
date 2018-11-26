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
    source:null,
    delMember:null,
    alert:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.popup = this.selectComponent("#popup");
    if(options.source == 1){
      this.setData({
        source:options.source
      })
    }
  },

  onShow: function () {
    this.getManagerGroup();
  },

  // 弹框
  alert: function () {
    this.popup.showPopup()
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
      else{
        this.showAlert(res.data.message);
      }
    }).catch(e => {
      this.showAlert('管理组成员获取失败!');
      console.log(e);
    })
  },

  // 处理公司管理员数据
  handleAdminGroup: function (list) {
    var adminGroup = [];
    list.map(item => {
      if (item.relationType == 12) {
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
    wx.setNavigationBarTitle({
      title: '添加管理组成员'
    })
  },

  // 单选框添加
  sureAddMember: function (e) {
    var index= e.currentTarget.dataset.index;
    var chooseMember = this.data.chooseMember;
    var allMember = this.data.allMember;
    var allGroup = this.data.allGroup;
    var item = e.currentTarget.dataset.item;
    var id = item.id;
    if (item.selfType == 12){
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
        item.relationType = 12;
      }
      allGroup[index] = item;
      for(var i = 0; i < allMember.length; i++){
        if(allMember[i].id == item.id){
          allMember[i] = item;
        }
      }
      this.setData({ allGroup, chooseMember, allMember});
    }
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
    var allGroup = this.data.allMember;
    allGroup.map((single,num)=>{
      if(single.selfType == 12){
        memberIds.push(single.id);
      }
    })
    api.customRequest(obj, memberIds,address,"POST",true).then(res=>{
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        this.getManagerGroup();
        this.switchModel();
        wx.setNavigationBarTitle({
          title: '全部成员'
        })
        if (this.data.source != null){
          wx.navigateBack();
        }
      }
      else{
        if(res.data.message == "" || res.data.message == null || res.data.message == undefined){res.data.message = '数据加载异常';}
        this.showAlert(res.data.message);
      }
    }).catch(e=>{
      this.showAlert('管理组成员添加失败!');
    })
  },

  // 显示删除成员界面
  delMember: function () {
    this.setData({
      addOrReduce: true,
      isAddMember: false,
      allGroup: this.data.allMember
    });
    wx.setNavigationBarTitle({
      title: '删除管理组成员'
    })
  },

  // 删除成员
  delGroup: function (e) {
    var item = e.currentTarget.dataset.item;
    var memberIds = this.data.allGroup;
    var allGroup = [];
    memberIds.map((single,index)=>{
      if(single.relationType == 12){
        allGroup.push(single);
      }
    })
    
    memberIds = [];
    allGroup.map((single,index)=>{
      if(single.id != item.id){
        memberIds.push(single.id);
      }
    })
    
    allGroup.map((single, index) => {
      if (single.id == item.id) {
        allGroup.splice(index, 1);
      }
    })
    this.setData({ allGroup, delMember: memberIds});
  },

  // 确定删除成员
  sureDelMember: function () {
    var head = { taskId: wx.getStorageSync('defaultTaskTeam'), delete:"true"};
    var address = app.ip + "tc/taskTeamService/editAdminGroup";
    var memberIds = this.data.delMember;
    api.customRequest(head,memberIds,address,"POST",true).then(res=>{
      console.log("删除成员");
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        this.reloadData();
      }
      else{
        this.showAlert(res.data.message);
      }
    }).catch(e=>{
      this.showAlert('管理组成员删除失败');
    })
  },

  // 重载本地相关数据
  reloadData: function () {
    this.getManagerGroup();
    this.setData({
      addOrReduce: false,
      isAddMember: true
    })
    wx.setNavigationBarTitle({
      title: '全部成员'
    })
  },

  // 弹框显示
  showAlert: function (txt) {
    this.setData({
      alert:{content:txt}
    });
    this.alert();
  }
})