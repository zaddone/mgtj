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
    
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let that = this
    app.getTianqi(function (res) {
      console.log(res)
      //app.globalData.weather = res
      that.setData({ weather: res })
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this
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
        that.setData({
          to: res.data,
        }, function () {
          console.log(that.data.to.Txt.toString())
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

  }
})