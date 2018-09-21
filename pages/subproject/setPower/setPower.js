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
    alert:null,
    taskId:null,
    memberlist:null,//项目成员列表
    fileid:null,
    file: null,
    fileInfo:null,
    selectMember:null,//被选中的特定成员
    isShowMemberList:false//是否展示成员列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.popup = this.selectComponent("#popup");
    this.setData({
      taskId:options.taskid,
      fileid:options.fileid
      });
  },

  onShow: function () {
    // this.searchTaskMember();
    this.getFilePower();
  },

  // 弹框
  alert: function () {
    this.popup.showPopup()
  },

  // 获取人员与文件权限状态
  getFilePower: function () {
    var address = app.ip + "tc/taskAuthorityService/findListArcPrivilege";
    var obj = {arcId:this.data.fileid};
    var file = this.data.file;
    api.request(obj,address,"POST",true).then(res=>{
      if(res.data.code == 200 && res.data.result){
        var selectMember = res.data.data.taskAuthorityList;
        var member = [];
        for (var i = 0; i < selectMember.length; i++){
          if (selectMember[i].definedPriv){
            member.push(selectMember[i])
          }
        }
        this.setData({
          file:res.data.data,
          fileInfo:res.data.data,
          selectMember: member
        })
      }
    })
  },

  // 状态切换
  switchState: function (e) {
    var isShowMemberList;
    var state = e.currentTarget.dataset.state;
    var checked = e.detail.value;
    var file = this.data.file;
    if(state == "all"){
      if(checked){
        file.authorityType = 0;
      }
      else{
        file.authorityType = 1;
      }
      isShowMemberList = false;
    }
    else{
      if(checked){
        file.authorityType = 1;
        isShowMemberList = true;
      }
      else{
        file.authorityType = 0;
        isShowMemberList = false;
      }
    }

    this.setData({
      file: file,
      isShowMemberList: isShowMemberList
    })
  },

  // 取消选择成员
  switchCancel: function () {
    this.setData({
      isShowMemberList:false
    })
  },

  // 选择成员
  chooseMember: function (e) {
    var selectMember = this.data.selectMember;
    var item = e.currentTarget.dataset.item;
    var taskAuthorityList = this.data.file.taskAuthorityList;
    var file = this.data.file;
    var state = false;
    for (var i = 0; i < selectMember.length; i++){
      if (selectMember[i].userId == item.userId){
        selectMember.splice(i,1);
        state = true;
      }
    }
    if(!state){
      selectMember.push(item);
    }
    for (var i = 0; i < taskAuthorityList.length; i++){
      if (taskAuthorityList[i].userId == item.userId){
        if (taskAuthorityList[i].definedPriv){
          taskAuthorityList[i].definedPriv = false;
        }
        else{
          taskAuthorityList[i].definedPriv = true;
        }
      }
    }
    file.taskAuthorityList = taskAuthorityList;
    this.setData({ file, selectMember});
  },

  // 开启只读保护
  openReadPer: function (e) {
    var file = this.data.file;
    if(!e.detail.value){
      file.authorityType = null;
    }
    else{
      if (!this.data.fileInfo.authorityType){
        file.authorityType = 0
      }
      else{
        file.authorityType = this.data.fileInfo.authorityType;
      }
    }
    this.setData({file})
  },
  
  // 编辑文件权限
  editFilePower: function(e) {
    var address = app.ip + "tc/taskAuthorityService/editArcPrivilege";
    var selectMember = this.data.selectMember;
    var arcId = this.data.fileid;
    var file = this.data.file;
    var userIds = [];//部分用户集合
    var isReadonly = 0;
    var openType = 0;
    var head = {arcId};
    if (file.authorityType == null){
      isReadonly = 1;
      head.isReadonly = 1;
      head.openType = 0;
      this.setData({alert:{content:"已关闭只读保护"}})
    }
    else{
      this.setData({alert:{content:"已开启只读保护"}})
      isReadonly = 0;
      if (file.authorityType == 0){
        openType = 0;
      }
      else{
        openType = 1;
        for (var i = 0; i < selectMember.length; i++){
          userIds.push(selectMember[i].userId);
        }
      }
      head.openType = openType;
      head.isReadonly = isReadonly;
    }
    if (userIds.length ==0 ){
      userIds = [];
    }
    api.customRequest(head, userIds,address,"POST",true).then(res=>{
      if(res.data.code == 200 && res.data.result){
        this.alert();
        var page = getCurrentPages();
        var prevPage = page[page.length - 2];
        var fileList = prevPage.data.fileList;
        for (var i = 0; i < fileList.length; i++){
          if (fileList[i].id == arcId){
            
            if (isReadonly == 0){
              fileList[i].definedPriv = true;
            }
            else{
              fileList[i].definedPriv = false;
            }
          }
        }
        prevPage.setData({ fileList})
        setTimeout(()=>{
          wx.navigateBack();
        },1800)
        
      }
      else{
        this.setData({alert:{content:"只读权限设置失败"}});
        this.alert();
      }
    }).catch(e=>{
      this.setData({ alert: { content: "只读权限设置失败" } });
      this.alert();
    })
  }
})