//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    logoinState:true,//true:代表注册，false:渲染注册
    dataRole:1,//1:登录界面，0：注册界面
    isLogoing:true,//是否正在登录中
    logoinPlaceholder:{
      phone:true,
      password:true
    },
    registerPlaceholder:{
      phone:true,
      verification:true,
      password:true
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
    isShowlogoinPwd:false,//登陆密码是否可见
    isShowRegisterPwd:false,//注册密码是否可见
    isClickLogoinBtn:false,//登录按钮是否可点击
    isClickRegisterBtn:false,//注册按钮是否可点击
    countTime: 60,//倒计时间隔
    verificationBtnText:'获取验证码',//验证码按钮文字
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onReady: function () {
    //获得popup组件
    this.popup = this.selectComponent("#popup");
  },
  alert:function(){
    this.popup.showPopup()
  },
  //登录/注册 切换
  switchUrl:function(event){
    var role = event.currentTarget.dataset.logoin;
    // 重置密码可见状态
    if(role == this.data.dataRole){
      return false;
    }
    else{
      this.setData({
        dataRole:role,
        isClickLogoinBtn:false,
        isClickRegisterBtn:false
      })
    }

    // 重置表单数据
    var condiction = true;
    if(role != 1){
      condiction = false
    }
    this.setData({
      logoinState:condiction,
      logoinPlaceholder: {
        phone: true,
        password: true
      },
      registerPlaceholder: {
        phone: true,
        verification: true,
        password: true
      },
      register: {
        phone: "",
        verification: "",
        password: ""
      },
      isShowlogoinPwd: false,
      isShowRegisterPwd: false
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
            password: this.data.logoinPlaceholder.password
          },
        })
      }
      else{
        this.setData({
          logoinPlaceholder: {
            phone: true,
            password: this.data.logoinPlaceholder.password
          },
        })
      }
    }
    else{
      this.setData({
        logoinPlaceholder: {
          phone: this.data.logoinPlaceholder.phone,
          password: false
        },
      })
    }
  },
  // 获取登录信息
  getLogoInfo:function(event){
    var role = event.currentTarget.dataset.role;
    var logoin = this.data.logoin;
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
    this.setData({
      logoin:logoin
    })
    this.validatorLogoinInfo(logoin);
  },
  // 获取验证码请求
  getVerificationCode:function(){
    console.log(123);
    var that = this;
    that.setData({
      verificationBtnText: this.data.countTime - 1 + "s后重发",
      countTime:this.data.countTime - 1
    });
    if(that.data.countTime == 0){
      that.setData({
        countTime:60,
        verificationBtnText:"获取验证码"
      });
      return false;
    }
    setTimeout(function(){
      that.getVerificationCode()
    },1000)
  },
  // 切换登陆密码可见状态
  switchPwdState:function(e){
    var role = e.currentTarget.dataset.role;
    if(role == "logoin"){
      this.setData({
        isShowlogoinPwd:!this.data.isShowlogoinPwd
      })
    }
    else{
      this.setData({
        isShowRegisterPwd: !this.data.isShowRegisterPwd
      })
    }
  },
  // 获取用户注册信息
  getRegisterInfo:function(e){
    var role = e.currentTarget.dataset.role;
    var register = this.data.register;
    var registerPlaceholder = this.data.registerPlaceholder;
    if(role == "phone"){
      register.phone = e.detail.value;
      if(register.phone.length != 0){
        this.setData({
          registerPlaceholder:{
            phone:false,
            verification: this.data.registerPlaceholder.verification,
            password: this.data.registerPlaceholder.password
          }
        })
      }
      else{
        this.setData({
          registerPlaceholder: {
            phone: true,
            verification: this.data.registerPlaceholder.verification,
            password: this.data.registerPlaceholder.password
          }
        })
      }
    }
    else if (role == "verification"){
      register.verification = e.detail.value;
      if (register.verification.length != 0) {
        this.setData({
          registerPlaceholder: {
            phone: this.data.registerPlaceholder.phone,
            verification: false,
            password: this.data.registerPlaceholder.password
          }
        })
      }
      else {
        this.setData({
          registerPlaceholder: {
            phone: this.data.registerPlaceholder.phone,
            verification: true,
            password: this.data.registerPlaceholder.password
          }
        })
      }
    }
    else{
      register.password = e.detail.value;
      if (register.password.length != 0) {
        this.setData({
          registerPlaceholder: {
            phone: this.data.registerPlaceholder.phone,
            verification: this.data.registerPlaceholder.verification,
            password: false
          }
        })
      }
      else {
        this.setData({
          registerPlaceholder: {
            phone: this.data.registerPlaceholder.phone,
            verification: this.data.registerPlaceholder.verification,
            password: true
          }
        })
      }
    }
    this.setData({
      register:register
    });
    this.validatorRegisterInfo(register);
  },
  // 验证用户登录信息格式，是否合法，以此改变按钮样式
  validatorLogoinInfo:function(info){
    var phoneReg = /^1\d{10}$/img;
    var pwdReg = /^\w{6,20}$/
    var validatorPhone = phoneReg.test(info.phone);
    var validatorPwd = pwdReg.test(info.password);
    if (validatorPhone && validatorPwd){
        console.log(true)
        this.setData({
          isClickLogoinBtn:true
        })
    }
    else{
      this.setData({
        isClickLogoinBtn: false
      })
    }
  },
  // 验证用户注册信息格式是否合法，以此改变按钮样式
  validatorRegisterInfo:function(info){
    var phoneReg = /^1\d{10}$/img;
    var verificationReg = /^\w{2,8}$/;
    var pwdReg = /^\w{6,20}$/;
    var validatorPhone = phoneReg.test(info.phone);
    var validatorPwd = pwdReg.test(info.password);
    var validatorVerification = verificationReg.test(info.verification);
    if (validatorPhone && validatorPwd && validatorVerification){
      this.setData({
        isClickRegisterBtn:true
      })
    }
    else{
      this.setData({
        isClickRegisterBtn:false
      })
    }
  }
})
