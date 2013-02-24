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

		var grid = new GridCalculator(options.stageHeight, options.stageWidth, 8, 20);
		var game = new ArkanoidGame(ctx, grid, 200);
		game.start();
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
function DrawableBlock(drawingContext, color, gridCalculator, gridRow, gridColumn) {
	DrawableEntityBase.call(this, drawingContext, color);
	var self = this;
	self.gridCalculator = gridCalculator;
	self.gridRow = gridRow;
	self.gridColumn = gridColumn;

	self.draw = function() {
		self.ctx.fillStyle = self.color;

		var x = self.gridCalculator.getBlockPosX(self.gridColumn);
		var y = self.gridCalculator.getBlockPosY(self.gridRow);
		var h = self.gridCalculator.getBlockHeight();
		var w = self.gridCalculator.getBlockWidth();

		self.ctx.fillRect(x, y, w, h);
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
		self.ctx.beginPath();
		self.ctx.arc(self.centerX, self.centerY, self.radius, 0, Math.PI*2, false);
		self.ctx.fill();
	};

	return {
		draw: self.draw
	};
}

// ArkanoidPlayer
ArkanoidPlayer.prototype = Object.create(DrawableBlock.prototype);
ArkanoidPlayer.prototype.constructor = DrawableBlock;
function ArkanoidPlayer(drawingContext, color, gridCalculator) {
	var self = this;
	self.cornerX = 0;
	self.cornerY = 0;
	self.gridCalculator = gridCalculator;

	DrawableBlock.call(this, drawingContext, self.color, self.gridCalculator, self.gridCalculator.getNumRows() - 2, self.gridCalculator.getNumColumns() - 2);

	self.centerPlayer = function() {
		self.cornerX = (gridCalculator.getRealWidth() - gridCalculator.getBlockWidth()) / 2;
		self.cornerY = gridCalculator.getBlockPosY(gridCalculator.getNumRows() - 2);
	};

	self.draw = function() {
		self.ctx.fillStyle = color;

		var x = self.cornerX;
		var y = self.cornerY;
		var h = self.gridCalculator.getBlockHeight();
		var w = self.gridCalculator.getBlockWidth();

		self.ctx.fillRect(x, y, w, h);
	};

	self.centerPlayer();
	return {
		draw: self.draw,
		centerPlayer: self.centerPlayer
	};
}

Ball.prototype = Object.create(DrawableCircle.prototype);
Ball.prototype.constructor = DrawableCircle;
function Ball(drawingContext, color, radius, stageHeight, stageWidth) {
	var self = this;
	self.centerBall = function() {
		self.centerX = (stageWidth - radius*2) / 2;
		self.centerY = (stageHeight - radius*2) / 2;
	}
	self.centerBall();	

	DrawableCircle.call(this, drawingContext, color, radius, self.centerX, self.centerY);

	var move = function(dX, dY) {
		self.centerX += dX;
		self.centerY += dY;
	};

	var hitsBottom = function() {
		return stageHeight - radius <= self.centerY;
	};

	var hitsTop = function() {
		return self.centerY <= radius;
	};

	var hitsLeft = function() {
		return self.centerX <= radius;
	};

	var hitsRight = function() {
		return stageWidth - radius <= self.centerX;
	};

	return {
		centerBall: self.centerBall,
		draw: self.draw,
		move: move,
		hitsBottom: hitsBottom,
		hitsTop: hitsTop,
		hitsLeft: hitsLeft,
		hitsRight: hitsRight
	};
}

// ArkanoidGame
function ArkanoidGame(drawingContext, gridCalculator, fps) {
	var self = this;
	self.ballRadius = gridCalculator.getBlockHeight() * 0.6;
	self.runningLoop = null;

	var player = new ArkanoidPlayer(drawingContext, "#000", gridCalculator);
	player.draw();

	var ball = new Ball(drawingContext, "#000", self.ballRadius, gridCalculator.getRealHeight(), gridCalculator.getRealWidth());
	ball.draw();

	self.ballDirection = {
		dX: 1,
		dY: 1
	}

	var gameLoop = function() {
		drawingContext.clearRect(0, 0, gridCalculator.getRealWidth(), gridCalculator.getRealHeight());
		if (ball.hitsBottom()) self.ballDirection.dY = -1;
		if (ball.hitsTop()) self.ballDirection.dY = 1;
		if (ball.hitsRight()) self.ballDirection.dX = -1;
		if (ball.hitsLeft()) self.ballDirection.dX = 1;
		
		ball.move(self.ballDirection.dX, self.ballDirection.dY);
		ball.draw();

		player.draw();
	};

	var start = function() {
		self.runningLoop = setInterval(gameLoop, 1000/fps);
	};

	var pause = function() {
		clearInterval(self.runningLoop);
		self.runningLoop = null;
	};

	return {
		start: start,
		pause: pause
	};
}

// helper: grid calculator for coordinate system
function GridCalculator(realHeight, realWidth, numColumns, numRows) {
	var self = this;
	self.numColumns = numColumns;
	self.numRows = numRows;
	self.realHeight = realHeight;
	self.realWidth = realWidth;

	var getRealHeight = function() {
		return self.realHeight;
	};

	var getRealWidth = function() {
		return self.realWidth;
	};

	var getNumRows = function() {
		return self.numRows;
	};

	var getNumColumns = function() {
		return self.numColumns;
	};

	var getBlockWidth = function() {
		return self.realWidth / self.numColumns;
	};

	var getBlockHeight = function() {
		return self.realHeight / self.numRows;
	};

	var getBlockPosX = function(columnIndex) {
		return columnIndex * getBlockWidth();
	};

	var getBlockPosY = function(rowIndex) {
		return rowIndex * getBlockHeight();
	};

	var getBlockCenterPosX = function(columnIndex) {
		return (columnIndex + 0.5) * getBlockWidth();
	};

	var getBlockCenterPosY = function(rowIndex) {
		return (rowIndex + 0.5) * getBlockHeight();
	};

	return {
		getBlockWidth: getBlockWidth,
		getBlockHeight: getBlockHeight,
		getBlockPosX: getBlockPosX,
		getBlockPosY: getBlockPosY,
		getBlockCenterPosX: getBlockCenterPosX,
		getBlockCenterPosY: getBlockCenterPosY,
		getNumRows: getNumRows,
		getNumColumns: getNumColumns,
		getRealHeight: getRealHeight,
		getRealWidth: getRealWidth
	};
}