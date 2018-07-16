//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    logoin:true,//true:代表注册，false:渲染注册
    logoinPlaceholder:{
      phone:true,
      password:true
    },
    registerPlaceholder:{

    },
    logoin:{
      phone:"",
      password:""
    },
    register:{
      phone:"",
      verification:"",
      password:""
    },
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //登录/注册 切换
  switchUrl:function(event){
    var role = event.currentTarget.dataset.logoin;
    var condiction = true;
    if(role != 1){
      condiction = false
    }
    this.setData({
      logoin:condiction,
      logoinPlaceholder: {
        phone: true,
        password: true
      },
    })
  },
  // 验证码倒计时
  VerificationTime:function(){

  },
  // 登录模块实现placeholder效果
  inputLogoin:function(event){
    var role = event.currentTarget.dataset.role;
    if(role == "user"){
      if(this.data.logoin.phone.length != 0){
        this.setData({
          logoinPlaceholder: {
            phone: false,
            password: true
          },
        })
      }
    }
    else{
      this.setData({
        logoinPlaceholder: {
          phone: true,
          password: false
        },
      })
    }
  },
  // 获取登录信息
  getLogoInfo:function(event){
    var role = event.currentTarget.dataset.role;
    var logoin = {
          phone: "",
          password: ""
      };
    var logoinPlaceholder = this.data.logoinPlaceholder; 
    if(role == "user"){
      logoin.phone = event.detail.value;
      if(logoin.phone.length > 0){
        this.setData({
          logoinPlaceholder: {
            phone: false,
            password: logoinPlaceholder.password
          },
        })
      }
      else{
        this.setData({
          logoinPlaceholder: {
            phone: true,
            password: logoinPlaceholder.password
          },
        })
      }
    }
    else{
      logoin.password = event.detail.value;
      if(logoin.password.length > 0){
        this.setData({
            logoinPlaceholder: {
              phone: logoinPlaceholder.phone,
              password: false
            }
        })
      }
      else{
        this.setData({
          logoinPlaceholder: {
            phone: logoinPlaceholder.phone,
            password: true
          }
        })
      }
    }
    console.log(logoin);
    this.setData({
      logoin:logoin
    })
  },
  // 获取验证码请求
  getVerificationCode:function(){

  }
})
