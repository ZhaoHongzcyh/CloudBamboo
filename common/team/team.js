// common/team/team.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    src:{
      type:String,
      value:""
    },
    companyName:{
      type:String,
      value:"公司名称"
    },
    legalPerson:{
      type:String,
      value:"负责人"
    },
    checked:{
      type:Boolean,
      value:false
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
    switchCompany:function(){
      this.setData({
        checked:!this.data.checked
      })
      var bool = this.data.checked? true:false;
      var obj = {
        isChoose:bool
      }
      this.triggerEvent('switchCompany',obj);
    }
  }
})
