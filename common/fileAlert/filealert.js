// common/fileAlert/filealert.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title:{
      type: String,
      value:"新建文件夹"
    },
    placeholder:{
      type: String,
      value: "请输入文件夹名称"
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShowModel: false,
    value: null
  },

  /**
   * 组件的方法列表
   */
  methods: {
    hide: function (){
      this.setData({ isShowModel: false, value:null})
    },
    showModel: function () {
      this.setData({isShowModel:true})
    },
    getValue: function (e) {
      this.setData({
        value:e.detail.value
      })
    },
    sureadd: function () {
      this.triggerEvent("newFolder",{folderName:this.data.value});
    }
  }
})
