import request from '../../api/request'

Page({
	data: {
		zhifubaoValue:'',
		nameValue:'',
		telValue:'',
		openid:'',
		btnDisabled:false,
		btnText:'提交申请',
		tixianMoney:'',
		points:'',
		money:''
	},
	onLoad (option) {
		console.log(option);
		this.setData({
			openid: option.openid,
			tixianMoney: option.tixianMoney,
			points: option.points,
			money: option.money
		})
		let _this = this;
		request('/api/getTixianInfo', {
			'openid':option.openid
		}).then(res => {
			if (res.data) {
				_this.setData({
					zhifubaoValue:res.data.zhifubao,
					nameValue:res.data.name,
					telValue:res.data.tel,
				})
			}
			if (res.data && res.data.status == 'N') {
				_this.setData({
					btnText:'申请正在审核中',
					btnDisabled:true,
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
				'tixianMoney':this.data.tixianMoney,
				'points':this.data.points,
				'money':this.data.money,
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