exports.definition = {
	config : {
		adapter : {
			type : "titouchdb",
			dbname : "categories",
			views : [{
				name : "menu_view",
				map : function(doc) {
					emit(doc.id, null);
				}
			}],
			view_options : {
				prefetch : true
			},
			modelname : 'menu'
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
		view : "menu_view",
		silent : true
	});
}
