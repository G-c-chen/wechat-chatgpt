 Page({
    data: {},
    onLoad: function(options) {
        let url = options.url;
        url = decodeURIComponent(url)
		this.setData({
            url: url
        });
    }
 });