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
		});

		return Model;
	},
	extendCollection : function(Collection) {
		_.extend(Collection.prototype, {
			map_row : function(Model, row) {
				var result = new Model(row.documentProperties);
				return result;
			}
		});

		return Collection;
	}
};