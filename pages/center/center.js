var app = getApp();
import request from '../../api/request'

Page({
	data: {
		avatar: '',
		nickName: '',
		loginStatus: false,
		shareDisabled:false,
		signDisabled:false,
		points:0,
		money:0,
		openid:''
	},
	
	onLoad () {
		wx.showLoading({
			title: '加载中',
		})
		this.getLoginInfo()
	},
	
	getLoginInfo () {
		let that = this
		wx.getUserInfo({
			success: (res) => {
				this.setData({
					avatar: res.userInfo.avatarUrl,
					nickName: res.userInfo.nickName,
					loginStatus: true,
				})
				wx.login({
					success: function(r) {
						if (r.code) {
							//发起网络请求
							request('/api/getOpenid', {
								'js_code':r.code,
								'avatarUrl': res.userInfo.avatarUrl,
								'nickName': res.userInfo.nickName,
								'gender': res.userInfo.gender,
								'city': res.userInfo.city,
								'province': res.userInfo.province,
								'country': res.userInfo.country,
								'language': res.userInfo.language,
							}).then((r1) => {
								that.setData({
									signDisabled:r1.signStatus == 'Y'?true:false,
									shareDisabled:r1.shareStatus == 'Y'?true:false,
									points:r1.points,
									money:r1.money,
									openid:r1.openid
								})
								wx.stopPullDownRefresh()
								wx.hideLoading()
							})
						} else {
							console.log('获取用户登录态失败！' + r.errMsg)
						}
					}
				});
			}
		})
		
	},
	
	onPullDownRefresh () {
		wx.showLoading({
			title: '刷新中',
		})
		this.getLoginInfo()
	},
	
	userInfoHandler (e) {
		if (e.detail.userInfo) {//授权成功
			this.setData({
				avatar: e.detail.userInfo.avatarUrl,
				nickName: e.detail.userInfo.nickName,
				loginStatus: true
			})
		}
	},
	
	sign () {
		//签到
		request('/api/sign', {
			'signStatus':'Y',
			'points':this.data.points,
			'openid':this.data.openid
		}).then(res => {
			if (res) {
				this.setData({
					signDisabled:res.signStatus == 'Y'?true:false,
					points:res.points
				})
				wx.showModal({
					title: '签到成功',
					content: `+${res.pointsNum}积分`,
					showCancel:false,
					confirmText:'知道啦'
				})
			}
		})
	},
	
	onShareAppMessage: function (res) {
		let that = this;
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
				// 转发群成功
				console.log(res);
				if (res.shareTickets.length > 0) {
					request('/api/share', {
						'shareStatus':'Y',
						'points':that.data.points,
						'openid':that.data.openid
					}).then(r => {
						if (r) {
							that.setData({
								shareDisabled:r.shareStatus == 'Y'?true:false,
								points:r.points
							})
							wx.showModal({
								title: '转发成功',
								content: `+${r.pointsNum}积分`,
								showCancel:false,
								confirmText:'知道啦'
							})
						}
					})
				}
			},
			fail: function (res) {
				// 转发失败
			}
		}
	},
})