function toggleLeft(e){
	Alloy.Globals.drawer.toggleLeftWindow();
}

Alloy.Models.menuModel.on("change", function() {
	$.winTitle.text = Alloy.Models.menuModel.get("name");
});