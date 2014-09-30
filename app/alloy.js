Alloy.Globals.AJAX = require("AJAX");

Alloy.CFG.queryURL = "https://tipasha.iriscouch.com/";

Alloy.Models.menuModel = Alloy.createModel("MenuDB");
Alloy.Collections.menu = Alloy.createCollection('MenuDB');

function isiOS7Plus() {
	if (Titanium.Platform.name == 'iPhone OS') {
		var version = Titanium.Platform.version.split(".");
		var major = parseInt(version[0], 10);

		if (major >= 7) {
			return true;
		}
	}
	return false;
}

Alloy.Globals.iOS7 = isiOS7Plus();
Alloy.CFG.top = Alloy.Globals.iOS7 ? 20 : 0;
