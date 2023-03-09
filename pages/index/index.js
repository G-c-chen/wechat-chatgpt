const app = getApp()
Page({
    data: {
        is_check: 1,
        lists: [],
        message: '',
        balance: 0,
        vip_expire_time: '',
        scrollTop: 0,
        shareTitle: '',
        shareImage: ''
    },
    onLoad(options) {
        console.log('options', options)
        if (options.sid) {
            // 分享id
            wx.setStorageSync('sid', options.sid)
        }
        
        this.setData({
            system: app.globalData.system
        })
        app.util.login().then(() => {
            this.getWxappInfo()
            this.getHistoryMsg()
            this.getBalance()
        })
    },
    onShow() {
        setTimeout(() => {
            this.getBalance()
        }, 1000)
    },
    getHistoryMsg() {
        app.util.request({
            url: '/wxapp/getHistoryMsg'
        }).then(res => {
            if (res.data.length > 0) {
                this.setData({
                    lists: res.data
                })
            }

            this.scrollToBottom()
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
    sendText() {
        var message = this.data.message
        if (!message) {
            console.log('no input')
            return;
        }
        // 过滤敏感词
        app.util.request({
            url: '/wxapp/wordFilter',
            data: {
                message: message
            },
            loading: true
        }).then(res => {
            var clearMessage = res.data
            var lists = this.data.lists
            lists.push({
                user: '我',
                message: clearMessage.split("\n")
            })
            lists.push({
                user: 'ChatGPT',
                message: ['正在输入..']
            })

            this.setData({
                message: '',
                lists: lists
            })

            this.scrollToBottom()

            app.util.request({
                url: '/wxapp/sendText',
                data: {
                    message: message
                },
                loading: false,
                timeout: 120000
            }).then(res => {
                lists = lists.slice(0, -1)
                lists.push({
                    user: 'ChatGPT',
                    message: res.data
                })
                this.setData({
                    lists: lists
                })

                this.scrollToBottom()
                this.getBalance()
            }).catch(res => {
                lists = lists.slice(0, -1)
                lists.push({
                    user: 'ChatGPT',
                    message: ['网络错误，本条消息不扣费。']
                })
                this.setData({
                    lists: lists
                })
            })
        })
    },
    sendConfirm() {
        setTimeout(() => {
            this.sendText()
        }, 50)
    },
    scrollToBottom() {
        setTimeout(() => {
            let query = wx.createSelectorQuery().in(this)
            query.select('.list').boundingClientRect(res => {
                this.setData({
                    scrollTop: res.height
                })
            })
            query.exec(res => {})
        }, 100)
    },
    toPay() {
        wx.navigateTo({
            url: '/pages/pay/pay'
        })
    },
    copyText(e) {
        const index = e.currentTarget.dataset.index
        const lists = this.data.lists
        let message = lists[index].message
        message = message.join("\n")
        message = message.replaceAll('&nbsp;', ' ')
        wx.setClipboardData({
            data: message
        })
    },
    getWxappInfo() {
        const _this = this
        return new Promise(function (resolve, reject) {
            app.util.request({
                url: '/wxapp/getWxappInfo',
                loading: false
            }).then(res => {
                // 设置页面标题
                let page_title = res.data.page_title
                if (page_title) {
                    wx.setNavigationBarTitle({
                        title: page_title
                    })
                }

                // 设置欢迎语
                let welcome = res.data.welcome
                if (welcome) {
                    let lists = _this.data.lists
                    if (lists.length == 0) {
                        lists.push({
                            user: 'ChatGPT',
                            message: [welcome]
                        })
                        _this.setData({
                            lists: lists
                        })
                    }
                }

                _this.setData({
                    shareTitle: res.data.share_title,
                    shareImage: res.data.share_image,
                    is_check: res.data.is_check
                })

                resolve()
            })
        })
    },
    async onShareAppMessage() {
        var share_id = await this.getShareId('wechat')
        
        return {
            title: this.data.shareTitle,
            imageUrl: this.data.shareImage,
            path: '/pages/index/index?sid=' + share_id
        }
    },
    async onShareTimeline() {
        var share_id = await this.getShareId('timeline')
        return {
            title: this.data.shareTitle,
            imageUrl: this.data.shareImage,
            path: '/pages/index/index?sid=' + share_id
        }
    },
    async getShareId(way) {
        var share_id = 0
        await app.util.request({
            url: '/wxapp/doShare',
            data: {
                way: way
            }
        }).then(res => {
            share_id = res.data.share_id
            console.log('ss', share_id)
        })
        return share_id
    },
    onAddToFavorites() {
        return {
            title: this.data.shareTitle,
            imageUrl: this.data.shareImage
        }
    }
})