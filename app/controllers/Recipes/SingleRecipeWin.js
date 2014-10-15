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
				title : ingredient.name
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
