function toggleLeft(e){
	Alloy.Globals.drawer.toggleLeftWindow();
}

Alloy.Models.menuModel.on("change", function() {
	$.root.title = Alloy.Models.menuModel.get("name");
});