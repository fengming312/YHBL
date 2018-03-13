var app = getApp();
var cachedResults = {
	nextPage: 1,
	items: [],
	total: 0,
	num: 0
}
import request from '../../api/request'

Page({
	data: {
		width:'70%',
		height:'300rpx',
		mgl:'-35%',
		mgt:'300rpx',
		imgUrl:'http://b366.photo.store.qq.com/psb?/V11WmQSH3rLyY2/W0UbEaNr58hOv*fa3E7gb.gbBXWnbc5Ms8Q5MKZ36eQ!/b/dG4BAAAAAAAA&bo=qwYABcAP0AsRCYI!&rf=viewer_4',
		activityInfoObj:{},
		modelShow_img: false,
		modelShow: false,
		itemData: '',
		hide:false,
		sortIndex: 0,
		list: [],
		tagName: "",
		tagShow: false,
		buyText: "",
    inputValue:"",
    toTopShow:true,
    searchShow:false,
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
	
	onShow () {
    this.setData({
      inputValue:''
    })
		wx.showNavigationBarLoading() //在标题栏中显示加载
		this.loadData(1, this.data.currentTab);
	},
	
	onLoad: function () {
		wx.showNavigationBarLoading() //在标题栏中显示加载
		wx.setNavigationBarTitle({
			title: "2小时爆款榜"
		})
		wx.showLoading({
			title: '加载中',
		})
		this.loadData(1, this.data.currentTab);
		this.getActivityInfo()
	},

	getActivityInfo () {
		let that = this;
		request('/api/manage/getActivityInfo', {})
			.then((res) => {
				console.log(res);
				if (res.data.datas.show == '1') {
					that.setData({
						modelShow_img:true
					})
				}else {
					that.setData({
						modelShow_img:false
					})
				}
				that.setData({
					activityInfoObj:res.data.datas
				})
		})
	},
	
  toSearch () {
    if (this.data.inputValue) {
      wx.navigateTo({
        url: `../search/search?inputValue=${this.data.inputValue}`
      })
    }else {
      wx.showToast({
        title: '请输入关键词',
        icon:'none',
        duration: 1200
      })
		}
	},

  bindKeyInput: function(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },

  onPageScroll (e) {
    if (e.scrollTop <= 2000) {
      this.setData({
        searchShow:false
      })
    }else {
      this.setData({
        searchShow:true
      })
    }
    if (e.scrollTop >= 2500) {
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

	onShareAppMessage: function (res) {
		wx.showShareMenu({
			withShareTicket: true
		})
		if (res.from === 'button') {
			// 来自页面内按钮
			console.log(res.target)
		}
		return {
      title: '胜者为王，20分钟内最强爆款',
      imageUrl:'../../images/icon.jpg',
			success: function(res) {
				// 成功
				
				console.log(res);
			},
			fail: function(res) {
				// 失败
				console.log(res);
			}
		}
	},
	show (e) {
		if (!this.data.tagShow) {
			return false;
		}
		let itemData = e.currentTarget.dataset.data;
		itemData.index = e.currentTarget.dataset.index
		itemData.Quan_time = itemData.Quan_time.substr(0, 10)
//		itemData.coupon_start_time = itemData.coupon_start_time.substr(0, 10)
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
			let num_iid = e.currentTarget.dataset.data.GoodsID;
			let activity_id = e.currentTarget.dataset.data.Quan_id;
			let url = `https://uland.taobao.com/coupon/edetail?activityId=${activity_id}&itemId=${num_iid}&pid=mm_45185224_41898191_194664578`
			wx.request({
				url: 'https://senhuor.com/api/topApi',
				data: {
					"title": e.currentTarget.dataset.data.Title,
					"url": url,
					"logo": e.currentTarget.dataset.data.Pic,
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
	
	getActivity () {
		wx.showModal({
			content: `这是淘口令`,
			confirmText: '一键复制',
			success: res => {
				if (res.confirm) {
					wx.setClipboardData({
						data: '这是淘口令',
						success: function (res) {
							wx.showToast({
								title: '复制成功',
								duration: 1500,
							})
						}
					})
				}
			}
		})
	},
	
	hide () {
		this.setData({
			modelShow: false,
			hide:false
		})
	},
	
	closeImgModel () {
		this.setData({
			modelShow_img: false,
		})
	},
	
	swichSort (e) {
		this.setData({
			sortIndex: e.target.dataset.item.id
		})
	},
	
	loadData: function (page, tabNo) {
		var that = this;
		wx.request({
      url: 'https://senhuor.com/api/all',
			data: {
				"page": page,
				"api":"top_hour"
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
				if (res.data.code == '0') {
					let arr = res.data.data.result;
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
})