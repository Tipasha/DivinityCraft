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

var timeout = null;
function onChange(e) {
	if (timeout) {
		clearTimeout(timeout);
	}
	timeout = setTimeout(_load, 300);
	function _load() {
		var viewName = "recipe_view";
		if (e.value) {
			viewName = $.collection.createViewByTag(e.value);
		} else if (Alloy.Models.menuModel.get("id")) {
			viewName = $.collection.createViewByCategoryID(Alloy.Models.menuModel.get("id"));
		}
		$.collection.reload(viewName);
	}
}
