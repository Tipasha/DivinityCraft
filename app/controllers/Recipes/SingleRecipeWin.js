var ingMap = ["ing_1", "ing_2"];

$.ing_1TblSections = [];
$.ing_2TblSections = [];

_.each($model.get("connections"), function(rec) {
	_.each(ingMap, function(ing) {
		$[ing + "TblSection"] = Ti.UI.createTableViewSection();

		_.each(rec[ing], function(ingredient) {
			var row = Ti.UI.createTableViewRow({
				height : 44,
				title : ingredient.name
			});

			$[ing + "TblSection"].add(row);
		});
		$[ing + "TblSections"].push($[ing + "TblSection"]);
	});
	addPlusView(44 * (rec.ing_1.length > rec.ing_2.length ? rec.ing_1.length : rec.ing_2.length));
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
