// miniprogram/pages/page/view.js
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
    if (options.id) {
      wx.showLoading({
        title: '加载中',
      })
      let that = this
      app.getContent(options.id, function(d) {
        if (!d.wxml)
          d.wxml = app.towxml('>来源:zhihu-' + d.Author + '     \n\n\n' + d.Content, 'markdown')
        wx.setNavigationBarTitle({
          title: d.Title
        })
        that.setData({
          db: d.wxml
        }, function() {
          app.setHistorage(d._id)
          wx.hideLoading()
        })
      }, function() {
        wx.hideLoading()
      })
    }
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
    return {
      title: this.data.db.Title,
      query: 'id=' + this.data.db._id,
      imageUrl: ''
    }
  },
  onShareTimeline() {
    return {
      title: this.data.db.Title,
      imageUrl: this.data.to.Imgurl
    }
  }
})