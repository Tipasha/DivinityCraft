var titouchdb = require('com.obscure.titouchdb');
var manager = titouchdb.databaseManager;
var db = manager.getDatabase("recipes");

var ingMap = ["ing_1", "ing_2"];

var basicRowHeight = 44;

$.ing_1TblSections = [];
$.ing_2TblSections = [];

_.each($model.get("connections"), function(rec) {
	if (rec.ing_1.length > rec.ing_2.length) {
		addPlusView(basicRowHeight * rec.ing_1.length);
		$.ing_1RowHeight = null;
		$.ing_2RowHeight = basicRowHeight * rec.ing_1.length / rec.ing_2.length;
	} else {
		addPlusView(basicRowHeight * rec.ing_2.length);
		$.ing_1RowHeight = basicRowHeight * rec.ing_2.length / rec.ing_1.length;
		$.ing_2RowHeight = null;
	}
	_.each(ingMap, function(ing) {
		$[ing + "TblSection"] = Ti.UI.createTableViewSection();

		_.each(rec[ing], function(ingredient) {
			var row = Ti.UI.createTableViewRow({
				height : $[ing + "RowHeight"] ? $[ing + "RowHeight"] : basicRowHeight,
				selectionStyle : OS_IOS ? Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY : null
			});
			
			var lbl = Ti.UI.createLabel({
				text : ingredient.name || "",
				font : {
					fontSize : 14
				},
				color : "#000",
				left : 6
			});
			
			row.add(lbl);

			row.addEventListener("click", function() {
				var doc = db.getDocument(ingredient.id);
				if (doc && doc.properties) {
					Ti.App.fireEvent("showRecipe", {
						recipe : doc.properties
					});
				} else {
					var dialog = Ti.UI.createAlertDialog({
						ok : 'Ok',
						title : L("no_object_in_bd")
					}).show();
				}
			});

			$[ing + "TblSection"].add(row);
		});
		$[ing + "TblSections"].push($[ing + "TblSection"]);
	});
});

$.leftTbl.sections = $.ing_1TblSections;
$.rightTbl.sections = $.ing_2TblSections;

function addPlusView(height) {
	var self = Ti.UI.createView({
		height : height
	});

	var plus = Ti.UI.createLabel({
		text : "+"
	});

	self.add(plus);

	$.addViewsContainer.add(self);
}
