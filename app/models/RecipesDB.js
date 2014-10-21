var titouchdb = require('com.obscure.titouchdb');
var manager = titouchdb.databaseManager;
var db = manager.getDatabase("recipes");

exports.definition = {
	config : {
		adapter : {
			type : "titouchdb",
			dbname : "recipes",
			views : [{
				name : "recipe_view",
				map : function(doc) {
					emit(doc.name, null);
				}
			}],
			view_options : {
				prefetch : true
			},
			modelname : 'recipe'
		}
	},
	extendModel : function(Model) {
		_.extend(Model.prototype, {
		});

		return Model;
	},
	extendCollection : function(Collection) {
		_.extend(Collection.prototype, {
			initialize : function(info) {
				info = info || {};
				this.prefix = Alloy.CFG.queryURL + "divinity_feed";
				this.filter = info.opts ? info.opts : {};
				this.init = {
					limit : info.limit ? info.limit : 10
				};
			},
			map_row : function(Model, row) {
				var result = new Model(row.documentProperties);
				return result;
			},
			createViewByCategoryID : function(id) {
				var viewName = "recipe_view_" + id;

				// FOR REREADING DOCUMENTS
				if (db.getExistingView(viewName)) {
					db.getExistingView(viewName).deleteView();
				}

				var recipeView = db.getView(viewName);
				recipeView.setMapReduce(function(doc) {
					if (id == doc.category_id) {
						emit(doc.name, null);
					}
				}, null, recipeView.version || "1");

				return viewName;
			},
			createViewByTag : function(tag, id) {
				var viewName = "recipe_view_" + tag;

				// FOR REREADING DOCUMENTS
				if (db.getExistingView(viewName)) {
					db.getExistingView(viewName).deleteView();
				}

				var recipeView = db.getView(viewName);
				recipeView.setMapReduce(function(doc) {
					if (doc.tags.toLowerCase().indexOf(tag.toLowerCase()) != -1 && (id ? doc.category_id == id : true)) {
						emit(doc.name, null);
					}
				}, null, recipeView.version || "1");

				return viewName;
			}
		});

		return Collection;
	}
};
function fetchFunc(collection, viewName, successFunc) {
	Ti.API.info(viewName)
	collection.fetch({
		success : successFunc,
		error : function() {
			collection.trigger("error_loading");
		},
		view : viewName ? viewName : "recipe_view",
		silent : true
	});
}