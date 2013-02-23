window.arkanoid = (function(userOptions) {

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


	// private methods
	function initOptions(userOptions) {
		options = mergeObjects(defaultOptions, userOptions);
		if (options.fullWidth) options.stageWidth = document.documentElement.clientWidth;
		if (options.fullHeight) options.stageHeight = document.documentElement.clientHeight;
	}

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

	function initAll() {
		initOptions();
		initCanvas();

		var stage = new ArkanoidStage(ctx, options.stageHeight, options.stageWidth);
	}

	// public methods
	return {
		init: initAll
	};
})();

// DrawableEntityBase
function DrawableEntityBase(drawingContext, color) {
	if (!drawingContext) throw "A drawing context needs to be provided.";

	this.ctx = drawingContext;
	this.color = color;

	this.draw = function() {
		throw "DrawableEntityBase is an abstract class -- needs an implementation!"
	};

	return {
		draw: this.draw
	};
}

// DrawableBlock: DrawableEntityBase
DrawableBlock.prototype = Object.create(DrawableEntityBase.prototype);
DrawableBlock.prototype.constructor = DrawableEntityBase;
function DrawableBlock(drawingContext, color, posX, posY, height, width) {
	DrawableEntityBase.call(this, drawingContext, color);
	var self = this;
	self.posX = posX;
	self.posY = posY;
	self.height = height;
	self.width = width;

	self.draw = function() {
		self.ctx.fillStyle = color;
		self.ctx.fillRect(self.posX, self.posY, self.height, self.width);
	};

	return {
		draw: self.draw
	};
}

//DrawableCircle: DrawableEntityBase
DrawableCircle.prototype = Object.create(DrawableEntityBase.prototype);
DrawableCircle.prototype.constructor = DrawableEntityBase;
function DrawableCircle(drawingContext, color, radius, centerX, centerY) {
	DrawableEntityBase.call(this, drawingContext, color);
	var self = this;
	self.radius = radius;
	self.centerX = centerX;
	self.centerY = centerY;

	self.draw = function() {
		self.ctx.fillStyle = color;
		self.ctx.ellipse(self.centerX, self.centerY, self.radius, self.radius, 0, 0, 0, false);
	};

	return {
		draw: self.draw
	};
}

// ArkanoidPlayer
ArkanoidPlayer.prototype = Object.create(DrawableBlock.prototype);
ArkanoidPlayer.prototype.constructor = DrawableBlock;
function ArkanoidPlayer(drawingContext, color, blockHeight, blockWidth, stageWidth, stageHeight) {
	var self = this;
	self.stageWidth = stageWidth;
	self.stageHeight = stageHeight;
	self.cornerX = 0;
	self.cornerY = 0;

	DrawableBlock.call(this, drawingContext, color, (stageWidth - blockWidth)/2, stageHeight - blockWidth * 2, blockWidth, blockHeight);
	self.centerPlayer = function() {
		self.cornerX = (stageWidth - self.width) / 2;
	};

	self.centerPlayer();
	return {
		draw: self.draw,
		centerPlayer: self.centerPlayer
	};
}

// ArkanoidStage
function ArkanoidStage(drawingContext, height, width) {
	this.blockWidth = width / 10;
	this.blockHeight = height / 50;
	this.ballRadius = this.blockHeight * 0.8;

	var player = new ArkanoidPlayer(drawingContext, "#000", this.blockHeight, this.blockWidth, width, height);
	player.draw();

	return {

	};
}