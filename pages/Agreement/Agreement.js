Page({
  data:{
    src:null,
    state:null
  },
  onLoad: function (options){
    this.setData({state:options.state})
  },

  onShow: function () {
    if(this.data.state == 2){
      this.setData({
        src: 'http://xz.yzsaas.cn/'
      })
    }
    else if(this.data.state == 3){
      this.setData({ src:'http://xz.yzsaas.cn/aboutus.html'})
    }
    else {
      this.setData({ src: 'http://xz.yzsaas.cn/document.html' })
    }
  }
})