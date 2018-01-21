var app = getApp();
var cachedResults = {
  nextPage: 1,
  items: [],
  total: 0,
  num: 0
}
Page({
  data: {
    searchValue:'',
    sortIndex: 0,
    sort: "1",
    nomore:false,
    loading:true,
    itemData: '',
    list: [],
    tagName: "",
    tagShow: false,
    buyText: "",
    toTopShow:true,
    sortList: [
      {
        id: 0,
        name: '综合',
        sort: '1'
      },
      {
        id: 1,
        name: '最新',
        sort: '2'
      },
      {
        id: 2,
        name: '销量',
        sort: '3'
      },
      {
        id: 3,
        name: '价格',
        sort: '4'
      }
    ],
  },

  onLoad: function(option){
    this.setData({
      searchValue: option.inputValue
    })
    this.loadData(option.inputValue)
  },

  onPageScroll (e) {
    if (e.scrollTop >= 1300) {
      this.setData({
        toTopShow:false
      })
    }else {
      this.setData({
        toTopShow:true
      })
    }
  },

  toTop () {
    this.setData({
      toTopShow:true
    })
    wx.pageScrollTo({
      scrollTop: 0,
    })
  },

  bindKeyInput: function(e) {
    this.setData({
      searchValue: e.detail.value
    })
  },

  search () {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    })
    this.loadData(this.data.searchValue)
  },

  show (e) {
    if (!this.data.tagShow) {
      return false;
    }
    let itemData = e.currentTarget.dataset.data;
    itemData.index = e.currentTarget.dataset.index
    itemData.coupon_end_time = itemData.coupon_end_time.substr(0, 10)
    itemData.coupon_start_time = itemData.coupon_start_time.substr(0, 10)
    this.setData({
      itemData: itemData,
      modelShow: true,
      hide: true
    })
  },

  loadData: function (searchValue='全部', page=1, sort=1) {
    var that = this;
    this.setData({
      loading:false
    })
    wx.request({
      // url: 'https://senhuor.com/api/all',
      url: 'http://localhost:3001/api/all',
      data: {
        "page": page,
        "api": "search",
        "searchValue":searchValue,
        "sort":sort
      },
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.data.tagShow == '1') {
          that.setData({
            tagShow: true,
            buyText: res.data.buyText,
          })
        }
        if (res.data.data.data) {
          that.setData({
            loading: true,
          })
          if (!res.data.data.data.list.length) {
            that.setData({
              nomore:true,
            })
          }else {
            that.setData({
              nomore:false,
            })
          }
          let arr = res.data.data.data.list;
          for (let i = 0; i < arr.length; i++) {
            arr[i].goods_intro = arr[i].goods_introduce
            arr[i].coupon_amount = arr[i].coupon_price
            arr[i].goods_sale_num = arr[i].goods_sales
            arr[i].dsr = '4.8'
            arr[i].huiyuan_price = parseFloat(arr[i].goods_price-arr[i].coupon_price).toFixed(0);
          }
          if (page == 1) {
            cachedResults.nextPage = 1
            cachedResults.items = arr
          }else {
            cachedResults.items = cachedResults.items.concat(arr)
          }
          if (cachedResults.items.length >= 800) {
            wx.pageScrollTo({
              scrollTop: 0,
              duration: 0
            })
            cachedResults.items.splice(0)
            cachedResults.items = cachedResults.items.concat(arr)
          }
          that.setData({
            list: cachedResults.items,
          })
        }else {
          wx.showToast({
            title: '没有数据了',
            duration: 1200,
          })
        }
      },
      complete: function () {
        // complete
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
        wx.hideLoading()
      }
    })
  },

  setClipboardData (e) {
    let _this = this;
    if (e.currentTarget.dataset.data.modle) {
      wx.showModal({
        content: `${this.data.buyText}${e.currentTarget.dataset.data.modle}`,
        confirmText: '一键复制',
        success: res => {
          if (res.confirm) {
            wx.setClipboardData({
              data: e.currentTarget.dataset.data.modle,
              success: function (res) {
                wx.showToast({
                  title: '复制成功',
                  duration: 1500,
                })
                setTimeout(() => {
                  _this.setData({
                    modelShow: false
                  })
                }, 2000)
              }
            })

          }
        }
      })
    }else {
      let num_iid = e.currentTarget.dataset.data.goods_id;
      let activity_id = e.currentTarget.dataset.data.coupon_id;
      let url = `https://uland.taobao.com/coupon/edetail?activityId=${activity_id}&itemId=${num_iid}&pid=mm_45185224_41898191_194664578`
      wx.request({
        url: 'https://senhuor.com/api/topApi',
        data: {
          "title": e.currentTarget.dataset.data.goods_short_title,
          "url": url,
          "logo": e.currentTarget.dataset.data.goods_pic,
        },
        method: 'POST',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: res => {
          if (res.data) {
            let modle = res.data.data.modle;
            let index = "list[" + Number(e.currentTarget.dataset.data.index) + "].modle";//先用一个变量，把(info[0].gMoney)用字符串拼接起来
            this.setData({
              [index]:modle
            })
            wx.showModal({
              content: `${this.data.buyText}${modle}`,
              confirmText: '一键复制',
              success: res => {
                if (res.confirm) {
                  wx.setClipboardData({
                    data: modle,
                    success: function (res) {
                      wx.showToast({
                        title: '复制成功',
                        duration: 1500,
                      })
                      setTimeout(() => {
                        _this.setData({
                          modelShow: false
                        })
                      }, 2000)
                    }
                  })
                }else {
                  _this.hide()
                }
              }
            })
          }
        },
      })
    }
  },

  hide () {
    this.setData({
      modelShow: false,
      hide:false
    })
  },

  swichSort (e) {
    this.setData({
      sortIndex: e.target.dataset.item.id,
      sort: e.target.dataset.item.sort
    })
    wx.showLoading({
      title: '加载中',
    })
    this.loadData(this.data.searchValue, 1, this.data.sort)
  },

  onPullDownRefresh () {
    wx.showLoading({
      title: '刷新中',
    })
    this.loadData(this.data.searchValue,1,this.data.sort)
  },

  onReachBottom () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    cachedResults.nextPage += 1
    this.loadData(this.data.searchValue,cachedResults.nextPage,this.data.sort)
  },
})