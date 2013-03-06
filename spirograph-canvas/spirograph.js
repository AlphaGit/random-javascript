window.Spirograph = function(userOptions) {
	// private fields
	var canvas;
	var ctx;
	var options;
	var configNode;

	var defaultOptions = {
		fps: 20,
		angleIncrement: 0.0001
	};

	var center = {
		x: null,
		y: null
	};
	var currentAngle = 0;

	options = mergeObjects(defaultOptions, userOptions);
	if (!options.canvasNode) throw "canvasSelector is a required parameter";
	canvas = document.querySelector(options.canvasNode);
	ctx = canvas.getContext("2d");
	center.x = canvas.width / 2;
	center.y = canvas.height / 2;

	if (options.configurationNode)
		configNode = document.querySelector(options.configurationNode);

	function mergeObjects(toOverride, overridingWith) {
		for (var property in overridingWith) {
			toOverride[property] = overridingWith[property];
		}
		return toOverride;
	}

	var animationHandle;
	function start() {
		animationHandle = setInterval(animationLoop, 1000/options.fps);
	};
	function stop() {
		clearInterval(animationHandle);
	}

	function animationLoop() {
		//TODO get point position
		//TODO draw it
		//TODO increment angle
	};

	// public methods
	return {
		start: start
	};
};

function Polygon(centerX, centerY, sides, radius) {
	var center = {
		x: centerX,
		y: centerY
	};

	return getEdgePosition(angle) {
		if (angle == 0)
			return {
				x: center.x,
				y: center.y - radius
			};

		//TODO return x and y for each possible angle in this polygon
	}
};