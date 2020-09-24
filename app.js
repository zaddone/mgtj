//app.js
App({
  towxml: require('/towxml/index'),
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }
    this.db = wx.cloud.database()
    this.globalData = {tmpdb:{}}
  },
  setTmpDB(db){
    this.saveContent(db)
    this.globalData.tmpdb = db
  },
  getContent(id,hand){
    let that = this
    let db = wx.getStorage({
      key:id,
      success:function(res){
        //console.log(res)
        if (!res.data || parseInt(+new Date() / 1000) - res.data.time > 3600){
          that.db.collection('content').doc(id).get().then(res => {
            console.log(res.data)
            hand(res.data)
            that.saveContent(res.data)
          })
          return
        }  
        hand(res.data)
      },
      fail:function(){
        that.db.collection('content').doc(id).get().then(res => {
          hand(res.data)
          that.saveContent(res.data)
        })
      },
    })
 },
 getHistorage(hand){
   wx.getStorage({
     key: 'history',
     success: function (r) {
       hand(r.data)
     },
   })
 },
 saveContent(db){
   db.time = parseInt(+new Date() / 1000);
   wx.setStorage({
     key: db._id,
     data: db,
     success:function(){
       wx.getStorage({
         key: 'history',
         success: function(r) {
           //r.data.push(db._id)
           r.data.unshift(db._id)
           r.data = Array.from(new Set(r.data))
           if (r.data.length>100){
             r.data.slice(100).forEach(function (v) {
               wx.removeStorage({ key: v })
             })
             r.data = r.data.slice(0, 100)
           }
           wx.setStorage({
             key: 'history',
             data: r.data,
           })
         },
       })       
     },
   })
 },
  getSearchKey(w) {
    let word = new Set(w.toLowerCase().split(/[^\dA-Za-z\u3007\u3400-\u4DB5\u4E00-\u9FCB\uE815-\uE864]/g))
    console.log(word)
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

    return this.objToArray(word)
  },
  objToArray(map) {
    if (map.length === 0) return;
    let resstr = [];
    for (let w of map) {
      resstr.push(w)
    }
    resstr.sort(function (obj1, obj2) {
      var val1 = obj1.length;
      var val2 = obj2.length;
      if (val1 > val2) {
        return -1;
      } else if (val1 < val2) {
        return 1;
      } else {
        return 0;
      }
    })
    return resstr
  },
})
