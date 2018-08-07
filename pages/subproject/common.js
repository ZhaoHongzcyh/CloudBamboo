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
      data:res.data.data[0].subList
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
var obj = {
  handleTask,
  handleFile
};
module.exports = obj;