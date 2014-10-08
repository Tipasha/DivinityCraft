Alloy.Globals.navGroup = $.navGroup;
if (OS_IOS) {
	$.navGroup.setRootNavGroup($.navWindow);
}
Alloy.Globals.drawer = $.drawer;
$.drawer.open();

Ti.App.addEventListener("showRecipe", function(e) {
	var recipe = Alloy.createModel("RecipesDB", e.recipe);
	recipe.__transform = recipe.singleTranslate();
	$.navGroup.open(Alloy.createController("Recipes/SingleRecipeWin", {
		"$model" : recipe
	}).getView());
});
