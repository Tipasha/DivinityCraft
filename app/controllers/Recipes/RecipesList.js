var args = arguments[0] || {};
var ListViewBinder = require("ListViewBinder");

var titouchdb = require('com.obscure.titouchdb');
var manager = titouchdb.databaseManager;
var recipesDB = manager.getDatabase("recipes");
var recipesPull = recipesDB.createPullReplication("https://toma:123456@tipasha.iriscouch.com/feed");

var isSearch = false;

$.collection = Alloy.createCollection("RecipesDB");

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
var timeout = null;

if (OS_ANDROID) {
	$.pb.show();
}
recipesPull.addEventListener('status', function(e) {
	Ti.API.info(recipesDB.lastSequenceNumber)
	Ti.API.info("FEED", e.status, recipesPull.changesCount, recipesPull.isPull, recipesPull.isRunning, recipesPull.lastError)
	isSearch = false;
	if (OS_ANDROID) {
		if (e.status == 2) {
			recipesPull.stop();
			reloadCollection();
		} else if (e.status == 3) {
			$.pb.value += 10;
			/*
			if (recipesPull.changesCount == 149) {
							recipesPull.stop();
							reloadCollection();
						}*/
			
		}
	} else {
		if (e.status == 1) {
			if (timeout) {
				clearTimeout(timeout);
			}
			timeout = setTimeout(function() {
				reloadCollection();
				recipesPull.stop();
			}, 8000);
		} else if (e.status == 0) {
			if (timeout) {
				clearTimeout(timeout);
			}
			reloadCollection();
		}
	}
});
recipesPull.start();

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