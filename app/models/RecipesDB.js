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
			translate : function() {
				var o = this.toJSON();
				
				return {
					photo : {
						image : this.getAttachmentBlob()
					},
					title : {
						text : o.name
					},
					desc : {
						text : o.bonus
					},
					id : o._id
				};
			},
			singleTranslate : function() {
				var o = this.toJSON();

				return {
					image : this.getAttachmentBlob(),
					title : o.name,
					bonus : o.bonus,
					desc : o.description
				};
			},
			getAttachmentBlob : function() {
				var doc = db.getDocument(this.id);
				var attachments = this.get("_attachments");
				if (doc) {
					var currRev = doc.currentRevision;
					if (currRev && attachments) {
						var attch = null;
						_.each(attachments, function(val, key) {
							attch = currRev.getAttachment(key);
						});
						if (attch) {
							return attch.content;
						} else {
							return null;
						}
					} else {
						return null;
					}
				} else {
					return null;
				}
			}
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
			loadMore : function() {
				var self = this;
				var _limit = this.init.limit;

				if (!self.allFeeds) {
					self.trigger("error_loading");
					return;
				}
				var feeds = self.allFeeds.slice(self.models.length, _limit + self.models.length);

				self.add(feeds);

				if (feeds.length == _limit) {
					self.trigger("loadmore");
				} else if (feeds.length < _limit) {
					self.trigger("all_loaded");
				}
			},
			reload : function(viewName) {
				var self = this;
				var _limit = this.init.limit;
				fetchFunc(self, viewName, function() {
					Ti.API.info(self.length)
					if (self.length) {
						var result = self.toJSON();
						self.allFeeds = result;

						var feeds = result.slice(0, _limit);

						self.reset(feeds);

						if (feeds.length < _limit) {
							self.trigger("all_loaded");
						}
					}
				});
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