//index.js
const app = getApp()
Page({
  data: {  
    list:[]
  },

  onShow(e){
    let sinfo = wx.getSystemInfoSync()
    console.log(sinfo)
    let rate = sinfo.screenWidth / 750
    let t = sinfo.statusBarHeight + sinfo.safeArea.top * 2
    this.setData({
      top: t,
      iconSize: rate* 80,
      topd:t+rate*100,
    })
  },
  onLoad: function(e) {
    this.limit = 15;   
    this.maxLimit = 150    
    this.showHistory()
    //console.log(Array.from(new Set([1,8,2,8,1])))
  },
  showHistory(){
    let that = this
    app.getHistorage(function(db){
      that.listWithId = db
      that.getNextPage()
    })
  },
  searchContent(event){
    let key = event.detail.value
    if (!key)return;
    wx.showLoading({
      title: '加载中',
    })
    let that = this
    this.begin = 0
    this.end = 0
    this.data.list = []
    this.listWithId = []
    wx.cloud.callFunction({
      name: 'searchContent',
      data: {
        words: app.getSearchKey(key),
        limit:that.limit,
      },
      success: function (res) {
        //console.log(res)
       
        wx.hideLoading()
        if (res.result.length>0){
          that.listWithId = res.result
          that.getNextPage()
        }else{
          wx.showToast({
            title: '没有找到',
          })
          that.showHistory()
        }
        
      },
      fail: function(res){
        console.error(res)
        wx.hideLoading()
      }
    })    
  },
  getNextPage(){
    if (this.data.list.length > this.maxLimit )this.data.list = this.data.list.slice(this.data.list.length-this.maxLimit)
      this.end = this.begin + this.limit
      if (this.end > this.listWithId.length) this.end = this.listWithId.length
      let that = this
      this.getContent(this.listWithId.slice(this.begin,this.end),function(list){
        that.setData({ list: that.data.list.concat(list) })
      })    
      this.begin = this.end
  },
  getPullPage(){
    if (this.data.list.length > this.maxLimit) this.data.list = this.data.list.slice(0, this.maxLimit)
    this.end = this.begin + this.limit
    if (this.end > this.listWithId.length) this.end = this.listWithId.length
    let that = this
    this.getContent(this.listWithId.slice(this.begin, this.end), function (list) {
      that.setData({ 
        list: list.concat(that.data.list) ,
        function(){
          wx.stopPullDownRefresh()
        }
      })
    })
    this.begin = this.end
  },
  getContent(list,hand){
    //console.log(list)    
    let that = this
    app.db.collection('content').where({
      _id: app.db.command.in(list)
    }).get({
      success:function(res){
        res.data.forEach(function(d){ 
          //
          list.forEach(function(l,i){
            if (d._id == l)list[i] = d
          })
          that.listWithId.push(d.parentId)
        })
        that.listWithId = Array.from(new Set(that.listWithId))
        //console.log(list)
        if (hand)hand(list)
        else
          that.setData({list: that.data.list.concat(list)})
        //that.setData({ list: list})
        //console.log(that.data.list)
        app.db.collection('links').where({
          _id: app.db.command.in(list)
        }).get({
          success: function (r) {
            r.data.forEach(function(d){
              that.listWithId = that.listWithId.concat(d.link)
            })
            that.listWithId = Array.from(new Set(that.listWithId))
          }
        })
      },
    })
  },
  onPullDownRefresh(){
    //console.log(event)
    this.getPullPage()
  },
  onReachBottom(){
    //onsole.log(event)
    this.getNextPage()
  },
  chickItem(e){
    //console.log(e)
    app.setTmpDB(this.data.list[e.currentTarget.dataset.id])
    //app.globalData.tmpdb = this.data.list[e.currentTarget.dataset.id]
    //console.log(app.globalData.tmpdb)
    if (app.globalData.tmpdb.Type == 2){
      wx.navigateTo({
        url: '/pages/page/video',
      })
    } else if (app.globalData.tmpdb.Type == 1){
      wx.navigateTo({
        url: '/pages/page/view',
      })
    }
  },

})
