var args = arguments[0] || {};

$.init = function(info) {
	$.collection = info.collection;
};

var timeout = null;
function onChange(e) {
	if (timeout) {
		clearTimeout(timeout);
	}
	timeout = setTimeout(_load, 300);
	function _load() {
		if (e.source.value) {
			$.collection.reload(Alloy.Models.menuModel.get("id"), e.source.value);
		} else if (Alloy.Models.menuModel.get("id")) {
			$.collection.reload(Alloy.Models.menuModel.get("id"));
		} else {
			$.collection.reload();
		}
	}
}
