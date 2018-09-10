// pages/subproject/companyFolder/companyfolder.js
const app = getApp();
const api = require("../../../api/common.js");
const handle = require("../common.js");
Page({
  data: {
    companyId:null,//公司id
    fileData:null,
    parentIdStack:[]//父文件夹对象
  },
  onLoad: function (options) {
    this.setData({
      companyId:options.id
    })
  },

  onShow: function () {
    this.getCompanyFolder();
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
        this.setData({fileData:fileData})
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

  // 获取文件目录树
  getFolderTree: function (id) {
    var address = app.ip + "tc/taskService/findTaskArcTree";
    var obj = { parentId: id, taskId: this.data.companyId};
    api.request(obj,address,"POST",true).then(res=>{
      console.log("文件树");
      console.log(res);
    })
  }
})