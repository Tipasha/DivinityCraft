_.each($model.get("connections"), function(rec) {
	var leftTblData = [];
	var rightTblData = [];

	_.each(rec.ing_1, function(ing) {
		var row = Ti.UI.createTableViewRow({
			height : 44
		});

		var title = Ti.UI.createLabel({
			left : 0,
			text : ing.name
		});

		row.add(title);

		leftTblData.push(row);
	});

	_.each(rec.ing_2, function(ing) {
		var row = Ti.UI.createTableViewRow({
			height : 44
		});

		var title = Ti.UI.createLabel({
			left : 0,
			text : ing.name
		});

		row.add(title);

		rightTblData.push(row);
	});
	$.leftTbl.data = leftTblData;
	$.rightTbl.data = rightTblData;
	addPlusView(44 * 3);
});

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
