//app.js
App({
  ip:"http://192.168.1.107:8082/tc_service/",//开发环境
  filePreview:"http://192.168.1.107/tc_web/",
  // ip:"https://services.yzsaas.cn/",//生产环境
  // ip:"http://192.168.1.79:8082/tc_service/",
  onLaunch: function () {
  },
  onShow:function(options){
    console.log("场景值");
    console.log(options);
    this.getSceneValue(options);
  },
  // 获取场景值
  getSceneValue:function(options){
    console.log("获取场景值")
    console.log(options);
    if(options.scene == 1036){
      console.log("跳转te测试")
      this.globalData.isByAppEntry = true;
      var sceneObject = this.globalData.Invitation;
      var urlid = options.query.url.split("/");
      var length = urlid.length;
      // app分享的场景对象内容
          sceneObject = {
            url: urlid[length - 1]
          }
      this.globalData.Invitation = sceneObject;
      // setTimeout(()=>{
        wx.reLaunch({
          url: '/pages/acceptInvitation/acceptInvitation',
        })
      // },200)
      
    }
  },
  // 编辑tabbar
  editTabBar:function(index){
    var tabBar = this.globalData.tabbar.list;
    for(var i = 0; i < tabBar.length; i++){
      tabBar[i].selected = false;
      if(i == index){
        tabBar[index].selected = true;
      }
    }
    this.globalData.tabbar.list = tabBar;
  },
  globalData:{
    isByAppEntry:false,
    Invitation:{
      url:null//分享的链接
    },
    // headimg:null,//用户头像地址
    // userInfo: null,
    projectName:null,//项目名称
    projectDescript:null,//项目描述
    sessionoverdue:true,//true: session过期 false:session未过期
    tabbar: {
      color: "#000000",
      selectedColor: "#0f87ff",
      backgroundColor: "#ffffff",
      borderStyle: "black",
      list: [
        {
          "pagePath": "/pages/myself/myself",
          "text": "我的",
          "iconPath": "/pages/tabBar/img/myself.png",
          "selectedIconPath": "/pages/tabBar/img/myself-active.png",
          selected: false
        },
        {
          "pagePath": "/pages/project/project",
          "text": "项目",
          "iconPath": "/pages/tabBar/img/project.png",
          "selectedIconPath": "/pages/tabBar/img/project-active.png",
          selected: false
        },
        {
          "pagePath": "/pages/company/company",
          "text": "公司",
          "iconPath": "/pages/tabBar/img/company.png",
          "selectedIconPath": "/pages/tabBar/img/company-active.png",
          selected: true
        },
        {
          "pagePath": "/pages/cloudDisk/cloudDisk",
          "text": "云盘",
          "iconPath": "/pages/tabBar/img/cloudDisk.png",
          "selectedIconPath": "/pages/tabBar/img/cloudDisk-active.png",
          selected: false
        },
        {
          "pagePath": "/pages/mailList/mailList",
          "text": "通讯录",
          "iconPath": "/pages/tabBar/img/mailList.png",
          "selectedIconPath": "/pages/tabBar/img/mailList-active.png",
          selected: false
        }
      ],
      position: "bottom"
    },

    tasknum:0//项目下方的四个tab当前所处的位置
  }
})