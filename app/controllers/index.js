Alloy.Globals.navGroup = $.navGroup;
if (OS_IOS) {
	$.navGroup.setRootNavGroup($.navWindow);
}
Alloy.Globals.drawer = $.drawer;
$.drawer.open();

if (OS_ANDROID) {
	$.drawer.addEventListener('open', onNavDrawerWinOpen);
	var actionBar = null;

	function onNavDrawerWinOpen(evt) {
		this.removeEventListener('open', onNavDrawerWinOpen);

		if (this.getActivity()) {
			var activity = this.getActivity();
			actionBar = activity.getActionBar();

			if (actionBar) {
				actionBar.setTitle("Все рецепты");
				actionBar.setLogo("/images/bar/menu_btn.png");
				actionBar.setOnHomeIconItemSelected($.drawer.toggleLeftWindow);
			}

			activity.onCreateOptionsMenu = function(e) {
				Ti.API.info("CREATE MENU")
				var menu = e.menu;

				var reloadBtn = menu.add({
					title : "Reload",
					icon : "/images/bar/reload_icon.png",
					showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS
				});
				reloadBtn.addEventListener("click", function(e) {
					Ti.App.fireEvent("reloadCollection");
				});
			};
		}
	}


	Alloy.Models.menuModel.on("change", function() {
		if (actionBar) {
			actionBar.setTitle(Alloy.Models.menuModel.get("name"));
		}
	});
}

Ti.App.addEventListener("showRecipe", function(e) {
	var recipe = Alloy.createModel("RecipesModel", e.recipe);
	recipe.__transform = recipe.singleTranslate();
	$.navGroup.open(Alloy.createController("Recipes/SingleRecipeWin", {
		"$model" : recipe
	}).getView());
});
