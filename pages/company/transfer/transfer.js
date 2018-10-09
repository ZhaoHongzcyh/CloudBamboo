// pages/company/transfer/transfer.js
const app = getApp();
const api = require("../../../api/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    app:app,
    allGroup:null,
    allMember:null,
    confirm:null,
    state:null,
    transferItem:null
  },

  onLoad: function (options) {
    this.setData({
      state: options.state
    })
    this.confirm = this.selectComponent("#confirm");
    this.getCompanyMember();
  },

  // 确认转让弹框
  openConfirm: function () {
    this.confirm.show();
  },

  // 获取公司成员数据
  getCompanyMember: function () {
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
        this.handleMemberData(data);
      }
    }).catch(e => {
      console.log(e);
    })
  },

  // 处理公司成员数据
  handleMemberData: function (ary) {
    var data = [];
    var userid = wx.getStorageSync('tcUserId');
    ary.map((item,index)=>{
      if(item.id != userid) {
        data.push(item);
      }
    })
    this.setData({ allGroup: data, allMember: data });
  },

  // 用户搜索
  search: function (e) {
    console.log(e);
    var content = e.detail.value;
    var allGroup = [];
    this.data.allMember.map((item,index)=>{
      var reg = new RegExp(content,'ig');
      if (reg.test(item.pname)) {
        allGroup.push(item); 
      }
    });
    if(content == null || content == ''){
      allGroup = this.data.allMember;
    }
    
    this.setData({allGroup: allGroup});
  },

  // 公司转让模态框
  transferModel: function (e) {
    var item = e.currentTarget.dataset.item;
    var content = '确认要转让给 ' + item.pname;
    this.setData({ confirm: { content: content }, transferItem: item});
    this.openConfirm();
  },

  // 确认转让
  transfer: function () {
    var quitTask = this.data.state == 1? true:false;
    var address = app.ip + "tc/taskService/updateTaskManager";
    var obj = {
      taskId: wx.getStorageSync('defaultTaskTeam'),
      managerId: this.data.transferItem.id,
      quitTask: quitTask
    };

    api.request(obj,address,"POST",true).then(res=>{
      console.log("公司转让结果");
      console.log(res);
      if(res.data.code == 200 && res.data.result) {
        wx.setStorageSync('defaultTaskTeam', null);
        wx.navigateBack({
          delta: 2
        })
      }
      else{

      }
    })
  }

  
})