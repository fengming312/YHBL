const DOMINE = 'http://localhost:3001';
//const DOMINE = 'ttps://senhuor.com';
function request (url,data) {
		return new Promise((resolve,reject) => {
			wx.request({
				url: DOMINE + url,
				data: data,
				method: 'POST',
				header: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				success: res => {
					resolve(res.data.data);
				},
				fail: function(res) {
					// fail调用接口失败
					reject(res.data.data);
				},
				complete: function(res) {
					// complete
				}
			})
		})
}


export default request