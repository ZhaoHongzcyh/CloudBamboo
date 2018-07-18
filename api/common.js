var request = function(data={},url="localhost",method="post",bool){
  var obj = {};
  var token = wx.getStorageSync("proxyUserToken");
  
  return new Promise(function(resolve,reject){
       if (bool) {
         data.proxyUserToken = token;
         obj = {
           url: url,
           data: data,
           method:method,
           header: data,
           success: function (res) {
             resolve(res);
           },
           error: function (err) {
             reject(err)
           }
         }
         wx.request(obj);
       }
       else{

         obj = {
           url: url,
           header: data,
           method:method,
           success: function (res) {
             resolve(res);
           },
           error: function (err) {
             reject(err)
           }
         };
         console.log("请求")
         wx.request(obj);
       }
     })
}

// 处理登录成功之后返回信息
var handleLogoinInfo = function(info){
  console.log(info);
    if(info.data.code == 200 && info.data.result){
      info = info.data;
      try{
        wx.setStorageSync("appKey", info.data.appKey);
        wx.setStorageSync("proxyUserToken", info.data.proxyUserToken);
        wx.setStorageSync("defaultTaskTeam", info.data.proxyUserToken);
      }
      catch(e){
        console.log("用户基本信息储存异常");
      }
      return {
        code:200,
        msg:"handle success"
      }
    }
    else{
      return {
        code:info.data.code,
        msg:info.data.message
      }
    }
}

module.exports = {
  request,
  handleLogoinInfo
}