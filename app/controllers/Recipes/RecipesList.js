var args = arguments[0] || {};
var ListViewBinder = require("ListViewBinder");

var isSearch = false;

$.collection = Alloy.createCollection("RecipesModel");
$.dbCollection = Alloy.createCollection("RecipesDB");

if (OS_IOS) {
	$.searchBar.init({
		collection : $.collection
	});
}

if (OS_IOS) {
	var control = Ti.UI.createRefreshControl({
		tintColor : '#000'
	});
	$.list.refreshControl = control;
	$.list.refreshControl.addEventListener('refreshstart', function(e) {
		recipesPull.stop();
		recipesPull.start();
	});
}

$.binder = new ListViewBinder({
	listview : $.list,
	section : $.defaultSection,
	collection : $.collection,
	pull : OS_IOS ? $.list.refreshControl : null
});
$.binder.bind();
$.ai.show();

$.collection.on("error_loading", function() {
	$.list.footerView.height = 0;
});

$.collection.on("collection_empty", function() {
	$.list.footerView.height = 0;
	$.emptyLbl.text = isSearch ? L("search_empty") : L("list_empty");
	$.emptyLbl.visible = true;
});

$.collection.on("loadmore", function() {
	$.list.footerView.height = 44;
});

$.collection.on("reset", function() {
	$.emptyLbl.visible = false;
});

$.collection.reload();

function loadMore() {
	$.collection.loadMore();
}

Alloy.Models.menuModel.on("change", function() {
	isSearch = false;
	reloadCollection();
});

function reloadCollection() {
	var viewName = "recipe_view";
	if (Alloy.Models.menuModel.get("id")) {
		$.collection.reload(Alloy.Models.menuModel.get("id"));
	} else {
		$.collection.reload();
	}
}

function itemClicked(e) {
	var _item = e.section.getItemAt(e.itemIndex);
	var _model = $.collection.get(_item.id);
	Ti.App.fireEvent("showRecipe", {
		recipe : _model.toJSON()
	});
}