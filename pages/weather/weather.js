// miniprogram/pages/weather/weather.js
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
  onLoad: function (options) {
    let sinfo = wx.getSystemInfoSync()
    let rate = sinfo.screenWidth / 750
    this.setData({
      iconSize: rate * 80,
      width: sinfo.screenWidth,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this
    if (this.loc){
      app.getWeatherWithLoc(app.globalData.loc[0], app.globalData.loc[1],function(r){
        wx.setNavigationBarTitle({
          title: res.cityname + " 天气预报",
        })
        that.setData({ weather: res })
      })
      return
    }
    app.getTianqiWithLoc(function (res) {
      console.log(res)
      //app.globalData.weather = res
      wx.setNavigationBarTitle({
        title: res.cityname+" 天气预报",
      })
      that.setData({ weather: res })
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})