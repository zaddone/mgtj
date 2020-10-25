//app.js
//https://apis.map.qq.com/ws/geocoder/v1/?location=30.5702,104.06476&key=3BFBZ-ZKD3X-LW54A-ZT76D-E7AHO-4RBD5
const history = "history"
const searchKeys = "searchKeys"
const Week = ['日', '一', '二', '三', '四', '五', '六'];
const DD = ['', '明', '后']
var NowDay = new Date().getDate()
//var md5 = require('./util/md5.js')
App({
  rz: 6,
  rw: 20,
  towxml: require('/towxml/index'),
  onLaunch: function() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    this.db = wx.cloud.database()
    this.globalData = {
      //tmpdb: {},
      keyWords: [],
      content: {}
    }
  },
  getToday(hand) {
    if (this.globalData.today) {
      if (hand) hand(this.globalData.today)
      return
    }
    //console.log(y, m)
    let date = new Date;
    let db = {
      y: date.getFullYear(),
      m: date.getMonth() + 1,
      d: date.getDate(),
    }
    let that = this
    wx.request({
      url: 'https://www.zaddone.com/calendar/info',
      data: db,
      success: function(res) {
        if (!res.data.msg) return
        //console.log(res.data.msg)
        let db_ = res.data.msg.split(',')
        db.nm = db_[1]
        db.nd = db_[2]
        db.w = Week[parseInt(db_[3])]
        if (db_.length > 4)
          db.other = db_.slice(4)
        that.globalData.today = db
        //console.log(li)
        if (hand) hand(db)
      }
    })
  },
  getWeatherWithLoc(lat, loc, hand) {
    let that = this
    that.getCityWithLoc(lat, loc, function(c) {
      console.log(c)
      for (let i = c.length - 1; i >= 0; i--) {
        let city = c[i]
        if (city.length == 0) continue
        //console.log(city)
        that.getCityinfo(
          city,
          function(r) {
            //getCityWeather()
            console.log(c, r)
            let p = r[0]
            let ci = r[1]
            let d = ""
            if (r.length > 2) d = r[2]
            if (c[i - 2].indexOf(p) != -1 && c[i - 1].indexOf(ci) != -1) {
              that.getCityWeather(p, ci, d, hand)
              return true
            }
          })
        return
      }
    })
  },
  getTianqiWithLoc(hand) {
    let that = this
    if (this.globalData.loc) {
      this.getWeatherWithLoc(this.globalData.loc[0], this.globalData.loc[1], hand)
      return
    }
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        //console.log(res)
        that.globalData.loc = [res.latitude, res.longitude]
        that.getWeatherWithLoc(res.latitude, res.longitude, hand)
      }
    })
  },
  getTianqiWithIP(hand) {
    let that = this
    this.getCityWithIp(function(res) {
      let c = res.split(/省|市|县|区|镇/)
      for (let i = c.length - 1; i >= 0; i--) {
        let city = c[i]
        if (city.length == 0) continue
        that.getCityinfo(
          city,
          function(r) {
            //getCityWeather()
            //console.log(r, c)
            let p = r[0]
            let ci = r[1]
            let d = ""
            if (r.length > 2) d = r[2]
            if (c[0].indexOf(p) != -1 && c[1].indexOf(ci) != -1) {
              that.getCityWeather(p, ci, d, hand)
              return true
            }
          })
        return
      }
    })
  },
  getTianqi(hand) {
    //locationEnabled
    let that = this
    if (wx.authorize({
        scope: 'scope.userLocationBackground',
      })) {
      that.getTianqiWithLoc(hand)
      return
    } else {
      this.getTianqiWithIP(hand)
    }
  },
  getCityWithLoc(lat, lng, hand) {
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + lat + ',' + lng + '&key=3BFBZ-ZKD3X-LW54A-ZT76D-E7AHO-4RBD5',
      success(res) {
        console.log(res.data)
        hand(res.data.result.ad_info.name.split(','))
      },
    })
  },

  getUserInfo(hand) {
    if (this.globalData.userInfo) {
      hand(this.globalData.userInfo)
      return
    }
    let that  = this
    wx.cloud.callFunction({
      name: 'userInfo',
      success: function(res) {
        that.globalData.userInfo = res.result
        hand(res.result)
      },
    })
  },
  getContent(id, hand,fail) {
    let db = this.globalData.content[id]
    if (db) {
      console.log(db.Title)
      hand(db)
      return
    }
    let that = this
    this.db.collection('content').doc(id).get().then(res => {
      res.data.Title = res.data.Title.replace(/_([^_]+)_/, "$1")
      if (res.data.Type == 1) {
        res.data.Content = res.data.Content.replace(/_([^_]+)_/, "$1").replace(/\!?\[[^\]]*\]\([^)]*\)/g, function (w) {
        //console.log(w)
        if (/svg/.test(w)) return "";
        if (/^\!/.test(w)) return '';
        return w
      })
       
      }
      hand(res.data)
      this.globalData.content[id] = res.data

      //that.saveContent(res.data)
    }).catch((e) => {
      console.log(e)
      if (fail)fail()
    });
  },
  getLink(id, hand,fail) {
    this.db.collection('links').doc(id).get().then(res => {
      console.log(res)
      if (!res.data.link || res.data.link.length == 0) return
      hand(res.data.link)
      //that.saveContent(res.data)
    }).catch((e) => {
      console.log(e)
      if (fail)fail()
    });
  },
  getContent_(id, hand) {
    let that = this
    let db = wx.getStorage({
      key: id,
      success: function(res) {
        //console.log(res)
        if (!res.data || parseInt(+new Date() / 1000) - res.data.time > 3600) {
          that.db.collection('content').doc(id).get().then(res => {
            console.log(res.data)
            hand(res.data)
            that.saveContent(res.data)
          })
          return
        }
        hand(res.data)
      },
      fail: function() {
        that.db.collection('content').doc(id).get().then(res => {
          hand(res.data)
          that.saveContent(res.data)
        })
      },
    })
  },
  getHistorage(hand) {
    wx.getStorage({
      key: history,
      success: function(r) {
        hand(r.data)
      },
    })
  },
  setHistorage(id) {
    wx.getStorage({
      key: history,
      success: function(r) {
        //r.data.push(db._id)
        r.data.unshift(id)
        r.data = Array.from(new Set(r.data))
        if (r.data.length > 100) {
          r.data = r.data.slice(0, 100)
        }
        wx.setStorage({
          key: history,
          data: r.data,
        })
      },
      fail: function() {
        wx.setStorage({
          key: history,
          data: [id],
        })
      }
    })
  },
  saveContent(db) {
    if (db.Type != 2) return
    db.time = parseInt(+new Date() / 1000);
    wx.setStorage({
      key: db._id,
      data: db,
      success: function() {
        wx.getStorage({
          key: history,
          success: function(r) {
            //r.data.push(db._id)
            r.data.unshift(db._id)
            r.data = Array.from(new Set(r.data))
            if (r.data.length > 100) {
              r.data.slice(100).forEach(function(v) {
                wx.removeStorage({
                  key: v
                })
              })
              r.data = r.data.slice(0, 100)
            }
            wx.setStorage({
              key: history,
              data: r.data,
            })
          },
          fail: function() {
            wx.setStorage({
              key: history,
              data: [db._id],
            })
          }
        })
      },
    })
  },
  getSearchKey(w) {
    let word = new Set(w.toLowerCase().split(/[^\dA-Za-z\u3007\u3400-\u4DB5\u4E00-\u9FCB\uE815-\uE864]/g))
    //console.log(word)
    for (let x of word) {
      if (x.length <= 1) {
        word.delete(x)
        continue
      }
      let _x = x.match(/[0-9a-zA-Z]+|[\u3007\u3400-\u4DB5\u4E00-\u9FCB\uE815-\uE864]/g);
      for (let i = 0; i < _x.length; i++) {
        let str = _x[i]
        if (str.length > 1)
          word.add(str)
        for (let _i = i + 1; _i < _x.length; _i++) {
          str += _x[_i]
          word.add(str)
        }
      }
    }
    //console.log(word)
    return Array.from(word)
    // return this.objToArray(word)
  },
  reqWords(w, hand) {
    //console.log(w)
    let that = this
    this.getUserInfo(function(info) {
      console.log(info)
      that.db.collection(info.config.collword).where({
        _id: that.db.command.in(w)
      }).get({
        success: function(res) {
          let Idmap = new Map()
          res.data.forEach(function(k) {
            let sum = 1 / k.link.length + k._id.length;
            k.link.forEach(function(l, i) {
              Idmap.set(l, ((Idmap.get(l) || 0) + (i / k.link.length) + sum))
            })
          })
          var arrayObj = Array.from(Idmap);
          arrayObj.sort(function(a, b) {
            return b[1] - a[1]
          })
          //console.log(arrayObj)
          let list = []
          arrayObj.forEach(function(value) {
            list.push(value[0])
          })
          hand(list)
        },
      })
    })
  },
  getCityWeather(province, city, district, handweatcher) {
    let that = this
    wx.request({
      url: 'https://wis.qq.com/weather/common',
      data: {
        source: 'pc',
        weather_type: 'observe|forecast_1h|forecast_24h|alarm|tips|rise',
        province: province,
        city: city,
        county: district,
      },
      success(res) {
        console.log(res)
        let dataW = []
        let alarm = []
        for (let i in res.data.data.alarm) {
          let ala = res.data.data.alarm[i]
          let adb = {
            title: ala.province + ala.city + ala.county + ala.type_name + ala.level_name + '预警 ',
            text: ala.detail,
          }
          alarm.push(adb)
        }
        let week = -1
        for (let i in res.data.data.forecast_24h) {
          let w = res.data.data.forecast_24h[i]
          let t = new Date(w.time)
          if (week === t.getDay()) {
            continue
          }
          week = t.getDay()
          let month = t.getMonth() + 1
          dataW.push({
            day_weather_code: w.day_weather_code,
            night_weather_code: w.night_weather_code,
            max_degree: w.max_degree,
            min_degree: w.min_degree,
            date: month + "-" + t.getDate(),
            week: '周' + Week[week],
            today: (week === new Date().getDay()) ? 'today' : '',
          })
        }
        let hd = []
        if (res.data.data.rise.length > 0) {
          that.rz = parseInt(res.data.data.rise[0].sunrise.substring(0, 2))
          that.rw = parseInt(res.data.data.rise[0].sunset.substring(0, 2))
        }

        for (let i in res.data.data.forecast_1h) {
          let w = res.data.data.forecast_1h[i]
          let h = parseInt(w.update_time.substring(8, 10))
          let c = (h > that.rz && h < that.rw) ? "d" : 'n'
          hd.push({
            weather: w.weather,
            weather_code: c + w.weather_code,
            degree: w.degree,
            wind: w.wind_direction,
            time_tag: DD[parseInt(w.update_time.substring(6, 8)) - NowDay],
            update_time: h,
          })

        }
        let tips = []
        if (res.data.data.tips.forecast_24h) {
          for (let i in res.data.data.tips.forecast_24h) {
            tips.push(res.data.data.tips.forecast_24h[i])
          }
        }
        if (res.data.data.tips.observe)
          for (let i in res.data.data.tips.observe) {
            tips.push(res.data.data.tips.observe[i])
          }
        let nowH = new Date().getHours()
        //console.log(nowH)
        let base = {
          degree: res.data.data.observe.degree,
          weather_code: ((nowH > that.rz && nowH < that.rw) ? 'd' : 'n') + res.data.data.observe.weather_code,
          weather: res.data.data.observe.weather,
        }
        handweatcher({
          alarm: alarm,
          cityname: city + ' ' + district,
          show: "visible",
          w: base,
          dayW: dataW,
          hd: hd,
          tips: tips[Math.floor(Math.random() * tips.length)],
        })
        //console.log(res)
      },
    })
  },
  getCityinfo(city, hand) {
    console.log(city)
    let that = this
    wx.request({
      url: 'https://wis.qq.com/city/matching',
      data: {
        source: 'pc',
        city: city,
      },
      success(res) {
        let li = res.data.data.internal
        //console.log(li, city)
        for (let v in li) {
          if (hand(li[v].replace(' ', '').split(",")))
            return
        }
        if (city.length > 1) that.getCityinfo(city.substring(0, city.length - 1), hand);
      },
      fail(res) {
        console.log(res)
        //wx.reLaunch({ url: "/pages/search/search" })
      }
    })
  },
  getCityWithIp(hand) {
    wx.request({
      url: 'https://pv.sohu.com/cityjson?ie=utf-8',
      success(res) {
        hand(JSON.parse(res.data.match(/\{.+\}/)[0]).cname)
        //hand(res.data)
      },
      fail(res) {
        console.log(res)
        //wx.reLaunch({ url: "/pages/search/search" })
      }
    })
  },
  clipboardData: function () {
    let that = this
    wx.getClipboardData({
      success(res) {
        if (!res.data) {
          //that.globalData.clipboard=''
          return;
        }
        if (that.clipboard && that.clipboard === res.data) return;
        that.clipboard = res.data;
        that.handKeyWords(res.data,
          that.showModeToPage
        )
        return
      }
    })
  },
  onShow() {
    let that = this
    //this.getUserInfo(function(info){    
    let k = setInterval(
      function () {
        that.clipboardData()
        clearInterval(k)
      }, 3000)
    //})  
  },
  getGoodsData(py, id, hand, fail) {
    let that = this
    if (that.globalData.goodsdb && that.globalData.goodsdb.Id == id) {
      //console.log("find")
      hand(that.globalData.goodsdb)
      return
    }
    wx.showLoading({
      title: '请稍等',
    })
    wx.request({
      url: 'https://www.zaddone.com/site/goodsid/' + py,
      data: { goodsid: id },
      success: function (res) {
        if (res.statusCode != 200 || !res.data || res.data.length === 0) {
          wx.showToast({
            title: '没有找到',
            icon: 'none'
          })
          return;
        }
        let db = res.data[0]
        that.globalData.goodsdb = db;
        hand(db)
      },
      fail: fail,
      complete: function () {
        wx.hideLoading();
      }
    })
  },
  getShoppings: function (hand) {
    if (this.globalData.shoppings) {
      hand(this.globalData.shoppings)
      return;
    }
    let that = this
    wx.request({
      url: "https://www.zaddone.com/site/",
      data: { content_type: "json" },
      success: function (res) {
        //console.log(res)
        let shopping = []
        //let other
        res.data.forEach(function (v, i) {
          if (v.py === 'taobao') {
            v.template = '_taobao'
          } else {
            v.template = ''
          }
          v.title = v.Name
          shopping.push(v)
        })
        //shopping.push(other)
        that.globalData.shoppings = shopping;
        hand(that.globalData.shoppings)
      },
      fail: function () {
        wx.navigateBack({})
      },
    })
  },
  showModeToPage(py, id) {
    this.getGoodsData(py, id, function (db) {
      let title = '找到商品'
      if (db.Fprice) {
        title = "￥" + db.Price + '返' + db.Fprice
      }
      wx.showModal({
        title: title,
        content: db.Name,
        success(res) {
          if (res.confirm) {
            console.log(py, id)
            //wx.navigateTo({
            //let tem = py==='taobao'?'_taobao':''
            wx.reLaunch({
              url: '/pages/view/view' + (py === 'taobao' ? '_taobao' : '') + '?show=true&py=' + py + '&goods=' + id,
            })
            //console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }, function () {
      wx.showToast({
        title: '没有找到',
        duration: 5000,
      })
    })
  },
  handKeyWords(data, handhttp) {
    let that = this;
    let val = /(http[\S]+)[\+| ]?/.exec(data)
    if (!val) {
      return
    }
    var url = val[1];
    wx.request({
      url: 'https://www.zaddone.com/site/goodsurl',
      data: { url: url },
      success: function (res) {
        console.log(res)
        if (!res.data.db || res.data.db.length == 0) {
          data = data.replace(url, "")
          if (data.length === 0) {
            wx.showToast({
              title: '没有找到优惠信息',
              icon: 'none',
              duration: 5000,
            })
            return;
          }
          wx.showModal({
            title: '没有找到优惠信息',
            content: data,
            confirmText: '再试一试',
            success: function (_res) {
              if (!_res.confirm) return
              that.getShoppings(function (shoppings) {
                for (let i in shoppings) {
                  if (shoppings[i].py === res.data.py) {
                    wx.reLaunch({
                      url: '/pages/index/list?q=' + data + '&tab=' + i,
                    })
                    return
                  }
                }
              })
            }
          })
          return;
        }
        that.globalData.goodsdb = res.data.db[0];
        handhttp(res.data.py, res.data.db[0].Id)
      },
    })
  },
})