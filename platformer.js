var Platformer = (function() {
	var JUMPING_HEIGHT = -4.2, START_FALL = 0,
		LEFT = 37, RIGHT = 39, UP = 38,
		MOVING_DISTANCE = 400;
	var sprite = {}, keysDown = {}, 
		gamePieces = [], movingBlocks = [], border = {},
		canvas, ctx;

	var gravity = 0.1, velY = 0, 
		speed = 2, blockSpeed = 1;

	var Sprite = function(startX, startY, imageLeft, imageRight, imageJumping) {
		this.height = 60;
		this.width = 70;
		this.x = startX;
		this.y = startY;
		this.movingRight = true;
		this.jumping = false;

		// Load images
		this.image_jumping = new Image();
		this.image_jumping.src = imageJumping;

		this.image_left = new Image();
		this.image_left.src = imageLeft;

		this.image_right = new Image();
		this.image_right.src = imageRight;
	}

	var setupCanvas = function(canvasId, collisionId) {
		canvas = document.getElementById(canvasId);
		ctx = canvas.getContext('2d');

		// Register game pieces
		gamePieces = [];
		elements = document.getElementsByClassName(collisionId);

		for (var i = 0; i < elements.length; i++) {
			var element = elements[i];

			// Register game pieces
			gamePieces.push({
				moves: element.hasAttribute('move'),
				left: element.offsetLeft - sprite.width,
				top: element.offsetTop - sprite.height,
				right: element.offsetLeft + element.offsetWidth,
				bottom: element.offsetTop + element.offsetHeight
			});

			// Register moving elements
			if (element.hasAttribute('move')) {
				movingBlocks.push({
					id: element.id,
					delta: 0,
					right: true,
					index: gamePieces.length - 1
				});
			}
		}

		// Add Bottom, less complicated for jumping/ledges
		gamePieces.push({
			left: canvas.offsetLeft,
			top: canvas.offsetTop + canvas.height - sprite.height,
			right: canvas.offsetLeft + canvas.width - sprite.width,
			bottom: canvas.offsetTop + canvas.height - sprite.height + 10
		});

		// Add left and right borders
		border = {
			left: canvas.offsetLeft,
			right: canvas.offsetLeft + canvas.width - sprite.width
		}

	};

	var standingOn = function(gamePiece) {
		if (sprite.x >= gamePiece.left &&
			sprite.x <= gamePiece.right &&
			sprite.y === gamePiece.top) {
			return true;
		}
		else return false;
	};

	var collisionWith = function(element, x, y) {
		if (x > element.left && x < element.right &&
			y > element.top && y < element.bottom) {
			return true;
		}
		return false;
	};

	var handleMovingPieces = function() {
		for (var i = 0; i < movingBlocks.length; i++) {
			var block = movingBlocks[i];
			var element = document.getElementById(block.id);

			// Change Direction
			if (block.delta === MOVING_DISTANCE) {
				block.right = !block.right;
				block.delta = 0;
			} else {
				var gamePiece = gamePieces[block.index];

				// Update element position
				if (block.right) {
					element.style.left = element.offsetLeft + blockSpeed + "px";
				} else {
					element.style.left = element.offsetLeft - blockSpeed + "px";
				}

				// Update gamepiece positions
				gamePiece.left = element.offsetLeft - sprite.width;
				gamePiece.right = element.offsetLeft + element.offsetWidth;
				block.delta += 1;

				// Update sprite
				if (standingOn(gamePiece) || collisionWith(gamePiece, sprite.x, sprite.y)) {
					if (block.right) {
						sprite.x += blockSpeed;
					} else {
						sprite.x -= blockSpeed;
					}
				}
			}
		}
	}

	var handleJump = function() {
		if (sprite.jumping) {
			velY += gravity;

			var tempY = sprite.y + velY;

			// Check for collisions
			for (var i = 0; i < gamePieces.length; i++) {
				var gamePiece = gamePieces[i];

				if (collisionWith(gamePiece, sprite.x, tempY)) {
					// Falling or rising?
					if (velY >= 0) {
					 	// Land on object
						sprite.y = gamePiece.top;
						sprite.jumping = false;
					} else {
						// Hit head on gamePiece
						velY = START_FALL;
					}
					return;
				}
			}
			sprite.y = tempY;
		}
	};

	var handleKeydown = function() {
		// Jump
		if (keysDown[UP]) {
			if(!sprite.jumping) {
       			sprite.jumping = true;
	       		velY = JUMPING_HEIGHT;
	      	}
		}
		// Move Left or Right
		if (keysDown[LEFT] || keysDown[RIGHT]) {

			var tempX = sprite.x;

			if (keysDown[LEFT]) {
				sprite.movingRight = false;
				tempX -= speed;
			} else {
				sprite.movingRight = true;
				tempX += speed;
			}

			// Check for collisions and ledges
			for (var i = 0; i < gamePieces.length; i++) {
				var gamePiece = gamePieces[i];

				// Stepped off ledge
				if (tempX > gamePiece.left && tempX < gamePiece.right &&
				    sprite.y < gamePiece.top && sprite.jumping == false) {
					/*** Make more robust ***/
					sprite.jumping = true;
					velY = START_FALL;
				}

				// Collision
				if (collisionWith(gamePiece, tempX, sprite.y)) {
					return;
				}
			}

			// Keep within bounds
			if (tempX > border.left && tempX < border.right) {
				sprite.x = tempX;
			}
		}
	};

	// The main game loop
	var main = function () {
		// Reset canvas
		canvas.width = canvas.width;	

		handleKeydown();
		handleJump();
		handleMovingPieces();

		if (sprite.jumping) {
			ctx.drawImage(sprite.image_jumping, sprite.x, sprite.y);
		} else if (sprite.movingRight) {
			ctx.drawImage(sprite.image_right, sprite.x, sprite.y);
		} else {
			ctx.drawImage(sprite.image_left, sprite.x, sprite.y);
		}

	};
	
	return {
		setupSprite: function(startX, startY, width, height, imageLeft, imageRight, imageJumping) { 
			sprite = new Sprite(startX, startY, imageLeft, imageRight, imageJumping);
		},
		setupCanvas: function(canvasId, collisionId) { 
			if (sprite) {
				setupCanvas(canvasId, collisionId);
			} else {
				console.log("Must register Sprite before Canvas.");
			}
		},
		start: function() { 
			addEventListener("keydown", function (e) {
				keysDown[e.keyCode] = true;
			}, false);

			addEventListener("keyup", function (e) {
				delete keysDown[e.keyCode];
			}, false);

			if (canvas && sprite) {
				setInterval(main, 1);
			} else {
				console.log("Must register both Sprite and Canvas with Platformer.");
			}
		}
	};

})();

var y = document.getElementById('main').offsetTop - 60;
Platformer.setupSprite(60, y, 70, 60, "images/dude-left.png", "images/dude-right.png", "images/dude-jumping.png");

//Create the canvas
var canvas = document.getElementById('johnny');
canvas.width = window.innerWidth;
canvas.height = document.getElementById('contactInfo').offsetTop + 25;;

setTimeout(function(){
	// Wait for images to load
	Platformer.setupCanvas('johnny', 'game');
	Platformer.start();
}, 300);
