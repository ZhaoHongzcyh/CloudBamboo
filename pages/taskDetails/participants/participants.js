// pages/taskDetails/participants.js
const app = getApp();
const api = require("../../../api/common.js");
const library = require("../handle.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    app:app,
    taskId:null,
    task:null,
    memberlist:[]//参与人
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      taskId:options.id
    })
    this.selectPlanChild(options.id)
  },
  
  // 根据ID查找计划条目
  selectPlanChild: function (id) {
    var address = app.ip + "tc/schedule/itemService/findBo";
    var obj = { id };
    api.request(obj, address, "post", true).then(res => {
      var handle = library.handleChild(res);
      if (handle.status) {
        handle.data.arcList = api.cloudDiskDataClean(handle.data.arcList);
        handle.data.arcList = api.fileNameSort(handle.data.arcList);
        // 将参与人放在同一个数组中
        var memberlist = []
        handle.data.memberList.map((item,index)=>{
          if(item.relationType == 2){
            memberlist.push(item);
          }
        })
        this.setData({
          task: handle.data,
          memberlist: memberlist
        })
      }
      else {
        console.log(handle);
      }
    })
  }
})