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
    friendsList:null,//好友列表
    prevMemberList:null//新建公司页面的已添加成员
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  onShow: function () {
    this.getHasAddMember();
    this.getCompanyList();
    this.getFriendsList();
  },

  // 获取新建公司页面的已有成员数据
  getHasAddMember: function () {
    var page = getCurrentPages();
    var length = page.length;
    var prevPage = page[length - 2];
    var prevMemberList = prevPage.data.memberList;
    this.setData({ prevMemberList});
  },

  // 获取好友列表
  getFriendsList: function () {
    var prevMemberList = this.data.prevMemberList;
    var address = app.ip + "tc/userContactService/getPersonContacts";
    api.request({},address,"POST",true).then(res=>{
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
            let checkEnd = false;
            prevMemberList.map((previd,x)=>{
              if(previd.id == person.id){
                checkEnd = true;
              }
            })
            if(checkEnd){
              person.select = true;
              person.initSelect = true;
            }
            else{
              person.select = false;
              person.initSelect = false;
            }
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
    var prevMemberList = this.data.prevMemberList;
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
              if (item.participant == null) { item.participant = []}
              prevMemberList.map((partId,x)=>{
                if(partId.id == memItem.id){
                  checkend = true;
                }
              })
              if (checkend) {
                member[num].initSelect = true;//已经在公司成员中;
                member[num].select = true;
                console.log(1);
              }
              else {
                member[num].initSelect = false;//未在公司成员中;
                member[num].select = false;
              }
            })
            companyList[index].member = member;
          }
        })
        this.setData({ companyList});
      }
      else{
        console.log("请求异常");
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
  },

  // 选择好友列表中的成员
  chooseFriends: function (e) {
    var item = e.currentTarget.dataset.item;
    var index = e.currentTarget.dataset.index;
    var num = e.currentTarget.dataset.num;
    var id = item.id;
    var friendsList = this.data.friendsList;
    if(item.initSelect){
      return false;
    }
    friendsList[index].personList[num].select = !friendsList[index].personList[num].select;
    var item = friendsList[index].personList[num];
    this.getMemberId(id,item);
    this.syncMemberStatus(id, friendsList[index].personList[num].select);
    this.setData({friendsList});
  },

  // 选择公司成员
  chooseMember: function (e) {
    var num = parseInt(e.currentTarget.dataset.num);
    var index = parseInt(e.currentTarget.dataset.index);
    var companyList = this.data.companyList;
    var item = companyList[index].member[num];
    var id = companyList[index].member[num].id;
    var status = item.select;
    if(item.initSelect){
      return false;
    }
    if (!item.initSelect) {
      companyList[index].member[num].select = !status;
      let item = companyList[index].member[num];
      this.getMemberId(id,item);
      this.syncMemberStatus(id, companyList[index].member[num].select)
    }
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
  getMemberId: function (id,item) {
    var participantId = this.data.participantId;
    var checkEnd = false;
    var prevMemberList = this.data.prevMemberList;
    participantId.map((item,index)=>{
      if(item.id == id){
        checkEnd = true;
      }
    })
    if(!checkEnd){
      participantId.push(id);
      let obj = {
        item:item,
        id: item.id,
        name: item.pname,
        role: 0,//1:管理员，0：普通用户
        head: app.ip + "tc/spaceService/showPersonIcon/" + item.id + "/100/100"//头像路径
      }
      prevMemberList.push(obj);
    }
    this.setData({ participantId, prevMemberList});
  },

  // 添加成员
  submitMember: function () {
    var prevMemberList = this.data.prevMemberList;
    var page = getCurrentPages();
    var length = page.length;
    var prevPage = page[length - 2];
    prevPage.setData({ memberList: this.delHasAdd(prevMemberList)});
    wx.navigateBack({});
  },

  // 去处相同已经被添加的成员
  delHasAdd: function (prevMemberList) {
    var newMember = [];
    prevMemberList.map((item,index)=>{
      let checkEnd = false;
      newMember.map((person,num)=>{
        if(person.id == item.id){
          checkEnd = true;
        }
      })
      if(!checkEnd){
        newMember.push(item);
      }
    });

    return newMember;
  }
})