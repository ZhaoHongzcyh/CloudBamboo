const app = getApp();
const api = require("../../api/common.js");
const util = require("../../utils/index/MD5.js");
Page({
  data:{
    switchMyselfLogoin:false,//登陆模式与任务模式切换
    app:app,
    headimg: null,
    url:{},//导航数据
    userinfo:{
      name:""
    },
    list:[],//待处理任务

    // -------------------------------------------------------------登录注册模块数据-----------------------------------------
    logoinState: true,//true:代表注册，false:渲染注册
    logoin:{
      phone:null,
      password:null
    },
    register: {
      phone: "",
      verification: "",
      password: ""
    },
    isClickLogoinBtn:false,//登录按钮是否可点击
    verificationBtnText:'获取验证码',
    readCondiction:true,//是否勾选服务协议
    countTime:60,//倒计时
    alertTitle:{state:0,title:null},
    msgCode:null,//短信验证码
    isShowRegisterPwd: false,//注册密码可见状态
    isShowlogoinPwd: false,//登录密码可见状态
    logoinCode:null,//小程序登陆code验证码
    opendid:null,//微信与协作绑定的凭证id
    share: false,//是否通过分享登录
    shareScene: {}//分享场景信息
  },


  onLoad:function(options){
    this.popup = this.selectComponent("#popup");
  },

  onShow: function (options) {
    this.getEntryInfo();
  },

  // 判断用户是通过哪一个通道进入系统
  getEntryInfo: function () {
    // return false;
    var sessionoverdue = app.globalData.sessionoverdue;
    // 判断用户是否通过分享进入
    if (!app.globalData.isByAppEntry) {
      // 判断session是否过期
      if (sessionoverdue){
        wx.setNavigationBarTitle({title:'云竹协作'});
        wx.hideTabBar({})
        this.setData({ switchMyselfLogoin: false });
        this.getLogoinCode();//验证用户是否绑定协作
      }
      else{
        wx.setNavigationBarTitle({ title: '我的' });
        this.popup = this.selectComponent("#popup");
        wx.showTabBar({});
        this.setData({ switchMyselfLogoin: true });
        this.getTask();

        // 避免因服务器维护造成小程序端登录界面出现异常
        if (!this.data.switchMyselfLogoin){
          wx.hideTabBar({})
        }
        else{
          wx.showTabBar({});
        }
      }
    }
  },

  // 请求链接分享的数据
  getShareData: function () {
    var address = app.ip + "tc/taskDepartmentService/dpmmInvite/" + app.globalData.Invitation.url;
    api.request({}, address, "post", true).then(res => {
      if (res.data.code == 200 && res.data.result) {
        this.setData({
          shareScene: res.data.data,
          share: true
        })
      }
    }).catch(e => {
      console.log(e);
    })
  },

  // 打开app下载弹框
  alert: function () {
    this.popup.showPopup();
  },

  // 请求用户详细信息
  getUserInfo:function(){
    var address = app.ip + "tw/userService/getUserInfo";
    api.request({},address,"post",true).then(res=>{
      if(res.data.code == 401 && !res.data.result){
        this.getLogoinCode();
      }
      else{
        var userinfo = {
          name: res.data.data.curUser.pname
        }
        this.setData({
          userinfo: userinfo
        })
      }
      wx.stopPullDownRefresh()
    })
  },
  // 请求任务
  getTask:function(){
    // 更新用户头像
    this.setData({
      headimg: app.ip + "tc/spaceService/showPersonIcon/" + wx.getStorageSync("tcUserId") + "/100/100"
    });
    var address = app.ip + "tc/schedule/itemService/findMyManageItemList";
    api.request({},address,"post",true).then(res=>{
      if(!res.data.result && res.data.code != 200){
        this.setData({ switchMyselfLogoin:false});
        this.getLogoinCode();
      }
      else{
        var list = api.handleTask(res);
        this.setData({
          list: list
        })
      }
      
      // 请求用户信息
      if(res.data.code == 200 && res.data.result){
        this.getUserInfo();
      }
    }).catch(e=>{
      console.log(e);
    })
  },

  // 下拉刷新
  onPullDownRefresh: function (e) {
    this.onShow();
    this.setData({
      headimg: app.ip + "tc/spaceService/showPersonIcon/" + wx.getStorageSync("tcUserId") + "/100/100"
    })
  },

  // 点击状态栏的弹框
  radioAlert:function(e){
    console.log(e);
  },

  // 进入任务详情页面
  entryTask: function (e) {
    var id = e.currentTarget.dataset.id;
    var powerid = e.currentTarget.dataset.taskid;
    wx.navigateTo({
      url: '/pages/taskDetails/taskdetails?taskId=' + id +  "&powerId=" + powerid,
    })
  },

  // 进入个人账号设置模块
  entryPersonalSet: function () {
    wx.navigateTo({
      url: './personalSet/personalSet',
    })
  },

  // ---------------------------------------登录注册模块---------------------------------------------

  // 登录与注册路由切换
  switchUrl: function (e) {
    var data = e.currentTarget.dataset.logoin;
    var logoinState = true;
    if(data != 1){
      logoinState = false;
    }
    this.setData({ logoinState})
  },

  // 获取用户登录信息
  getLogoInfo: function (e) {
    var role = e.currentTarget.dataset.role;
    var logoin = this.data.logoin;
    var value = e.detail.value;
    // 设置登录账号信息
    if(role == "user"){
      logoin.phone = value;
    }
    else{
      logoin.password = value;
    }
    this.setData({logoin});
    this.validatorLogoinInfo(logoin)
  },

  // 检查输入的登录信息是否合法
  validatorLogoinInfo: function (logoin) {
    var phoneReg = /^1\d{10}$/img;
    var pwdReg = /^[0-9a-zA-Z]{6,20}$/
    var validatorPhone = phoneReg.test(logoin.phone);
    var validatorPwd = pwdReg.test(logoin.password);
    var isClickLogoinBtn = false
    if (validatorPhone && validatorPwd){
      isClickLogoinBtn = true;
    }
    this.setData({isClickLogoinBtn})
  },

  // 获取用户注册的信息
  getRegisterInfo: function (e) {
    var register = this.data.register;
    var role = e.currentTarget.dataset.role;
    var value = e.detail.value;
    if (role == "phone"){
      register.phone = value;
    }
    else if (role == "verification"){
      register.verification = value;
    }
    else if (role == "password"){
      register.password = value;
    }
    this.setData({ register})
    this.validatorRegisterInfo()
  },

  // 检查输入的注册信息是否合法
  validatorRegisterInfo: function () {
    var register = this.data.register;
    var phoneReg = /^1\d{10}$/img;
    var verificationReg = /^\w{4,8}$/;
    var pwdReg = /^\[0-9a-zA-Z]{6,20}$/;
    var validatorPhone = phoneReg.test(register.phone);
    var validatorPwd = pwdReg.test(register.password);
    var validatorVerification = verificationReg.test(register.verification);
    var isClickRegisterBtn = false;
    if (validatorPhone && validatorPwd && validatorVerification && this.data.readCondiction) {
      isClickRegisterBtn = true;
    }
    this.setData({ isClickRegisterBtn})
  },

  // 切换勾选协议
  switchCondiction: function () {
    var readCondiction = !this.data.readCondiction;
    this.setData({ readCondiction})
    this.validatorRegisterInfo();
  },

  // 验证电话号码格式是否正确
  validatePhoneFormat: function (phone) {
    var phoneReg = /^1\d{10}$/img;
    return phoneReg.test(phone);
  },

  // 验证码倒计时
  countDown: function () {
    var countTime = this.data.countTime;
    this.setText();
    if(countTime < 0){
      this.setData({countTime:60})
    }
    else{
      setTimeout(() => {
        countTime = countTime - 1;
        this.setData({ countTime });
        this.countDown()
      }, 1000)
    }
  },

  // 提获取验证码按钮设置文字
  setText: function () {
    var countTime = this.data.countTime;
    var verificationBtnText = countTime + "s后重发";
    if(countTime < 0){
      verificationBtnText = '获取验证码';
    }
    this.setData({ verificationBtnText})
  },

  // 获取验证码请求
  getCode: function () {
    var register = this.data.register;
    var validator = this.validatePhoneFormat(register.phone);
    if (!validator){
      this.setData({alertTitle:{state:1,title:'手机号格式错误'}})
      this.layOutHideAlert(1800)
    }
    else{
      if(this.data.countTime != 60){
        return false;
      }
      else{
        this.sendGetCodeRequest();
      }
    }
  },

  // 发起验证码请求
  sendGetCodeRequest: function () {
    var address = app.ip + "neteasy/sms/sendCode";
    var phone = this.data.register.phone;
    var obj = {
      mobile: phone,
      typeFlag: 100
    };
    api.request(obj, address, "POST", true).then(res => {
      if (res.statusCode == 200 && res.data.result) {
        this.setData({ msgCode: res.data.data})
        this.countDown();
      }
      else{
        if(res.data.message == "" || res.data.message == undefined){
          res.data.message == '验证码获取失败,稍后再试'
        }
        this.setData({alertTitle:{state:1,title:res.data.message}});
        this.layOutHideAlert(1800);
      }
    }).catch(e=>{
      this.setData({ alertTitle: { state: 1, title: '网络错误,稍后再试' } });
      this.layOutHideAlert(1800);
    })
  },

  // 核对注册信息是否完整
  checkRegisterInfo: function () {
    var isClickRegisterBtn = this.data.isClickRegisterBtn;
    var register = this.data.register;
    if (!isClickRegisterBtn){
      this.setData({alertTitle:{state:1,title:'检查注册信息是否正确'}});
      this.layOutHideAlert(1800);
    }
    else if (this.data.msgCode != register.verification){
      this.setData({ alertTitle: { state: 1, title: '验证码错误' } });
      this.layOutHideAlert(1800);
    }
    else{
      this.sendRegisterReq();
    }
  },

  // 发起注册请求
  sendRegisterReq: function () {
    this.setData({alertTitle:{state:2,title:'注册中...'}})
    var address = app.ip + "tw/userService/regist";
    var register = this.data.register;
    var obj = {
      userName: register.phone,
      password: util.hexMD5(register.password),
      valiCode: register.verification,
      "Equipment-Type": 4
    }
    api.request(obj, address, "post", true).then(res => {
      this.setData({ alertTitle: { state: 1, title: res.data.message } })
      this.layOutHideAlert(1800);
    }).catch(e=>{
      this.setData({ alertTitle: { state: 1, title: '网络异常!' } })
      this.layOutHideAlert(1800);
    })
  },

  // 阅读协议
  readAgreement: function () {
    wx.navigateTo({
      url: '/pages/Agreement/Agreement?state=1',
    })
  },

  // 隐藏弹框
  hideAlert: function () {
    var alertTitle = this.data.alertTitle;
    alertTitle.state = 0;
    this.setData({ alertTitle})
  },

  // 多少毫秒之后隐藏弹框
  layOutHideAlert: function (time) {
    setTimeout(()=>{
      this.hideAlert();
    },time)
  },

  // 切换注册密码可见状态
  switchRegisterPwdState: function () {
    this.setData({ isShowRegisterPwd: !this.data.isShowRegisterPwd})
  },

  // 切换登录密码可见状态
  switchLogoinPwdState: function () {
    this.setData({ isShowlogoinPwd: !this.data.isShowlogoinPwd})
  },

  // 登录系统
  logoinSystem: function () {
    if (!this.data.isClickLogoinBtn){
      this.setData({alertTitle:{state:1,title:'登录信息错误'}});
      this.layOutHideAlert(1800);
    }
    else{
      this.setData({ alertTitle: { state: 2, title: '登录中. . . ' } });
      var obj = {
        userName: this.data.logoin.phone,
        password: util.hexMD5(this.data.logoin.password),
        "Equipment-Type": 4
      }
      if (this.data.opendid != null) {
        obj.opendId = this.data.opendid;
      }
      var address = app.ip + "tw/userService/login";
      api.request(obj, address, "post", true).then(res => {
        this.handlelogoin(res);
      }).catch(e=>{
        this.setData({ alertTitle: { state: 1, title: '网络异常，登录失败' } });
        this.layOutHideAlert(1800);
      })
    }
  },

  // 处理登陆返回的信息
  handlelogoin: function (res){
    var handleInfo = api.handleLogoinInfo(res);
    var logoin = this.data.logoin;
    if (handleInfo.code == '200') {
      // 储存用户的登录信息
      wx.setStorageSync("userName", logoin.phone);
      wx.setStorageSync("password", logoin.password);
      wx.switchTab({
          url: '/pages/company/company',
        })
      this.setData({ switchMyselfLogoin: true})
      wx.showTabBar({})
    }
    else{
      if(res.data.message == "" || res.data.message == undefined){
        res.data.message = '登录失败!';
      }
      this.setData({alertTitle:{state:1,title:res.data.message}})
    }
    this.layOutHideAlert(1800);
  },

  // 获取小程序登陆code(通过code登陆协作)
  getLogoinCode: function () {
    wx.login({
      success: (res) => {
        this.setData({
          logoinCode: res.code
        })
        this.validateCode(res.code);
        wx.stopPullDownRefresh();//关闭下拉刷新
      },
      fail: (e) => {
        wx.stopPullDownRefresh();//关闭下拉刷新
      }
    })
  },

  // 
  validateCode: function (logoinCode) {
    var address = app.ip + "tc/weChat/authorizationCode/" + logoinCode;
    var obj = { code: logoinCode };
    // 判断用户是否通过App链接邀请进入
    if (app.globalData.isByAppEntry) {
      obj = Object.assign({}, obj, app.globalData.Invitation);
    }
    api.sendCode(obj, address, "get").then(res => {
      var handleInfo = api.handleLogoinInfo(res);
      if (handleInfo.code == '200') {
        this.setData({ switchMyselfLogoin: true })
        wx.showTabBar({})
        wx.switchTab({
          url: '/pages/company/company',
        })
      }
      else {
        this.setData({
          opendid: res.data.data.openid
        })
      }
    }).catch((e) => {
      this.setData({ switchMyselfLogoin: false})
    });
  },

  // 进入个人资料详情
  entryUserCenter: function () {
    wx.navigateTo({
      url: './personalInfo/userinfo',
    })
  }
})