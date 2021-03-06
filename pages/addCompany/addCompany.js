const app = getApp();
const api = require("../../api/common.js");
Page({
  data:{
    info:{
      state:0,
      content:""
    },
    isShowTextPlaceholder:true,
    companyName:"",
    memberList:[],//公司成员
    industry:null,//公司所在行业
    region:[],//公司所在地址
    multiArray:[],
    cityNum:0,//默认城市数组序号
    isShowAddress: false,//是否显示城市地址选择器
    province:null,//选择的省份信息
    city:null,//选择的城市信息
    isAddingCompany: false
  },
  onLoad:function(){
    // 弹框
    this.popup = this.selectComponent("#company-popup");
    this.initCompanyMember();
    this.getAddress();
  },

  // 初始化加载用户头像与公司成员
  initCompanyMember: function () {
    var obj = {
      id: wx.getStorageSync("tcUserId"),
      item: null,
      name: "我",
      role: 1,//1:管理员，0：普通用户
      head: app.ip + "tc/spaceService/showPersonIcon/" + wx.getStorageSync("tcUserId") + "/100/100"//头像路径
    };
    var memberList = [];
    memberList.push(obj);
    this.setData({ memberList});
  },

  // 弹框
  alert: function () {
    this.popup.showPopup()
  },

  // 隐藏输入框提示信息
  hidePlaceholder:function(){
    this.setData({
      isShowTextPlaceholder:false
    })
  },

  // 显示输入框提示信息
  showPlaceholder:function(){
    if(this.data.companyName.length == 0){
      this.setData({
        isShowTextPlaceholder:true
      })
    }
  },

  getinput:function(e){
    this.setData({
      companyName:e.detail.value
    })
  },

  // 删除成员
  delete:function(e){
    var index = e.currentTarget.dataset.index;
    var memberList = this.data.memberList;
    memberList.splice(index,1);
    this.setData({
      memberList:memberList
    })
  },

  // 添加团队
  addCompany:function(){
    if (this.data.isAddingCompany){
      return false;
    }
    else{
      this.setData({
        isAddingCompany: true
      })
    }
    var address = app.ip + "tc/taskTeamService/addTaskTeam";
    var province = this.data.province;
    var memberList = this.data.memberList;
    var obj = {
      title: encodeURI(this.data.companyName)
    }
    
    if (this.checkProvinceCity()){
      obj.locationProvince = this.data.province.code;
      obj.industryCode = this.data.industry.code;
      if (this.data.city == null) {
        if (province.name == "澳门特别行政区" || province.name == "香港特别行政区" || province.name == "台湾省") {

        }
        else {
          this.setData({ isAddingCompany: false})
          this.customAlert("请核对公司地址",2000);
          return false;
        }
      }
      else{
        obj.locationCity = this.data.city.code;
      }
    }
    else{
      this.setData({ isAddingCompany: false })
      return false;
    }

    // 收集成员id
    var participant = [];
    memberList.map((item,index)=>{
      participant.push(item.id);
    })

    api.customRequest(obj,participant,address,"POST",true).then(res=>{
      this.setData({
        isAddingCompany: false
      })
      if(res.data.code == 200 && res.data.result){
        wx.setStorageSync("defaultTaskTeam", res.data.data.id);
        wx.switchTab({
          url: '/pages/company/company',
        })
      }
      else{
        if(res.data.code == 419){
          this.customAlert(res.data.message,2000);
        }
        else if(res.data.code == 414){
          this.customAlert("公司名称无法为空",2000);
        }
        else{
          if (res.data.message == null || res.data.message == "" || res.data.message == undefined){
            res.data.message = "新建公司失败"
          }
          this.customAlert(res.data.message, 2000);
        }
      }
    }).catch(e=>{
      this.setData({
        isAddingCompany: false,
        info: {
          state: 1,
          content: "服务异常，请稍后再试"
        }
      })
      setTimeout(()=>{
        this.setData({info:{state:0,content:""}})
      },2000)
    })
  },

  // 自定义弹框提示内容与消失时间
  customAlert: function (txt,time=2000) {
    this.setData({
      info:{state:1, content: txt}
    });
    setTimeout(() => {
      this.setData({ info: { state: 0, content: "" } })
    }, time)
  },

  // 隐藏弹框
  hideAlert:function(){
    this.setData({
      info:{
        state:0,
        content:""
      }
    })
  },

  // 公司行业选择
  selectIndustry: function () {
    var title = this.data.industry == null ? null : this.data.industry.name
    wx.navigateTo({
      url: './industry/industry?title=' + title,
    })
  },


  // 获取省市地区列表
  getAddress: function () {
    var mulitAry = [];
    var address = app.ip + "tc/SystemService/getAllCitys";
    api.request({},address,"POST",true).then(res=>{
      var region = [];
      var multiArray = [];
      if(res.data.code == 200 && res.data.result){
        var data = res.data.data;
        data.map((item,index)=>{
          region.push(item.province);
          multiArray[index] = item.citys;
        })
      }
      this.setData({
        region, multiArray
      })
    })
  },

  // 行数
  showAddress: function (e) {
    this.setData({
      isShowAddress: !this.data.isShowAddress
    })
  },

  // 城市选择器
  setCity: function (e) {
    
  },

  // 选择省份
  selectProvince: function (e) {
    var province = e.currentTarget.dataset.item;
    var cityNum = e.currentTarget.dataset.index;
    this.setData({ province, cityNum})
  },

  // 选择城市
  selectcity: function (e) {
    var city = e.currentTarget.dataset.item;
    this.setData({city})
  },

  // 取消城市选择
  cancelAddress: function () {
    this.setData({
      isShowAddress:false,
      city:null,
      province:null
    })
  },

  // 验证选择内容是否合法
  checkProvinceCity: function () {
    var province = this.data.province;
    var industry = this.data.industry;
    var city = this.data.city;
    if(province == null){
      this.setData({
        info: {
          state: 1,
          content: "请核对公司地址"
        }
      })
      setTimeout(() => {
        this.setData({ info: { state: 0, content: "" } })
      }, 2000)
      return false;
    }
    else if(industry == null){
      this.setData({
        info: {
          state: 1,
          content: "请核对公司行业"
        }
      })
      setTimeout(() => {
        this.setData({ info: { state: 0, content: "" } })
      }, 2000)
      return false;
    }
    else{
      return true;
    }
  },

  // 添加成员
  addMember: function () {
    wx.navigateTo({
      url: './addMember/addmember',
    })
  }
})