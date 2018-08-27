// pages/subproject/setPower/setPower.js
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
    memberlist:null,//项目成员列表
    fileid:null,
    file: null,
    isShowMemberList:false//是否展示成员列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      taskId:options.taskid,
      fileid:options.fileid
      });
  },
  onShow: function () {
    // this.searchTaskMember();
    this.getFilePower();
  },
  // 开启只读保护
  openReadOnly: function () {
    var address = app.ip + "tc/taskAuthorityService/editArcPrivilege";

  },
  // 获取人员与文件权限状态
  getFilePower: function () {
    var address = app.ip + "tc/taskAuthorityService/findListArcPrivilege";
    var obj = {arcId:this.data.fileid};
    var file = this.data.file;
    api.request(obj,address,"POST",true).then(res=>{
      console.log("人员权限");
      console.log(res);
      var file = this.data.file;
      if(res.data.code == 200 && res.data.result){
        // file.
        this.setData({
          file:res.data.data
        })
      }
    })
  },
  // 状态切换
  switchState: function (e) {
    var state = e.currentTarget.dataset.state;
    var file = this.data.file;
    console.log(state);
    if(state == "all"){
      file.authorityType = 0;
    }
    else if(state == "other"){
      file.authorityType = 1;
    }
    this.setData({
      file:file,
      isShowMemberList: !this.data.isShowMemberList
    })
  }
})