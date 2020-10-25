var app = getApp();
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
    if (!options.goods || !options.py) return;
    let that = this
    app.getGoodsData(options.py, options.goods, function (db) {
      
      that.setData({
        //tab: { py: options.py },
        //template: "",
        py: options.py,
        db: db,
      })
      wx.setNavigationBarTitle({ title: db.Tag })
    }, function () {
      wx.showToast({
        title: '没有找到',
        icon:'none',
      })    
      wx.reLaunch({
        url: '/pages/index/index',
      })   
    })
  },
  currencyRouter:function(){
    let that = this
    //app.getUserInfo(function (info) {
      //console.log(info.phone?info.phone:info.secret)
    wx.request({
      url: 'https://www.zaddone.com/site/miniapp/' + that.data.py,
      data: {
          goodsid: that.data.db.Id,
          session:app.globalData.userInfo?app.globalData.userInfo.UserId:wx.getAccountInfoSync().miniProgram.appId,
          ext: that.data.db.Ext, mini: "mini" },
      success: function (res) {
        let r = res.data
        console.log(res)
        wx.navigateToMiniProgram({
          appId: r.appid,
          path: r.url,
        })
        //console.log()
      },
    })
    //})
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
    return {
      title: this.data.db.Name,
    }
  }
})