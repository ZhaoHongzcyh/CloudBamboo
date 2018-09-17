const app = getApp();
Page({
  data:{
    equipSystem:1,//1:代表安卓机型 0：代表苹果机型
    src:null
  },
  onLoad:function(){
    this.getEquipInfo();
  },
  onReady:function(){

  },
  getEquipInfo:function(){
    wx.getSystemInfo({
      success:(res)=>{
        console.log(res);
        var reg = /iPhone/img;
        var src = "https://itunes.apple.com/cn/app/%E4%BA%91%E7%AB%B9%E5%8D%8F%E4%BD%9C/id1210580623";
        if(reg.test(res.model)){
          this.setData({
            equipSystem:0,
            src:src
          })
        }
        else{
          src = "http://xz.yzsaas.cn/download.html";
          this.setData({
            equipSystem: 1,
            src: src
          })
        }
      }
    })
  }
})