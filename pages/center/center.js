var app = getApp();

Page({
	data: {
		avatar:'',
		nickName:''
	},
	onShow () {
		wx.getUserInfo({
			success: (res) => {
				this.setData({
					avatar:res.userInfo.avatarUrl,
					nickName:res.userInfo.nickName
				})
			}
		})
		
	},
})