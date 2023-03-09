const app = getApp();
var rewardVideoAd = null;
Page({
    data: {
        is_check: -1,
        system: '',
        balance: 0,
        vip_expire_time: '',
        tasks: null,
        goodsList: [],
        goods_id: 0,
        vipList: [],
        vip_id: 0,
        paying: false
    },

    onLoad: function (options) {
        this.setData({
            system: app.globalData.system
        })
        this.getWxappInfo()
        app.util.login().then(() => {
            this.getBalance()
            this.getTasks()
        })
        this.getGoodsList()
        this.getVipList()
    },

    onShow() {
        this.getBalance()
    },

    getGoodsList() {
        app.util.request({
            url: '/wxapp/getGoodsList'
        }).then(res => {
            const goodsList = res.data
            goodsList.forEach(item => {
                if(item.is_default) {
                    this.setData({
                        goods_id: item.id
                    })
                }
            })
            this.setData({
                goodsList: goodsList
            })
        })
    },
    getVipList() {
        app.util.request({
            url: '/wxapp/getVipList'
        }).then(res => {
            const vipList = res.data
            vipList.forEach(item => {
                if(item.is_default) {
                    this.setData({
                        vip_id: item.id
                    })
                }
            })
            this.setData({
                vipList: vipList
            })
        })
    },
    getTasks() {
        app.util.request({
            url: '/wxapp/getTasks',
            loading: false
        }).then(res => {
            this.setData({
                tasks: res.data
            })
            if(res.data && res.data.ad && !rewardVideoAd) {
                this.initRewardAd()
            }
        })
    },
    
    getBalance() {
        app.util.request({
            url: '/wxapp/getBalance',
            loading: false
        }).then(res => {
            this.setData({
                balance: res.data.balance,
                vip_expire_time: res.data.vip_expire_time
            })
        })
    },

    chooseGoods(e) {
        const id = e.currentTarget.dataset.id
        this.setData({
            goods_id: id
        })
    },
    chooseVip(e) {
        const id = e.currentTarget.dataset.id
        this.setData({
            vip_id: id
        })
    },
    
    getWxappInfo() {
        const _this = this
        app.util.request({
            url: '/wxapp/getWxappInfo',
            loading: false
        }).then(res => {
            _this.setData({
                is_check: res.data.is_check
            })
        })
    },

    doPayGoods: function () {
		if (this.data.paying) {
			return false;
        }
        var goods_id = this.data.goods_id;

        if (goods_id == 0) {
            app.util.message('请选择充值套餐');
            return false;
        }

        this.setData({
            paying: true
        })

        setTimeout(() => {
            this.setData({
                paying: false
            }, 2000)
        })

        app.util.request({
            url: '/wxapp/createOrder',
            data: {
                goods_id: goods_id
            }
        }).then(res => {
            wx.requestPayment({
                timeStamp: res.data.timeStamp,
                nonceStr: res.data.nonceStr,
                package: res.data.package,
                signType: 'MD5',
                paySign: res.data.paySign,
                success: function (res) {
                    app.util.message('支付成功', 'error', function() {
                        wx.redirectTo({
                           url: '/pages/index/index',
                        })
                    })
                },
                fail: function (res) {
                    app.util.message('支付失败，请重试', 'error');
                }
            })
        })
    },

    doPayVip: function () {
		if (this.data.paying) {
			return false;
        }
        var vip_id = this.data.vip_id;

        if (vip_id == 0) {
            app.util.message('请选择VIP套餐');
            return false;
        }

        this.setData({
            paying: true
        })

        setTimeout(() => {
            this.setData({
                paying: false
            }, 2000)
        })

        app.util.request({
            url: '/wxapp/createOrder',
            data: {
                vip_id: vip_id
            }
        }).then(res => {
            wx.requestPayment({
                timeStamp: res.data.timeStamp,
                nonceStr: res.data.nonceStr,
                package: res.data.package,
                signType: 'MD5',
                paySign: res.data.paySign,
                success: function (res) {
                    app.util.message('支付成功', 'error', function() {
                        wx.redirectTo({
                           url: '/pages/index/index',
                        })
                    })
                },
                fail: function (res) {
                    app.util.message('支付失败，请重试', 'error');
                }
            })
        })
    },
    toIndex() {
        wx.navigateBack({
            fail() {
                wx.redirectTo({
                  url: '/pages/index/index'
                })
            }
        })
    },
    initRewardAd() {
        rewardVideoAd = null
        const ad_unit_id = this.data.tasks.ad.ad_unit_id
        if(wx.createRewardedVideoAd && !rewardVideoAd){
            rewardVideoAd = wx.createRewardedVideoAd({ adUnitId: ad_unit_id })
            rewardVideoAd.onLoad(() => {
                console.log('reward ad onload')
            })
            rewardVideoAd.onError((err) => {
                console.log('reward ad error')
                this.initRewardAd()
            })
            rewardVideoAd.onClose((res) => {
                console.log('reward ad onclose', res)
                if (res && res.isEnded) {
                    app.util.request({
                        url: '/wxapp/doAd',
                        data: {
                            ad_unit_id: ad_unit_id
                        },
                        loading: false
                    }).then(res => {
                        app.util.message(res.message)
                        this.getTasks()
                        this.getBalance()
                    })
                }
            })
        }
    },
    showTaskAd() {
        if(rewardVideoAd) {
            rewardVideoAd.show()
        } else {
            this.initRewardAd()
            rewardVideoAd.show()
        }
    }
})