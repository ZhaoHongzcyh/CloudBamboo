// pages/subproject/copyfile/copyfile.js
const app = getApp();
const api = require("../../../api/common.js");
const handle = require("../common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showTapNum:1,
    alert:null,
    taskId:null,
    filelId:null,
    cloudDiskList:null,//云盘列表
    parentIdStack:[],//父文件夹id堆栈
    // -------------------------------------公司列表---------------------------------
    companyList:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      taskId:options.taskId,
      filelId: options.fileid.split(",")
    })
    this.newFolder = this.selectComponent("#newFolder");
    this.popup = this.selectComponent("#popup");
    console.log(options);
  },

  onShow: function () {
    this.getCloudDiskList()
  },

  // 菜单切换
  showtap: function (e) {
    var tap = e.currentTarget.dataset.tap;
    if(tap == 3){
      this.getCompanyList();
    }
    this.setData({
      showTapNum: tap
    })
  },

  // -------------------------------------------------我的云盘-------------------------------------------------------------
  // 新建文件夹弹框
  newFolderAlert: function () {
    this.newFolder.showModel();
  },

  // 弹框
  alert: function () {
    this.popup.showPopup()
  },

  // 获取云盘列表
  getCloudDiskList: function () {
    var address = app.ip + "tc/IArcSumManagerService/findArcSummarysdate";
    var obj = {
      ownerType: 10000003,
      ownerId: wx.getStorageSync("tcUserId"),
      folderId: 1
    }
   this.jump(1);
  },

  // 进入文件夹
  entryFolder: function (e) {
    var item = e.currentTarget.dataset.item;
    var parentIdStack = this.data.parentIdStack;
    var obj = {
      title:item.title,
      id:item.parentId,
      folderid:item.id
    };
    parentIdStack.push(obj);
    this.setData({ parentIdStack});
    this.jump(item.id);
  },

  // 跳转进入文件夹
  jump: function (id) {
    var address = app.ip + "tc/IArcSumManagerService/findArcSummarysdate";
    var obj = {
      ownerType: 10000003,
      ownerId: wx.getStorageSync("tcUserId"),
      folderId: id
    }
    api.request(obj, address, "POST", true).then(res => {
      var dat = api.cloudDiskDataClean(res.data.data.list);
      var list = api.fileNameSort(dat);
      list.map((item,index)=>{
        if(item.atype != 0){
          list.splice(index,1);
        }
      })
      this.setData({
        cloudDiskList: list
      })
    }).catch(e => {
      console.log(e)
    })
  },

  // 新建文件夹
  newFolderName: function (e) {
    console.log(e);
    var folderName = encodeURI(e.detail.folderName);
    var cloudDiskList = this.data.cloudDiskList;
    var parentIdStack = this.data.parentIdStack;
    var length = parentIdStack.length;
    var parentid = 1;
    if(length == 1){
      parentid = parentIdStack[length - 1].folderid;
    }
    else if(length > 1){
      parentid = parentIdStack[length - 1].id;
    }
    console.log(parentIdStack);
    var address = app.ip + "tc/knowledgeService/addArc";
    var obj = { parentId: parentid, title: folderName }
    api.request(obj, address, "POST", true).then(res => {
      console.log("新建文件夹");
      console.log(res);
      if (res.data.code == 200 && res.data.result) {
        var file = handle.addFolder(app, api, res.data.data);
        file[0].isReadOnly = true;
        cloudDiskList.unshift(file[0]);
      }
      this.setData({ cloudDiskList: cloudDiskList})
      this.newFolder.hide();
    })
  },

  // 跳转到指定文件夹
  jumpFolder: function (e) {
    var index = e.currentTarget.dataset.index;
    var parentIdStack = this.data.parentIdStack;
    var length = parentIdStack.length;
    var id = parentIdStack[index].id;
    parentIdStack.splice(index);
    this.setData({ parentIdStack});
    this.jump(id)
  },

  // 上一级文件夹
  upFolder: function () {
    var parentIdStack = this.data.parentIdStack;
    var length = parentIdStack.length;
    var id = parentIdStack[length - 2].id;
    this.jump(id);
    parentIdStack.splice(length - 1);
    this.setData({ parentIdStack })
  },

  // 复制文件
  copyFile: function () {
    var parentIdStack = this.data.parentIdStack;
    var length = parentIdStack.length;
    var targetFolder = 1;
    if(length == 0){
      targetFolder = 1;
    }
    else if(length == 1){
      targetFolder = parentIdStack[length - 1].folderid;
    }
    else{
      targetFolder = parentIdStack[length - 1].id;
    }
    var address = app.ip + "tc/taskService/copyArc";
    var obj = {
      targetFolder: targetFolder,
    }
    var arcIds = this.data.filelId;
    console.log(arcIds)
    api.customRequest(obj, arcIds,address,"POST",true).then(res=>{
      console.log("复制结果");
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        this.setData({alert:{content:'复制成功!'}});
        this.alert()
        setTimeout(()=>{
          wx.navigateBack();
        },2000)
        
      }
    })
  },

  // ----------------------------------------------公司列表-------------------------------------------------
  getCompanyList: function () {
   var address = app.ip + "tc/taskTeamService/findTaskTeam";
   api.request({},address,"POST",true).then(res=>{
     console.log("公司列表");
     console.log(res);
     if(res.data.code == 200 && res.data.result){
       this.setData({
         companyList:res.data.data.list
       })
     }
   })
  },

  // 复制文件到公司
  selectCompany: function (e) {
    var item = e.currentTarget.dataset.item;
    var address = app.ip + "tc/taskService/copyArc";
    var arcIds = this.data.filelId.join(",");
    var head = {
      targetFolder: item.id,
    };
    // api.customRequest(head, arcIds,address,"POST",true).then(res=>{
    //   console.log("复制到公司");
    //   console.log(res);
    // })
    this.entryCompanyFolder(item, arcIds)
  },

  // 进入公司文件夹
  entryCompanyFolder: function (item, arcIds) {
    wx.navigateTo({
      url: '../companyFolder/companyfolder?id=' + item.id + "&arcIds=" + arcIds,
    })
  }
})