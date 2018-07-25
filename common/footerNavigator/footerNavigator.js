// common/footerNavigator/footerNavigator.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    num:{
      type:Number,
      value:2
    }
  },
  data:{
    url:[
      {
        activeUrl:"./img/myself-active.png",
        staticUrl:"./img/myself.png",
        text:"我的",
        href:"/pages/myself/myself",
        state:false
      },
      {
        activeUrl: "./img/project-active.png",
        staticUrl: "./img/project.png",
        text:"项目",
        href:"/pages/project/project",
        state: false
      },
      {
        activeUrl: "./img/company-active.png",
        staticUrl: "./img/company.png",
        text:"公司",
        href:"/pages/company/company",
        state: false
      },
      {
        activeUrl: "./img/cloudDisk-active.png",
        staticUrl: "./img/cloudDisk.png",
        text:"云盘",
        href:"/pages/cloudDisk/cloudDisk",
        state: false
      },
      {
        activeUrl: "./img/mailList-active.png",
        staticUrl: "./img/mailList.png",
        text:"通讯录",
        href:"/pages/mailList/mailList",
        state: false
      }
    ]
  },
  methods:{
    pageJump: function (e) {
      var url = e.currentTarget.dataset.url;
      var index = e.currentTarget.dataset.index;
      wx.redirectTo({
        url: url + "?index=" + index,
      })
    }
  }
})
