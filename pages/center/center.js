var app = getApp();
import request from '../../api/request'

Page({
	data: {
		avatar: '',
		nickName: '',
		loginStatus: false,
		shareDiabled:true
	},
	
	onLoad () {
		wx.getUserInfo({
			success: (res) => {
				this.setData({
					avatar: res.userInfo.avatarUrl,
					nickName: res.userInfo.nickName,
					loginStatus: true,
				})
				wx.login({
					success: function(res) {
						if (res.code) {
							//发起网络请求
							request('/api/getOpenid', {'js_code':res.code}).then((res) => {
								console.log(res);
							})
						} else {
							console.log('获取用户登录态失败！' + res.errMsg)
						}
					}
				});
			}
		})
		
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
				// 转发群成功
				if (res.shareTickets.length > 0) {
					request('/api/share', {aaa: 1}).then((r) => {
						console.log(r);
					})
				}
			},
			fail: function (res) {
				// 转发失败
			}
		}
	},
})