icons = {
	'file': 65,
	'exit': 66,
	'enter': 67,
	'checkmark': 68,
	'cog': 69,
	'remove': 70,
	'pencil': 71,
	'file2': 72,
	'file3': 73,
	'support': 74,
	'home': 75,
	'info': 76,
	'info2': 77,
	'question': 78,
	'lock': 79,
	'spam': 80,
	'wrench': 81,
	'print': 82,
	'disk': 83,
	'stop': 84,
	'user': 85,
	'screen': 86,
	'binoculars': 87,
	'warning': 88,
	'arrow-left': 89,
	'arrow-right': 90,
	'ok-circled': 97,
	'eq': 98,
	'left-open': 99,
	'right-open': 100,
	'key': 101
};

// Apply the workspace classes as soon as index.html selects a desktop style.
(function() {
	var isMacValue = false,
		isDesktopValue = false;

	function syncWorkspaceClasses() {
		var isWindows = isDesktopValue && !isMacValue;

		document.documentElement.classList.toggle('mb-mac-loading', isMacValue);
		document.documentElement.classList.toggle('mb-macos', isMacValue);
		document.documentElement.classList.toggle('mb-windows-loading', isWindows);
		document.documentElement.classList.toggle('mb-windows', isWindows);
		if (document.body) {
			document.body.classList.toggle('mb-macos', isMacValue);
			document.body.classList.toggle('mb-windows', isWindows);
		}
	}

	try {
		Object.defineProperty(window, 'isMac', {
			configurable: true,
			get: function() {
				return isMacValue;
			},
			set: function(value) {
				isMacValue = value === true;
				syncWorkspaceClasses();
			}
		});
	} catch (error) {
		window.isMac = isMacValue;
	}

	try {
		Object.defineProperty(window, 'isDesktop', {
			configurable: true,
			get: function() {
				return isDesktopValue;
			},
			set: function(value) {
				isDesktopValue = value === true;
				syncWorkspaceClasses();
			}
		});
	} catch (error) {
		window.isDesktop = isDesktopValue;
	}
})();
