const app = getApp();
Page({
  data:{
    isShowTextPlaceholder:true,
    companyName:"",
    memberList:[
      {
        name:"admin",
        role:1,//1:管理员，0：普通用户
        head:"./img/head.png"//头像路径
      },
      {
        name: "普通用户",
        head: "./img/head.png"//头像路径
      },
      {
        name: "admin",
        role: 1,//1:管理员，0：普通用户
        head: "./img/head.png"//头像路径
      },
      {
        name: "普通用户",
        head: "./img/head.png"//头像路径
      },
      {
        name: "admin",
        role: 1,//1:管理员，0：普通用户
        head: "./img/head.png"//头像路径
      },
      {
        name: "普通用户",
        head: "./img/head.png"//头像路径
      },
      {
        name: "admin",
        role: 1,//1:管理员，0：普通用户
        head: "./img/head.png"//头像路径
      },
      {
        name: "普通用户",
        head: "./img/head.png"//头像路径
      }
    ]
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
  deleteMember:function(e){
    var index = e.currentTarget.dataset.index;
    var memberList = this.data.memberList;
    memberList.splice(index,1);
    this.setData({
      memberList:memberList
    })
  }
})