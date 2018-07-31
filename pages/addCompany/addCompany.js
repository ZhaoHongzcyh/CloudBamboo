const app = getApp();
const api = require("../../api/common.js");
Page({
  data:{
    info:{
      state:0,
      content:""
    },
    isShowTextPlaceholder:true,
    companyName:"",
    memberList:[
      {
        name:"我",
        role:1,//1:管理员，0：普通用户
        head:app.ip + "tc/spaceService/showPersonIcon/" + wx.getStorageSync("tcUserId") + "/100/100"//头像路径
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
    var name = encodeURI(this.data.companyName);
    var obj = {
      title:name
    }
    api.request(obj,address,"post",true).then(res=>{
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        wx.setStorageSync("defaultTaskTeam", res.data.data.id);
        wx.redirectTo({
          url: '/pages/company/company',
        })
      }
      else{
        if(res.data.code == 419){
          this.setData({
            info: {
              state: 1,
              content: "公司数量太多"
            }
          })
        }
        else if(res.data.code == 414){
          console.log("无法为空")
          this.setData({
            info: {
              state: 1,
              content: res.data.message
            }
          })
        }
        else{
          if (res.data.message == null || res.data.message == "" || res.data.message == undefined){
            res.data.message = "新建公司失败"
          }
          this.setData({
            info: {
              state: 1,
              content: res.data.message
            }
          })
        }
        setTimeout(()=>{
          this.setData({info:{state:0,content:""}})
        },2000)
      }
    }).catch(e=>{
      this.setData({
        info: {
          state: 1,
          content: "服务异常，请稍后再试"
        }
      })
      setTimeout(()=>{
        this.setData({info:{state:0,content:""}})
      },2000)
    })
  },
  // 隐藏弹框
  hideAlert:function(){
    this.setData({
      info:{
        state:0,
        content:""
      }
    })
  }
})