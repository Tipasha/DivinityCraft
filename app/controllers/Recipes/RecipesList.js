var args = arguments[0] || {};

$.collection = Alloy.Collections.recipes;

var ListViewBinder = require("ListViewBinder");
$.binder = new ListViewBinder({
	listview : $.list,
	section : $.defaultSection,
	collection : $.collection
});
$.binder.bind();

function loadMore() {
	$.collection.loadMore();
}

Alloy.Models.menuModel.on("change", function() {
	var viewName = $.collection.createViewByCategoryID(Alloy.Models.menuModel.get("id"));
	$.collection.reload(viewName);
});

function itemClicked(e) {
	var _item = e.section.getItemAt(e.itemIndex);
	var _model = $.collection.get(_item.id);
	Ti.App.fireEvent("showRecipe", {
		recipe : _model.toJSON()
	});	
}
