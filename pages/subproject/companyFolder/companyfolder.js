// pages/subproject/companyFolder/companyfolder.js
const app = getApp();
const api = require("../../../api/common.js");
const handle = require("../common.js");
Page({
  data: {
    alert:null,
    companyId:null,//公司id
    fileData:null,
    rootId:null,//公司根目录id
    copyFile:null,//被复制的文件列表
    parentIdStack:[
      {parentId:0,title:'首页'}
    ]//父文件夹对象
  },
  onLoad: function (options) {
    this.setData({
      companyId:options.id,
      copyFile: options.arcids.split(",")
    })
    this.newFolder = this.selectComponent("#newFolder");
    this.popup = this.selectComponent("#popup");
  },

  onShow: function () {
    this.getCompanyFolder();
  },

  // 弹框
  alert: function () {
    this.popup.showPopup()
  },

  // 获取新建文件夹名称
  getFolderName: function (e) {
    var value = e.detail.value;
  },

  // 新建文件夹弹框
  newFolderAlert: function () {
    this.newFolder.showModel();
  },

  // 获取公司目录文件
  getCompanyFolder: function () {
    var address = app.ip + "tc/taskService/findTaskFolderByParentId";
    api.request({ taskId:this.data.companyId},address,"POST",true).then(res=>{
      console.log("公司更目录");
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        var fileData = res.data.data.list;
        fileData.map((item,index)=>{
          if(item.atype != 0){
            fileData.splice(index,1);
          }
        })
        
        fileData = api.cloudDiskDataClean(fileData);
        fileData = api.fileNameSort(fileData);
        var rootId = fileData[0].parentId;
        this.setData({ fileData: fileData, rootId})
      }
    }) 
  },

  // 进入文件夹
  entryFolder: function (e) {
    var parentIdStack = this.data.parentIdStack;
    var item = e.currentTarget.dataset.item;
    var obj = {
      title:item.title,
      parentId:item.id
    }
    parentIdStack.push(obj);
    this.setData({ parentIdStack});
    this.getFolderTree(item.id)
  },
  
  // 上一级文件夹
  upFolder: function () {
    var parentIdStack = this.data.parentIdStack;
    var length = parentIdStack.length;
    var parentId = parentIdStack[length - 2].parentId;
    this.getFolderTree(parentId);
    parentIdStack.splice(length - 1);
    this.setData({ parentIdStack})
  },

  // 获取文件目录树
  getFolderTree: function (id) {
    var address = app.ip + "tc/taskService/findTaskArcTree";
    var obj = { parentId: id, taskId: this.data.companyId};
    api.request(obj,address,"POST",true).then(res=>{
      console.log("文件树");
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        var fileData = res.data.data;
        fileData.map((item,index)=>{
          if(item.atype != 0){fileData.splice(index,1);}
        })
        fileData = api.cloudDiskDataClean(fileData);
        fileData = api.fileNameSort(fileData);
        this.setData({ fileData});
      }
    })
  },

  // 新建文件夹
  newFolderName: function (e) {
    var parentIdStack = this.data.parentIdStack;
    var address = app.ip + "tc/taskService/addArcFolder";
    var length = parentIdStack.length;
    var folderName = encodeURI(e.detail.folderName);
    var fileData = this.data.fileData;
    var parentId = length == 0 ? 0 : parentIdStack[length - 1].parentId
    var obj = { parentId: parentId , taskId: this.data.companyId, folder: folderName};
    api.request(obj,address,"POST",true).then(res=>{
      console.log("新建文件夹");
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        var file = handle.addFolder(app, api, res.data.data);
        fileData.unshift(file[0]);
      }
      this.setData({fileData});
      this.newFolder.hide();
    })
  },

  // 复制文件
  copyFile: function () {
    var address = app.ip + "tc/taskService/copyArc";
    var parentIdStack = this.data.parentIdStack;
    var length = parentIdStack.length;
    var targetFolder = length == 0 ? this.data.rootId : parentIdStack[length - 1].parentId;
    var head = { targetFolder};
    var arcIds = this.data.copyFile;
    api.customRequest(head, arcIds,address,"POST",true).then(res=>{
      console.log("文件复制");
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        this.setData({alert:{content:'复制成功!'}});
        this.alert();
        setTimeout(()=>{
          wx.navigateBack({
            delta: 2
          })
        },1500)
      }
      else{
        this.setData({alert:{content:'文件复制失败'}});
        this.alert();
      }
    }).catch(e=>{
      this.setData({ alert: { content: '文件复制失败' } });
      this.alert();
    })
  },

  // 跳转到指定文件夹
  jump: function (e) {
    var parentid = e.currentTarget.dataset.parentid;
    var parentIdStack = this.data.parentIdStack;
    parentIdStack.map((item,index)=>{
      if(item.parentId == parentid){
        parentIdStack.splice(index+1,1)
      }
    })
    if(parentIdStack.length == 1){
      this.getCompanyFolder();
    }
    else{
      this.getFolderTree(parentid);
    }
    this.setData({parentIdStack})
    
  }
})