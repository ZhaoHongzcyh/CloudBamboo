//index.js
//获取应用实例
const app = getApp()
const util = require("./MD5.js");
const api = require("../../api/common.js");
Page({
  data: {
    VerificatResult:false,//小程序code验证结果
    url:{},
    logoinCode:null,//微信登录code
    logoinState:true,//true:代表注册，false:渲染注册
    dataRole:1,//1:登录界面，0：注册界面
    registerAlert:{
      state:0,
      content:""
    },//0：默认，1:验证码获取失败弹框，2：注册失败弹框
    logoinAlert:{
      state:0,
      content:""
    },
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
    verification:"",//返回的验证码
    isShowlogoinPwd:false,//登陆密码是否可见
    isShowRegisterPwd:false,//注册密码是否可见
    isClickLogoinBtn:false,//登录按钮是否可点击
    isClickRegisterBtn:false,//注册按钮是否可点击
    countTime: 60,//倒计时间隔
    verificationBtnText:'获取验证码',//验证码按钮文字
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad:function(){
    //获得popup组件
    this.popup = this.selectComponent("#popup");
    this.getLogoinCode();
    
  },
  codeError:function(){
    this.autoAddLogoin();
    this.setData({
      VerificatResult:true
    })
  },
  // 自动填写登录信息
  autoAddLogoin:function(){
    var info = api.autoAddLogoinInfo();
    
    if(info != false){
      this.setData({
        logoin:info,
        isClickLogoinBtn:true,
        logoinPlaceholder: {
          phone: false,
          password: false
        }
      })
      console.log(this.data.logoin)
    }
  },
  // 下拉刷新
  onPullDownRefresh:function () {
    console.log("测试")
    this.getLogoinCode();
  },
  // 获取登录code
  getLogoinCode:function(){
    console.log("获取")
    wx.login({
      success:(res)=>{
        console.log(res);
        this.setData({
          logoinCode:res.code
        })
        this.validateCode(res.code);
        wx.stopPullDownRefresh();//关闭下拉刷新
      },
      fail:(e)=>{
        console.log(e);
        wx.stopPullDownRefresh();//关闭下拉刷新
      }
    })
  },
  // 发送code
  validateCode:function(logoinCode){
    var address = app.ip + "tc/weChat/authorizationCode/" + logoinCode;
    var obj = {code:logoinCode};
    console.log(logoinCode);
    console.log(address);
    api.sendCode(obj,address,"get").then(res=>{
      console.log("code验证信息")
      console.log(res);
      var handleInfo = api.handleLogoinInfo(res);
      if (handleInfo.code == '200') {
        wx.redirectTo({
          url: '/pages/company/company'
        })
      }
      else {
        console.log("code验证失败")
        this.codeError();
      }
    }).catch((e)=>{
      console.log("code 验证异常")
        this.codeError();
    });

  },
  // 弹框
  alert:function(){
    this.popup.showPopup()
  },
  //登录/注册路由切换
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
      logoin:{},
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

  // 获取并储存登录信息
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
    this.validatorLogoinInfo(this.data.logoin);
  },

  // 验证码倒计时
  getVerificationCode:function(){
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

  // 切换登录密码可见状态
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

  // 获取并存储用户注册信息
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

  // 验证用户登录信息格式，是否合法，以此改变登录按钮样式
  validatorLogoinInfo:function(info){
    console.log(info);
    var phoneReg = /^1\d{10}$/img;
    var pwdReg = /^\w{6,20}$/
    var validatorPhone = phoneReg.test(info.phone);
    var validatorPwd = false;
    if(!info.password){
      validatorPwd = false;
    }
    else{
      var validatorPwd = pwdReg.test(info.password);
    }
    
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

  // 验证用户注册信息格式是否合法，以此改变注册按钮样式
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
  },

  // 发起登录请求
  userLogoin:function(){
    var obj = {
      userName:this.data.logoin.phone,
      password:util.hexMD5(this.data.logoin.password)
    }
    console.log(obj);
    if (this.data.isClickLogoinBtn){
      this.setData({
        isLogoing: false,
        logoinAlert: {
          state: 0,
          content: "登录中..."
        }
      })
      var address = app.ip + "tw/userService/login";
      api.request(obj,address,"post",true).then(res=>{
        console.log("登录成功")
        console.log(res);
        var handleInfo = api.handleLogoinInfo(res);
        if (handleInfo.code == '200'){
          // 储存用户的登录信息
          wx.setStorageSync("userName",obj.userName);
          wx.setStorageSync("password", this.data.logoin.password);
          
          wx.reLaunch({
            url: '/pages/company/company'
          })
        }
        else{
          var logoin = this.data.logoin
          this.setData({
            logoinAlert:{
              state:1,
              content:handleInfo.msg
            },
            logoinPlaceholder: {
              phone: false,
              password: false
            },
            logoin:{},
            isLogoing:true
          })
          setTimeout(() => {
            this.setData({
              logoinAlert: {
                state: 0,
                content: ""
              },
              logoinPlaceholder:{
                phone:true,
                password:true
              },
              isClickLogoinBtn:false
            })
            console.log(this.data.logoin)
          }, 2000)
        }
      }).catch(e=>{
        console.log(e);
        this.setData({
          logoinAlert:{
           state:0,
           content:"登录失败..."
         }
        })
        setTimeout(()=>{
          this.setData({
            isLogoing:true
          })
        },2000)
      })
    }
  },

  // 发起注册请求
  userRegister:function(){
    if (!this.data.isClickRegisterBtn){
      return false;
    }
    var register = this.data.register;
    var obj = {
      userName:register.phone,
      password:util.hexMD5(register.password),
      valiCode: register.verification
    }
    this.setData({
      registerAlert: {
        state: 1,
        content: "注册中..."
      }
    })
    var address = app.ip + "tw/userService/regist";
    console.log(obj);
    api.request(obj, address, "post", false).then(res => {
      console.log(res);
      this.setData({
        registerAlert: {
          state: 1,
          content: res.data.message
        }
      })
    }).catch(e=>{
      this.setData({
        registerAlert: {
          state: 1,
          content: "注册失败..."
        }
      })
    })
  },

  // 隐藏注册弹框
  hideAlert:function(){
    this.setData({
      registerAlert: {
        state: 0,
        content: ""
      }
    })
  },
  // 发起验证码请求
  getCode:function(){
    var phone = this.data.register.phone;
    var phoneReg = /^1\d{10}$/img;
    console.log(phone);
    if(!phoneReg.test(phone)){
      return false;
    }
    var obj = {
      mobile: phone,
      typeFlag: 100
    }
    if(this.data.countTime < 60 || obj.phone){
      return false;
    }
    else{
      console.log(obj)
      var address = app.ip + "neteasy/sms/sendCode";
      api.request(obj, address, "post", true).then(res => {
        console.log(res);
        if(res.statusCode == 200 && res.data.code != 101){
          this.setData({
            verification:res.data
          })
        }
        else{
          this.setData({
            registerAlert:{
              state:1,
              content:res.data.message
            }
          })
          setTimeout(()=>{
            this.setData({
              registerAlert: {
                state: 0,
                content: ""
              },
              countTime:1
            })
          },1500)
        }
      })
    }
    this.getVerificationCode();
  },
  pageJump: function (e) {
    var index = e.currentTarget.dataset.index;
    var url = e.currentTarget.dataset.url;
    app.editTabBar(index);
    wx.redirectTo({
      url: url,
    })
  }
})
