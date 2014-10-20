function toggleLeft(e){
	Alloy.Globals.drawer.toggleLeftWindow();
	Ti.App.fireEvent("drawerToggle");
}

Alloy.Models.menuModel.on("change", function() {
	$.root.title = Alloy.Models.menuModel.get("name");
});