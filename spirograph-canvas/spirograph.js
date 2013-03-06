window.Spirograph = function(userOptions) {
	// private fields
	var canvas;
	var ctx;
	var options;
	var configNode;

	var defaultOptions = {
	};

	options = mergeObjects(defaultOptions, userOptions);
	if (!options.canvasNode) throw "canvasSelector is a required parameter";
	canvas = document.querySelector(options.canvasNode);

	if (options.configurationNode)
		configNode = document.querySelector(options.configurationNode);

	ctx = canvas.getContext("2d");

	function mergeObjects(toOverride, overridingWith) {
		for (var property in overridingWith) {
			toOverride[property] = overridingWith[property];
		}
		return toOverride;
	}

	function start() {
		alert("//TODO do magic here!");
	};

	// public methods
	return {
		start: start
	};
};
