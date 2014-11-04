exports.definition = {
	config : {
		adapter : {
			type : "properties",
			collection_name : "RecipesModel"
		}
	},
	extendModel : function(Model) {
		_.extend(Model.prototype, {
			translate : function() {
				var o = this.toJSON();

				var bonusArr = o.bonus ? o.bonus.split("; ") : [];
				var posArr = [];
				var negArr = [];
				var defArr = [];

				_.each(bonusArr, function(rec) {
					if (rec.search(/\+/) != -1) {
						posArr.push(rec);
					} else if (rec.search(/\-/) != -1) {
						negArr.push(rec);
					} else {
						defArr.push(rec);
					}
				});

				return {
					photo : {
						image : o.icon ? Alloy.CFG.queryURL + "feed/" + o._id + "/" + o.icon : ""
					},
					viewContainer : {
						top : o.bonus ? 9 : null,
						bottom : o.bonus ? 9 : null
					},
					title : {
						text : o.name || ""
					},
					positiveDesc : {
						text : posArr.join("\n"),
						height : posArr.length ? Ti.UI.SIZE : 0,
						top : posArr.length ? 4 : 0
					},
					negativeDesc : {
						text : negArr.join("\n"),
						height : negArr.length ? Ti.UI.SIZE : 0,
						top : negArr.length ? 4 : 0
					},
					defaultDesc : {
						text : defArr.join("\n"),
						height : defArr.length ? Ti.UI.SIZE : 0,
						top : defArr.length ? 4 : 0
					},
					id : o._id
				};
			},
			singleTranslate : function() {
				var o = this.toJSON();

				var bonusArr = o.bonus ? o.bonus.split("; ") : [];
				var posArr = [];
				var negArr = [];
				var defArr = [];

				_.each(bonusArr, function(rec) {
					if (rec.search(/\+/) != -1) {
						posArr.push(rec);
					} else if (rec.search(/\-/) != -1) {
						negArr.push(rec);
					} else {
						defArr.push(rec);
					}
				});

				return {
					image : o.icon ? Alloy.CFG.queryURL + "feed/" + o._id + "/" + o.icon : "",
					title : o.name,
					bonus_pos : posArr.join("\n"),
					bonus_neg : negArr.join("\n"),
					bonus_def : defArr.join("\n"),
					bonus_pos_height : posArr.length ? Ti.UI.SIZE : 0,
					bonus_neg_height : negArr.length ? Ti.UI.SIZE : 0,
					bonus_def_height : defArr.length ? Ti.UI.SIZE : 0,
					desc : o.description
				};
			},
		});

		return Model;
	},
	extendCollection : function(Collection) {
		_.extend(Collection.prototype, {
			initialize : function(info) {
				this.prefix = Alloy.CFG.queryURL + "feed/_all_docs?include_docs=true";
				this.bd_prefix = Alloy.CFG.queryURL + "feed";
				this.init = {
					limit : info && info.limit ? info.limit : 10
				};
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
			reload : function(categoryId, keyword, skipLoad) {
				var self = this;
				var _limit = this.init.limit;

				if (!skipLoad) {
					Alloy.Globals.AJAX.getJSON(self.bd_prefix, false, function(json) {
						if (json && json.status == 200) {
							var lastSeq = json.result.update_seq;
							var docCount = json.result.doc_count;
							if (!Ti.App.Properties.getInt("feed_db_last_seq") || Ti.App.Properties.getInt("feed_db_last_seq") != parseInt(lastSeq) || Ti.App.Properties.getInt("feed_db_last_doc_count") != parseInt(docCount)) {
								Alloy.Globals.AJAX.getJSON(self.prefix, false, function(json) {
									if (json && json.status == 200) {
										var result = json.result.rows;

										_.each(result, function(rec) {
											if (rec.id != "_design/_auth" && rec.doc) {
												var feedDoc = Alloy.createModel("RecipesDB");
												feedDoc.id = rec.id;
												feedDoc.set({
													id : rec.id,
													name : rec.doc.name,
													connections : rec.doc.connections,
													description : rec.doc.description,
													bonus : rec.doc.bonus,
													tags : rec.doc.tags,
													category_id : rec.doc.category_id,
													icon : rec.doc._attachments ? _.keys(rec.doc._attachments)[0] : ""
												});
												feedDoc.save();
											}
										});

										Ti.App.Properties.setInt("feed_db_last_seq", parseInt(lastSeq));
										Ti.App.Properties.setInt("feed_db_last_doc_count", parseInt(docCount));
									}

									fetchRecipesDB({
										collection : self,
										limit : _limit,
										categoryId : categoryId,
										keyword : keyword
									});
								});
							} else {
								fetchRecipesDB({
									collection : self,
									limit : _limit,
									categoryId : categoryId,
									keyword : keyword
								});
							}
						} else {
							fetchRecipesDB({
								collection : self,
								limit : _limit,
								categoryId : categoryId,
								keyword : keyword
							});
						}
					});
				} else {
					fetchRecipesDB({
						collection : self,
						limit : _limit,
						categoryId : categoryId,
						keyword : keyword
					});
				}
			}
		});

		return Collection;
	}
};

function fetchRecipesDB(opts) {
	var _collection = opts.collection;
	var _limit = opts.limit;
	var _catId = opts.categoryId ? opts.categoryId : null;
	var _keyword = opts.keyword ? opts.keyword : null;

	var recipesDB = Alloy.createCollection("RecipesDB");

	var viewName = "recipe_view";
	if (_keyword) {
		viewName = recipesDB.createViewByTag(_keyword, _catId);
	} else if (_catId) {
		viewName = recipesDB.createViewByCategoryID(_catId);
	}

	recipesDB.fetch({
		success : function(data) {
			if (!data.length && !_keyword) {
				_collection.trigger("error_loading");
			} else if (!data.length) {
				_collection.allFeeds = [];
				_collection.reset([]);
				_collection.trigger("collection_empty");
			} else {
				var allFeeds = recipesDB.toJSON();

				var recipes = recipesDB.toJSON().slice(0, _limit);
				_collection.allFeeds = allFeeds;

				_collection.reset(recipes);

				if (recipes.length < _limit) {
					_collection.trigger("all_loaded");
				}
			}
		},
		error : function() {
			_collection.trigger("error_loading");
		},
		view : viewName
	});
}

