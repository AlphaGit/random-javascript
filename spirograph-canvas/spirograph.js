window.Spirograph = function(userOptions) {
	// private fields
	var canvas = null;
	var ctx = null;
	var options = null;

	var defaultOptions = {
		fullWidth: true,
		fullHeight: true,
		stageHeight: 600,
		stageWidth: 1024
	};

	options = mergeObjects(defaultOptions, userOptions);
	if (!options.canvasNode) throw "canvasSelector is a required parameter";
	if (options.fullWidth) options.stageWidth = document.documentElement.clientWidth;
	if (options.fullHeight) options.stageHeight = document.documentElement.clientHeight;

	function mergeObjects(toOverride, overridingWith) {
		for (var property in overridingWith) {
			toOverride[property] = overridingWith[property];
		}
		return toOverride;
	}

	function initCanvas() {
		var body = document.getElementsByTagName("body")[0];
		var height = options.stageWidth;
		var width = options.stageHeight;
		canvas = document.createElement("canvas");
		canvas.width = height;
		canvas.height = width;
		body.appendChild(canvas);
		ctx = canvas.getContext("2d");
	}

	function start() {
		initCanvas();
		alert("//TODO do magic here!");
	};

	// public methods
	return {
		start: start
	};
};
