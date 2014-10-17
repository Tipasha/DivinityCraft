var titouchdb = require('com.obscure.titouchdb');
var manager = titouchdb.databaseManager;
var db = manager.getDatabase("recipes");

var ingMap = ["ing_1", "ing_2"];

var basicRowHeight = 54;

$.ing_1TblSections = [];
$.ing_2TblSections = [];

$.ai.show();

setInterval(function() {
	$.ai.hide();
	$.container.visible = true;
}, 1000);

_.each($model.get("connections"), function(rec, i) {
	if (rec.ing_1.length > rec.ing_2.length) {
		addPlusView(basicRowHeight * rec.ing_1.length, i);
		$.ing_1RowHeight = null;
		$.ing_2RowHeight = basicRowHeight * rec.ing_1.length / rec.ing_2.length;
	} else {
		addPlusView(basicRowHeight * rec.ing_2.length, i);
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
				left : 0,
				width : "100%",
				textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER
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

function addPlusView(height, i) {
	var self = Ti.UI.createView({
		height : height
	});

	var topLine = Ti.UI.createView({
		height : 2,
		backgroundColor : "#cbc7c6",
		top : 0
	});

	var bottomLine = Ti.UI.createView({
		height : 2,
		backgroundColor : "#cbc7c6",
		bottom : 0
	});

	var plus = Ti.UI.createLabel({
		text : "+"
	});

	self.add(plus);
	if (i == 0) {
		self.add(topLine);
	} else {
		$.addViewsContainer.children[i - 1].children[$.addViewsContainer.children[i - 1].children.length - 1].height = 1;
	}
	self.add(bottomLine);

	$.addViewsContainer.add(self);
}
