// pages/taskDetails/editTask/editTask.js
const app = getApp();
const api = require("../../../api/common.js");
const library = require("../handle.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskId:null,
    task:null,//任务信息
    startDate:null,//任务开始时间
    endDate:null,//结束时间
    taskName:null,
    emergencyGrade: ["闲置处理", "正常处理", "紧急处理"],//紧急状态
    isAddMember: false,
    memberlist:[],//参与人
    searchMatch:[],//搜索人员匹配结果
    singleTaskId:null,//单个任务id
    userid: wx.getStorageSync("tcUserId")//个人id
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      taskId:options.id
    })
    this.selectPlan(options.id)
  },
  // 根据ID查找任务
  selectPlan: function (id) {
    var address = app.ip + "tc/schedule/itemService/findBo";
    var obj = { id };
    api.request(obj, address, "post", true).then(res => {
      console.log("编辑任务");
      console.log(res);
      var handle = library.handleChild(res);
      if (handle.status) {
        if (handle.data.itemBean.endDate != null) {
          handle.data.itemBean.endDate = handle.data.itemBean.endDate.split("T")[0]
        }
        // 将参与人整理到单独的数组中，方便管理
        var member = [];//参与人
        var list = handle.data.memberList;
        for (var i = 0; i < list.length; i++){
          if(list[i].relationType != 2){
            member.push(list[i])
          }
        }
        this.setData({
          task: handle.data,
          startDate: handle.data.itemBean.startDate.split("T")[0],
          endDate: handle.data.itemBean.endDate,
          memberlist:member,
          singleTaskId: handle.data.itemBean.id
        })
        console.log(this.data.task)
      }
      else {
        console.log(handle);
      }
    })
  },
  // 修改任务名称
  changeTaskName: function(e){
    console.log(e);
    var taskName = e.detail.value;
    this.setData({
      taskName:taskName
    })
  },
  // 设置开始时间
  startDate: function (e) {
    var startDate = e.detail.value;
    this.setData({
      startDate:startDate,
      endDate:null
    })
  },
  // 设置结束时间
  endDate: function(e){
    var endDate = e.detail.value;
    this.setData({
      endDate: endDate
    })
  },
  // 搜索联系人
  searchMember: function(e){
    var searchStr = e.detail.value;
    // console.log(searchStr);
    var address = app.ip + "tc/taskMemberService/searchEngines";
    var obj = { searchStr};
    api.request(obj,address,"post",true).then(res=>{
      console.log("匹配结果");
      console.log(res);
      this.matchSearch(res);
    })
  },
  // 匹配搜索结果
  matchSearch: function(res){
    if(res.data.code == 200 && res.data.result){
      var data = res.data.data.searchContactsObj.list;
      var searchMatch = []//匹配结果
      data.map((item,index)=>{
        console.log(index);
        if(item.personId != this.data.userid){
          searchMatch.push(item);
        }
      })
      this.setData({
        searchMatch: searchMatch
      })
    }
    else if(res.data.message == ""){
      return {status:false,msg:"搜索失败"};
    }
    else{return {status:false,msg:res.data.message}}
  },
  // 添加成员
  addMember: function(e){
    var personid = e.currentTarget.dataset.personid;
    var memberlist = null;
    this.data.searchMatch.map((item,index)=>{
      if(item.personId == personid){
        memberlist = item;
      }
    });
    // 判断参与人中是否已经存在改人员
    console.log("判断")
    console.log(this.data.memberlist);
    console.log(memberlist);
  },
  // 修改任务
  modifyTask: function(){
    var id = this.data.singleTaskId;
    var scheduleItemBean = {
      id:id,
      title:"23",
      resourceId:this.data.taskId
    }
    console.log(scheduleItemBean)
    var address = app.ip + "tc/schedule/itemService/update";
    api.sendDataByBody(scheduleItemBean,address,"post",true).then(res=>{
      console.log("修改任务");
      console.log(res);
    })
  }
})