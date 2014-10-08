Alloy.Globals.navGroup = $.navGroup;
if (OS_IOS) {
	$.navGroup.setRootNavGroup($.navWindow);
}
Alloy.Globals.drawer = $.drawer;

/*
 var cw = Alloy.createController("main/Head" + ( OS_IOS ? "Window" : "View"));
 Alloy.Globals.drawer.setAndRememberCenterWindow(cw);*/

$.drawer.open();
