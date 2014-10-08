Alloy.Globals.AJAX = require("AJAX");


Alloy.Models.menuModel = Alloy.createModel("MenuDB");
Alloy.Collections.menu = Alloy.createCollection('MenuDB');
Alloy.Collections.recipes = Alloy.createCollection("RecipesDB");

var titouchdb = require('com.obscure.titouchdb');
var manager = titouchdb.databaseManager;

var recipesDB = manager.getDatabase("recipes");
var categoriesDB = manager.getDatabase("categories");

var categoriesPull = categoriesDB.createPullReplication(Alloy.CFG.couchdb_server + "divinity_menu");
categoriesPull.addEventListener('status', function(e) {
	if (e.status == 0) {
		Alloy.Collections.menu.reload();
	}
});
categoriesPull.start();

var recipesPull = recipesDB.createPullReplication(Alloy.CFG.couchdb_server + "divinity_feed");
recipesPull.continuous = true;
recipesPull.addEventListener('status', function(e) {
	if (e.status == 2) {
		Alloy.Collections.recipes.reload();
	}
});
recipesPull.start();

function isiOS7Plus() {
	if (Titanium.Platform.name == 'iPhone OS') {
		var version = Titanium.Platform.version.split(".");
		var major = parseInt(version[0], 10);

		if (major >= 7) {
			return true;
		}
	}
	return false;
}

Alloy.Globals.iOS7 = isiOS7Plus();
Alloy.CFG.top = Alloy.Globals.iOS7 ? 20 : 0;
