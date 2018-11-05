// 处理与公司页面相关内容
var handleUserInfo = function(info){
  if(info.statusCode == 200 && info.data.result){
    info = info.data.data;
  }
  var defaultTaskTeam = wx.getStorageSync("defaultTaskTeam");
  var userid = wx.getStorageSync('tcUserId');
  var isManager = false;
  if (defaultTaskTeam == null){
    for (var i = 0; i < info.list.length; i++) {
      if (info.list[i].manager == userid){
        defaultTaskTeam = info.list[i].id;
        wx.setStorageSync('defaultTaskTeam', defaultTaskTeam);
      }
    }
  }

  for(var i =0; i<info.list.length;i++){
    if (info.list[i].id == defaultTaskTeam){
      if (userid == info.list[i].manager){
        isManager = true;
      }
      return {
        cname: info.list[i].title,
        cicon: "",//单位logo
        isManager: isManager//是否为公司负责人
      }
    }
  }
  return {
    isGetCompany: false
  }
}

// 判断是否为公司负责人(如果使用的是 tc/taskTeamService/findTaskTeamBo 该接口，则调用该函数处理公司详情数据)
var handleCompany = function (res) {
  var defaultTaskTeam = wx.getStorageSync("defaultTaskTeam");
  var userid = wx.getStorageSync('tcUserId');
  var isManager = false;
  if(res.data.code == 200 && res.data.result) {
    console.log(res);
    let manager = res.data.data.manager;
    let summaryBean = res.data.data.summaryBean;
    if (manager.taskId == defaultTaskTeam){
      if (manager.resourceId == userid){
        isManager = true;
      }
      return {
        cname: summaryBean.title,
        cicon: "",//单位logo
        isManager: isManager//是否为公司负责人
      }
    }
    else{
      return {
        isGetCompany: false
      }
    }
  }
}
var obj = {
  handleUserInfo, handleCompany
}

module.exports = obj;