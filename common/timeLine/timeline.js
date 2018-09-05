// common/timeLine/timeline.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data:{
      type:Object,
      value:[]
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    editreply: function (e) {
      var num = e.currentTarget.dataset.index;
      var obj = {num}
      this.triggerEvent('edit', obj);
    }
  }
})
