// common/logoinAlert/logoinAlert.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    src:{
      type:String,
      value:''//图片路径
    },
    alertText:{
      type:String,
      value:'登录中...'
    },
    bgcolor:{
      type:String,
      value:"gray"
    },
    animate:{
      type:Boolean,
      value:true
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
    hide:function(){
      this.triggerEvent("hideAlert");
    }
  }
})
