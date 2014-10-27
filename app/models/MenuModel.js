exports.definition = {
	config : {
		adapter : {
			type : "properties",
			collection_name : "MenuModel"
		}
	},
	extendModel : function(Model) {
		_.extend(Model.prototype, {
			translate : function() {
				var o = this.toJSON();
				
				var id = o._id ? o._id : o.parent_id;
				
				var filterIcon = o.icon && o.icon.length ? _.filter(o.icon, function(icon) {
					return  icon == (o._id ? o._id : o.id) + ".png";
				}) : [];
				var iconName = filterIcon.length ? filterIcon[0] : "";
				
				return {
					template : o.children ? "topRowTemplate" : "childRowTemplate",
					id : o.id,
					title : {
						text : o.name
					},
					icon : {
						image : iconName ? Alloy.CFG.queryURL + "divinity_menu/" + id + "/" + iconName : ""
					}
				};
			}
		});

		return Model;
	},
	extendCollection : function(Collection) {
		_.extend(Collection.prototype, {
			initialize : function(info) {
				this.prefix = Alloy.CFG.queryURL + "divinity_menu/_all_docs?include_docs=true";
				this.bd_prefix = Alloy.CFG.queryURL + "divinity_menu";
			},
			loadMore : function() {
			},
			reload : function(categoryId, keyword) {
				var self = this;

				Alloy.Globals.AJAX.getJSON(self.bd_prefix, false, function(json) {
					if (json && json.status == 200) {
						var lastSeq = json.result.update_seq;
						var docCount = json.result.doc_count;
						if (!Ti.App.Properties.getInt("categories_db_last_seq") || Ti.App.Properties.getInt("categories_db_last_seq") != parseInt(lastSeq) || Ti.App.Properties.getInt("categories_db_last_doc_count") != parseInt(docCount)) {
							Alloy.Globals.AJAX.getJSON(self.prefix, false, function(json) {
								if (json && json.status == 200) {
									var result = json.result.rows;

									_.each(result, function(rec) {
										if (rec.id != "_design/_auth" && rec.doc && !rec.doc.isChildren) {
											var catDoc = Alloy.createModel("MenuDB");
											catDoc.id = rec.id;
											catDoc.set({
												id : rec.doc.id,
												name : rec.doc.name,
												children : rec.doc.children,
												icon : rec.doc._attachments ? _.keys(rec.doc._attachments) : ""
											});
											catDoc.save();
										}
									});

									Ti.App.Properties.setInt("categories_db_last_seq", parseInt(lastSeq));
									Ti.App.Properties.setInt("categories_db_last_doc_count", parseInt(docCount));
								}

								fetchMenuDB({
									collection : self
								});
							});
						} else {
							fetchMenuDB({
								collection : self
							});
						}
					} else {
						fetchMenuDB({
							collection : self
						});
					}
				});
			}
		});

		return Collection;
	}
};

function fetchMenuDB(opts) {
	var _collection = opts.collection;

	var menuDB = Alloy.createCollection("MenuDB");

	menuDB.fetch({
		success : function(data) {
			if (!data.length) {
				_collection.trigger("error_loading");
			} else {
				_collection.reset(menuDB.toJSON());
			}
		},
		error : function() {
			_collection.trigger("error_loading");
		},
		view : "menu_view"
	});
}
