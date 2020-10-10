// miniprogram/pages/weather/map.js
const app = getApp()
var logo = "../../images/location.png";
Page({
  /**
   * 页面的初始数据
   */
  data: {},
  regionchange(event) {
    this.getCenterLocation()
    //console.log(event)
  },
  markertap: function(event) {
    wx.reLaunch({
      url: '/pages/weather/weather'
    })
    //console.log(event)
  },
  setMapInfo(latitude, longitude, call) {
    let sinfo = wx.getSystemInfoSync()
    this.setData({
      latitude: latitude,
      longitude: longitude,
      windowsHeight: sinfo.windowHeight,
      markers: [{
        iconPath: logo,
        id: 0,
        latitude: latitude,
        longitude: longitude,
        width: 50,
        height: 74,
        //callout: { content: this.data.weatcher, display: 'ALWAYS',},
        callout: call,
      }],

    })
  },
  showData(res) {
    this.setData({
      markers: [{
        //  iconPath: "../../images/shejiyeiconoiujmbtptap.png",
        iconPath: logo,
        id: 0,
        latitude: res.latitude,
        longitude: res.longitude,
        width: 50,
        height: 74,
      }],
    })
  },
  getCenterLocation: function() {
    let that = this;
    this.mapCtx.getCenterLocation({
      success: function(res) {
        that.showData(res)
        app.globalData.loc = [res.latitude, res.longitude]
        app.getWeatherWithLoc(res.latitude, res.longitude, function(r) {

          console.log(r)
          //app.globalData.weather = r
          wx.setNavigationBarTitle({
            title: r.cityname + ' ' + r.w.weather + r.w.degree + '℃',
          })

        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    this.mapCtx = wx.createMapContext('myMap')
    wx.getLocation({
      type: 'gcj02',
      fail(res) {
        //console.log("fail",res)
        if (!options.longitude) {
          return
        }
        that.setMapInfo(options.latitude, options.longitude)
      },
      success(res) {
        //console.log("success", res)
        that.setMapInfo(res.latitude, res.longitude)
      },
    })
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