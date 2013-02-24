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

	var getCornerX = function() {
		return self.cornerX;
	};

	var getCornerY = function() {
		return self.cornerY;
	};

	var move = function(dX) {
		self.cornerX += dX;
	};

	return {
		draw: self.draw,
		centerPlayer: self.centerPlayer,
		getCornerX: getCornerX,
		getCornerY: getCornerY,
		move: move
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

	var hitsBlockTop = function(blockX, blockY, blockHeight, blockWidth) {
		// ball center needs to be in the triangular section between the block center and the top edge
		var limitRight = blockX + blockWidth + radius;
		var limitLeft = blockX - radius;
		var limitTop = blockY - radius;
		var limitBottom = blockY + blockHeight / 2;

		var pointA = new Point(limitLeft, limitTop);
		var pointB = new Point(limitRight, limitTop);
		var pointC = new Point((limitLeft + limitRight) / 2, limitBottom);

		var topTriangle = new Triangle(pointA, pointB, pointC);
		return topTriangle.isInside(new Point(self.centerX, self.centerY));
	};

	var hitsBlockBottom = function(blockX, blockY, blockHeight, blockWidth) {
		// ball center needs to be in the triangular section between the block center and the bottom edge
		var limitRight = blockX + blockWidth + radius;
		var limitLeft = blockX - radius;
		var limitTop = blockY + blockHeight / 2;
		var limitBottom = blockY + blockHeight;

		var pointA = new Point(limitLeft, limitBottom);
		var pointB = new Point((limitLeft + limitRight) / 2, limitTop);
		var pointC = new Point(limitRight, limitBottom);

		var bottomTriangle = new Triangle(pointA, pointB, pointC);
		return bottomTriangle.isInside(new Point(self.centerX, self.centerY));
	};

	var hitsBlockLeft = function(blockX, blockY, blockHeight, blockWidth) {
		// ball center needs to be in the triangular section between the block center and the left edge
		var limitLeft = blockX;
		var limitRight = blockX + blockWidth / 2;
		var limitTop = blockY;
		var limitBottom = blockY + blockHeight;

		var pointA = new Point(limitLeft, limitTop);
		var pointB = new Point(limitRight, (limitTop + limitBottom) / 2);
		var pointC = new Point(limitLeft, limitBottom);

		var leftTriangle = new Triangle(pointA, pointB, pointC);
		return leftTriangle.isInside(new Point(self.centerX, self.centerY));
	};

	var hitsBlockRight = function(blockX, blockY, blockHeight, blockWidth) {
		// ball center needs to be in the triangular section between the block center and the right edge
		var limitLeft = blockX + blockWidth / 2;
		var limitRight = blockX + blockWidth;
		var limitTop = blockY;
		var limitBottom = blockY + blockHeight;

		var pointA = new Point(limitLeft, (limitTop + limitBottom) / 2);
		var pointB = new Point(limitRight, limitTop);
		var pointC = new Point(limitRight, limitBottom);

		var rightTriangle = new Triangle(pointA, pointB, pointC);
		return rightTriangle.isInside(new Point(self.centerX, self.centerY));
	};

	return {
		centerBall: self.centerBall,
		draw: self.draw,
		move: move,
		hitsBottom: hitsBottom,
		hitsTop: hitsTop,
		hitsLeft: hitsLeft,
		hitsRight: hitsRight,
		hitsBlockTop: hitsBlockTop,
		hitsBlockRight: hitsBlockRight,
		hitsBlockBottom: hitsBlockBottom,
		hitsBlockLeft: hitsBlockLeft
	};
}

// ArkanoidGame
function ArkanoidGame(drawingContext, gridCalculator, fps) {
	var KEY_CODE_LEFT_ARROW = 37;
	var KEY_CODE_RIGHT_ARROW = 39;

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

	self.pressedKeys = {
		leftArrow: false,
		rightArrow: false
	};

	var onKeyDown = function(evt) {
		evt = evt || window.event;
		if (evt.keyCode == KEY_CODE_LEFT_ARROW) self.pressedKeys.leftArrow = true;
		if (evt.keyCode == KEY_CODE_RIGHT_ARROW) self.pressedKeys.rightArrow = true;
	};
	var onKeyUp = function(evt) {
		evt = evt || window.event;
		if (evt.keyCode == KEY_CODE_LEFT_ARROW) self.pressedKeys.leftArrow = false;
		if (evt.keyCode == KEY_CODE_RIGHT_ARROW) self.pressedKeys.rightArrow = false;
	};

	var gameLoop = function() {
		drawingContext.clearRect(0, 0, gridCalculator.getRealWidth(), gridCalculator.getRealHeight());
		if (ball.hitsBottom()) self.ballDirection.dY = -1;
		if (ball.hitsTop()) self.ballDirection.dY = 1;
		if (ball.hitsRight()) self.ballDirection.dX = -1;
		if (ball.hitsLeft()) self.ballDirection.dX = 1;

		var pX = player.getCornerX();
		var pY = player.getCornerY();
		var pH = gridCalculator.getBlockHeight();
		var pW = gridCalculator.getBlockWidth();

		if (ball.hitsBlockTop(pX, pY, pH, pW)) self.ballDirection.dY = -1;
		if (ball.hitsBlockBottom(pX, pY, pH, pW)) self.ballDirection.dY = 1;
		if (ball.hitsBlockLeft(pX, pY, pH, pW)) self.ballDirection.dX = -1;
		if (ball.hitsBlockRight(pX, pY, pH, pW)) self.ballDirection.dX = 1;
		
		ball.move(self.ballDirection.dX, self.ballDirection.dY);
		player.move(self.pressedKeys.leftArrow ? -1 : self.pressedKeys.rightArrow ? 1 : 0);

		ball.draw();
		player.draw();
	};

	var start = function() {
		window.onkeydown = onKeyDown;
		window.onkeyup = onKeyUp;
		self.runningLoop = setInterval(gameLoop, 1000/fps);
	};

	var pause = function() {
		clearInterval(self.runningLoop);
		window.onkeydown = null;
		window.onkeyup = null;
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

// geometry helpers
function Point(x, y) {
	this.x = x;
	this.y = y;
}

function Triangle(p1, p2, p3) {
	this.p1 = p1;
	this.p2 = p2;
	this.p3 = p3;

	var self = this;

	var sign = function(n) {
		if (n > 0) return 1;
		if (n < 0) return -1;
		return 0;
	};

	// from http://www.emanueleferonato.com/2012/06/18/algorithm-to-determine-if-a-point-is-inside-a-triangle-with-mathematics-no-hit-test-involved/
	var isInside = function (p) {
		var p1 = self.p1;
		var p2 = self.p2;
		var p3 = self.p3;

		var planeP1P2 = (p1.x - p.x) * (p2.y - p.y) - (p2.x - p.x) * (p1.y - p.y);
		var planeP2P3 = (p2.x - p.x) * (p3.y - p.y) - (p3.x - p.x) * (p2.y - p.y);
		var planeP3P1 = (p3.x - p.x) * (p1.y - p.y) - (p1.x - p.x) * (p3.y - p.y);

		return sign(planeP1P2) == sign(planeP2P3) && sign(planeP2P3) == sign(planeP3P1);
	};

	return {
		isInside: isInside
	};
}