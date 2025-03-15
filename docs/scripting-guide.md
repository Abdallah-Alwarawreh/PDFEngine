# PDFEngine Scripting Guide

## Game Structure

### Basic Setup

Every game needs an initialization function and an update loop:

```javascript
// Game configuration
const WIDTH = 500;
const HEIGHT = 500;
const FPS = 60;

// Global state
let global = {
	initialized: false
};

let gameState = {
	score: 0,
	isGameOver: false
};

// Initialize game
function initGame() {
	if (global.initialized) return;
	global.initialized = true;

	// Start the game loop
	app.setInterval('updateGame()', 1000 / FPS);
}

// Game update function - called every frame
function updateGame() {
	if (gameState.isGameOver) return;

	// Your game logic here
	updatePlayer();
	checkCollisions();
	updateScore();
}
```

## Field Access

### Getting Fields

```javascript
// Get a field by name
let playerField = this.getField('field_player');
let scoreField = this.getField('field_score');

// Get field properties
let rect = playerField.rect; // Returns [x1, y1, x2, y2]
let value = scoreField.value; // Get field value
```

### Updating Fields

```javascript
// Update field value
scoreField.value = '100';

// Update field position
playerField.rect = [x1, y1, x2, y2];

// Update field color
playerField.fillColor = ['RGB', 1, 0, 0]; // Red
```

## Position Helpers

```javascript
// Get center position of a field
function getFieldCenter(field) {
	let rect = field.rect;
	return {
		x: (rect[0] + rect[2]) / 2,
		y: (rect[1] + rect[3]) / 2
	};
}

// Move a field to a position
function moveField(field, x, y, width, height) {
	field.rect = [x - width / 2, y - height / 2, x + width / 2, y + height / 2];
}
```

## Input Handling

### Mouse Events

To capture mouse position you need a tricky way because chrome pdf doesn't give us a direct api for it, check out this breakout experiment to understand how they did it: [breakout](https://github.com/osnr/horrifying-pdf-experiments/blob/master/generate_breakout.py)

### Keyboard Events

In order for this to work, you need a text field with a javascript action of `key_pressed(event.change)` players must be typing in the text field to move.

```javascript
function key_pressed(key) {
	const paddleHeight = paddleR.rect[3] - paddleR.rect[1];
	switch (key) {
		case 's':
			if (paddleRPosition.y > MINHEIGHT) paddleRPosition.y -= 5;
			break;
		case 'w':
			if (paddleRPosition.y < 455) paddleRPosition.y += 5;
			break;
	}
	let paddle = this.getField('field_paddle_R');
	paddle.rect = setRectPosition(paddle.rect, paddleRPosition, 32, 100);
}
```

## Collision Detection

```javascript
function checkCollision(field1, field2) {
	let rect1 = field1.rect;
	let rect2 = field2.rect;

	return !(
		rect1[2] < rect2[0] ||
		rect1[0] > rect2[2] ||
		rect1[3] < rect2[1] ||
		rect1[1] > rect2[3]
	);
}

function checkCollisions() {
	let player = this.getField('field_player');
	let enemy = this.getField('field_enemy');

	if (checkCollision(player, enemy)) {
		handleCollision();
	}
}
```

## Utility Functions

### Debug Helpers

```javascript
function debug(message) {
	app.alert(message);
}

function debugField(field) {
	debug(`Field ${field.name}:
		Position: ${field.rect}
		Value: ${field.value}`);
}
```

### Math Helpers

```javascript
function random(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function distance(pos1, pos2) {
	let dx = pos2.x - pos1.x;
	let dy = pos2.y - pos1.y;
	return Math.sqrt(dx * dx + dy * dy);
}
```

## Limitations

1. The PDF JavaScript environment is sandboxed
2. No access to external resources
3. Limited to PDF form fields for visual elements
4. No direct pixel manipulation

## Debugging

1. Use `app.alert()` to show debug information
