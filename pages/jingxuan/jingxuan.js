var app = getApp();
var cachedResults = {
	nextPage: 1,
	items: [],
	total: 0,
	num: 0
}
let touchDot = 0;//触摸时的原点
let touchDotY = 0;//触摸时的原点
let idx = 0;
let leftMove = false;
let rightMove = false;

Page({
	data: {
		sortIndex: 0,
		sort: "",
		modelShow: false,
		itemData: '',
		modle: '',
		hide: false,
		list: [],
		currentTab: 0,
		scrollLeftDis: 0,
		tagName: "",
		tagShow: false,
		buyText: "",
    toTopShow:true,
		sortList: [
			{
				id: 0,
				name: '综合',
				sort: ''
			},
			{
				id: 1,
				name: '最新',
				sort: 'new'
			},
			{
				id: 2,
				name: '销量',
				sort: 'sale_num'
			},
			{
				id: 3,
				name: '价格',
				sort: 'price_asc'
			}
		],
		navList: [
			{
				fid: 0,
				name: '精选'
			},
			{
				fid: 1,
				name: '女装'
			},
			{
				fid: 2,
				name: '男装'
			},
			{
				fid: 3,
				name: '内衣'
			},
			{
				fid: 4,
				name: '数码'
			},
			{
				fid: 5,
				name: '美食'
			},
			{
				fid: 6,
				name: '美妆'
			},
			{
				fid: 7,
				name: '母婴'
			},
			{
				fid: 8,
				name: '鞋包'
			},
			{
				fid: 9,
				name: '家居'
			},
			{
				fid: 10,
				name: '车品'
			},
			{
				fid: 11,
				name: '其他'
			},
		],
		loading:true
	},
	onLoad: function () {
		
		wx.showNavigationBarLoading() //在标题栏中显示加载
		wx.showLoading({
			title: '加载中',
		})
		this.loadData(1, this.data.currentTab);
		//调用应用实例的方法获取全局数据
	},
	onShareAppMessage: function (res) {
		wx.showShareMenu({
			withShareTicket: true
		})
		if (res.from === 'button') {
			// 来自页面内转发按钮
			console.log(res.target)
		}
		return {
      title: '胜者为王，20分钟内最强爆款',
			imageUrl: '../../images/icon.jpg',
			success: function (res) {
				// 转发成功
				console.log(res);
			},
			fail: function (res) {
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
		let itemData = e.currentTarget.dataset.data;
		itemData.index = e.currentTarget.dataset.index;
		if (this.data.currentTab == 0) {
			itemData.Quan_time = itemData.Quan_time.substr(0, 10)
		}else {
			itemData.coupon_end_time = itemData.coupon_end_time.substr(0, 10)
			itemData.coupon_start_time = itemData.coupon_start_time.substr(0, 10)
		}
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
			let goods_id = e.currentTarget.dataset.data.goods_id;
			let coupon_id = e.currentTarget.dataset.data.coupon_id;
			let url = `https://uland.taobao.com/coupon/edetail?activityId=${coupon_id}&itemId=${goods_id}&pid=mm_45185224_41898191_194664578`;
			wx.request({
//				url: 'https://senhuor.com/api/topApi',
				url: 'http://localhost:3001/api/topApi',
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
			hide: false
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
		this.loadData(1, this.data.currentTab, this.data.sort)
	},
	
	swichNav: function (e) {
		var that = this;
		let current
		if (typeof e == 'object') {
			current = e.target.dataset.current
		}else {
			current = e
		}

		this.setData({
			sortIndex: 0,
			sort: ''
		})
		wx.showNavigationBarLoading() //在标题栏中显示加载
		wx.showLoading({
			title: '加载中',
		})
		wx.pageScrollTo({
      scrollTop: 0,
      duration: 1
		})
		wx.getSystemInfo({
			success: function (res) {
				let screenWidth = res.windowWidth
				if (typeof e == 'object') {
					idx = current
					that.setData({
						currentTab: current,
					})
					if (e.currentTarget.offsetLeft + 30 > (screenWidth / 2)) {
						let dis = e.currentTarget.offsetLeft - screenWidth / 2 + 30
						that.setData({
							scrollLeftDis: dis
						})
					} else {
						that.setData({
							scrollLeftDis: 0
						})
					}
				}else {
					if (60*current + 30 > (screenWidth / 2)) {
						let dis = 60*current - screenWidth / 2 + 30
						that.setData({
							scrollLeftDis: dis
						})
					} else {
						that.setData({
							scrollLeftDis: 0
						})
					}
				}
			}
		})
		
		this.loadData(1, current, this.data.sort)
	},
	
	touchStart:function(e){
    return false
		touchDot = e.touches[0].pageX; // 获取触摸时的原点
		touchDotY = e.touches[0].pageY; // 获取触摸时的原点
		leftMove = false;
		rightMove = false;
	},
	
	touchMove (e) {
    console.log(1111);
    return false
		var touchMove = e.touches[0].pageX;
		var touchMoveY = e.touches[0].pageY;
		let yDis = Math.abs(touchMoveY - touchDotY)
		if(touchMove - touchDot <= -40 && yDis < 20 ){
			leftMove = true
		}
		if(touchMove - touchDot >= 40 && yDis < 20 ){
			rightMove = true;
		}
	},
	
	// 触摸结束事件
	touchEnd:function(e){
		return false
		if (leftMove && this.data.loading) {
			if (idx == 11) {
				return false;
			}
			idx++;
			this.setData({
				currentTab:idx
			})
			this.swichNav(idx)
		}
		if (rightMove && this.data.loading) {
			if (idx == 0) {
				return false;
			}
			idx--;
			this.setData({
				currentTab:idx
			})
			this.swichNav(idx)
		}
	},
	
	loadData: function (page, tabNo, sort) {
		var that = this;
		this.setData({
			loading:false
		})
		wx.request({
			url: 'https://senhuor.com/api/all',
			data: {
				"page": page,
				"cate_id": tabNo,
				"sort": sort,
				"api": "all"
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
				if (res.data) {
					let arr = [];
					let dataArr = [];
					if (tabNo == 0) {
						dataArr = res.data.data.result;
					}else {
						dataArr = res.data.data.data;
					}
					for (let i = 0; i < dataArr.length; i++) {
						if (tabNo == 0) {
							dataArr[i].coupon_amount = dataArr[i].Quan_price
							dataArr[i].goods_pic = dataArr[i].Pic
							dataArr[i].goods_short_title = dataArr[i].Title
							dataArr[i].goods_intro = dataArr[i].Introduce
							dataArr[i].goods_price = dataArr[i].Org_Price
							dataArr[i].goods_sale_num = dataArr[i].Sales_num
							dataArr[i].huiyuan_price = dataArr[i].Price
							dataArr[i].dsr = dataArr[i].Dsr
							dataArr[i].goods_id = dataArr[i].GoodsID
							dataArr[i].coupon_id = dataArr[i].Quan_id
						}else {
							if (!dataArr[i].goods_pic.startsWith("http")) {
								dataArr[i].goods_pic = "http:"+dataArr[i].goods_pic;
							}
							dataArr[i].huiyuan_price = parseFloat(dataArr[i].goods_price - dataArr[i].coupon_amount).toFixed(0);
						}
						if (dataArr[i].goods_sale_num >= 100 && dataArr[i].dsr >= 4.8) {
							arr.push(dataArr[i])
						}
					}
					if (page == 1) {
						cachedResults.nextPage = 1
						cachedResults.items = arr
					} else {
						cachedResults.items = cachedResults.items.concat(arr)
					}
					if (cachedResults.items.length >= 800) {
						wx.pageScrollTo({
              scrollTop: 0,
              duration: 1
						})
						cachedResults.items.splice(0)
						cachedResults.items = cachedResults.items.concat(arr)
					}
					that.setData({
						list: cachedResults.items,
						loading:true
					})
				} else {
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
	
	onPullDownRefresh () {
		wx.showLoading({
			title: '刷新中',
		})
		this.loadData(1, this.data.currentTab, this.data.sort)
	},
	
	onReachBottom () {
		wx.showNavigationBarLoading() //在标题栏中显示加载
		cachedResults.nextPage += 1
		this.loadData(cachedResults.nextPage, this.data.currentTab, this.data.sort)
	},
})