const app = getApp();
const api = require("../../api/common.js");
Page({
  data:{
    companyListData:[],
    isHasCompany:0,//0:未加入任何公司，1：已经加入公司，2：公司切换失败
  },
  onReady:function(){
    
  },
  onLoad:function(){
    this.getCompanyList();
  },
  // 请求公司列表
  getCompanyList: function () {
    var that = this;
    this.setData({
      isHasCompany:0
    });
    var obj = {
      taskId: wx.getStorageSync("defaultTaskTeam")
    },
    address = app.ip + "tc/taskTeamService/findTaskTeam";
    api.request(obj, address, "post", true).then(res => {
      console.log("团队");
      console.log(res);
      // session 过期 页面重定向
      if(res.data.code == 402){
        wx.redirectTo({
          url: '/pages/index/index',
        })
      }
      
      if (res.data.data.list.length > 0){
        var ary = res.data.data.list;
        ary = api.clearCompanyList(ary);
        that.setData({
          companyListData: ary,
          isHasCompany:1
        })
      }
      else{
        this.setData({
          isHasCompany:0
        })
      }
    }).catch(e=>{
      this.setData({
        isHasCompany: 2
      })
    })
  },
  // 选择公司
  chooseCompany:function(e){
    var company = e.details;
    var taskId = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    var obj = {taskId};
    var ary = this.data.companyListData;
    var address = app.ip + "tc/taskTeamService/setDefaultTaskTeam";
    api.request(obj,address,"post",true).then(res=>{
      // console.log(res);
      if(res.data.code == 200){
        ary = api.clearCompanyList(ary);
        ary = api.choosedCompany(ary,index);
        this.setData({
          companyListData:ary
        })
      }
    }).catch(e=>{
      console.log(e);
    })
  }
})