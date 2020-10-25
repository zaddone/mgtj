// miniprogram/pages/index/face.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    app.getUserInfo(function(info){
      that.setData({config:info.config})
    })

    app.getToday(function (db) {
      if (db.nm ===db.nd ){
        db.nd = "初一"
      }
      if (db.other){
        db.tag = db.other[0]
        for (let v of db.other){
          if (v.search(/节/)!= -1){
            db.tag = v
            break
          }
          //console.log(v)
        }
        if (db.other[0].length==2){
          db.nj ==db.other[0]
        }
      }
      that.setData({today:db})
      console.log(db)
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this
    app.getTianqi(function (res) {
      console.log(res)
      //app.globalData.weather = res
      that.setData({ weather: res })
    })
    let sinfo = wx.getSystemInfoSync()
    let rate = sinfo.screenWidth / 750
    console.log(sinfo)
    this.setData({
      top: sinfo.statusBarHeight,
      iconSize: rate * 40,
      width: sinfo.windowWidth,
      height: sinfo.windowHeight,
      h1: sinfo.safeArea.height
    })
    wx.request({
      url: 'https://www.zaddone.com/site/today',
      success: function (res) {
        //res.data.Imgurl = res.data.Imgurl.split('?')[0]
        console.log(res)
        that.setData({
          to: res.data,
        }, function () {
          //console.log(that.data.to.Txt.toString())
        })
      },
    })
  },
  tapSearch(){
    wx.navigateTo({
      url: '/pages/search/search',
    })
  },
  tapWeather() { 
    wx.navigateTo({
      url: '/pages/weather/weather',
    })

  },
  tapCalendar(){
    wx.navigateTo({
      url: '/pages/calendar/calendar',
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title:this.data.to.Txt[0],
      path: '/pages/index/face'
    }
  },
  onShareTimeline(){
    return{
      title: this.data.to.Txt[0],
      imageUrl: this.data.to.Imgurl
    }
  }
})