var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  tapDialogButton(e) {
    console.log(e)
    if (e.detail.index===1){
      let that = this
      wx.setClipboardData({
        data: that.data.db.code,
      })
      return;
    }
    this.data.db.show = false
    this.setData({
      db: this.data.db
    })
  },
  taobaoRouter: function () {
    let that = this
    //app.getUserInfo(function (info) {
      wx.getAccountInfoSync().miniProgram.appId
    wx.request({
      url: 'https://www.zaddone.com/site/goods/taobao',
      data: {
        goodsid: that.data.db.Ext,
        ext: that.data.db.Name,
        session:app.globalData.userInfo?app.globalData.userInfo.UserId:wx.getAccountInfoSync().miniProgram.appId,
      },
      success: function (res) {
        if (res.statusCode != 200 || !res.data || res.data.length === 0) {
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          })
          return;
        }
        console.log(res)
        that.data.db.code = res.data.tbk_tpwd_create_response.data.model
        that.data.db.show = true
        that.setData({
          db: that.data.db
        })
      }
    })
    //});
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!options.goods || !options.py) return;
    let that = this
    app.getGoodsData(options.py, options.goods, function (db) {
      db.taobaobutton = [{ text: '关闭' }]
      if (options.show) db.taobaobutton.push({text:'一键复制'})
      that.setData({  
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
  onShareAppMessage: function () {
    return {
      title: this.data.db.Name,
    }
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