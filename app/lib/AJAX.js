var XHR = require("xhr");

var debug = true;
var cacheDisabled = true;
var defaultTTL = 120000;

module.exports = {
	disableCache : function(val) {
		cacheDisabled = val;
	},
	setDebug : function(val) {
		debug = !!val;
	},
	setDefaultTTL : function(val) {
		defaultTTL = !!val;
	},
	buildQueryString : function(params) {
		if (!params) {
			return "";
		}
		var queryString = "";
		_.each(params, function(value, key) {
			if (value != null) {
				queryString = queryString + key + "=" + encodeURIComponent(value) + "&";
			}
		});

		return queryString ? queryString.substr(0, queryString.length - 1) : "";
	},
	getJSON : function(url, no_ttl, callback) {
		Ti.API.info("URL : " + url)
		
		var xhr = new XHR();
		if (debug) {
			Ti.API.debug('>>>Get data from server:');
			Ti.API.debug('URL : ' + url);
		}
		var options = no_ttl || cacheDisabled ? {} : {
			ttl : defaultTTL
		};
		xhr.get(url, onSuccessCallback, onErrorCallback, options);
		function onSuccessCallback(e) {
			try {
				var data = JSON.parse(e.data);
			} catch(ex) {
				if (debug) {
					Ti.API.debug('Parse Exeption : ' + ex.message);
				}
				callback({
					status : 500,
					error : ex.message
				});
				return;
			}
			if (data) {
				callback({
					status : 200,
					result : data
				});
			} else {
				callback({
					status : 404,
					error : L("not_found")
				});
			}
			if (debug) {
				Ti.API.debug('>>>End');
			}
		};
		function onErrorCallback(e) {
			if (debug) {
				Ti.API.debug("Error", e);
			}
			callback({
				status : 500,
				error : e.data && e.data.error ? e.data.error : L('unknown_error')
			});
			if (debug) {
				Ti.API.debug('>>>End');
			}
		};
	}
};
