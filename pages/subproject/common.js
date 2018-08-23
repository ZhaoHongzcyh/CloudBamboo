// 处理任务数据
var handleTask = function (res) {
  if(res.data.code == 200 && res.data.result){
    
    return {
      status:true,
      task:res.data.data.list
    }
  }
  else if(res.data.code != ""){
    return {
      status: false,
      msg:res.data.message
    }
  }
  else{
    return {
      status: false,
      msg:"任务数据加载失败！"
    }
  }
}

// 处理项目文档数据
var handleFile = function (res) {
  if(res.data.code == 200 && res.data.result){
    return {
      status: true,
      // data:res.data.data[0].subList
      data:res.data.data.list
    }
  }
  else if(res.data.message != ""){
    return {
      status:false,
      msg:res.data.message
    }
  }
  else{
    return {
      status:false,
      msg:"数据加载失败！"
    }
  }
}

// 处理返回的文件列表数据
var fileList = function (app,api,file) {
  file = api.cloudDiskDataClean(file);
  file = api.fileNameSort(file);
  file.map((item, index) => {
    item.select = false;
  })
  // 文件路径拼接
  for (var i = 0; i < file.length; i++) {
    if (file[i].atype == 7) {
      file[i].src = app.ip + "tc/spaceService/downloadFileBatchUnlimitGet?arcIds=" + file[i].id;
    }
    else if (file[i].atype != 0) {
      file[i].src = app.ip + "tc/spaceService/downloadFileBatchUnlimitGet?arcIds=" + file[i].id;
    }
    else {
      file[i].src = null
    }
  }
  return file;
}
// 处理新添加文件夹之后返回的数据
var addFolder = function (app,api,obj){
  obj = [obj];
  var file = api.cloudDiskDataClean(obj);
  file = api.fileNameSort(file);
  file.map((item, index) => {
    item.select = false;
  })
  // 文件路径拼接
  for (var i = 0; i < file.length; i++) {
    if (file[i].atype == 7) {
      file[i].src = app.ip + "tc/spaceService/downloadFileBatchUnlimitGet?arcIds=" + file[i].id;
    }
    else if (file[i].atype != 0) {
      file[i].src = app.ip + "tc/spaceService/downloadFileBatchUnlimitGet?arcIds=" + file[i].id;
    }
    else {
      file[i].src = null
    }
  }
  return file;
}

var obj = {
  handleTask,
  handleFile,
  addFolder,
  fileList
};
module.exports = obj;