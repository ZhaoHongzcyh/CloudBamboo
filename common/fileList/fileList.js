// common/fileList/fileList.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item:{
      type:Object,
      value:{}
    },
    checked:{
      type:Boolean,
      value:false
    },
    isdownload:{
      type:Boolean,
      value:false
    },
    isdelete:{
      type:Boolean,
      value:false
    },
    readonly:{
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
    selectFile:function(e){
      var info = {e}
      this.triggerEvent("select",info);
    },
    downloadFile: function (e) {
      var item = e.currentTarget.dataset.item;
      this.triggerEvent("download",item);
    },
    deletedFile: function (e) {
      var item = e.currentTarget.dataset.item;
      this.triggerEvent("delete",item);
    }
  }
})
