// pages/taskDetails/peopleList/peoplelist.js
const app = getApp();
const api = require("../../../api/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    memberList:null,//成员列表
    taskid:null,
    num:null//@符号被替代的位置
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      taskid:options.taskid,
      num:options.num
    })
    this.selectTaskMember()
  },
  // 查询任务成员
  selectTaskMember: function () {
    var address = app.ip + "tc/schedule/itemService/findBo";
    var obj = {id:this.data.taskid}
    api.request(obj,address,"post",true).then(res=>{
      if(res.data.code == 200 && res.data.result){
        this.handleMemberData(res.data.data.memberList);
      }
      else{
        console.log("成员加载失败")
      }
    })
  },

  // 处理返回的任务成员数据
  handleMemberData: function (data) {
    var memberList = [];
    data.map((item,index)=>{
      if(item.relationType == 1 || item.relationType == 2){
        memberList.push(item);
      }
    });
    this.setData({
      memberList
    })
  },
  
  // 选择人员
  selected: function (e) {
    
    var item = e.currentTarget.dataset.item;
    var page = getCurrentPages();
    var length = page.length;
    var prevPage = page[length - 2];//上一级页面信息
    var calledPeople = prevPage.data.calledPeople;
    var replyContent = prevPage.data.replyContent;
    if (calledPeople == null){
      calledPeople = [];
      calledPeople.push(item);
    }
    else{
      calledPeople.push(item);
    }
    var reg = /@/g;
    replyContent = replyContent.split("");
    replyContent[this.data.num] = " @" + item.personName + " ";
    replyContent = replyContent.join("");
    prevPage.setData({
      calledPeople: calledPeople,
      replyContent: replyContent
    });
    wx.navigateBack();
  }
})