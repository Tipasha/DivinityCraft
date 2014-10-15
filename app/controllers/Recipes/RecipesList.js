var args = arguments[0] || {};
var ListViewBinder = require("ListViewBinder");

$.collection = Alloy.Collections.recipes;

if (OS_IOS) {
	var control = Ti.UI.createRefreshControl({
		tintColor : '#000'
	});
	$.list.refreshControl = control;
	$.list.refreshControl.addEventListener('refreshstart', function(e) {
		var viewName = "recipe_view";
		if (Alloy.Models.menuModel.get("id")) {
			viewName = $.collection.createViewByCategoryID(Alloy.Models.menuModel.get("id"));
		}
		$.collection.reload(viewName);
	});
}

$.binder = new ListViewBinder({
	listview : $.list,
	section : $.defaultSection,
	collection : $.collection,
	pull : OS_IOS ? $.list.refreshControl : null
});
$.binder.bind();

$.collection.on("collection_empty", function() {
	$.list.footerView.height = 0;
	$.emptyLbl.visible = true;
});

$.collection.on("loadmore", function() {
	$.list.footerView.height = 44;
});

$.collection.on("reset", function() {
	$.emptyLbl.visible = false;
});

function loadMore() {
	$.collection.loadMore();
}

Alloy.Models.menuModel.on("change", function() {
	var viewName = $.collection.createViewByCategoryID(Alloy.Models.menuModel.get("id"));
	$.collection.reload(viewName);
});

$.searchBar.init({
	collection : $.collection
});

function itemClicked(e) {
	var _item = e.section.getItemAt(e.itemIndex);
	var _model = $.collection.get(_item.id);
	Ti.App.fireEvent("showRecipe", {
		recipe : _model.toJSON()
	});
}

var timeout = null;
function search(e) {
	if (timeout) {
		clearTimeout(timeout);
	}
	timeout = setTimeout(_load, 300);

	function _load() {
		var viewName = $.collection.createViewByTag(e.value);
		$.collection.reload(viewName);
	}

}
