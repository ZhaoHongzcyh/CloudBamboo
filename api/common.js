var request = function(data={},url="localhost",method="post",bool){
  var obj = {};
  var token = wx.getStorageSync("proxyUserToken");
  
  return new Promise(function(resolve,reject){
      if (bool) {
         data.proxyUserToken = token;
         obj = {
           url: url,
           method:method,
           header: data,
           success: function (res) {
             resolve(res);
           },
           fail: function (err) {
             reject(err)
           }
         }
         wx.request(obj);
       }
      else{
         obj = {
           url: url,
           header: {
             proxyUserToken:token
           },
           data:data,
           method:method,
           success: function (res) {
             resolve(res);
           },
           fail: function (err) {
             reject(err)
           }
         };
         wx.request(obj);
       }
     })
}

// 通过body发送参数
var sendDataByBody = function (data,url,method,isCheck=true) {
  var token = wx.getStorageSync("proxyUserToken");
  return new Promise(function (resolve, reject) {
    var obj = {
      url: url,
      method: method,
      data: data,
      success: function (res) {
        resolve(res);
      },
      fail: function (err) {
        reject(err)
      }
    }
    if(isCheck){
      obj.header = {
        proxyUserToken:token
      }
    }
    wx.request(obj);
  })
}

// 自定义头部数据与body数据请求
var customRequest = function (head,body,address,method="post",bool=true) { 
  return new Promise(function (resolve,reject) {
    var token = wx.getStorageSync("proxyUserToken");
    if(bool){
      head.proxyUserToken = token;
    }
    var obj = {
      url: address,
      method: method,
      header:head,
      data: body,
      success: function (res) {
        resolve(res);
      },
      fail: function (err) {
        reject(err)
      }
    }
    wx.request(obj);
  })
}

// 发送小程序Code与验证
var sendCode = function (data = {}, url = "localhost", method = "post"){
  return new Promise(function(resolve,reject){
    var obj = {
      url: url,
      method: method,
      data: data,
      success: function (res) {
        resolve(res);
      },
      fail: function (err) {
        reject(err)
      }
    }
    wx.request(obj);
  })
  
}
// 处理登录成功之后返回信息
var handleLogoinInfo = function(info){
    if(info.data.code == 200 && info.data.result){
      info = info.data;
      try{
        wx.setStorageSync("appKey", info.data.appKey);
        wx.setStorageSync("proxyUserToken", info.data.proxyUserToken);
        wx.setStorageSync("defaultTaskTeam", info.data.defaultTaskTeam);
        wx.setStorageSync("tcUserId", info.data.proxyUserInfo.tcUserId);
      }
      catch(e){
        return {code:400,msg:"error"}
      }
      return {
        code:200,
        msg:"success"
      }
    }
    else{
      return {
        code:info.data.code,
        msg:info.data.message
      }
    }
}

// 自动填写登录信息
var autoAddLogoinInfo = function(){
  var phone = wx.getStorageSync("userName");
  var password= wx.getStorageSync("password");
  if(phone == "" || phone == null){
    return false;
  }
  else if(password == "" || password == null){
    return false;
  }
  else{
    return { phone, password };
  }
  
}
// 处理考勤信息
var handleAttendance = function(data){
  var timeReg = /\d{2}:\d{2}/img;
  var goWork = {
    time:"--:--",
    status:true,
    title:"上班打卡",
    code:0
  };
  var offWork = {
    time:"--:--",
    status:true,
    title:"下班打卡",
    code:0
  }
  if(data.workType == 1){
    goWork.time = data.workShift.match(timeReg);
    goWork.status = true;
    goWork.title = "上班打卡";
    goWork.code = 1;
  }
  else if(data.workType == 2){
    goWork.time = data.workShift.match(timeReg);
    goWork.status = false;
    goWork.title = "补登打卡",
    goWork.code = 2;
  }
  else if (data.workType == 3) {
    goWork.time = " 缺卡";
    goWork.status = false;
    goWork.title = "上班打卡";
    goWork.code = 3;
  }

  if(data.workType == 0){
    offWork.status = false;
    goWork.code = 0;
  }
  if(data.closingType == 1){
    offWork.time = data.closingTime.match(timeReg);
    offWork.status = true;
    offWork.title = "更新打卡";
    offWork.code = 1;
  }
  else if (data.closingType == 2){
    offWork.time = data.closingTime.match(timeReg);
    offWork.status = false;
    offWork.title = "补登打卡";
    offWork.code = 2
  }
  else if (data.closingType == 3){
    offWork.time = "--:--";
    offWork.status = false;
    offWork.title = "缺卡";
    offWork.code = 3;
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
  var defaultId = wx.getStorageSync("defaultTaskTeam");
  for(var i =0; i < ary.length; i++){
    
    if(ary[i].id == defaultId){
      ary[i].checked = true;
    }
    else{
      ary[i].checked = false;
    }
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
    // 整理时间格式
    for(var i = 0; i < dat.length; i++){
      var year = dat[i].createDate.split("T")[0];
      var date = dat[i].createDate.match(/T(\d|\:){1,20}\d{1,40}/)[0].split("T")[1];
      dat[i].createDate = year + " " + date;
      // 整理文件大小格式
      var style=["M","KB"];
      var num = dat[i].asize/(1024*1024);
      if(num > 0.1){
        dat[i].asize = (num + "").toString().substring(0,4) + "M"
      }
      else if(num < 0.1){
        dat[i].asize = (num*1024 + "").toString().substring(0,4) + "kb"
      }
    }
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
// 处理”我的“模块中请求的任务数据
var handleTask = function(res){
  var list = [];
  var ary = [];
  var dat = new Date();
  var year = dat.getFullYear();
  var month = dat.getMonth() + 1;
  var today = dat.getDate();
  if(month < 10){
    month =  "0" + "" + month;
  }
  if(today < 10){
    today = "0" + "" + today;
  }
  var today = Number(year + month + today);
  ary.sort(function(a,b){
    return compareTime(a,b);
  })
  if(res.data.code == 200 && res.data.result){
    ary = res.data.data.list;
    for(var i = 0; i < ary.length; i++){
      if(ary[i].endDate != null){
        var str = ary[i].endDate.split("T");
        str = str[0].split("-");
        ary[i].endTime = str.join("");
        if (Number(str.join("")) >= today){
          ary[i].isTimeOut = false;
        }
        else{
          ary[i].isTimeOut = true;
        }
        str = str[1] + "月" + str[2] + "日";
        ary[i].endDate = str;
        //list.unshift(ary[i])
      }
      else{
        //list.push(ary[i]);
      }
      list.push(ary[i]);
    }
  }
  return list;
}
// 时间比较
var compareTime = function(startTime, endTime) {
  var startTimes = startTime.substring(0, 10).split('-');
  var endTimes = endTime.substring(0, 10).split('-');
  startTime = startTimes[1] + '-' + startTimes[2] + '-' + startTimes[0] + ' ' + startTime.substring(10, 19);
  endTime = endTimes[1] + '-' + endTimes[2] + '-' + endTimes[0] + ' ' + endTime.substring(10, 19);
  var thisResult = (Date.parse(endTime) - Date.parse(startTime)) / 3600 / 1000;
  if (thisResult < 0) {
    return -1;
  } else if (thisResult > 0) {
    return 1
  } else if (thisResult == 0) {
    return 0;
  } else {
    return 0;
  }
}

var nowTime = function() {
  var d = new Date();
  var date = d.getDate();
  var month = d.getMonth() + 1;
  if (month < 10) {
    month = "" + 0 + month
  }
  if (date < 10) {
    date = "" + 0 + date;
  }
  var year = d.getFullYear();
  return year + "-" + month + "-" + date;
}

module.exports = {
  request,
  handleLogoinInfo,
  handleAttendance,
  getData,
  clearCompanyList,
  choosedCompany,
  cloudDiskDataClean,
  fileNameSort,
  handleTask,
  compareTime,
  sendCode,
  autoAddLogoinInfo,
  nowTime,
  sendDataByBody,
  customRequest
}