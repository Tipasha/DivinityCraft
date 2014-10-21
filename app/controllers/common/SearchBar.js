var args = arguments[0] || {};
$.searchBar.applyProperties(args);

$.init = function(info) {
	$.collection = info.collection;
};

function onFocus() {
	$.searchActive = true;
	$.searchBar.showCancel = true;
}

function onCancel() {
	clearSearch();
}

function clearSearch() {
	$.searchActive = false;
	$.searchBar.showCancel = false;
	$.searchBar.blur();
}

Ti.App.addEventListener("drawerToggle", clearSearch);

var timeout = null;
function onChange(e) {
	if (timeout) {
		clearTimeout(timeout);
	}
	timeout = setTimeout(_load, 300);
	function _load() {
		if (e.value) {
			$.collection.reload(Alloy.Models.menuModel.get("id"), e.value);
		} else if (Alloy.Models.menuModel.get("id")) {
			$.collection.reload(Alloy.Models.menuModel.get("id"));
		} else {
			$.collection.reload();
		}
	}
}
