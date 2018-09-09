const app = getApp();
Page({
  data:{
    list:[]
  },
  onLoad:function(){
    this.setData({
      list: app.globalData.tabbar.list
    })
    console.log(app.globalData.tabbar.list);
  },
  pageJump:function(e){
    var page = getCurrentPages();
    console.log(page)
    return false;
    var index = e.currentTarget.dataset.index;
    var url = e.currentTarget.dataset.url;
    app.editTabBar(index);
  }
})