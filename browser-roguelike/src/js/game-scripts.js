/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

var level1 = `.,.,.,.,.,.,#,#,#,#,#,#,#,#,#,#,#,.,.,.
.,.,.,.,.,.,#,,,,F,,,,,,#,.,.,.
.,.,.,.,.,.,#,,#,#,#,,#,,#,,#,.,.,.
.,.,.,#,#,#,#,,#,#,#,,#,#,#,,#,.,.,.
.,.,.,#,,,,,,#,#,,,,,,#,.,.,.
.,.,.,#,,,,,,#,#,#,#,#,#,#,#,.,.,.
.,.,.,#,,,,,,,,,,#,#,#,#,#,#,#
.,.,.,#,,,F,,,#,#,#,,#,#,,,,,#
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
.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.`;

var turns = 0;
var dead = false;
var enemies = [];
var enemyCounter = 0;
var player;

// Touch controls variables
var xDown = null;          
var yDown = null; 

// Style overrides block
var overrides = document.createElement('style');
document.querySelector('head').appendChild(overrides);

// UNITS

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

// Game code functions

function drawScreen() {
	var background = document.querySelector('#display-wrapper'),
		grid = document.createElement('div'),
		messageWindow = document.createElement('div'),
		levelRows;

	messageWindow.id = 'message';
	grid.id = 'game-grid';

	// Read level data
	levelRows = level1.split('\n');

	// Row creation logic
	for (let rowIndex = 0; rowIndex < levelRows.length; rowIndex++) {
		var levelCells = levelRows[rowIndex].split(','),
			elemRow = document.createElement('div');
	
		elemRow.classList.add('row');
		grid.appendChild(elemRow, grid);
	
		// Cell creation logic
		for (let cellIndex = 0; cellIndex < levelCells.length; cellIndex++) {
			var cell = levelCells[cellIndex],
				elemCell = document.createElement('div');
	
			elemCell.classList.add('cell');
			elemCell.id = rowIndex + '-' + cellIndex;
			elemRow.appendChild(elemCell, elemRow);
	
			switch (cell) {
			case '.' :
				elemCell.classList.add('empty');
				break;
			case '#' :
				elemCell.classList.add('wall');
				break;
			case '' :
				elemCell.classList.add('floor');
				break;
			case '@' :
				player = new Player(elemCell, 1, [rowIndex, cellIndex], 'player', 100);

				elemCell.classList.add('floor');
				elemCell.classList.add('player');
				break;
			case 'D' :
				// elemCell.style.backgroundColor = '#641903';
				break;
			case 'F' :
				enemyCounter++;
				enemies.push(new Enemy(elemCell, enemyCounter, [rowIndex, cellIndex] , 'fire-vortex', 100));

				elemCell.classList.add('floor');
				elemCell.classList.add('enemy');
				break;
			case 'C' :
				elemCell.style.backgroundColor = '#fff700';
				elemCell.classList.add('floor');
				elemCell.classList.add('gold');
				break;
			}
			
		}
	}
	
	background.appendChild(grid, background);
	background.appendChild(messageWindow, background);
	setGridSize();
}

function setGridSize() {
	var w = window.innerWidth,
		h = window.innerHeight;

	if (w > h) {
		overrides.innerHTML = `#display-wrapper #game-grid .row .cell{height: 5vh; width: 5vh;}
		#display-wrapper #game-grid{font-size: 3.9vh;}`;
	} else {
		overrides.innerHTML = `#display-wrapper #game-grid .row .cell{height: 5vw; width: 5vw;}
		#display-wrapper #game-grid{font-size: 3.9vw;}`;
	}
}

function refreshScreen() {
	var background = document.querySelector('#display-wrapper'),
		grid = document.querySelector('#game-grid'),
		messageBox = document.querySelector('#message');
	
	background.removeChild(grid);
	background.removeChild(messageBox);

	drawScreen();
}

function enemyAITurn() {
	// Iterate on each enemy
	for (let i = 0; i < enemies.length; i++) {		
		moveEnemy(enemies[i], randomDirection());
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
		newCell = document.getElementById(newPos[0] + '-' + newPos[1]);
		break;
	case 'right':
		newPos = [enemyObject.pos[0], enemyObject.pos[1] + 1];
		newCell = document.getElementById(newPos[0] + '-' + newPos[1]);
		break;
	case 'down':
		newPos = [enemyObject.pos[0] + 1, enemyObject.pos[1]];
		newCell = document.getElementById(newPos[0] + '-' + newPos[1]);
		break;
	case 'left':
		newPos = [enemyObject.pos[0], enemyObject.pos[1] - 1];
		newCell = document.getElementById(newPos[0] + '-' + newPos[1]);
		break;
	}
	
	if (!newCell.classList.contains('wall') && !newCell.classList.contains('enemy')) {
		if (newCell.classList.contains('player')) {
			death();
		}

		enemyObject.elem.classList.remove('enemy');
		newCell.classList.add('enemy');

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

function findPlayer() {
	var playerRow = document.querySelector('.player').parentNode.querySelectorAll('.cell');
		
	for (let i = 0; i < playerRow.length; i++) {
		var element = playerRow[i];

		if (element.classList.contains('player')) {
			return i;
		}
	}
}

function movePlayer(direction) {
	var newCell,
		newPos;

	switch (direction) {
	case 'up':
		newPos =  [player.pos[0] - 1, player.pos[1]];
		newCell = document.getElementById(newPos[0] + '-' + newPos[1]);
		break;
	case 'right':
		newPos =  [player.pos[0], player.pos[1] + 1];
		newCell = document.getElementById(newPos[0] + '-' + newPos[1]);
		break;
	case 'down':
		newPos =  [player.pos[0] + 1, player.pos[1]];
		newCell = document.getElementById(newPos[0] + '-' + newPos[1]);
		break;
	case 'left':
		newPos = [player.pos[0], player.pos[1] - 1];
		newCell = document.getElementById(newPos[0] + '-' + newPos[1]);
		break;
	}

	if (newCell.classList.contains('enemy')) {
		death();
		player.elem.classList.remove('player');
		return;
	}

	if (!newCell.classList.contains('wall')) {
		player.elem.classList.remove('player');
		
		newCell.classList.add('player');

		player.pos = newPos;
		player.elem = document.getElementById(newPos[0] + '-' + newPos[1]);
	}
}

function checkVictory() {
	if (!dead && document.querySelector('.player').classList.contains('gold')) {
		return true;
	} else {
		return false;
	}
}

function displayVictoryMessage() {
	var messageBox = document.querySelector('#message');
	var message = document.createElement('p');
	var button = document.createElement('a');

	message.innerHTML = 'You win!<br /><br />You completed the game in ' + turns + ' turns. Good job!';

	button.classList.add('btn');
	button.textContent = 'Play again';

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
			enemies = [];
			refreshScreen();
			turns = 0;
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
			enemies = [];
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
// End touch controls

document.addEventListener('keydown', function input(e) {
	if (!dead) {
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

window.addEventListener('resize', setGridSize);

// Draw the screen for the first time
drawScreen();