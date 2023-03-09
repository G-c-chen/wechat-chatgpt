App({
  onLaunch: function () {
    this.globalData.siteroot = this.siteinfo.host + '/api.php';
    if (this.siteinfo.site_id) {
      this.globalData.site_id = this.siteinfo.site_id;
    }
    const system = wx.getSystemInfoSync().system.toLowerCase()
    if (system.indexOf('android') > -1) {
        this.globalData.system = 'android'
    } else if (system.indexOf('ios') > -1) {
        this.globalData.system = 'ios'
    } else {
        this.globalData.system = 'other'
    }
  },
  util: require('./utils/util.js'),
  globalData: {
    siteroot: '',
    site_id: 0,
    system: ''
  },
  siteinfo: require('./siteinfo.js')
})