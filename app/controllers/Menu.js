var lastSelectedIndex = -1;

$.accordeonMode = true;

$.collection = Alloy.createCollection("MenuModel");

var ListViewBinder = require("ListViewBinder");
$.binder = new ListViewBinder({
	listview : $.list,
	section : $.defaultSection,
	collection : $.collection
});
$.binder.bind();
$.collection.reload();


function onRowClick(e) {
	var model = $.collection.at(e.itemIndex);
	var r = model.toJSON();
	var item = e.section.getItemAt(e.itemIndex);

	if (r.children && r.children.length) {
		if (!_checkIfOpened()) {
			if (lastSelectedIndex != -1 && $.accordeonMode) {
				e.section.updateItemAt(lastSelectedIndex, _.extend(e.section.getItemAt(lastSelectedIndex), {
					arrow : {
						backgroundImage : "/images/menu/arrow_right.png"
					}
				}));

			}
			e.section.updateItemAt(e.itemIndex, _.extend(item, {
				arrow : {
					backgroundImage : "/images/menu/arrow_down.png"
				}
			}));

			if ($.accordeonMode) {
				$.collection.remove(_getAllChildModels());
			}
			$.collection.add(_createChildModels(), {
				at : r.id + 1
			});
			lastSelectedIndex = r.id;
		} else {
			lastSelectedIndex = -1;
			e.section.updateItemAt(e.itemIndex, _.extend(item, {
				arrow : {
					backgroundImage : "/images/menu/arrow_right.png"
				}
			}));

			$.collection.remove(_getAllChildModels());
		}

		function _createChildModels() {
			var models = [];
			_.each(r.children, function(el, i) {
				var m = Alloy.createModel("MenuModel", _.extend(el, {
					icon : r.icon
				}));
				m.set({
					is_children : true,
					parent_id : r._id,
					parent_name : r.name
				});
				models.push(m);
			});
			return models;
		}

		function _checkIfOpened() {
			var nextListItem = e.section.getItemAt(e.itemIndex + 1);
			if (!nextListItem) {
				return false;
			}
			var nextItemId = nextListItem.id;
			return r.children && r.children[0].id == nextItemId;
		}

		function _getAllChildModels() {
			var models = _.filter($.collection.models, function(m) {
				return m.get("is_children");
			});
			return models;
		}

	} else {
		Alloy.Globals.navGroup.home();
		Alloy.Models.menuModel.set(r);
		Alloy.Globals.drawer.toggleLeftWindow();
	}
}
