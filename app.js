//app.js
App({
  // ip:"http://192.168.1.107:8082/tc_service/",//开发环境
  // filePreview:"http://192.168.1.107/tc_web/",
  ip:"https://services.yzsaas.cn/",//生产环境
  filePreview: "http://xz.yzsaas.cn/tc_web/",//生产环境
  onLaunch: function () {
  },
  onShow:function(options){
    this.getSceneValue(options);
  },
  // 获取场景值
  getSceneValue:function(options){
    if(options.scene == 1036){
      this.globalData.isByAppEntry = true;
      var sceneObject = this.globalData.Invitation;
      var urlid = options.query.url.split("/");
      var length = urlid.length;
      // app分享的场景对象内容
          sceneObject = {
            url: urlid[length - 1]
          }
        this.globalData.Invitation = sceneObject;
        setTimeout(()=>{
          wx.reLaunch({
            url: '/pages/acceptInvitation/acceptInvitation',
          })
        },250)
        
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
    tasknum:0//项目下方的四个tab当前所处的位置
  }
})