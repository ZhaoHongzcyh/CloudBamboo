const app = getApp();
var listConfig = require("./listConfig.js");
const api = require("../../api/common.js");
const company = require("../../api/company.js");
Page({
  data:{
    company:{
      name:"公司名称",
      logo:"./img/company.png"
    },
    listConfig:{}
  },
  onLoad:function(){
    this.setData({
      listConfig:listConfig.listConfig
    })
    this.getWorkAttendance();
    this.getCompanyInfo();
    this.getUserTeam();
  },
  // 请求考勤打卡情况
  getWorkAttendance:function(){
    var obj = {
      taskId:0
    }
    var address = app.ip + "tc/taskMemberService/findTaskMembershipAttendanceBean";
    api.request(obj,address,"post",true).then(res=>{
      console.log("考情")
      console.log(res);
    }).catch(e=>{
      console.log(e);
    })
  },
  // 查询公司信息
  getCompanyInfo:function(){
    var obj = {};
    var address = app.ip + "tw/userService/getUserInfo";
    api.request(obj,address,"post",true).then(res=>{
      console.log(res);
      var handleInfo = company.handleUserInfo(res);
      this.setData({
        company:{
          name:handleInfo.cname,
          cicon: handleInfo.cicon
        }
      })
    }).catch(e=>{
      console.log(e);
    })
  },
  // tc/taskTeamService/findTaskTeam
  getUserTeam:function(){
    var obj = {};
    var address = app.ip + "tc/taskTeamService/findTaskTeam";
    api.request(obj,address,"post",true).then(res=>{
      console.log("团队信息");
      console.log(res)
    })
  }
})