const app = getApp();
Page({
  data:{
    equipSystem:1//1:代表安卓机型 0：代表苹果机型
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
        if(reg.test(res.model)){
          this.setData({
            equipSystem:0
          })
        }
        else{
          this.setData({
            equipSystem: 1
          })
        }
      }
    })
  }
})