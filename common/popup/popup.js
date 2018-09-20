
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    title: {            // 属性名
      type: String,     // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: ''     // 属性初始值（可选），如果未指定则会根据类型选择一个
    },
    // 弹窗内容
    content: {
      type: String,
      value: '内容'
    },
    // 弹窗取消按钮文字
    btn_no: {
      type: String,
      value: '取消'
    },
    // 弹窗确认按钮文字
    btn_ok: {
      type: String,
      value: '确定'
    },
    // 弹窗底部提示文字
    footer:{
      type:String,
      value:"null"
    },
    // 是否为普通弹窗
    isAlert:{
      type:Boolean,
      value:false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    flag: true,
    apple: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //隐藏弹框
    hidePopup: function () {
      this.setData({
        flag: !this.data.flag
      })
    },

    // 获取设备类型（苹果与安卓）
    checkApple: function () {
      if (this.data.isAlert){
        return false;
      }
      wx.getSystemInfo({
        success: (res) => {
          var reg = /iPhone/img;
          if (reg.test(res.model)) {
            this.setData({
              footer:"复制关键字，跳转AppStore",
              apple: true,
              content:"使用云竹协作更多功能,可点击下方按钮前往AppStore搜索下载"
            })
          }
          else {
            this.setData({
              footer: "立即下载",
              apple: false
            })
          }
        }
      })
    },

    //展示弹框
    showPopup() {
      this.setData({
        flag: !this.data.flag
      })
      this.checkApple()
    },
    // 跳转到app下载页面
    downApp:function(){
      if (this.data.isAlert){
        this.hidePopup();
      }
      else{
        wx.navigateTo({
          url: '/pages/downApp/downApp'
        })
      }
    },

    // 复制关键字
    copyText: function () {
      wx.setClipboardData({data:'云竹协作'});
      wx.showToast({title:'复制成功'});
      this.hidePopup()
    },
    /*
    * 内部私有方法建议以下划线开头
    * triggerEvent 用于触发事件
    */
    _error() {
      //触发取消回调
      this.triggerEvent("error")
    },
    _success() {
      //触发成功回调
      this.triggerEvent("success");
    }
  }
})