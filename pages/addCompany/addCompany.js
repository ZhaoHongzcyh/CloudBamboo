const app = getApp();
const api = require("../../api/common.js");
Page({
  data:{
    isShowTextPlaceholder:true,
    companyName:"",
    memberList:[
      {
        name:"我",
        role:1,//1:管理员，0：普通用户
        head:"./img/head.png"//头像路径
      }
    ]
  },
  onLoad:function(){
    // 弹框
    this.popup = this.selectComponent("#company-popup");
  },
  // 弹框
  alert: function () {
    this.popup.showPopup()
  },
  // 隐藏输入框提示信息
  hidePlaceholder:function(){
    this.setData({
      isShowTextPlaceholder:false
    })
  },
  // 显示输入框提示信息
  showPlaceholder:function(){
    if(this.data.companyName.length == 0){
      this.setData({
        isShowTextPlaceholder:true
      })
    }
  },
  getinput:function(e){
    this.setData({
      companyName:e.detail.value
    })
  },
  // 删除成员
  delete:function(e){
    var index = e.currentTarget.dataset.index;
    var memberList = this.data.memberList;
    memberList.splice(index,1);
    this.setData({
      memberList:memberList
    })
  },
  // 添加团队
  addCompany:function(){
    var address = app.ip + "tc/taskTeamService/addTaskTeam";
    var title = this.data.companyName;
    api.request({title},address,"post",true).then(res=>{
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        wx.setStorageSync("defaultTaskTeam", res.data.data.id);
        wx.redirectTo({
          url: '/pages/company/company',
        })
      }
    })
  }
})