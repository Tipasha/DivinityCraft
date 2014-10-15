function ListViewBinder(options) {
	this.options = options;
	this.data = [];
	this.listview = options.listview;
	this.collection = options.collection;
	this.modelClass = this.collection.model;
	this.template = options.item_template || null;
	this.section = options.section || null;
	this.ptr = options.pull || null;
	this.onlyafter = 0;
	this.deferAdd = 0;
	this.deferRemove = 0;
	this.deferReplace = 0;
	this.waitForAdd = [];
	this.waitForRemove = [];
	this.waitForReplace = [];
	this.errorView = options.errorView || null;
}

_.extend(ListViewBinder.prototype, {
	bind : function() {'use strict';
		var self = this;
		//bind to collection events
		this.collection.on("add", this.add, this);
		this.collection.on("reset fetch", this.reload, this);
		this.collection.on("change", this.change, this);
		this.collection.on("remove", this.remove, this);
		this.collection.on("loadmore reset fetch", this.setMarker, this);
		this.collection.on("all_loaded", this.removeLoadMore, this);

		//setup auto load
		if (this.listview) {
			this.listview.addEventListener("marker", function(e) {
				self.collection.loadMore();
			});
		}

		//setup pull to refresh
		/*
		if (OS_IOS && this.ptr) {
					this.ptr.addEventListener('refreshstart', function(e) {
						self.collection.reload();
					});
				}*/
		
	},

	removeLoadMore : function() {
		if (this.listview && this.listview.footerView) {
			this.listview.footerView.height = 0;
		}
	},
	setMarker : function() {'use strict';
		var self = this;
		if (self.collection.length > 0) {
			if (self.listview && self.listview.footerView) {
				self.listview.footerView.height = 44;
			}
			_.defer(function() {
				self.listview.setMarker({
					sectionIndex : 0,
					itemIndex : Math.max(7, self.collection.length - 10)
				});
			});
		}
	},

	startLoading : function() {
		if (OS_IOS && this.ptr != null) {
			this.ptr.beginRefreshing();
		}
	},
	endLoading : function() {
		if (OS_IOS && this.ptr != null) {
			this.ptr.endRefreshing();
		}
	},

	reload : function(e) {'use strict';
		//translate data
		var data = _.map(this.collection.models, function(m) {
			return m.translate();
		});
		if (this.options.useSetItems) {
			this.section.setItems(data);
		} else {
			//recreate section
			this.section = Ti.UI.createListSection({
				items : data
			});
			this.listview.sections = [this.section];
		}
		this.endLoading();
	},

	add_defer : function() {'use strict';
		if (this.waitForAdd.length > 0) {
			var data = _.map(this.waitForAdd, function(m) {
				return m.translate();
			});
			this.section.insertItemsAt(_.first(this.waitForAdd).__insertAt, data);
			this.waitForAdd = [];

			if (this.errorView) {
				this.errorView.hideView();
			}
		}
	},
	add : function(model, col, options) {'use strict';
		var self = this;
		//remember last index
		//check continues (previous must be insterted one index above)
		if (_.size(this.waitForAdd) > 0 && _.last(this.waitForAdd).__insertAt != options.index - 1) {
			//dont clear defer
			self.add_defer();
		}
		model.__insertAt = options.index;
		this.waitForAdd.push(model);
		clearTimeout(this.deferAdd);
		this.deferAdd = setTimeout(function() {
			self.add_defer();
		}, 0);
	},

	replace_defer : function() {'use strict';
		if (this.waitForReplace.length > 0) {
			var data = _.map(this.waitForReplace, function(m) {
				return m.translate();
			});
			if (data.length == 1) {
				this.section.updateItemAt(_.first(this.waitForReplace).__insertAt, data[0]);
			} else {
				this.section.replaceItemsAt(_.first(this.waitForReplace).__insertAt, data.length, data);
			}
			this.waitForReplace = [];
		}
	},

	change : function(model, col) {'use strict';
		var options = {
			index : this.collection.indexOf(model)
		};
		var self = this;
		//remember last index
		//check continues (previous must be insterted one index above)
		if (_.size(this.waitForReplace) > 0 && _.last(this.waitForReplace).__insertAt != options.index - 1) {
			//dont clear defer
			self.replace_defer();
		}
		model.__insertAt = options.index;
		this.waitForReplace.push(model);
		clearTimeout(this.deferReplace);
		this.deferReplace = setTimeout(function() {
			self.replace_defer();
		}, 0);
		return;
	},

	remove_defer : function() {'use strict';
		if (_.size(this.waitForRemove) > 0) {
			this.section.deleteItemsAt(_.last(this.waitForRemove).__deleteAt, this.waitForRemove.length, {
				animationStyle : OS_IOS ? Titanium.UI.iPhone.RowAnimationStyle.LEFT : null
			});
			this.waitForRemove = [];
		}
	},

	remove : function(model, col, options) {'use strict';
		var self = this;
		//check continues (previous must be insterted one index above)
		if (_.size(this.waitForRemove) > 0 && _.last(this.waitForRemove).__deleteAt != options.index) {
			//dont clear defer
			self.remove_defer();
		}
		//remember last index
		model.__deleteAt = options.index;
		this.waitForRemove.push(model);
		clearTimeout(this.deferRemove);
		this.deferRemove = setTimeout(function() {
			self.remove_defer();
		}, 0);
	}
});

module.exports = ListViewBinder;
