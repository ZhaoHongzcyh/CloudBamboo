// pages/index/editUser/editUser.js
const app = getApp();
const api = require("../../../api/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    app:app,
    selfHead:null,
    userinfo: null,
    state:false,//函数防抖状态
    alert:{},
    sex:null,//性别
    showSexModel:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getUserInfo();

    // 获取弹框节点
    this.popup = this.selectComponent("#popup");
  },

  // 弹框
  alert: function () {
    this.popup.showPopup()
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.onShow();
  },

  // 获取用户详细信息
  getUserInfo: function () {
    var address = app.ip + "tw/userService/getUserInfo";
    api.request({}, address, "POST", true).then(res => {
      wx.stopPullDownRefresh();
      if (res.data.code == 200 && res.data.result) {
        var selfHead = app.ip + 'tc/spaceService/showPersonIcon/' + res.data.data.curUser.id + '/100/100'
        var sex = res.data.data.curUser.sex == null ? null : res.data.data.curUser.sex;
        this.setData({ userinfo: res.data.data.curUser, selfHead, sex })
      }
      else{
        this.setAlert(res.data.message);
      }
    }).catch(e => {
      this.setAlert("无法获取个人资料");
    })
  },

  // 更换头像
  changePhoto: function () {
    wx.chooseImage({
      count:1,
      success:(res)=>{
        const tempFilePaths = res.tempFilePaths;
        if (tempFilePaths.length > 0){
          this.upHead(tempFilePaths[0]);
        }
      }
    })
  },

  // 上传头像
  upHead: function (src) {
    var address = app.ip + 'tc/spaceService/uploadFile';//"tw/itOrgManagerService/updateOrgPersonBeanByPid";
    
    var token = wx.getStorageSync('proxyUserToken');
    wx.uploadFile({
      url: address,
      filePath: src,
      header: {
        "content-type": "multipart/form-data",
        proxyUserToken: token
      },
      name:"userphoto",
      success:(res)=>{
        if(res.statusCode == 200){
          res = JSON.parse(res.data);
          if(res.result && res.code == 200){
            var selfId = res.data[0].id;
            this.upTempFile(selfId, src)
          }
        }
        else{
          this.setAlert('头像更改失败');
        }
      },
      fail:(e)=>{
        console.log(e);
        this.setAlert('头像更改失败');
      }
    })
  },

  // 上传临时文件
  upTempFile: function (id, newsrc) {
    var address = app.ip + "tc/spaceService/formalFile";
    var head = {};
    var fileIds = [id]
    api.customRequest(head, fileIds,address,"POST",true).then(res=>{
      if(res.data.code == 200 && res.data.result){
        this.saveFile(id,newsrc)
      }
      else{
        this.setAlert('头像更改失败');
      }
    })
  },

  // 保存文件
  saveFile: function (id, newsrc) {
    var userid = wx.getStorageSync('tcUserId');
    var address = app.ip + "tw/itOrgManagerService/updateOrgPersonBeanByPid";
    var userinfo = this.data.userinfo;
    var obj = { pname: encodeURI(this.data.userinfo.pname), pid: userid, picon:id}
    api.request(obj,address,"POST",true).then(res=>{
      if(res.data.code == 200 && res.data.result){
        userinfo.picon = id;
        this.setData({
          selfHead: newsrc,
          userinfo: userinfo
        })
      }
      else{
        this.setAlert('头像更改失败');
      }
    });
  },

  // 函数防抖，防止多次执行setData影响性能
  debounce: function (e) {
    var eva = e.currentTarget.dataset.eval;
    var value = e.detail.value;
      clearTimeout(this.data.state);
      var state = setTimeout(()=>{
        state = false;
        this[eva](value);
      },500);
      this.setData({state})
  },

  // 修改昵称
  changeNickName: function (nick) {
    var userinfo = this.data.userinfo;
    if(nick !== null){
      userinfo.pname = nick;
      this.setData({userinfo})
    }
  },

  // 修改职业
  changeWork: function (work) {
    var userinfo = this.data.userinfo;
    if (work !== null) {
      userinfo.occupationName = work;
      this.setData({ userinfo })
    }
  },

  // 修改邮箱
  changeEmail: function (email) {
    var userinfo = this.data.userinfo;
    if (email !== null) {
      userinfo.email1 = email;
      this.setData({ userinfo })
    }
  },

  // 修改座机
  changePhone2: function (phone) {
    var userinfo = this.data.userinfo;
    if (phone !== null && phone !== "") {
      userinfo.phone2 = phone;
      this.setData({ userinfo })
    }
  },

  // 修改手机
  changePhone: function (phone) {
    var userinfo = this.data.userinfo;
    if (phone !== null && phone !== "") {
      userinfo.username = phone;
      this.setData({ userinfo })
    }
  },

  // 保存用户信息
  saveUserInfo: function () {
    var userid = wx.getStorageSync('tcUserId');
    var address = app.ip + "tw/itOrgManagerService/updateOrgPersonBeanByPid";
    var userinfo = JSON.stringify(this.data.userinfo);
    userinfo = JSON.parse(userinfo);
    var obj = {
      pid: userid,
      pname: encodeURI(userinfo.pname),
      picon:userinfo.picon,
      sex:userinfo.sex,
      phone:userinfo.username,
      occupation: encodeURI(userinfo.occupationName),
      email: userinfo.email1,
      offcePhone:userinfo.phone2
    }
    for(var key in obj){
      if(obj[key] == null || obj[key] == "null" || obj[key]== ""){
        delete obj[key];
      }
    }
    if(obj.email != undefined) {
      if (!this.checkEmail(obj.email)){
        obj.email = obj.email.replace(/\s+/g, "");
        if (obj.email == ""){
          delete obj.email;
        }
        else{
          this.setAlert('无效的email地址');
          return false;
        }
      }
    }
    api.request(obj,address,"POST",true).then(res=>{
      if(res.data.code == 200 && res.data.result){
        this.setAlert('保存成功');
      }
      else{
        this.setAlert('保存失败');
      }
    }).catch(e=>{
      this.setAlert('保存失败');
    })
  },

  // 设置alert的内容
  setAlert:function (txt) {
    this.setData({alert:{content:txt}});
    this.alert();
  },

  // 邮箱验证
 checkEmail: function(str){
  var re = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/
    if(re.test(str)){
      return true;
    }else {
      return false;
    }
  },

  // 选择性别
  chooseSex: function (e) {
    var sex = e.currentTarget.dataset.sex;
    this.setData({sex})
  },

  // 模态框的隐藏与显示的切换
  switchModel: function () {
    this.setData({ showSexModel: !this.data.showSexModel})
  },

  // 确定选择性别
  sureChooseSex: function () {
    this.switchModel();
    var userinfo = this.data.userinfo;
    userinfo.sex = this.data.sex;
    this.setData({userinfo});
  }
})