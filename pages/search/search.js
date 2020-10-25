//index.js
const app = getApp()
Page({
  limit: 5,
  maxLimit: 50,
  mainList: [],
  data: {
    focus: false,

  },
  begin: 0,
  end: 0,
  closeInput(e) {
    console.log(e)
    this.setData({
      key: '',
      focus: true
    })
  },

  showContent() {
    if (!this.mainList || this.mainList.length == 0) return
    if (!this.data.list) this.data.list = []
    let that = this

    for (let i = 0; i < this.limit; i++) {
      if (this.mainList.length == 0) {
        let k = setTimeout(
          function() {
            that.showContent()
            clearTimeout(k)
          }, 2000)
        break
      }
      app.getContent(this.mainList.shift(), function(db) {
        let par = db.parentId
        if (par) {
          if (!app.globalData.content[par]) {
            that.mainList.unshift(par)
            that.mainList = Array.from(new Set(that.mainList))
          }
        }
        app.getLink(db._id, function(list) {
          console.log(list)
          db.link = list
          list.forEach(function(_l) {
            //console.log(_l)
            if (!app.globalData.content[_l]) {
              that.mainList.unshift(_l)
              that.mainList = Array.from(new Set(that.mainList))
            }
          })
          //that.showContent()
        })
        //console.log(db)
        let remark = ''
        if (db.Type == 1) {
          for (let s of db.Content.split(/\n/)) {
            if (/\!?\[[^\]]*\]\([^)]*\)/.test(s)) continue
            if (s.length == 0) continue
            remark += s.replace(/[^\w\u3007\u3400-\u4DB5\u4E00-\u9FCB\uE815-\uE864]+/, '')
            if (remark.length > 100) {
              remark = remark.substr(0, 100) + "......"
              break
            } else {
              remark += ' '
            }
          }
        }
        that.data.list.push({
          Title: db.Title,
          _id: db._id,
          remark: remark,
          Type: db.Type
        })
        let x = that.data.list.length > that.maxLimit
        if (x > 0) {
          that.data.list = that.data.list.slice(x)
        }
        that.setData({
          list: that.data.list
        })
      })
    }
  },


  onShow() {
    let sinfo = wx.getSystemInfoSync()
    console.log(sinfo)
    let rate = sinfo.screenWidth / 750
    let t = sinfo.statusBarHeight + sinfo.safeArea.top * 2
    this.setData({
      top: t,
      iconSize: rate * 80,
      topd: t + rate * 100,
    })
  },

  onLoad: function(e) {
    if (e.q) {
      this.search(e.q)
    } else {
      this.showHistory()
    }
    //console.log(Array.from(new Set([1,8,2,8,1])))
  },
  showHistory() {
    let that = this
    app.getHistorage(function(db) {
      console.log(db)
      that.mainList = db
      that.showContent()
      //that.getNextPage()
    })
  },
  search(key) {

    this.setData({
      key: key,
      list: [],
    })
    app.globalData.content = {}
    let that = this
    app.reqWords(app.getSearchKey(key), function(li) {
      //console.log(li)
      that.mainList = li
      that.showContent()
    })
  },
  searchContent(event) {
    let key = event.detail.value
    if (!key) return;
    this.search(key)
  },
  moreTap(e) {
    this.showContent()
  },
  onPullDownRefresh() {

  },
  onReachBottom() {
    console.log("bottom")
    this.moreTap()
  },
  chickItem(e) {
    console.log(e)
    let that = this
    let db = app.globalData.content[e.currentTarget.dataset.id]
    console.log(db)
    if (db.parentId) {
      let par = db.parentId
      if (!app.globalData.content[par]) {
        this.mainList.unshift(par)
        this.mainList = Array.from(new Set(this.mainList))
      }
    }

    if (db.link) {
      db.link.forEach(function(l) {
        if (!app.globalData.content[l]) {
          that.mainList.unshift(l)
          that.mainList = Array.from(new Set(that.mainList))
        }
      })
    }
    if (db.Type == 2) {
      wx.navigateTo({
        url: '/pages/page/video?id=' + db._id,
      })
    } else if (db.Type == 1) {
      wx.navigateTo({
        url: '/pages/page/view?id=' + db._id,
      })
    }
  },

})