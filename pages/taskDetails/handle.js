var handleChild = function (res) {
  if(res.data.code == 200 && res.data.result){
    return {
      status:true,
      data:res.data.data
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
      msg:"加载失败"
    }
  }
}

var obj = {
  handleChild
}

module.exports = obj;