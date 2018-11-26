// common/confirm/confirm.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title:{
      type:Object,
      value:{
        content:"确认要删除当前任务？"
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    hide: function () {
      this.setData({
        isShow:false
      })
      this.triggerEvent("cancel");
    },
    show: function () {
      this.setData({
        isShow:true
      })
    },
    sure: function () {
      this.triggerEvent("sure");
    }
  }
})
