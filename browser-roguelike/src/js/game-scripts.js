/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

// (function runGame() {

var levelData = [`.,.,.,.,.,.,#,#,#,#,#,#,#,#,#,#,#,.,.,.
.,.,.,.,.,.,#,,,,F,,,,,,#,.,.,.
.,.,.,.,.,.,#,,#,#,#,,#,,#,F,#,.,.,.
.,.,.,#,#,#,#,,#,#,#,,#,#,#,,#,.,.,.
.,.,.,#,,,,,,#,#,,,,,,#,.,.,.
.,.,.,#,F,,,,,#,#,#,#,#,#,#,#,.,.,.
.,.,.,#,,,,,,,,,,#,#,#,#,#,#,#
.,.,.,#,,,F,,F,#,#,#,,#,#,F,,,,#
.,.,.,#,,,,,,#,.,#,,#,#,,,C,,#
.,.,.,#,,F,,,,#,.,#,,#,#,,F,,,#
.,.,.,#,#,#,,#,#,#,.,#,,#,#,,,,,#
.,.,.,.,.,#,,#,.,.,.,#,,#,#,,,,,#
.,.,#,#,#,#,,#,#,#,#,#,,#,#,,#,#,#,#
.,.,#,,,,,,,,,#,,,,,#,.,.,.
.,.,#,,,,,,,,,#,#,#,#,#,#,.,.,.
.,.,#,,,,,,,@,,#,.,.,.,.,.,.,.,.
.,.,#,,,,,,,,,#,.,.,.,.,.,.,.,.
.,.,#,,,,,,,,,#,.,.,.,.,.,.,.,.
.,.,#,#,#,#,#,#,#,#,#,#,.,.,.,.,.,.,.,.
.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.`
	,
`.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.
.,.,.,.,.,.,.,.,.,.,.,#,#,#,#,#,#,.,.,.,.,.,.,.,.,.,.,.
.,.,#,#,#,#,#,#,#,#,.,#,,,,,#,.,.,.,.,.,.,.,.,.,.,.
.,.,#,,,,,,,#,#,#,,#,#,,#,.,.,.,.,.,.,.,.,.,.,.
.,.,#,,@,,,,,#,#,,,,#,,#,.,.,.,.,.,.,.,.,.,.,.
.,.,#,,,,,,,#,#,,,,#,,#,.,.,.,.,.,.,.,.,.,.,.
.,.,#,#,#,,#,#,#,#,#,,,,#,,#,#,#,#,#,#,#,#,#,#,.,.
.,.,.,.,#,,#,.,.,.,#,,,,#,,#,#,,,,,,,,#,.,.
.,.,.,.,#,,#,#,#,#,#,,,,#,,#,#,,,,,,,,#,.,.
.,.,.,.,#,,,,,,,,,,#,,#,#,,,,,,,,#,.,.
.,.,.,.,#,,#,#,#,#,#,,,,#,,,,,,,,,,,#,.,.
.,.,.,.,#,,#,.,.,.,#,,,,#,#,#,#,,,,,,,,#,.,.
.,.,.,.,#,,#,.,.,.,#,,,,#,.,.,#,,,,,,,,#,.,.
.,#,#,#,#,,#,#,#,.,#,,,,#,.,.,#,#,#,#,#,#,#,#,#,.,.
.,#,,,,,,,#,.,#,#,,#,#,.,.,.,.,.,.,.,.,.,.,.,.,.
.,#,,,,,F,,#,.,.,#,,#,.,.,.,#,#,#,#,#,#,#,#,.,.,.
.,#,,,,,,,#,.,.,#,,#,.,.,.,#,,,,,C,,#,.,.,.
.,#,,,,,,,#,.,.,#,,#,.,.,.,#,#,#,,#,#,#,#,.,.,.
.,#,#,#,#,#,#,#,#,.,.,#,,#,.,.,.,.,.,#,,#,.,.,.,.,.,.
.,.,.,.,.,.,.,.,.,.,.,#,,#,#,#,#,#,#,#,,#,.,.,.,.,.,.
.,.,.,.,.,.,.,.,.,.,.,#,,,,,,,,,,#,.,.,.,.,.,.
.,.,.,.,.,.,.,.,.,.,.,#,#,#,#,#,#,#,#,#,#,#,.,.,.,.,.,.
.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.
.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.`];

var turns = 0;
var currentLevel = 0;
var dead = false;
var levelStore = [];
var enemies = [];
var enemyCounter = 0;
var player;

// Touch controls variables
var xDown = null;          
var yDown = null; 

// Style overrides block
var overrides = document.createElement('style');
document.querySelector('head').appendChild(overrides);

// UNIT prototypes

function Enemy(elem, id, pos, type, health) {
	this.elem = elem;
	this.id = id;
	this.type = type;
	this.health = health;
	this.pos = pos;
}

function Player(elem, id, pos, type, health) {
	this.elem = elem;
	this.id = id;
	this.type = type;
	this.health = health;
	this.pos = pos;
}

// Map prototypes

function Cell(elem, id, type, inside = []) {
	this.elem = elem;
	this.id = id;
	this.type = type;
	this.inside = inside;
}

// Game code functions

function drawScreen(selectedLevel = '') {
	var background = document.querySelector('#display-wrapper'),
		grid = document.createElement('div'),
		messageWindow = document.createElement('div'),
		levelRows;

	messageWindow.id = 'message';
	grid.id = 'game-grid';

	// Initialize level storage
	if (levelStore.length === currentLevel) {
		levelStore.splice(currentLevel, 0, new Array); // Create new array in the appropriate place.. may not work right, have to revisit
		enemies.splice(currentLevel, 0, new Array);
	}

	// Read level data
	levelRows = selectedLevel.split('\n');

	// Row creation logic
	for (let rowIndex = 0; rowIndex < levelRows.length; rowIndex++) {
		var levelCells = levelRows[rowIndex].split(','),
			elemRow = document.createElement('div');
	
		elemRow.classList.add('row');
		grid.appendChild(elemRow, grid);

		// Level store row creation
		levelStore[currentLevel].push(new Array);
	
		// Cell creation logic
		for (let cellIndex = 0; cellIndex < levelCells.length; cellIndex++) {
			var cell = levelCells[cellIndex],
				elemCell = document.createElement('div');
	
			elemCell.classList.add('cell');
			elemCell.id = rowIndex + '-' + cellIndex;
			elemRow.appendChild(elemCell, elemRow);

			// Add to level store tracking
			levelStore[currentLevel][rowIndex].push(new Cell(elemCell, rowIndex + '-' + cellIndex));
	
			switch (cell) {
			case '.' :
				elemCell.classList.add('empty');
				levelStore[currentLevel][rowIndex][cellIndex].type = 'empty';
				break;
			case '#' :
				elemCell.classList.add('wall');
				levelStore[currentLevel][rowIndex][cellIndex].type = 'wall';
				break;
			case '' :
				elemCell.classList.add('floor');
				levelStore[currentLevel][rowIndex][cellIndex].type = 'floor';
				break;
			case '@' :
				player = new Player(elemCell, 1, [rowIndex, cellIndex], 'player', 100);

				elemCell.classList.add('floor');
				elemCell.classList.add('player');
				levelStore[currentLevel][rowIndex][cellIndex].type = 'floor';
				levelStore[currentLevel][rowIndex][cellIndex].inside.push('player');
				break;
			case 'D' :
				// elemCell.style.backgroundColor = '#641903';
				break;
			case 'F' :
				enemyCounter++;
				enemies[currentLevel].push(new Enemy(elemCell, enemyCounter, [rowIndex, cellIndex] , 'fire-vortex', 100));

				elemCell.classList.add('floor');
				elemCell.classList.add('enemy');
				levelStore[currentLevel][rowIndex][cellIndex].type = 'floor';
				levelStore[currentLevel][rowIndex][cellIndex].inside.push('enemy');
				break;
			case 'C' :
				elemCell.style.backgroundColor = '#fff700';
				elemCell.classList.add('floor');
				elemCell.classList.add('gold');

				levelStore[currentLevel][rowIndex][cellIndex].type = 'floor';
				levelStore[currentLevel][rowIndex][cellIndex].inside.push('stairsDown');
				break;
			}
			
		}
	}
	
	background.appendChild(grid, background);
	background.appendChild(messageWindow, background);
	centerPlayerInScreen();
}

// function setGridSize() {
// 	var w = window.innerWidth,
// 		h = window.innerHeight;

// 	if (w > h) {
// 		overrides.innerHTML = `#display-wrapper #game-grid .row .cell{height: 5vh; width: 5vh;}
// 		#display-wrapper #game-grid{font-size: 3.9vh;}`;
// 	} else {
// 		overrides.innerHTML = `#display-wrapper #game-grid .row .cell{height: 5vw; width: 5vw;}
// 		#display-wrapper #game-grid{font-size: 3.9vw;}`;
// 	}
// }

function centerPlayerInScreen() {
	var top = ((player.elem.offsetTop - (window.innerHeight / 2)) * -1) - 23;
	var left = ((player.elem.offsetLeft - (window.innerWidth / 2)) * -1) - 23;
	overrides.innerHTML = '#display-wrapper #game-grid {top: ' + top + 'px; left: ' + left + 'px;}';
}

function refreshScreen() {
	var background = document.querySelector('#display-wrapper'),
		grid = document.querySelector('#game-grid'),
		messageBox = document.querySelector('#message');
	
	background.removeChild(grid);
	background.removeChild(messageBox);

	drawScreen(levelData[currentLevel]);
}

function enemyAITurn() {
	// Iterate on each enemy
	for (let i = 0; i < enemies[currentLevel].length; i++) {		
		moveEnemy(enemies[currentLevel][i], randomDirection());
	}
}

function moveEnemy(enemyObject, direction) {
	if (dead) {
		return;
	}

	var newCell,
		newPos;

	switch (direction) {
	case 'up':
		newPos = [enemyObject.pos[0] - 1, enemyObject.pos[1]];
		break;
	case 'right':
		newPos = [enemyObject.pos[0], enemyObject.pos[1] + 1];
		break;
	case 'down':
		newPos = [enemyObject.pos[0] + 1, enemyObject.pos[1]];
		break;
	case 'left':
		newPos = [enemyObject.pos[0], enemyObject.pos[1] - 1];
		break;
	}

	newCell = document.getElementById(newPos[0] + '-' + newPos[1]);

	// Do not allow movement onto a wall or another enemy
	if (levelStore[currentLevel][newPos[0]][newPos[1]].type != 'wall' && levelStore[currentLevel][newPos[0]][newPos[1]].inside.indexOf('enemy') === -1) {
		if (levelStore[currentLevel][newPos[0]][newPos[1]].inside.indexOf('player') > -1) {
			death();
		}
		
		// Update the visuals
		enemyObject.elem.classList.remove('enemy');
		newCell.classList.add('enemy');

		// Update the level database
		levelStore[currentLevel][enemyObject.pos[0]][enemyObject.pos[1]].inside.splice(levelStore[currentLevel][enemyObject.pos[0]][enemyObject.pos[1]].inside.indexOf('enemy'), 1);
		levelStore[currentLevel][newPos[0]][newPos[1]].inside.push('enemy');
		
		enemyObject.pos = newPos;
		enemyObject.elem = document.getElementById(newPos[0] + '-' + newPos[1]);
		enemyObject.moveTries = 0;
	} else {
		enemyObject.moveTries++;
		if (enemyObject.moveTries < 3) {
			moveEnemy(enemyObject, randomDirection());
		}
	}
}

function randomDirection() {
	var direction = Math.floor((Math.random() * 4) + 1);

	switch (direction) {
	case 1:
		return 'up';
	case 2:
		return 'right';
	case 3:
		return 'down';
	case 4:
		return 'left';
	}
}

function movePlayer(direction) {
	var newCell,
		newPos;

	switch (direction) {
	case 'up':
		newPos =  [player.pos[0] - 1, player.pos[1]];
		break;
	case 'right':
		newPos =  [player.pos[0], player.pos[1] + 1];
		break;
	case 'down':
		newPos =  [player.pos[0] + 1, player.pos[1]];
		break;
	case 'left':
		newPos = [player.pos[0], player.pos[1] - 1];
		break;
	}

	newCell = document.getElementById(newPos[0] + '-' + newPos[1]);

	if (levelStore[currentLevel][newPos[0]][newPos[1]].inside.indexOf('enemy') > -1) {
		death();
		player.elem.classList.remove('player'); // Visually remove player because you died
		return;
	}

	if (levelStore[currentLevel][newPos[0]][newPos[1]].type != 'wall') {
		player.elem.classList.remove('player'); // Visually remove the old position of the player
		newCell.classList.add('player'); // Visually display the new position of the player

		// Remove the player from the old levelStore cell
		levelStore[currentLevel][player.pos[0]][player.pos[1]].inside.splice(levelStore[currentLevel][player.pos[0]][player.pos[1]].inside.indexOf('player'), 1);
		// Add the player to the new levelStore cell
		levelStore[currentLevel][newPos[0]][newPos[1]].inside.push('player');
		
		player.pos = newPos; // Update the player object's position
		player.elem = document.getElementById(newPos[0] + '-' + newPos[1]); // Update the player elem's reference
		centerPlayerInScreen();
	}
}

function checkVictory() {
	if (!dead && document.querySelector('.player').classList.contains('gold')) {
		return true;
	} else {
		return false;
	}
}

function retryLevel() {
	player = {};
	enemies = [];
	levelStore.splice(currentLevel,1);
	refreshScreen();
	turns = 0;
}

function goToNewLevel(newLevel) {
	var background = document.querySelector('#display-wrapper'),
		grid = document.querySelector('#game-grid'),
		messageBox = document.querySelector('#message');
	
	background.removeChild(grid);
	background.removeChild(messageBox);

	currentLevel = newLevel;
	enemies[newLevel] = [];
	drawScreen(levelData[newLevel]);
}

function displayVictoryMessage() {
	var messageBox = document.querySelector('#message');
	var message = document.createElement('p');
	var button = document.createElement('a');
	var button2 = document.createElement('a');

	message.innerHTML = 'You win!<br /><br />You completed the game in ' + turns + ' turns. Good job!';

	button.classList.add('btn');
	button.textContent = 'Play again';

	button2.classList.add('btn');
	button2.textContent = 'Go to level ' + (currentLevel + 2); // Plus 2 because it's the next level and we're dealing with a 0-based value

	button.addEventListener('click', function handle(e){
		e.preventDefault();

		closeMessageWindow();

		// Reset gameboard
		setTimeout(function retry(){ 
			retryLevel();
		}, 360);
	});
	button2.addEventListener('click', function handle(e){
		e.preventDefault();

		closeMessageWindow();

		// Reset gameboard
		setTimeout(function load(){ 
			goToNewLevel(currentLevel + 1);
		}, 360);
	});

	messageBox.appendChild(message, messageBox);
	messageBox.appendChild(button, messageBox);
	messageBox.appendChild(button2, messageBox);

	messageBox.classList.add('show');

	function closeMessageWindow() {
		messageBox.classList.remove('show');

		setTimeout(function destroyMessage(){ 
			messageBox.removeChild(message);
			messageBox.removeChild(button);
			button.removeEventListener('click', closeMessageWindow);
		}, 360);
	}
}

function newTurn() {
	turns++;

	if (!checkVictory()) {
		enemyAITurn();
	} else {
		displayVictoryMessage();
	}

}

function death() {
	var messageBox = document.querySelector('#message');
	var message = document.createElement('p');
	var button = document.createElement('a');

	dead = true;

	message.innerHTML = 'You died.<br /><br />The fire vortex consumed you in an instant, leaving only a pile of ash where you once stood.<br /><br />You lasted ' + turns + ' turns.';

	button.classList.add('btn');
	button.textContent = 'Try again';

	button.addEventListener('click', closeMessageWindow);

	messageBox.appendChild(message, messageBox);
	messageBox.appendChild(button, messageBox);

	messageBox.classList.add('show');

	function closeMessageWindow(e) {
		e.preventDefault();

		messageBox.classList.remove('show');

		

		setTimeout(function destroyMessage(){ 
			messageBox.removeChild(message);
			messageBox.removeChild(button);
			button.removeEventListener('click', closeMessageWindow);

			// Reset gameboard
			player = {};
			enemies[currentLevel] = [];
			levelStore.splice(currentLevel,1);
			refreshScreen();
			turns = 0;
			dead = false;
		}, 360);
	}
}

// Start touch controls
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);

function handleTouchStart(evt) {
	xDown = evt.touches[0].clientX;
	yDown = evt.touches[0].clientY;
}

function handleTouchMove(evt) {
	if ( !xDown || !yDown ) {
		return;
	}

	if (dead) {
		return;
	}

	var xUp = evt.touches[0].clientX;
	var yUp = evt.touches[0].clientY;

	var xDiff = xDown - xUp;
	var yDiff = yDown - yUp;

	/* Determine touch direction */
	if (!dead && !document.getElementById('message').classList.contains('show')) {
		if (Math.abs(xDiff) > Math.abs(yDiff)) {
			if (xDiff > 0) {
				/* left swipe */
				movePlayer('left');
			} else {
				/* right swipe */
				movePlayer('right');
			}                       
		} else {
			if (yDiff > 0) {
				/* up swipe */
				movePlayer('up');
			} else { 
				/* down swipe */
				movePlayer('down');
			}                   
		}

		/* reset values */
		xDown = null;
		yDown = null;

		newTurn();
	}
}
// End touch controls

document.addEventListener('keydown', function input(e) {
	if (!dead && !document.getElementById('message').classList.contains('show')) {
		if (e.code === 'ArrowUp' || e.code === 'ArrowRight' || e.code === 'ArrowDown' || e.code === 'ArrowLeft' || e.code === 'Space') {
			switch (e.code) {
			case 'ArrowUp' :
				movePlayer('up');
				break;
			case 'ArrowRight' :
				movePlayer('right');
				break;
			case 'ArrowDown' :
				movePlayer('down');
				break;
			case 'ArrowLeft' :
				movePlayer('left');
				break;
			}
	
			newTurn();
		}
	}
});

window.addEventListener('resize', centerPlayerInScreen);

// Draw the screen for the first time
drawScreen(levelData[currentLevel]);

// }());