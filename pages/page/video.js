// miniprogram/pages/page/video.js
const app = getApp()
Page({
  indexId: 0,
  /**
   * 页面的初始数据
   */
  data: {
    runplay: false
  },
  indexId:0,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.id) {
      let that = this
      if (options.p) {
        that.indexId = options.p
        that.data.runplay = true
      }
      app.getContent(options.id, function(d) {
        wx.setNavigationBarTitle({
          title: d.Title
        })
        if (!d.playlist) {
          d.playlist = []
          d.Content.split('|').forEach(function(v) {
            let v_ = v.split('$')
            d.playlist.push({
              u: v_[1],
              n: v_[0]
            })
          })
        }
        if (!d.autoPlay) {
          d.autoPlay = d.playlist[that.indexId]
          d.autoPlay.play = "show"

        }
        that.setData({
          db: d.playlist,
          height: wx.getSystemInfoSync().windowHeight / 2,
          autoPlay: d.autoPlay,
          runplay: that.data.runplay
        },function(){
          app.setHistorage(d._id)
        })
      })

    }

    /**
        if (options.id) {
          let that = this
          app.getContent(options.id, function(db) {
            app.globalData.tmpdb = db
            that.indexId = options.p
            that.data.runplay = true
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
        if (!d.playlist) {
          d.playlist = []
          d.Content.split('|').forEach(function(v) {
            let v_ = v.split('$')
            d.playlist.push({
              u: v_[1],
              n: v_[0]
            })
          })
        }
        if (!d.autoPlay) {
          d.autoPlay = d.playlist[this.indexId]
          d.autoPlay.play = "show"

        }
        this.setData({
          db: d.playlist,
          height: wx.getSystemInfoSync().windowHeight / 2,
          autoPlay: d.autoPlay,
          runplay: this.data.runplay
        })
         */
  },
  clickPlay(e) {
    this.indexId = e.currentTarget.dataset.id
    let d = this.data.db[this.indexId]
    d.play = "show"
    this.data.autoPlay.play = ""
    console.log(d,this.data.db)
    this.setData({
      autoPlay: d,
      runplay: true,
      db: this.data.db
    })
    //console.log(e)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

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
      title: app.globalData.tmpdb.Title,
      path: '/pages/page/video?id=' + app.globalData.tmpdb._id + '&p=' + this.indexId
    }
  }
})