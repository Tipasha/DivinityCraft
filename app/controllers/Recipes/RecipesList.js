var args = arguments[0] || {};

$.collection = Alloy.createCollection("RecipesDB");

var ListViewBinder = require("ListViewBinder");
$.binder = new ListViewBinder({
	listview : $.list,
	section : $.defaultSection,
	collection : $.collection
});
$.binder.bind();
$.collection.reload();

function loadMore() {
	$.collection.loadMore();
}

Alloy.Models.menuModel.on("change", function() {
	var viewName = $.collection.createViewByCategoryID(Alloy.Models.menuModel.get("id"));
	$.collection.reload(viewName);
});
