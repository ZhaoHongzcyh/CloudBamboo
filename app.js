//app.js
App({
  ip:"http://192.168.1.107:8082/tc_service/",//开发环境
  // ip:"https://services.yzsaas.cn/",//生产环境
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
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
    headimg:null,//用户头像地址
    userInfo: null,
    company: {
      name: "公司名称",
      logo: "./img/company.png"
    },
    projectName:null,//项目名称
    projectDescript:null,//项目描述
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
    }
  }
})