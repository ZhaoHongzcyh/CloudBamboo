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
    userinfo: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getUserInfo();
  },

  // 获取用户详细信息
  getUserInfo: function () {
    var address = app.ip + "tw/userService/getUserInfo";
    api.request({}, address, "POST", true).then(res => {
      console.log("用户信息");
      console.log(res);
      if (res.data.code == 200 && res.data.result) {
        var selfHead = app.ip + 'tc/spaceService/showPersonIcon/' + res.data.data.curUser.id + '/100/100'
        this.setData({ userinfo: res.data.data.curUser, selfHead })
      }
    }).catch(e => {
      console.log("用户信息异常")
    })
  },

  // 更换头像
  changePhoto: function () {
    wx.chooseImage({
      count:1,
      success:(res)=>{
        const tempFilePaths = res.tempFilePaths;
        if (tempFilePaths.length > 0){
          this.setData({
            selfHead: tempFilePaths[0]
          })
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
        proxyUserToken: token,
        // picon: this.data.selfHead,
        // pname: encodeURI(this.data.userinfo.pname)
      },
      name:"userphoto",
      success:(res)=>{
        console.log(res);
        if(res.statusCode == 200){
          res = JSON.parse(res.data);
          if(res.result && res.code == 200){
            console.log(res);
            var selfId = res.data[0].id;
            this.upTempFile(selfId)
          }
        }
      },
      fail:(e)=>{
        console.log(e);
      }
    })
  },

  // 更改头像
  changeHeadImg: function (id) {
    var address = app.ip + "tw/itOrgManagerService/updateOrgPersonBeanByPid";
    var obj = { picon: id, pname: encodeURI(this.data.userinfo.pname)};
    api.request(obj,address,"POST",true).then(res=>{
      console.log("绑定结果");
      console.log(res);
    })
  },

  // 上传临时文件
  upTempFile: function (id) {
    var address = app.ip + "tc/spaceService/formalFile";
    var head = {};
    var fileIds = [id]
    api.customRequest(head, fileIds,address,"POST",true).then(res=>{
      console.log("临时");
      console.log(res);
      this.saveFile(id)
    })
  },

  // 保存文件
  saveFile: function (id) {
    var address = app.ip + "tw/itOrgManagerService/updateOrgPersonBeanByPid";
    var obj = {pname:encodeURI(this.data.userinfo.pname)}
    api.request(obj,address,"POST",true).then(res=>{
      
      console.log("保存结果");
      console.log(res);
    });
  }
})