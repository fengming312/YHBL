import request from '../../api/request'

Page({
	data: {
		zhifubaoValue:'',
		nameValue:'',
		telValue:'',
		openid:'',
		btnDisabled:false,
		btnText:'提交申请'
	},
	onLoad (option) {
		this.setData({
			openid: option.openid
		})
		let _this = this;
		request('/api/getTixianInfo', {
			'openid':option.openid
		}).then(res => {
			console.log(res);
			if (res.data && res.data.status == 'N') {
				_this.setData({
					btnText:'申请正在审核中',
					btnDisabled:true
				})
			}
		})
	},
	
	getZhifubao (e) {
		this.setData({
			zhifubaoValue: e.detail.value
		})
	},
	
	getName (e) {
		this.setData({
			nameValue: e.detail.value
		})
	},
	
	getTel (e) {
		this.setData({
			telValue: e.detail.value
		})
	},
	
	submit () {
		if (this.data.zhifubaoValue && this.data.nameValue && this.data.telValue) {
			request('/api/tixian', {
				'status':'N',
				'zhifubao':this.data.zhifubaoValue,
				'name':this.data.nameValue,
				'tel':this.data.telValue,
				'money':10,
				'openid':this.data.openid
			}).then(res => {
				if (res.data && res.data.status == 'N') {
					this.setData({
						btnDisabled:true,
						btnText:'申请正在审核中'
					})
					wx.showToast({
						title: '提交成功',
						duration: 1200
					})
				}
			})
		}else {
			wx.showToast({
				title: '请完善信息',
				icon:'none',
				duration: 1200
			})
		}
	}
})