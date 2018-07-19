// 处理与公司页面相关内容
var handleUserInfo = function(info){
  if(info.statusCode == 200 && info.data.result){
    info = info.data.data;
    wx.setStorageSync("allPersonSize", info.allPersonSize);//公司人数
    wx.setStorageSync("cid", info.cid);//公司ID
    wx.setStorageSync("teamName", info.curUser.teamName);//组织名称
    wx.setStorageSync("isOrgCorporationAdmin", info.isOrgCorporationAdmin);//是否管理员
  }
  return {
    cname:info.curUser.teamName,
    cicon:info.curCorp.cicon//单位logo
  }
}

var obj = {
  handleUserInfo
}

module.exports = obj;