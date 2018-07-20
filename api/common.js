var request = function(data={},url="localhost",method="post",bool){
  var obj = {};
  var token = wx.getStorageSync("proxyUserToken");
  
  return new Promise(function(resolve,reject){
      if (bool) {
         data.proxyUserToken = token;
         console.log(data)
         obj = {
           url: url,
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
        wx.setStorageSync("defaultTaskTeam", info.data.defaultTaskTeam);
        wx.setStorageSync("tcUserId", info.data.proxyUserInfo.tcUserId);
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

// 处理考勤信息
var handleAttendance = function(data){
  var timeReg = /\d{2}:\d{2}/img;
  var goWork = {
    time:"--:--",
    status:true,
    title:"未打卡"
  };
  var offWork = {
    time:"--:--",
    status:true,
    title:"未打卡"
  }
  if(data.workType == 1){
    goWork.time = data.workShift.match(timeReg);
    goWork.status = false;
    goWork.title = "正常打卡"
  }
  else if(data.workType == 2){
    goWork.time = data.workShift.match(timeReg);
    goWork.status = false;
    goWork.title = "补登打卡"
  }

  if(data.closingType == 1){
    offWork.time = data.closingTime.match(timeReg);
    offWork.status = false;
    offWork.title = "正常打卡"
  }
  else{
    offWork.time = data.closingTime.match(timeReg);
    offWork.status = false;
    offWork.title = "补登打卡"
  }
  var obj = {
    goWork,
    offWork
  };
  return obj;
}

// 生成时间
var getData = function(){
  var date = new Date;
  var year = date.getFullYear();
  var today = date.getDate();
  var month = date.getMonth() + 1;
  month = month.toString();
  switch(month){
    case "1":
      month = "一月";
      break;
    case "2":
      month = "一月";
      break;
    case "3":
      month = "三月";
      break;
    case "4":
      month = "四月";
      break;
    case "5":
      month = "五月";
      break;
    case "6":
      month = "六月";
      break;
    case "7":
      month = "七月";
      break;
    case "8":
      month = "八月";
    break;
    case "9":
      month = "八月";
      break;
    case "8":
      month = "九月";
      break;
    case "10":
      month = "十月";
      break;
    case "11":
      month = "十一月";
      break;
    case "12":
      month = "十二月";
      break;
  }
  return {
    month,
    today
  }
}

// 将选中的公司列表清空  切换公司模块
var clearCompanyList = function(ary){
  for(var i =0; i < ary.length; i++){
    ary[i].checked = false;
  }
  return ary;
}

// 选中某一个公司  切换公司模块
var choosedCompany = function(ary,index){
  for(var i = 0; i < ary.length; i++){
    if(i == index){
      ary[i].checked = true;
    }
    else{
      ary[i].checked = false;
    }
  }
  return ary;
}

// 云盘数据整理 dat:格式为数组，例如：[{},{}]
var cloudDiskDataClean = function(dat){
    var folder = [];//存放文件夹数据
    var file = [];//存放普通文件
    for(var i =0; i<dat.length; i++){
      if(dat[i].atype == 0){
        folder.push(dat[i])
      }
      else{
        file.push(dat[i])
      }
    }
    return {folder,file};//返回文件夹数据与文件数据
}

// 云盘数据清洗，按照文件名排序
var fileNameSort = function(dat){
  console.log(dat);
  var folder = dat.folder.sort(function(a,b){
    a.title > b.title ? 1 : 0;
  });
  var file = dat.file.sort(function(a,b){
    a.title > b.title ? 1 : 0;
  })
  var list = [];
  for(var i = 0; i < folder.length; i++){
    list.push(folder[i]);
  }
  for(var i = 0; i < file.length; i++){
    list.push(file[i])
  }
  return list;//按照文件名排序之后的数据
}
module.exports = {
  request,
  handleLogoinInfo,
  handleAttendance,
  getData,
  clearCompanyList,
  choosedCompany,
  cloudDiskDataClean,
  fileNameSort
}