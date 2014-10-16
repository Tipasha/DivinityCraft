var template;
module.exports = {
	defaultOptions : {},
	generate : function(options) {
		var html = this.getTemplate();
		_.each(options, function(v, k) {
			html = html.replace(new RegExp("{" + k + "}", "gi"), v);
		});

		return html;
	},
	getTemplate : function() {
		var f = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, "/html/feeds.html");
		template = f.read().text;
		f = null;
		return template;
	}
};
