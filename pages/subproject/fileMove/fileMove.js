// pages/subproject/fileMove/fileMove.js
const app = getApp();
const api = require("../../../api/common.js");
const handle = require("../common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileParentIdStack: null,//父文件夹堆栈
    parentId:0,//默认id为0
    taskId:null,
    alert:{},
    isShowReturn:false,//是否展示文件返回功能按钮
    fileParentIdStack:[],//目录信息
    filelist:null,//文件数据
    ids:null,//需要被移动的文件id集合
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      taskId:options.taskid,
      ids:options.file.split(",")
    })
    // 获取弹框节点
    this.popup = this.selectComponent("#popup");
    this.newFolder = this.selectComponent("#newFolder");
  },

  onShow: function () {
    this.selectFile(null);
  },

  // 弹框
  alert: function () {
    this.popup.showPopup()
  },

  // 通过项目id查找文件列表
  selectFile: function (e) {
    if(e != null){
      this.setData({ parentId: e.currentTarget.dataset.id })
    }
    var address = app.ip + "tc/taskService/findTaskArcTreeByParent";
    var obj = { taskId: this.data.taskId, parentId: this.data.parentId };
    api.request(obj, address, "post", true).then(res => {
      var file = handle.handleFile(res);
      if (file.status) {
        var fileParentIdStack = this.data.fileParentIdStack;//父文件夹Id堆栈
        var isShowReturn = false;
        var folder = [];
        var title = e == undefined ? '首页' : e.currentTarget.dataset.title;
        title = title.length > 5 ? title.substring(0, 4) + '...' : title.substring(0, 4);
        var floderObj = { parentId: this.data.parentId, title: title };
        file = handle.fileList(app, api, file.data);
        fileParentIdStack.push(floderObj);
        if (fileParentIdStack.length > 2 || fileParentIdStack.length == 2) {
          isShowReturn = true;
        }
        file.map((item,index)=>{
          if(item.atype == 0){
            folder.push(item);
          }
        })
        // 过滤文件，保留文件夹
        var parentId;
        if (e != null) {
          parentId = e.currentTarget.dataset.id
        }
        else{
          parentId = res.data.data.list[0].parentId
        }
        this.setData({
          fileList: folder,
          fileParentIdStack: fileParentIdStack,
          isShowReturn: isShowReturn,
          parentId: parentId
        })
      }
      else {
        console.log("数据加载失败");
      }
    })
  },

  // 进入文件夹
  entryFolder: function (e) {
    var parentId = e.currentTarget.dataset.parentid;
    this.setData({
      parentId: parentId
    });
    this.selectFile(e);
  },

  // 通过parentId请求文件列表
  getFileTree: function (parentId) {
    var fileParentIdStack = this.data.fileParentIdStack;
    var address = app.ip + "tc/taskService/findTaskArcTreeByParent";
    var obj = { taskId: this.data.taskId, parentId: parentId };
    var isShowReturn = false;
    api.request(obj, address, "post", true).then(res => {
      var file = handle.handleFile(res);
      if (file.status) {
        var folder = [];
        file = handle.fileList(app, api, file.data);
        if (fileParentIdStack.length > 2 || fileParentIdStack.length == 2) {
          isShowReturn = true;
        }
        // 判断当前文件是否可被用户选中
        file.map((item, num) => {
          if (item.atype == 0) {
            folder.push(item);
          }
        })
        this.setData({
          fileList: folder,
          fileParentIdStack: fileParentIdStack,
          isShowReturn: isShowReturn
        })
      }
    })
  },

  // 跳转到指定的文件夹
  jumpFile: function (e) {
    var fileParentIdStack = this.data.fileParentIdStack;
    var index = e.currentTarget.dataset.index;
    fileParentIdStack = fileParentIdStack.splice(0, index + 1)
    var parentId = e.currentTarget.dataset.parentid;
    this.setData({ fileParentIdStack });
    this.getFileTree(parentId);
  },

  // 新增加一个文件夹
  newFolderName: function (e) {
    var folderName = encodeURI(e.detail.folderName);
    var fileList = this.data.fileList;
    var address = app.ip + "tc/taskService/addArcFolder";
    var obj = { parentId: this.data.parentId, taskId: this.data.taskId, folder: folderName }
    api.request(obj, address, "POST", true).then(res => {
      if (res.data.code == 200 && res.data.result) {
        var file = handle.addFolder(app, api, res.data.data);
        fileList.unshift(file[0]);
      }
      this.setData({ fileList: fileList, isShowAddFile: false })
      this.newFolder.hide();
    })
  },

  // 新建文件夹弹框
  newFolderAlert: function () {
    this.newFolder.showModel();
  },

  // 移动文件
  moveFile: function () {
    var page = getCurrentPages();
    var prevPage = page[page.length - 2];
    var fileList = prevPage.data.fileList;
    var address = app.ip + "tc/knowledgeService/arcMoveFile";
    var head = { parentId: this.data.parentId};
    var ids = this.data.ids;
    api.customRequest(head,ids,address,"POST",true).then(res=>{
      if(res.data.result && res.data.data==null){
        this.setData({alert:{content:"移动成功"}});
        this.alert();
        fileList = this.delMoveFile(ids, fileList);
        prevPage.setData({
          fileList
        })
      }
      else if(res.data.result && res.data.data.length > 0){
        this.setData({ alert: { content: "移动成功,源文件已被覆盖" } });
        this.alert();
        fileList = this.delMoveFile(ids, fileList);
        prevPage.setData({
          fileList
        })
      }
      else{
        this.setData({ alert: { content: "移动失败" } });
        this.alert();
      }
      setTimeout(() => {
        wx.navigateBack();
      }, 2000)
    }).catch(e=>{
      this.setData({ alert: { content: "抱歉移动失败!请检查网络或重试" } });
      this.alert();
      setTimeout(() => {
        wx.navigateBack();
      }, 2000)
    })
  },
  
  // 删除上一个页面被移动的数据
  delMoveFile: function (ids,filelist) {
    for(var i = 0; i < ids.length; i++){
      filelist.map((item,index)=>{
        if(item.id == ids[i]){
          filelist.splice(index,1)
        }
      })
    }
    return filelist;
  }
})