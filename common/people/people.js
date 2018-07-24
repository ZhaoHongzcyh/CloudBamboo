// common/people/people.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item:{
      type: Object,
      value: {
        name: "admin",
        role: 1,//1:管理员，0：普通用户
        head: "./img/head.png"//头像路径
      }
    },
    index:{
      type:Number,
      value:0
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
    // 删除成员
    deleteMember: function (e) {
      var index = e.currentTarget.dataset.index;
      this.triggerEvent("delete",{index});
    }
  }
})
