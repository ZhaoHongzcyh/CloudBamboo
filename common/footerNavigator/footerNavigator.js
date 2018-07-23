// common/footerNavigator/footerNavigator.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },
  methods:{
    pageJump: function (e) {
      var url = e.currentTarget.dataset.url;
      wx.redirectTo({
        url: url,
      })
    }
  }
})
