exports.definition = {
	config: {
		adapter: {
			type: "properties",
			collection_name: "RecipesModel"
		}
	},
	extendModel: function(Model) {
		_.extend(Model.prototype, {
			// extended functions and properties go here
		});

		return Model;
	},
	extendCollection: function(Collection) {
		_.extend(Collection.prototype, {
			initialize : function() {
				this.prefix = Alloy.CFG.queryURL + "feed/_all_docs?include_docs=true";
			},
			loadMore : function() {
				var self = this;
				Alloy.Globals.AJAX.getJSON(self.prefix, false, function(json) {
					if (json && json.status == 200) {
						var result = json.result.rows;
						self.add(result);
					} else {
						self.trigger("error_loading");
					}
				});
			},
			reload : function() {
				var self = this;
				Alloy.Globals.AJAX.getJSON(self.prefix, false, function(json) {
					if (json && json.status == 200) {
						var result = json.result.rows;
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