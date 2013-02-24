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
		var stage = new ArkanoidStage(ctx, grid);
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
		self.ctx.fillStyle = color;

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
		self.ctx.ellipse(self.centerX, self.centerY, self.radius, self.radius, 0, 0, 0, false);
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

	DrawableBlock.call(this, drawingContext, color, gridCalculator, gridCalculator.getNumRows() - 2, gridCalculator.getNumColumns() - 2);
	self.centerPlayer = function() {
		self.cornerX = 100; //TODO
	};

	self.centerPlayer();
	return {
		draw: self.draw,
		centerPlayer: self.centerPlayer
	};
}

// ArkanoidStage
function ArkanoidStage(drawingContext, gridCalculator) {
	this.ballRadius = gridCalculator.getBlockHeight() * 0.8;

	var player = new ArkanoidPlayer(drawingContext, "#000", gridCalculator);
	player.draw();

	return {

	};
}

// helper: grid calculator for coordinate system
function GridCalculator(realHeight, realWidth, numColumns, numRows) {
	var self = this;
	self.numColumns = numColumns;
	self.numRows = numRows;

	var getNumRows = function() {
		return self.numRows;
	}

	var getNumColumns = function() {
		return self.numColumns;
	}

	var getBlockWidth = function() {
		return realWidth / numColumns;
	};

	var getBlockHeight = function() {
		return realHeight / numRows;
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
		getNumColumns: getNumColumns
	};
}