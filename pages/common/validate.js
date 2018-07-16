// 手机号验证
function validatorPhone(phone){
  var reg = /^1\d{10}$/img;
  if(reg.test(phone)){
    return true;
  }
  else{
    return false;
  }
}