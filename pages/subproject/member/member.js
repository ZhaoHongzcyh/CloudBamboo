// pages/subproject/member/member.js
const app = getApp();
const api = require("../../../api/common.js");
const handle = require("../common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    app:app,
    alert:null,
    taskId:null,
    state:null,//0:删除成员 1：添加成员
    friendsList:null,
    memberBeanList:null,//成员列表
    matchMember:null,//成员列表
    companyList:null,//所有公司
    companyMemberId:null,//从公司中选择的成员id
    choosemember:[],
    summary:null,
    participant:[],
    loadData:false,//是否正在刷新数据
    delSingle:null,//被删除的成员对象
    isCouldClickAdd:true,//是否可以点击确认添加成员按钮
    prevMemberlist:null,//用于储存上一个页面中的成员数据
    isShowDelErrorPage: false//是否展示删除成员的异常页面
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      taskId:options.taskid,
      state:options.state
    })
    app.globalData.tasknum = 2;
    this.popup = this.selectComponent("#popup");
    this.confirm = this.selectComponent("#confirm");
  },

  onShow: function () {
    if(this.data.state == 1){
      this.getPrevData();//获取上一个页面中成员数据
      this.getFriendsList();
      this.getProjectInfo();
      this.getCompanyList();
    }
    else{
      this.getProjectMember();
      this.getProjectInfo();
    }
  },

  onPullDownRefresh: function () {
    this.onShow();
    this.setData({
      loadData: true
    })
    setTimeout(()=>{
      this.setData({loadData:false});
      wx.stopPullDownRefresh();
    },4000)
  },

  // 获取上一个页面中成员数据
  getPrevData: function () {
    var prevMemberlist = [];
    var page = getCurrentPages();
    var length = page.length;
    var prevPage = page[length - 2];
    this.setData({
      prevMemberlist: prevPage.data.memberlist
    })
  },

  // 弹框
  alert: function () {
    this.popup.showPopup()
  },

  // 打开对话弹框
  openConfirm: function (e) {
    var single = e.currentTarget.dataset.item;
    this.setData({ delSingle: single })
    this.confirm.show();
  },

  // 获取项目信息
  getProjectInfo: function () {
    var address = app.ip + "tc/taskService/findTaskBOById";
    var taskId = this.data.taskId;
    api.request({taskId},address,"POST",true).then(res=>{
      console.log("------");
      console.log(res);
      if(res.data.code == 200 && res.data.result){
        this.setData({
          summary:res.data.data.summaryBean,
          participant: res.data.data.summaryBean.participant
        })
      }
    })
  },

  // 获取联系人列表
  getFriendsList: function () {
    var prevMemberlist = this.data.prevMemberlist;
    var address = app.ip + "tc/userContactService/getPersonContacts";
    api.request({},address,"POST",true).then(res=>{
      if(res.data.code == 200 && res.data.result){
        var data = res.data.data;
        for(var i = 0; i < data.length; i++){
          // 是否展开与折叠
          if(i == 0){
            data[i].folder = true;
          }
          else{
            data[i].folder = false;
          }
        }
        console.log(res);
        console.log("成员")
        let list = res.data.data;
        list.map((item,index)=>{
          item.personList.map((friend,num)=>{
            let checkEnd = false;
            prevMemberlist.map((person, x) => {
              if (person.id == friend.id) {
                checkEnd = true;
              }
            })
            if (checkEnd) {
              friend.select = true;
              friend.initSelect = true;
            }
            else {
              friend.select = false;
              friend.initSelect = false;
            }
          })
        })
        this.setData({
          friendsList: list
        })
      }
    })
  },

  // 好友列表折叠与展开
  foldMember: function (e) {
    var index = e.currentTarget.dataset.index;
    var friendsList = this.data.friendsList;
    friendsList[index].folder = !friendsList[index].folder;
    this.setData({ friendsList})
  },

  // 公司列表折叠与展开
  openFolder: function (e) {
    var index = e.currentTarget.dataset.index;
    var companyList = this.data.companyList;
    companyList[index].folder = !companyList[index].folder;
    this.setData({ companyList: companyList});
  },

  // 获取公司列表
  getCompanyList: function () {
    var obj = {
      taskId: wx.getStorageSync("defaultTaskTeam")
    },
    address = app.ip + "tc/taskTeamService/findTaskTeam";
    console.log(api.request(obj, address, "POST", true));
    api.request(obj, address, "POST", true).then(res => {
      var companyListId = [];
      if (res.data.code == 200 && res.data.result) {
        let list = res.data.data.list;
        list.map((item, index) => {
          companyListId.push(item.id);
        })
        this.setData({ companyList: list });
        
        //2018-11-21
        let promiseAll = [];
        let companyId = [];
        //end
        for (let i = 0; i < companyListId.length; i++) {
          // let isLast = false;
          // if (i == companyListId.length - 1){
          //   isLast = true;
          // }
          // this.getCompanyMember(companyListId[i],isLast);
          let obj = {taskId: companyListId[i]};
          let address = app.ip + "tc/taskMemberService/findPageTaskMember";
          // 生成多个promise对象
          var p1 = api.request(obj, address, "POST", true);
          promiseAll.push(p1);
          companyId.push(companyListId[i]);
        }
        Promise.all(promiseAll).then(result=>{
          console.log("所有请求");
          console.log(result);
          this.addMemberToCompany(result,companyId)
        })
      }
    })
  },

  // 将各个公司成员放入各个公司目录下
  addMemberToCompany: function (memberResult,companyId) {
    let companyList = this.data.companyList;
    console.log("++++++++++++");
    console.log(memberResult);
    console.log(companyList)
    var prevMemberlist = this.data.prevMemberlist;
    companyList.map((item,index)=>{
      companyId.map((id,num)=>{
        if(item.id == id){
          item.folder = false;
          if(memberResult[index].data.code == 200 && memberResult[index].data.result){
            item.member = memberResult[index].data.data.list
          }
          else{
            console.log("异常")
          }
        }
      })
    })

    companyList.map((item,index)=>{
      item.member.map((person,num)=>{
        let checkEnd = false;
        prevMemberlist.map((prevPerson,x)=>{
          if(person.id == prevPerson.id){
            checkEnd = true;
          }
        })
        if (checkEnd) {
          person.select = true;
          person.initSelect = true;
        }
        else {
          person.select = false;
          person.initSelect = false;
        }
      })
    })

    this.setData({ companyList})
  },

  // 获取各个公司的成员列表(该函数暂时被废弃)
  getCompanyMember: function (taskId,isLast) {
    var companyList = this.data.companyList;
    var prevMemberlist = this.data.prevMemberlist;
    var address = app.ip + "tc/taskMemberService/findPageTaskMember";
    var obj = { taskId };
    api.request(obj, address, "POST", true).then(res => {
      var userid = wx.getStorageSync('tcUserId');
      if (res.data.code == 200 && res.data.result) {
        let member = res.data.data.list;
        companyList.map((item, index) => {
          if (item.id == taskId) {
            item.folder = false;
            companyList[index].member = member;
          }
        })
        if(isLast){
          companyList.map((item,index)=>{
            try{
            item.member.map((person,num)=>{
              let checkEnd = false;
              prevMemberlist.map((prevItem,x)=>{
                if (person.id == prevItem.id){
                  checkEnd = true;
                }
              })
              if (checkEnd ){
                person.select = true;
                person.initSelect = true;
              }
              else{
                person.select = false;
                person.initSelect = false;
              }
            })
            }
            catch (e) {
              console.log("--------")
              console.log(item);
              console.log(item.member)
              console.log(e)
            }
          })
          
        }
        this.setData({ companyList });
      }
    })
  },


  // 同步公司成员与初始项目成员
  syncCompanyMember: function (result,companyid){

  },

  // 获取项目成员列表
  getProjectMember: function () {
    var address = app.ip + "tc/taskService/taskMemberManager";
    var obj = {taskId:this.data.taskId};
    api.request(obj,address,"POST",true).then(res=>{
      if(res.data.code == 200 && res.data.result){
        
        this.setData({
          isShowDelErrorPage: this.checkUserNumber(res.data.data.memberBeanList),
          memberBeanList: res.data.data.memberBeanList,
          matchMember:res.data.data.memberBeanList
        })
      }
    })
  },

  // 判断有无成员可操作
  checkUserNumber: function (member) {
    let checkEnd = [];
    member.map((item, index) => {
      if (item.relationType != 12 && item.relationType != 13 && item.relationType != 1) {
        checkEnd.push(item);
      }
    })
    checkEnd = checkEnd.length < 1 ? true : false;
    return checkEnd;
  },

  // 选择好友成员
  selectMember: function (e) {
    console.log(e);
    var index = e.currentTarget.dataset.index;
    var num = e.currentTarget.dataset.num;
    var data = this.data.friendsList;
    var choosemember = this.data.choosemember;
    var equal = false;
    if (data[index].personList[num].initSelect){
      return false;
    }
    data[index].personList[num].select = !data[index].personList[num].select;
    // 检查该元素是否已被选择
    choosemember.map((item, cid) => {
      if (item.id == data[index].personList[num].id) {
        equal = true;
      }
    })

    if (data[index].personList[num].select){
      if(!equal){
        choosemember.push(data[index].personList[num] );
      }
    }
    else{
      choosemember.map((item, cid) => {
        if (item.id == data[index].personList[num].id) {
          choosemember.splice(cid,1);
        }
      })
    }
    this.syncMemberIdAry(data[index].personList[num].id);
    this.setData({ choosemember, friendsList:data});
  },

  // 选择公司成员
  selectCompanyMember: function (e) {
    console.log(e);
    var index = e.currentTarget.dataset.index;
    var num = e.currentTarget.dataset.num;
    var companyList = this.data.companyList;
    var initSelect = companyList[index].member[num].initSelect;
    var choosemember = this.data.choosemember;
    if (!initSelect){
      // companyList[index].member[num].select = !companyList[index].member[num].select;
      // this.setData({ companyList});
      // 检查该元素是否被选中
      let checkEnd = false;
      choosemember.map((item,x)=>{
        if (item.id == companyList[index].member[num].id){
          checkEnd = true;
          choosemember.splice(x,1);
        }
      })
      if(!checkEnd){
        choosemember.push(companyList[index].member[num] );
        
        this.setData({ choosemember});
        
        this.syncMemberIdAry(companyList[index].member[num].id);
      }
      else{
        this.syncMemberIdAry(companyList[index].member[num].id);
        console.log("存在")
        // companyList[index].member[num].select = false;
        // this.setData({
        //   companyList
        // })
        // return false;
      }
      console.log(choosemember);
      
    }
  },

  // 同步公司成员id与好友列表中选择的内容
  syncMemberIdAry:function (id) {
    var friendsList = JSON.stringify(this.data.friendsList);
    var companyList = JSON.stringify(this.data.companyList);
    friendsList = JSON.parse(friendsList);
    companyList = JSON.parse(companyList);
    // 同步好友列表
    friendsList.map((item,index)=>{
      item.personList.map((friend,num)=>{
        let checkEnd = friend.select? false:true;
        if(friend.id == id){
          friend.select = checkEnd;
        }
      })
    })
    // 同步公司列表中的数据
    companyList.map((item,index)=>{
      item.member.map((person,num)=>{
        let checkEnd = person.select ? false : true;
        if(person.id == id){
          person.select = checkEnd;
        }
      })
    })
    this.setData({ companyList, friendsList});
  },

  // 添加成员该函数已被废弃
  // addmember: function () {
  //   var choosemember = this.data.choosemember;
  //   var summaryBean = this.data.summary;
  //   var address = app.ip + "tc/taskService/updateTaskDynamic";
  //   if(choosemember.length == 0){
  //     return false;
  //   }
  //   if (!this.data.isCouldClickAdd){
  //     return false;
  //   }
  //   else{
  //     this.setData({ isCouldClickAdd: !this.data.isCouldClickAdd});
  //     // var updateFields = this.
  //     var participant = this.data.participant;
  //     for(var i = 0; i < choosemember.length; i++){
  //       var state = false;
  //       if (participant == null) { participant = []}
  //       participant.map((item,index)=>{
  //         if (item == choosemember[i].id){
  //           state = true;
  //         }
  //       })

  //       if(!state){
  //         participant.push(choosemember[i].id);
  //       }
  //     }
  //     summaryBean.participant = participant;
  //     api.customRequest({ updateFields:'participant'},summaryBean,address,"POST",true).then(res=>{
  //       if(res.data.code == 200 && res.data.result){
  //         wx.navigateBack()
  //       }
  //       else{
  //         // 弹框提示添加失败
  //         this.setData({ alert: { content: '成员添加失败' } });
  //         this.alert();
  //       }
  //       this.setData({ isCouldClickAdd: !this.data.isCouldClickAdd });
  //     }).catch(e=>{
  //       this.setData({ alert: { content: '成员添加失败' } });
  //       this.alert();
  //     })
  //   }
  // },

  // 添加成员（通过新接口）
  addmember: function () {
    var choosemember = this.data.choosemember;
    var summaryBean = this.data.summary;
    if (choosemember.length == 0) {
      return false;
    }
    if (!this.data.isCouldClickAdd) {
      return false;
    }
    else{
      this.setData({ isCouldClickAdd: !this.data.isCouldClickAdd });
      var memberIds =[];
      choosemember.map((item,index)=>{
        memberIds.push(item.id);
      })
      let address = app.ip + "tc/taskMemberService/updateTaskMember";
      let add = memberIds;
      // let str = "{add:" + add +"}";
      api.customRequest({ taskId: this.data.taskId}, {add:add},address,"POST",true).then(res=>{
        console.log("成员结果添加");
        console.log(res);
        if(res.data.code == 200 && res.data.result){
          wx.navigateBack();
        }
        else{
          // 弹框提示添加失败
          this.setData({ alert: { content: '成员添加失败' } });
          this.alert();
        }
        this.setData({ isCouldClickAdd: !this.data.isCouldClickAdd });
      }).catch(e=>{
        // 弹框提示添加失败
        this.setData({ alert: { content: '成员添加失败' } });
        this.alert();
      })
    }
    
  },

  // 删除成员(该函数已经被废弃，采用新接口)
  // delMember: function (e) {
  //   var address = app.ip + "tc/taskService/addOrUpdateTask";
  //   var single = this.data.delSingle;
  //   var memberBeanList = this.data.memberBeanList;
  //   var summaryBean = this.data.summary;
  //   var participant = this.data.participant;
  //   var matchMember = this.data.matchMember;
  //   if (single.resourceId == summaryBean.teamManager){
  //     this.setData({alert:{content:'无法删除公司负责人'}});
  //     this.alert();
  //     return false;
  //   }
  //   participant.map((item,index)=>{
  //     if (item == single.resourceId){
  //       participant.splice(index,1);
  //     }
  //   })
  //   summaryBean.participant = participant;
  //   var obj = { summaryBean };
  //   api.sendDataByBody(obj,address,"POST",true).then(res=>{
  //     if(res.data.code == 200 && res.data.result){
  //       // wx.navigateBack();
  //       memberBeanList.map((item,num)=>{
  //         if (item.resourceId == single.resourceId){
  //           memberBeanList.splice(num,1)
  //         }
  //       })
  //       matchMember.map((item,num)=>{
  //         if (item.resourceId == single.resourceId) {
  //           matchMember.splice(num, 1)
  //         }
  //       })
        
  //       this.setData({ summaryBean, memberBeanList, matchMember, isShowDelErrorPage: this.checkUserNumber(memberBeanList)});
        
  //       this.confirm.hide();
  //     }
  //     else{
  //       // 弹框提示删除失败
  //       this.setData({alert:{content:'成员删除失败'}});
  //       this.alert();
  //     }
  //   }).catch(e=>{
  //     this.setData({ alert: { content: '成员删除失败' } });
  //     this.alert();
  //   })
  // },

  // 删除成员（新接口）
  delMember: function () {
    var matchMember = this.data.matchMember;
    var summaryBean = this.data.summary;
    var participant = this.data.participant;
    var memberBeanList = this.data.memberBeanList;
    var address = app.ip + "tc/taskMemberService/updateTaskMember";
    var single = this.data.delSingle;
    var memberIds = [this.data.delSingle.resourceId];
    if (single.resourceId == summaryBean.teamManager){
      this.setData({alert:{content:'无法删除公司负责人'}});
      this.alert();
      return false;
    }
    participant.map((item,index)=>{
      if (item == single.resourceId){
          participant.splice(index,1);
        }
      })

    api.customRequest({ taskId: this.data.taskId }, {delete:memberIds}, address, "POST", true).then(res => {
        if (res.data.code == 200 && res.data.result) {
          // wx.navigateBack();
          memberBeanList.map((item, num) => {
            if (item.resourceId == single.resourceId) {
              memberBeanList.splice(num, 1)
            }
          })
          matchMember.map((item, num) => {
            if (item.resourceId == single.resourceId) {
              matchMember.splice(num, 1)
            }
          })

          this.setData({ summaryBean, memberBeanList, matchMember, isShowDelErrorPage: this.checkUserNumber(memberBeanList) });

          this.confirm.hide();
        }
        else {
          // 弹框提示删除失败
          this.setData({ alert: { content: '成员删除失败' } });
          this.alert();
        }
      }).catch(e=>{
        console.log(e);
        // 弹框提示删除失败
        this.setData({ alert: { content: '成员删除失败' } });
        this.alert();
      })
  },

  // 动态匹配用户输入的联系人
  matchSearchContent: function (e) {
    var value = e.detail.value;
    var memberBeanList = this.data.memberBeanList;
    var matchMember = this.data.matchMember;
    var member = [];
    matchMember.map((item,index)=>{
      var reg = new RegExp(value,'i');
      if(reg.test(item.personName)){
        member.push(item);
      }
    })
    if(e.detail.value != ""){
      this.setData({
        memberBeanList: member
      })
    }
    else{
      this.setData({
        memberBeanList: matchMember
      })
    }  
  }
})