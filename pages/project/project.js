const app = getApp();
const api = require("../../api/common.js");
Page({
  data:{
    project:{
      person:[],
      company:[]
    },
    list:[]
  },
  onLoad:function(){
    this.getProjectInfo('company')
  },
  // 请求项目信息
  getProjectInfo:function(core){
    // 请求公司项目
    if(core == 'company'){

    }
    else{
      // 请求个人项目
    }
    var address = app.ip + 'tc/taskService/findTaskBos';
    var obj = {
      ownerType:40010001
    }
    api.request(obj,address,"post",true).then(res=>{
      console.log("项目列表");
      console.log(res);
      // this.setData({
      //   list:res.data.data.list
      // })
    }).catch(e=>{
      console.log(e);
    })
  }
})