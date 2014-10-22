// Originally derived from example code from Appcelerator developer relations.
$.windowStack = [];
var containerWindow = null;

function extendOptionsOpen(options) {
	if (!options)
		options = {};
	options.activityEnterAnimation = Ti.App.Android.R.anim.slide_in_right;
	options.activityExitAnimation = Ti.App.Android.R.anim.slide_out_left;
	options.animated = true;
	return options;
}

function extendOptionsClose(options) {
	if (!options)
		options = {};
	options.activityEnterAnimation = Ti.App.Android.R.anim.slide_in_left;
	options.activityExitAnimation = Ti.App.Android.R.anim.slide_out_right;
	options.animated = true;
	return options;
}

exports.setRootNavGroup = function(navGroup){
	$.navGroup = navGroup;
};
// Method: open Add a new window to the Navigation Group
// @param windowToOpen {TiUIWindow} Window to open within the nav group.
// @param [options] {openWindowParams} Options to apply while opening. See http://docs.appcelerator.com/titanium/latest/#!/api/openWindowParams.
exports.open = function(windowToOpen, options) {
	if (OS_ANDROID) {
		options = extendOptionsOpen(options);
	}
	// Add the window to the stack of windows managed by the controller
	$.windowStack.push(windowToOpen);

	// When the window closes pop it from the stack.
	windowToOpen.addEventListener('close', function(e) {
		if ($.top === e.source)
			$.windowStack.pop();
		$.trigger('close', e);
	});

	if (OS_ANDROID) {
		// Have the back button perform the back method.
		windowToOpen.addEventListener('android:back', function(e) {
			// We override so that the close event is handled properly.
			if ($.windowStack.length > 1) {
				$.back();
			} else {
				$.exit();
			}
		});
	}

	// Propagate the open event.
	windowToOpen.addEventListener('open', function(e) {
		$.trigger('open', e);
	});

	// Hack - setting this property ensures the window is "heavyweight" (associated with an Android activity)
	windowToOpen.navBarHidden = windowToOpen.navBarHidden || false;

	if (OS_IOS) {
		$.navGroup.openWindow(windowToOpen, options);
	} else if (OS_ANDROID) {
		windowToOpen.open(options);
	}
};

// Method: back Close the topmost window in the Navigation Group
// @param [options] {Ti.UI.Animation} Animation dictionary or animation to apply when closing the window. See http://docs.appcelerator.com/titanium/latest/#!/api/Titanium.UI.Animation.
// @returns {boolean} true if there was a window to close and false if the home or first window has been reached.
exports.back = function(options) {
	if (OS_ANDROID) {
		options = extendOptionsClose(options);
	}
	if ($.windowStack.length >= 1) {
		if (OS_IOS) {
			$.navGroup.closeWindow($.top, options);
		} else if (OS_ANDROID) {
			$.top.close(options);
		}
		return true;
	}
	return false;
};

// Method: home Go back to the first window of the NavigationController
// @param [options] {Ti.UI.Animation} Animation dictionary or animation to apply when closing the windows. See http://docs.appcelerator.com/titanium/latest/#!/api/Titanium.UI.Animation.
exports.home = function(_winToClose, options) {
	if (OS_ANDROID) {
		options = extendOptionsClose(options);
	}
	if ($.windowStack.length >= 1) {
		// Because we're closing windows on the stack as we traverse it,
		// it's possible that close events might pop windows off the stack,
		// so we make a copy to manipulate.
		if (_winToClose && $.windowStack.length > _winToClose) {
			var winToClose = $.windowStack.length - _winToClose - 1;
		} else {
			var winToClose = 0;
		}
		for (var i = $.windowStack.length - 1; i >= winToClose; i--) {
			if (OS_IOS) {
				$.navGroup.closeWindow($.windowStack[i], options);
			} else if (OS_ANDROID) {
				$.windowStack[i].close(options);
			}
		}
	}
};

exports.exit = function(options) {
	if (OS_ANDROID) {
		options = extendOptionsClose(options);
	}
	if (OS_IOS) {
		if ($.navGroup) {
			$.windowStack = [];
			$.navGroup.close();
		}
	} else {
		if ($.windowStack.length > 0) {
			for (var i = $.windowStack.length - 1; i >= 0; i--) {
				$.windowStack[i].close(options);
			}
		}
	}
};

// Property: top Returns the window at the top of the stack.
Object.defineProperty($, "top", {
	get : function() {
		return _.last($.windowStack);
	}
});

// Property: length Returns the number of windows on the stack.
Object.defineProperty($, "length", {
	get : function() {
		return $.windowStack.length;
	}
});
