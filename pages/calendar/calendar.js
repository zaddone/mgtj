// miniprogram/pages/calendar/calendar.js

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    week: ['日', '一', '二', '三', '四', '五', '六'],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    app.getUserInfo(function (info) {
      that.setData({ config: info.config })
    })
    let year, m, today
    var date = new Date;
    if (options.year) {
      year = parseInt(options.year)
      m = parseInt(options.month)
      if (m == date.getMonth() + 1 && year == date.getFullYear())
        today = date.getDate()
    } else {
      year = date.getFullYear()
      m = date.getMonth() + 1
      today = date.getDate()
    }
    wx.setNavigationBarTitle({
      title: year + '年' + m + '月',
    })
    let lm = m - 1
    let lyear = year
    if (lm < 1) {
      lm = 12
      lyear--
    }
    let nmonth = m + 1
    let nyear = year
    if (nmonth > 12) {
      //console.log(nmonth)
      nmonth = 1
      nyear++
    }

    this.setData({
      lm: lm,
      lyear: lyear,
      nmonth: nmonth,
      nyear: nyear,
      year: year,
      m: m
    }, function() {
      console.log(that.data.nmonth, that.data.lm)
    })
    //console.log(m)
    this.getMonth(year, m, function(list) {
      if (options.day) {
        that.showDay(list[parseInt(options.day) - 1])
      }
      if (today) {
        let tod = list[today - 1]
        tod.today = "today"
        if (!options.day) {
          that.showDay(tod)
        }
      } else if (!options.day) {
        //console.log('--------------------------')
        that.setData({
          day: {}
        })
      }
      let w = list[0].w
      if (w != 0) {
        for (let i = 0; i < w; i++) {
          list.unshift({})
        }
        that.getMonth(lyear, lm, function(li_) {
          for (let i = 0; i < w; i++) {
            list[i] = li_[li_.length - w + i]
            list[i].hide = "hide"
          }
          that.setData({
            li: list
          })
        })
      }
      let w_ = list[list.length - 1].w
      if (w_ != 6) {
        that.getMonth(nyear, nmonth, function(li_) {
          for (let i = w_, j = 0; i < 6; i++, j++) {
            li_[j].hide = "hide"
            list.push(li_[j])
          }
          that.setData({
            li: list
          })
        })
      }

      that.setData({
        li: list
      })
    })
  },

  getMonth(y, m, hand) {
    //console.log(y, m)
    let db = wx.getStorageSync(y.toString() + m.toString())
    if (db) {
      hand(db)
      return
    }
    let that = this
    wx.request({
      url: 'https://www.zaddone.com/calendar/info',
      data: {
        y: y,
        m: m
      },
      success: function(res) {
        if (!res.data.msg) return
        let list = []
        res.data.msg.forEach(function(l) {
          //console.log(l)
          let l_ = l.split(',')
          let objl = {
            y: y,
            m: m,
            d: l_[0],
            nd: l_[2],
            nm: l_[1],
            w: parseInt(l_[3]),
          }
          if (l_.length > 4) {
            objl.other = l_.slice(4)
            //objl.nd = objl.other[0]
          }
          list.push(objl)
        })
        wx.setStorage({
          key: y.toString() + m.toString(),
          data: list,
        })
        hand(list)

        //console.log(li)
      }
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
  next() {
    this.onLoad({
      year: this.data.nyear,
      month: this.data.nmonth
    })
  },
  last() {
    this.onLoad({
      year: this.data.lyear,
      month: this.data.lm
    })
  },
  onPullDownRefresh: function() {
    this.last()
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    // this.next()

  },
  getjieri(l, hand) {
    if (l.jieri) return
    let q = this.data.m + '月' + l.d + '日'
    //console.log(q)
    wx.request({
      url: 'https://www.zaddone.com/calendar/jieri',
      data: {
        q: q
      },
      success: function(res) {
        if (res.data.msg) {
          l.jieri = res.data.msg
          hand(l)
        }else{
          l.jieri = []
        }
      },
    })
  },
  showDay(l) {
    let that = this
    //console.log(l)
    if (l.m != this.data.m) {
      this.onLoad({
        year: l.y,
        month: l.m,
        day: l.d,
      })
      return
    }
    l.tap = "tap"
    l.ntag = l.nm
    if (l.nm == l.nd){
      l.ntag += "初一"
    }else{
      l.ntag += l.nd
    }
    let update = {day:l}
    if (this.data.li){
      update.li = this.data.li
    }
    this.setData(update,function(){
      that.getjieri(l, function (_l) {
        that.setData({
          day: _l
        })
      })
    })

  },
  tapday(e) {
    if (this.data.day) this.data.day.tap = ""

    this.showDay(this.data.li[e.currentTarget.dataset.id])

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})