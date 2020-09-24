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
  onLoad: function (options) {
    if (options.id) {
      let that = this
      app.getContent(options.id, function (db) {
        app.globalData.tmpdb = db
        that.onLoad({})
      })
      
      //console.log(res)
      return
      //app.globalData.tmpdb = app.db.collection('content').doc(options.id)
    }
    if (!app.globalData.tmpdb) return
    let d = app.globalData.tmpdb
    wx.setNavigationBarTitle({
      title: d.Title
    })
    if (!d.wxml) d.wxml = app.towxml('>来源:zhihu-' + d.Author + '     \n\n\n' + d.Content, 'markdown')
    this.setData({ db: d.wxml })

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
      title: app.globalData.tmpdb.Title,
      path: '/pages/page/view?id=' + app.globalData.tmpdb._id
    }
  }
})