var args = arguments[0] || {};
var ListViewBinder = require("ListViewBinder");

var titouchdb = require('com.obscure.titouchdb');
var manager = titouchdb.databaseManager;
var recipesDB = manager.getDatabase("recipes");
var recipesPull = recipesDB.createPullReplication(Alloy.CFG.couchdb_server + "divinity_feed");

$.collection = Alloy.createCollection("RecipesDB");

$.searchBar.init({
	collection : $.collection
});

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
var timeout = null;

recipesPull.addEventListener('status', function(e) {
	if (e.status == 1) {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(function() {
			reloadCollection();
			recipesPull.stop();
		}, 8000);
	} else if (e.status == 0) {
		reloadCollection();
	}
});
recipesPull.start();

function loadMore() {
	$.collection.loadMore();
}

Alloy.Models.menuModel.on("change", reloadCollection);

function reloadCollection() {
	var viewName = "recipe_view";
	if (Alloy.Models.menuModel.get("id")) {
		viewName = $.collection.createViewByCategoryID(Alloy.Models.menuModel.get("id"));
	}
	$.collection.reload(viewName);
}

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
