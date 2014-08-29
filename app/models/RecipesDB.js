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
						image : ""
					},
					title : {
						text : o.name
					},
					desc : {
						text : o.ing_1[0].name + " + " + o.ing_2[0].name
					}
				};
			}
		});

		return Model;
	},
	extendCollection : function(Collection) {
		_.extend(Collection.prototype, {
			map_row : function(Model, row) {
				var result = new Model(row.documentProperties);
				return result;
			},
			loadMore : function() {
			},
			reload : function() {
				var self = this;

				fetchFunc(self, function() {
					if (self.length) {
						var result = self.toJSON();
						self.reset(result);
					} else {
						var server = require('com.obscure.titouchdb');
						var db = server.databaseManager.getDatabase("recipes");

						var pull = db.createPullReplication("https://tipasha.iriscouch.com/divinity_feed");

						pull.addEventListener('status', function(e) {
							if (pull.status == 2 || pull.status == 3) {
								fetchFunc(self, function() {
									var result = self.toJSON();
									self.reset(result);
								});
							} else {
								self.trigger("error_loading");
							}
						});
						pull.start();
					}
				});
			}
		});

		return Collection;
	}
}; 
function fetchFunc(collection, successFunc) {
	collection.fetch({
		success : successFunc,
		error : function() {
			collection.trigger("error_loading");
		},
		view : "recipe_view",
		silent : true
	});
}