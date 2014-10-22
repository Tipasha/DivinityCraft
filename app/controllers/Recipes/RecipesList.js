var args = arguments[0] || {};
var ListViewBinder = require("ListViewBinder");

var isSearch = false;

$.collection = Alloy.createCollection("RecipesModel");

$.searchBar.init({
	collection : $.collection
});

if (OS_IOS) {
	var control = Ti.UI.createRefreshControl({
		tintColor : '#000'
	});
	$.list.refreshControl = control;
	$.list.refreshControl.addEventListener('refreshstart', reloadCollection);
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
	$.emptyLbl.text = isSearch ? "Эмм... У нас нет ингредиентов или рецептов, которые Вы хотите найти. Попробуйте ввести другую ключевую фразу для поиска." : "Список пуст... Совсем пуст.";
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

Ti.App.addEventListener("reloadCollection", reloadCollection);

function reloadCollection() {
	$.collection.reset([]);
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