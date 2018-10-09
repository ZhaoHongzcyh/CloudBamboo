// 处理与公司页面相关内容
var handleUserInfo = function(info){
  if(info.statusCode == 200 && info.data.result){
    info = info.data.data;
    // wx.setStorageSync("allPersonSize", info.allPersonSize);//公司人数
    // wx.setStorageSync("cid", info.cid);//公司ID
    // wx.setStorageSync("teamName", info.curUser.teamName);//组织名称
    // wx.setStorageSync("isOrgCorporationAdmin", info.isOrgCorporationAdmin);//是否管理员
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

var obj = {
  handleUserInfo
}

module.exports = obj;