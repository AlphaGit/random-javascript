window.playing = (function() {
	return {
		init: function() {
			var body = document.getElementsByTagName("body")[0];
			var height = document.documentElement.clientWidth;
			var width = document.documentElement.clientHeight;
			var canvas = document.createElement("canvas");
			canvas.width = height;
			canvas.height = width;

			body.appendChild(canvas);

			var ctx = canvas.getContext("2d");

			var circlingColorStrategy = new IncrementalCirclingStrategy(0, 0, 0, 20);

			setInterval(function() {
				circlingColorStrategy.circleColors();
				repaintCanvas(circlingColorStrategy.getColors());
			}, 20);

			var repaintCanvas = function(colorString) {
				ctx.fillStyle = colorString;
				ctx.fillRect(0, 0, height, width);
			}
		}
	}
})();

// Abstract class: Circling Color Strategy
function CirclingColorStrategy(initialRed, initialGreen, initialBlue) {
	this.red = initialRed;
	this.green = initialGreen;
	this.blue = initialBlue;

	this.getColors = function() {
		return "rgba(" + this.red + ", " + this.green + ", " + this.blue + ", 1.0)";
	}

	this.circleColors = function() {
		throw "CirclingColorStrategy is an abstract class -- needs an implementation!";
	};

	return {
		getColors: this.getColors,
		circleColors: this.circleColors
	}
};

// IncrementalCirclingStrategy: CirclingColorStrategy
IncrementalCirclingStrategy.prototype = new CirclingColorStrategy();
IncrementalCirclingStrategy.prototype.constructor = IncrementalCirclingStrategy;
function IncrementalCirclingStrategy(initialRed, initialGreen, initialBlue, incrementAmount) {
	CirclingColorStrategy.call(this, initialRed, initialGreen, initialBlue);
	var dirR = 1, dirG = 1, dirB = 1;
	this.incrementAmount = typeof(incrementAmount) == "undefined" || incrementAmount <= 2
		? 2
		: incrementAmount;

	var getRandom = function(limit) {
		return Math.floor(Math.random() * limit);
	};

	this.circleColors = function() {
		var newR = (this.red + getRandom(this.incrementAmount) * dirR);
		var newG = (this.green + getRandom(this.incrementAmount) * dirG);
		var newB = (this.blue + getRandom(this.incrementAmount) * dirB);

		if (newR >= 255) dirR = -1;
		if (newG >= 255) dirG = -1;
		if (newB >= 255) dirB = -1;

		if (newR <= 0) dirR = 1;
		if (newG <= 0) dirG = 1;
		if (newB <= 0) dirB = 1;

		this.red = newR;
		this.green = newG;
		this.blue = newB;
	}
}