var args = arguments[0] || {};

$.module = require('dk.napp.drawer');

// convert children to args based on role
if (args.children) {
	_.each(args.children, function(child) {

		// fix: https://jira.appcelerator.org/browse/TC-3583
		if (!child) {
			return;
		}

		var role = child.role;

		if (role) {
			args[role] = child;
		}
	});
}

// convert strings to constants
_.each(['closeDrawerGestureMode', 'openDrawerGestureMode', 'centerHiddenInteractionMode', 'animationMode', 'statusBarStyle'], function(arg) {

	if (args[arg] && typeof args[arg] === 'string') {
		args[arg] = $.module[args[arg]];
	}
});

// delete irrelevant args
delete args.id;
delete args.__parentSymbol;
delete args.children;

// create actual drawer
$.instance = $.module.createDrawer(args);

// add as top level view
$.addTopLevelView($.instance);

// expose properties, setters and getters
_.each(['centerWindow', 'leftWindow', 'rightWindow', 'closeDrawerGestureMode', 'openDrawerGestureMode', 'leftDrawerWidth', 'rightDrawerWidth', 'orientationModes', 'orientation', 'centerHiddenInteractionMode', 'animationMode', 'animationVelocity', 'showShadow', 'shadowWidth', 'shouldStretchDrawer', 'fading', 'parallaxAmount', 'statusBarStyle'], function(key) {
	var cc = key[0].toUpperCase() + key.substring(1);

	var get = exports['get' + cc] || ($['get' + cc] = function() {
		return $.instance[key];
	});
	var set = exports['set' + cc] || ($['set' + cc] = function(val) {
		$.instance[key] = val;
	});

	Object.defineProperty($, key, {
		get : get,
		set : set
	});
});

// exporse other functions
_.each(['toggleLeftWindow', 'toggleRightWindow', 'bounceLeftWindow', 'bounceRightWindow', 'isAnyWindowOpen', 'isLeftWindowOpen', 'isRightWindowOpen', 'open'], function(fn) {
	if (!exports[fn]) {

		// we need wrapper function for Android
		exports[fn] = function() {
			return $.instance[fn]();
		};
	}
});

// events
exports.on = function(event, callback, context) {
	return $.instance.addEventListener(event, callback);
};

exports.off = function(event, callback, context) {
	return $.instance.removeEventListener(event, callback);
};

exports.trigger = function(event, args) {
	return $.instance.fireEvent(event, callback, context);
};

exports.addEventListener = exports.on;
exports.removeEventListener = exports.off;
exports.fireEvent = exports.trigger;

// helpers
exports.closeLeftWindow = function() {
	if ($.instance.isLeftWindowOpen()) {
		return $.instance.toggleLeftWindow();
	}
};

exports.closeRightWindow = function() {
	if ($.instance.isRightWindowOpen()) {
		return $.instance.toggleRightWindow();
	}
};

exports.openLeftWindow = function() {
	if (!$.instance.isLeftWindowOpen()) {
		return $.instance.toggleLeftWindow();
	}
};

exports.openRightWindow = function() {
	if (!$.instance.isRightWindowOpen()) {
		return $.instance.toggleRightWindow();
	}
};

exports.openDrawerGestureModeChange = function(arg) {
	$.instance.setOpenDrawerGestureMode($.module[arg]);
};

rightNavButtons = [];
leftNavButtons = [];
var needChange = false;

$.memoCenterWindow = null;
exports.setAndRememberCenterWindow = function(c) {
	$.memoCenterWindow = c.getView();

	$.instance.setCenterWindow(c.getView());
};

exports.setNavButtons = function(args) {
	if (args.buttons.lenght < 1)
		return;
	if (args.side == "left") {
		leftNavButtons = args.buttons;
	} else {
		rightNavButtons = args.buttons;
	}
	if (OS_IOS) {
		bntsToMenuBtns(args, $.memoCenterWindow.window);
	} else if (OS_ANDROID) {
		var activity = $.instance.getActivity();
		var actionBar = activity.getActionBar();
		activity.onCreateOptionsMenu = function(e) {
			if (needChange) {
				e.menu.clear();
				bntsToMenuBtns(args, e.menu);
				needChange = false;
			}
		};
		activity.invalidateOptionsMenu();
		needChange = true;
	}
};

function bntsToMenuBtns(args, holder) {
	var btns = args.buttons;
	if (OS_ANDROID) {// holder is menu
		_.each(btns, function(e) {
			var btn = holder.add({
				icon : e.image,
				showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS
			});
			btn.addEventListener("click", e.onClick);
		});
	} else if (OS_IOS) {
		var view = Ti.UI.createView({
			width : Ti.UI.SIZE,
			height : "100%",
			layout : "horizontal",
			horizontalWrap : false
		});
		_.each(btns, function(e) {
			e.width = 44;
			e.height = 44;
			var btn = Ti.UI.createButton(e);
			btn.addEventListener("click", e.onClick);
			view.add(btn);
		});
		var st = "set" + (args.side.charAt(0).toUpperCase() + args.side.slice(1)) + "NavButton";
		holder[st](view);
	}
}
