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

```javascript
// These functions are called by field event handlers
function onMouseDown(field) {
	let pos = getFieldCenter(field);
	// Handle mouse down at pos.x, pos.y
}

function onMouseUp(field) {
	// Handle mouse up
}

function onMouseEnter(field) {
	// Handle mouse enter
}

function onMouseExit(field) {
	// Handle mouse exit
}
```

### Keyboard Events

```javascript
// Handle key press
function onKeyPress(field, keyCode) {
	switch (keyCode) {
		case 37: // Left arrow
			movePlayerLeft();
			break;
		case 39: // Right arrow
			movePlayerRight();
			break;
	}
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

## Game State Management

```javascript
// Initialize game state
let gameState = {
	score: 0,
	lives: 3,
	playerPos: { x: WIDTH / 2, y: HEIGHT / 2 },
	enemies: [],
	powerups: [],
	isGameOver: false
};

// Update game state
function updateGameState() {
	// Update player
	let player = this.getField('field_player');
	gameState.playerPos = getFieldCenter(player);

	// Update score
	let scoreField = this.getField('field_score');
	scoreField.value = gameState.score.toString();

	// Check game over
	if (gameState.lives <= 0) {
		gameState.isGameOver = true;
		endGame();
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

## Example Game: Simple Collector

Here's a complete example of a simple collection game:

```javascript
// Configuration
const WIDTH = 500;
const HEIGHT = 500;
const PLAYER_SPEED = 5;
const COIN_COUNT = 5;

// Game state
let gameState = {
	score: 0,
	coins: [],
	isGameOver: false
};

// Initialize game
function initGame() {
	if (global.initialized) return;
	global.initialized = true;

	// Setup player
	let player = this.getField('field_player');
	moveField(player, WIDTH / 2, HEIGHT / 2, 20, 20);

	// Create coins
	for (let i = 0; i < COIN_COUNT; i++) {
		spawnCoin();
	}

	// Start game loop
	app.setInterval('updateGame()', 1000 / 60);
}

// Spawn a coin at random position
function spawnCoin() {
	let coin = this.getField(`field_coin_${gameState.coins.length}`);
	let x = random(20, WIDTH - 20);
	let y = random(20, HEIGHT - 20);
	moveField(coin, x, y, 10, 10);
	gameState.coins.push(coin);
}

// Update game state
function updateGame() {
	if (gameState.isGameOver) return;

	let player = this.getField('field_player');

	// Check coin collisions
	for (let i = gameState.coins.length - 1; i >= 0; i--) {
		let coin = gameState.coins[i];
		if (checkCollision(player, coin)) {
			// Collect coin
			gameState.score += 1;
			gameState.coins.splice(i, 1);
			spawnCoin();

			// Update score display
			let scoreField = this.getField('field_score');
			scoreField.value = gameState.score.toString();
		}
	}
}

// Handle keyboard input
function onKeyPress(field, keyCode) {
	let player = this.getField('field_player');
	let pos = getFieldCenter(player);

	switch (keyCode) {
		case 37: // Left
			pos.x -= PLAYER_SPEED;
			break;
		case 39: // Right
			pos.x += PLAYER_SPEED;
			break;
		case 38: // Up
			pos.y += PLAYER_SPEED;
			break;
		case 40: // Down
			pos.y -= PLAYER_SPEED;
			break;
	}

	// Keep player in bounds
	pos.x = Math.max(10, Math.min(WIDTH - 10, pos.x));
	pos.y = Math.max(10, Math.min(HEIGHT - 10, pos.y));

	moveField(player, pos.x, pos.y, 20, 20);
}

// Start the game
initGame();
```

## Limitations

1. The PDF JavaScript environment is sandboxed
2. No access to external resources
3. Limited to PDF form fields for visual elements
4. No direct pixel manipulation
5. Performance depends on PDF reader implementation

## Debugging

1. Use `app.alert()` to show debug information
