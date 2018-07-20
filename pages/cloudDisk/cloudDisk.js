// 获取应用实例
const app = getApp();
const api = require("../../api/common.js");
Page({
  data:{
    sortRule:"name",//文件排序规则：name:按照文件名排序，time:按照时间排序
    fileData:[],//文件数据
    selectedFile:[],
    selectnum:0,
    selectStatus:[],//文件是否被选中的状态
    input:"请输入关键字搜索文件或文件夹"
  },
  onLoad:function(){
    this.getFileList();
  },
  // 获取文件列表
  getFileList:function(){
    var address = app.ip + "tc/IArcSumManagerService/findArcSummarysdate";
    var obj = {
      ownerType: 10000003,
      ownerId:wx.getStorageSync("tcUserId"),
      folderId:1
    }
    api.request(obj,address,"post",true).then(res=>{
      // console.log(res)
      var selectStatus = [];
      var dat = api.cloudDiskDataClean(res.data.data.list);
      var list = api.fileNameSort(dat);

      // 将选中状态设置为false
      for(var i = 0; i<list.length; i++){
        selectStatus.push(false);
      }
      this.setData({
        fileData:list,
        selectStatus: selectStatus
      })
    }).catch(e=>{
      console.log(e)
    })
  },
  // 文件排序
  fileSort:function(){
    if(this.data.sortRule == 'name'){

    }
    else{
      
    }
  },
  select:function(e){
    console.log("父级");
    console.log(e)
    var index = e.currentTarget.dataset.index;
    var selectStatus = this.data.selectStatus;
    var ary = this.data.selectedFile;
    var num = ary.indexOf(e.detail.e.currentTarget.dataset.id);
    if (ary.indexOf(e.detail.e.currentTarget.dataset.id) == -1){
      ary.push(e.detail.e.currentTarget.dataset.id);
      selectStatus[index] = true;
    }
    else{
      ary.splice(num,1);
      selectStatus[index] = false
    }
    this.setData({
      selectedFile:ary,
      selectnum:ary.length,
      selectStatus: selectStatus
    })
  },
  getSearchContent:function(e){
    // console.log(e);
    console.log(this.data.input)
  }
})