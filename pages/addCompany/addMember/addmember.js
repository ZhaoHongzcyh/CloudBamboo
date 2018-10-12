// pages/company/addMember/addmember.js
const app = getApp();
const api = require("../../../api/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    app: app,
    companyList:null,
    companyListId:null,//所有公司列表id
    participantId:[],
    friendsList:null//好友列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  onShow: function () {
    this.getCompanyList();
    this.getFriendsList();
  },

  // 获取好友列表
  getFriendsList: function () {
    var address = app.ip + "tc/userContactService/getPersonContacts";
    api.request({},address,"POST",true).then(res=>{
      console.log("好友列表");
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        let list = res.data.data;
        list.map((item,index)=>{
          if(index == 0){
            item.isShow = true;
          }
          else{
            item.isShow = false;
          }
          item.personList.map((person,num)=>{
            person.select = false;
          })
        })
        this.setData({ friendsList: list});
      }
    })
  },

  // 获取公司列表
  getCompanyList: function () {
    var obj = {
      taskId: wx.getStorageSync("defaultTaskTeam")
    },
    address = app.ip + "tc/taskTeamService/findTaskTeam";
    api.request(obj,address,"POST",true).then(res=>{
      console.log("公司列表");
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        let list = res.data.data.list;
        let companyListId = [];
        list.map((item,index)=>{
          companyListId.push(item.id);
        })
        this.setData({ companyList: list, companyListId: companyListId});
        for (let i = 0; i < companyListId.length; i++){
          this.getCompanyMember(companyListId[i]);
        }
        
      }
    })
  },

  // 获取各个公司的成员列表
  getCompanyMember: function (taskId) {
    var companyList = this.data.companyList;
    var address = app.ip + "tc/taskMemberService/findPageTaskMember";
    var obj = { taskId};
    api.request(obj,address,"POST",true).then(res=>{
      var userid = wx.getStorageSync('tcUserId');
      if(res.data.code == 200 && res.data.result){
        let member = res.data.data.list;
        companyList.map((item,index)=>{
          if(item.id == taskId){
            if(index == 0){
              companyList[index].isShow = true;
            }
            else{
              companyList[index].isShow = false;
            }

            member.map((memItem,num)=>{
              let checkend = false;
              if (memItem.id == userid){
                memItem.isSelf = true;
              }
              else{
                memItem.isSelf = false;
              }
              item.participant.map((partId,x)=>{
                if(partId == memItem.id){
                  checkend = true;
                }
              })
              // if (checkend) {
              //   member[num].selectStatus = 0;//已经在公司成员中;
              //   member[num].select = true;
              //   console.log(1);
              // }
              // else {
                console.log(0);
                member[num].selectStatus = 0;//未在公司成员中;
                member[num].select = false;
              // }
            })
            companyList[index].member = member;
          }
        })
        this.setData({ companyList});
        console.log(companyList);
      }
    })
  },

  // 好友列表的展开与收起
  showAllFriend: function (e) {
    var index = e.currentTarget.dataset.index;
    var friendsList = this.data.friendsList;
    friendsList[index].isShow = !friendsList[index].isShow;
    this.setData({ friendsList});
  },

  // 公司成员的展开与收起
  showAllMember: function (e) {
    var index = e.currentTarget.dataset.index;
    var companyList = this.data.companyList;
    companyList[index].isShow = !companyList[index].isShow;
    this.setData({ companyList});
    console.log(companyList);
  },

  // 选择好友列表中的成员
  chooseFriends: function (e) {
    var index = e.currentTarget.dataset.index;
    var num = e.currentTarget.dataset.num;
    var id = e.currentTarget.dataset.item.id;
    var friendsList = this.data.friendsList;
    friendsList[index].personList[num].select = !friendsList[index].personList[num].select;
    this.getMemberId(id);
    this.syncMemberStatus(id, friendsList[index].personList[num].select);
    this.setData({friendsList});
  },

  // 选择公司成员
  chooseMember: function (e) {
    var num = parseInt(e.currentTarget.dataset.num);
    var index = parseInt(e.currentTarget.dataset.index);
    var companyList = this.data.companyList;
    var id = companyList[index].member[num].id;
    var status = companyList[index].member[num].select;
    console.log(companyList[index].member[num].selectStatus)
    if(companyList[index].member[num].selectStatus == 0) {
      companyList[index].member[num].select = !status;
      this.getMemberId(id);
      this.syncMemberStatus(id, companyList[index].member[num].select)
    }
    console.log(companyList);
    this.setData({ companyList});
  },

  // 同步公司列表与好友列表中成员选取的状态
  syncMemberStatus: function (id,status) {
    var companyList = this.data.companyList;
    var friendsList = this.data.friendsList;
    friendsList.map((item,index)=>{
      item.personList.map((person,num)=>{
        if(person.id == id){
          person.select = status;
        }
      })
    });

    companyList.map((item,index)=>{
      item.member.map((person,num)=>{
        if(person.id == id){
          person.select = status;
        }
      })
    });

    this.setData({ friendsList, companyList});
  },

  // 获取添加成员id
  getMemberId: function (id) {
    var participantId = this.data.participantId;
    var checkEnd = false;
    participantId.map((item,index)=>{
      if(item.id == id){
        checkEnd = true;
      }
    })
    if(!checkEnd){
      participantId.push(id);
    }
    this.setData({ participantId});
  },

  // 添加成员
  submitMember: function () {
    var companyList = this
  }
})