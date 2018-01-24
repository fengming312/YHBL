var app = getApp();
var cachedResults = {
	nextPage: 1,
	items: [],
	total: 0,
	num: 0
}

Page({
	data: {
		loading:true,
		itemData: '',
		hide:false,
		sortIndex: 0,
		list: [],
		tagName: "",
		tagShow: false,
		buyText: "",
    toTopShow:true,
		sortList: [
			{
				id: 0,
				name: '综合'
			},
			{
				id: 1,
				name: '最新'
			},
			{
				id: 2,
				name: '销量'
			},
			{
				id: 3,
				name: '价格'
			}
		],
	},
	onLoad: function () {
		wx.showNavigationBarLoading() //在标题栏中显示加载
		wx.setNavigationBarTitle({
			title: "全天销量榜"
		})
		wx.showLoading({
			title: '加载中',
		})
		this.loadData(1, this.data.currentTab);
	},
	onShareAppMessage: function (res) {
		if (res.from === 'button') {
			// 来自页面内转发按钮
			console.log(res.target)
		}
		return {
      title: '胜者为王，20分钟内最强爆款',
      imageUrl:'../../images/icon.jpg',
			success: function(res) {
				// 转发成功
			},
			fail: function(res) {
				// 转发失败
			}
		}
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
			sortIndex: e.target.dataset.item.id
		})
	},
	
	loadData: function (page, tabNo) {
		var that = this;
		this.setData({
			loading:false
		})
		wx.request({
			url: 'https://senhuor.com/api/all',
			data: {
				"page": page,
				"api":"top_day"
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
				if (res.data.data.code == '200') {
					let arr = [];
					let dataArr = res.data.data.data;
					for (let i = 0; i < dataArr.length; i++) {
						if (!dataArr[i].goods_pic.startsWith("http")) {
							dataArr[i].goods_pic = "http:"+dataArr[i].goods_pic;
						}
						dataArr[i].huiyuan_price = parseFloat(dataArr[i].goods_price-dataArr[i].coupon_amount).toFixed(0);
						if (dataArr[i].goods_sale_num >= 50 && dataArr[i].dsr >= 4.6) {
							arr.push(dataArr[i])
						}
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
						loading:true
					})
				}else {
					wx.showToast({
						title: '没有数据了',
						duration: 1200,
					})
				}
			},
			complete: function () {
				wx.hideNavigationBarLoading() //完成停止加载
				wx.stopPullDownRefresh() //停止下拉刷新
				wx.hideLoading()
			}
		})
	},
	
	onPullDownRefresh () {
		wx.showLoading({
			title: '刷新中',
		})
		this.loadData(1)
	},
	
	onReachBottom () {
		wx.showNavigationBarLoading() //在标题栏中显示加载
		cachedResults.nextPage += 1
		this.loadData(cachedResults.nextPage)
	},
})