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

				return {
					template : o.children ? "topRowTemplate" : "childRowTemplate",
					id : o.id,
					title : {
						text : o.name
					}
				};
			}
		});

		return Model;
	},
	extendCollection : function(Collection) {
		_.extend(Collection.prototype, {
			loadMore : function() {
			},
			reload : function() {
				var self = this;
				Alloy.Globals.AJAX.getJSON(Alloy.CFG.queryURL + "category.json", false, function(json) {
					if (json && json.status == 200) {
						var result = json.result.category;

						_.each(result, function(rec, i) {
							rec = _.extend(rec, {
								"rowID" : i
							});
						});

						self.reset(result);
					} else {
						self.trigger("error_loading");
					}
				});
			}
		});

		return Collection;
	}
};
