Page({
  data:{
    src:null,
    state:null,
    options:null
  },
  onLoad: function (options){
    this.setData({state:options.state,options:options})
  },

  onShow: function () {
    if(this.data.state == 2){
      this.setData({
        src: 'https://xz.yzsaas.cn/'
      })
    }
    else if(this.data.state == 3){
      this.setData({ src:'https://xz.yzsaas.cn/aboutus.html'})
    }
    else if(this.data.state == 4){
      this.setData({src:this.data.options.src})
    }
    else {
      this.setData({ src: 'https://xz.yzsaas.cn/document.html' })
    }
  }
})