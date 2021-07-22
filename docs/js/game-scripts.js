/* browser-roguelike#dc47eb0 - James Pound @ 2021-07-22 18:08 */
"use strict";

/* eslint-disable no-console */

/* eslint-disable no-unused-vars */
// (function runGame() {
var levelData = [".,.,.,.,.,.,#,#,#,#,#,#,#,#,#,#,#,.,.,.\n.,.,.,.,.,.,#,,,,,,,,,,#,.,.,.\n.,.,.,.,.,.,#,,#,#,#,,#,,#,F,#,.,.,.\n.,.,.,#,#,#,#,,#,#,#,,#,#,#,,#,.,.,.\n.,.,.,#,,,,F,,#,#,,,,,,#,.,.,.\n.,.,.,#,F,,,,,#,#,#,#,#,#,#,#,.,.,.\n.,.,.,#,,,,,,,,,,#,#,#,#,#,#,#\n.,.,.,#,,,F,,,#,#,#,,#,#,,,,,#\n.,.,.,#,,,,,,#,.,#,,#,#,,,C,,#\n.,.,.,#,,,,,,#,.,#,,#,#,,F,,,#\n.,.,.,#,#,#,,#,#,#,.,#,,#,#,,,,,#\n.,.,.,.,.,#,,#,.,.,.,#,,#,#,,,,,#\n.,.,#,#,#,#,,#,#,#,#,#,,#,#,,#,#,#,#\n.,.,#,,,,,,,,,#,,,,,#,.,.,.\n.,.,#,,,,,,,,,#,#,#,#,#,#,.,.,.\n.,.,#,,,,,,,@,,#,.,.,.,.,.,.,.,.\n.,.,#,,,,,,,,,#,.,.,.,.,.,.,.,.\n.,.,#,,,,,,,,,#,.,.,.,.,.,.,.,.\n.,.,#,#,#,#,#,#,#,#,#,#,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.", ".,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.,.,.,#,#,#,#,#,#,.,.,.,.,.,.,.,.,.,.,.\n.,.,#,#,#,#,#,#,#,#,.,#,,,,,#,.,.,.,.,.,.,.,.,.,.,.\n.,.,#,,,,,,,#,#,#,,#,#,,#,.,.,.,.,.,.,.,.,.,.,.\n.,.,#,,@,,,,,#,#,,,,#,,#,.,.,.,.,.,.,.,.,.,.,.\n.,.,#,,,,,,,#,#,,F,,#,,#,.,.,.,.,.,.,.,.,.,.,.\n.,.,#,#,#,,#,#,#,#,#,,,,#,,#,#,#,#,#,#,#,#,#,#,.,.\n.,.,.,.,#,,#,.,.,.,#,,,,#,,#,#,,,,,,,,#,.,.\n.,.,.,.,#,,#,#,#,#,#,,,F,#,,#,#,,,F,,,,,#,.,.\n.,.,.,.,#,,,,,,,,,,#,,#,#,,,,,,,,#,.,.\n.,.,.,.,#,,#,#,#,#,#,,,,#,,,,,,,,F,,,#,.,.\n.,.,.,.,#,,#,.,.,.,#,,,,#,#,#,#,,,,,,,,#,.,.\n.,.,.,.,#,,#,.,.,.,#,,,,#,.,.,#,,,,,,,,#,.,.\n.,#,#,#,#,,#,#,#,.,#,,,,#,.,.,#,#,#,,#,#,#,#,#,.,.\n.,#,,,,,,,#,.,#,#,,#,#,.,.,.,.,#,,#,.,.,.,.,.,.\n.,#,,,,,F,,#,.,.,#,,#,.,.,.,#,#,#,,#,#,#,#,.,.,.\n.,#,,,,,,,#,.,.,#,,#,.,.,.,#,F,,,,,C,#,.,.,.\n.,#,,,,,,,#,.,.,#,,#,.,.,.,#,#,#,,#,#,#,#,.,.,.\n.,#,#,#,#,#,#,#,#,.,.,#,,#,.,.,.,.,.,#,,#,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.,.,.,#,,#,#,#,#,#,#,#,,#,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.,.,.,#,,,F,,,,,,,#,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.,.,.,#,#,#,#,#,#,#,#,#,#,#,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.", ".,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,#,#,#,#,#,#,#,#,#,#,#,#,.,.\n.,.,.,#,#,#,.,#,.,#,.,.,#,.,.,#,.,.,.,#,.,#,.,#,.,.,#,#,#,#,.,.,#,,,,,,,,,,,#,.,.\n.,.,.,.,#,.,.,#,.,#,.,#,.,#,.,#,#,.,.,#,.,#,#,.,.,.,#,.,.,.,.,.,#,,C,,,,,,,,,#,.,.\n.,.,.,.,#,.,.,#,#,#,.,#,#,#,.,#,.,#,.,#,.,#,#,.,.,.,#,#,#,#,.,.,#,,,,,,,,,,,#,.,.\n.,.,.,.,#,.,.,#,.,#,.,#,.,#,.,#,.,.,#,#,.,#,.,#,.,.,.,.,.,#,.,.,#,,,,,,,,,,,#,.,.\n.,.,.,.,#,.,.,#,.,#,.,#,.,#,.,#,.,.,.,#,.,#,.,.,#,.,#,#,#,#,.,.,#,#,#,#,#,#,,,#,#,#,#,.,.\n.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,#,,,#,.,.,.,.,.\n.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,#,,,#,.,.,.,.,.\n.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,,,#,#,#,.,.,.\n.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,#,,,,,,,,,,,,,,,,,,,#,.,.,.\n.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,#,,,,,,,,,,,,,,,,,,,#,.,.,.\n.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,#,,,,,,,,,,,,,,,,,F,,#,.,.,.\n.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,#,,,F,,,,F,,,,,,F,,,,,,#,.,.,.\n.,.,.,.,.,.,.,#,#,#,#,#,.,.,.,.,.,.,.,.,.,.,.,#,,,,,,,,,,F,,,,,,,,,#,.,.,.\n.,.,.,.,.,.,.,#,,F,,#,.,.,.,.,.,.,.,.,.,.,.,#,,,,,,,,,,,,,,,,,,,#,.,.,.\n.,.,.,.,.,.,.,#,,,,#,.,.,.,.,#,#,#,#,#,.,.,#,,,,,,,,F,,,,,F,,,,,,#,.,.,.\n.,.,.,.,#,#,#,#,,,,#,#,#,#,#,#,,,,#,#,#,#,,,,F,,,,,,,,,,,,,F,,#,.,.,.\n.,.,.,.,#,,,,,,,,,,,,,,,,,,,,,,,,,,,,F,,,F,,,,,,,#,.,.,.\n.,.,.,.,#,,#,#,,,,#,#,#,#,#,#,#,#,#,#,#,#,#,,,,,,,,,,,,,,,F,,,,#,.,.,.\n.,.,.,.,#,,#,#,#,#,#,#,.,.,.,.,.,.,.,.,.,.,.,#,,,,F,,,,,F,,,,,,,,,,#,.,.,.\n.,.,.,.,#,,#,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,#,,,,,,,,,,,,,,,,,,,#,.,.,.\n.,.,.,.,#,,#,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,#,,,F,,,,,,,,,,F,,,,,,#,.,.,.\n.,.,.,.,#,,#,.,.,.,.,#,#,#,#,#,#,#,#,#,#,.,.,#,,,,,,,F,,,F,,,,,,,,,#,.,.,.\n.,.,.,.,#,,#,.,.,.,.,#,,F,,,,,,,#,.,.,#,,,,,,,,,,,,,,,F,,,,#,.,.,.\n.,.,.,.,#,,#,.,.,.,.,#,,,,F,,F,,,#,#,#,#,,,,,,,,,,,,,,,,,,,#,.,.,.\n.,.,.,.,#,,#,.,.,.,.,#,,,#,#,,,,,,,,,,,,F,,,,,,,,,,,,,,,#,.,.,.\n.,.,.,#,#,,#,#,#,.,.,#,,,,#,#,,,,,,,,,,,,,,,,,,,F,,,,,,,#,.,.,.\n.,.,.,#,,,,,#,.,.,#,,F,,,#,#,,,#,#,#,#,,,,,,,,,F,,,,,,F,,,,#,.,.,.\n.,.,.,#,,,,,#,#,#,#,,,,,,,,,#,.,.,#,,,F,,,,,,,,,,,,,,,,#,.,.,.\n.,.,.,#,,F,,,,,,,,,,,,,,,#,.,.,#,,,,,,,F,,,,F,,,,,,,,#,.,.,.\n.,.,.,#,,,,,,,,,,,,,,,,,#,.,.,#,,,,,F,,,,,,,,,,,F,,,#,.,.,.\n.,.,.,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,,#,#,.,.,#,,,,,,,,,F,,,,,,,,,,#,.,.,.\n.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,#,,#,.,.,.,#,,,,,,,,,,,,,,,,,,,#,.,.,.\n.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,#,,#,.,.,.,#,,,,,,,,,,,,,,,,,,,#,.,.,.\n.,.,.,.,.,.,.,.,#,#,#,#,#,#,#,#,#,#,,#,.,.,.,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,#,.,.,.\n.,.,.,.,.,.,.,.,#,,,,,,,,,,,#,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,#,,#,#,#,#,#,#,#,#,#,#,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,#,,#,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,#,,#,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.\n.,#,#,#,#,#,#,#,#,,#,#,#,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.\n.,#,,,,,,,,,,,#,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.\n.,#,,,,,,,,,,,#,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.\n.,#,,,,,,,F,,,,#,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.\n.,#,,,,,,,,,,,#,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.\n.,#,,@,,,,,,,,,#,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.\n.,#,,,,,,,,,,,#,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.\n.,#,#,#,#,#,#,#,#,#,#,#,#,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,."];
var currentLevel = 0;
var levelStore = [];
var enemies = [];
var enemyCounter = 0;
var player;
var viewingGoal = false;
var options = {
  centerMode: false
};
var sessionStats = {
  turnsTotal: 0,
  turnsLevel: 0,
  retries: 0,
  zoomLevel: 4,
  dead: false
}; // Touch controls variables

var xDown = null;
var yDown = null; // Style overrides block

var overrides = document.createElement('style');
var zoomLevelStyle = document.createElement('style');
var stylePlayer = document.createElement('style');
document.querySelector('head').appendChild(overrides);
document.querySelector('head').appendChild(zoomLevelStyle);
document.querySelector('head').appendChild(stylePlayer); // UNIT prototypes

function Enemy(elem, id, pos, type, health) {
  this.elem = elem;
  this.id = id;
  this.type = type;
  this.health = health;
  this.pos = pos;
  this.stylePos = document.createElement('style');
  document.querySelector('head').appendChild(this.stylePos);
}

function Player(elem, id, pos, type, health) {
  this.elem = elem;
  this.id = id;
  this.type = type;
  this.health = health;
  this.pos = pos;
} // Map prototypes


function Cell(elem, id, type) {
  var inside = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
  this.elem = elem;
  this.id = id;
  this.type = type;
  this.inside = inside;
} // Game code functions


function drawTitleScreen() {
  var background = document.querySelector('#display-wrapper'),
      uiElem = document.createElement('div'),
      titleContainer = document.createElement('div'),
      titleHeader = document.createElement('h1'),
      messageWindow = document.createElement('div'),
      buttonContainer = document.createElement('div'),
      btnStartNormal = document.createElement('div'),
      btnStartProcudural = document.createElement('div');
  uiElem.id = 'ui-display';
  titleContainer.classList.add('titlescreen-container');
  titleHeader.classList.add('title-header');
  messageWindow.id = 'message';
  buttonContainer.classList.add('button-container');
  btnStartNormal.classList.add('btn');
  btnStartProcudural.classList.add('btn');
  background.classList.add('titlescreen');
  titleHeader.textContent = "Fire Gauntlet";
  btnStartNormal.textContent = 'Start Normal Game';
  btnStartProcudural.textContent = 'Start Procedural Game';
  background.appendChild(uiElem);
  titleContainer.appendChild(titleHeader);
  titleContainer.appendChild(buttonContainer);
  buttonContainer.appendChild(btnStartNormal);
  buttonContainer.appendChild(btnStartProcudural);
  uiElem.appendChild(messageWindow);
  uiElem.appendChild(titleContainer);
  setTimeout(function showTitlescreen() {
    titleContainer.classList.add('show');
  }, 150);

  function closeTitlescreen() {
    background.classList.remove('titlescreen');
    titleContainer.classList.remove('show');
    setTimeout(function destroyTitlescreen() {
      btnStartNormal.removeEventListener('click', destroyTitlescreen);
      btnStartProcudural.removeEventListener('click', destroyTitlescreen);
      uiElem.removeChild(titleContainer);
      background.removeChild(uiElem);
    }, 1000);
  }

  btnStartNormal.addEventListener('click', function handle() {
    closeTitlescreen();
    drawScreen(levelData[0]);
  });
  btnStartProcudural.addEventListener('click', function handle() {
    displayMessageBox('This mode is in development and is not yet available.', 'Dismiss', 'dismiss');
  });
}

function drawScreen(selectedLevel) {
  var background = document.querySelector('#display-wrapper'),
      grid = document.createElement('div'),
      messageWindow = document.createElement('div'),
      uiElem = document.createElement('div'),
      zoomButtons = document.createElement('div'),
      zoomUp = document.createElement('div'),
      zoomDown = document.createElement('div'),
      showGoalBtn = document.createElement('div'),
      switchCameraBtn = document.createElement('div'),
      levelRows;
  grid.id = 'game-grid';
  uiElem.id = 'ui-display';
  messageWindow.id = 'message';
  zoomButtons.id = 'zoom-container';
  zoomUp.id = 'zoom-up';
  zoomUp.textContent = '+';
  zoomDown.id = 'zoom-down';
  zoomDown.textContent = '-';
  showGoalBtn.id = 'show-goal';
  switchCameraBtn.id = 'switch-camera'; // Initialize level storage

  if (levelStore.length === currentLevel) {
    // If we're in a NEW level, add new arrays
    levelStore.splice(currentLevel, 0, new Array()); // Create new array in the appropriate place.. may not work right, have to revisit

    enemies.splice(currentLevel, 0, new Array());
  } // Read level data


  levelRows = selectedLevel.split('\n'); // Row creation logic

  for (var rowIndex = 0; rowIndex < levelRows.length; rowIndex++) {
    var levelCells = levelRows[rowIndex].split(','),
        elemRow = document.createElement('div');
    elemRow.classList.add('row');
    grid.appendChild(elemRow); // Level store row creation

    levelStore[currentLevel].push(new Array()); // Cell creation logic

    for (var cellIndex = 0; cellIndex < levelCells.length; cellIndex++) {
      var cell = levelCells[cellIndex],
          elemCell = document.createElement('div');
      elemCell.classList.add('cell');
      elemCell.id = rowIndex + '-' + cellIndex;
      elemRow.appendChild(elemCell); // Add to level store tracking

      levelStore[currentLevel][rowIndex].push(new Cell(elemCell, rowIndex + '-' + cellIndex));

      switch (cell) {
        case '.':
          elemCell.classList.add('empty');
          levelStore[currentLevel][rowIndex][cellIndex].type = 'empty';
          break;

        case '#':
          elemCell.classList.add('wall');
          levelStore[currentLevel][rowIndex][cellIndex].type = 'wall';
          break;

        case '':
          elemCell.classList.add('floor');
          levelStore[currentLevel][rowIndex][cellIndex].type = 'floor';
          break;

        case '@':
          player = new Player(elemCell, 1, [rowIndex, cellIndex], 'player', 100);
          elemCell.classList.add('floor');
          elemCell.classList.add('player');
          levelStore[currentLevel][rowIndex][cellIndex].type = 'floor';
          levelStore[currentLevel][rowIndex][cellIndex].inside.push('player');
          break;

        case 'D':
          // elemCell.style.backgroundColor = '#641903';
          break;

        case 'F':
          enemyCounter++;
          enemies[currentLevel].push(new Enemy(elemCell, enemyCounter, [rowIndex, cellIndex], 'fire-vortex', 100));
          elemCell.classList.add('floor');
          elemCell.classList.add('enemy');
          elemCell.classList.add('enemy-' + enemyCounter);
          renderEnemy(enemies[currentLevel][enemyCounter - 1], enemies[currentLevel][enemyCounter - 1].pos);
          levelStore[currentLevel][rowIndex][cellIndex].type = 'floor';
          levelStore[currentLevel][rowIndex][cellIndex].inside.push('enemy');
          break;

        case 'C':
          elemCell.style.backgroundColor = '#fff700';
          elemCell.classList.add('floor');
          elemCell.classList.add('goal');
          levelStore[currentLevel][rowIndex][cellIndex].type = 'floor';
          levelStore[currentLevel][rowIndex][cellIndex].inside.push('stairsDown');
          break;
      }
    }
  }

  background.appendChild(uiElem);
  uiElem.appendChild(zoomButtons);
  uiElem.appendChild(messageWindow);
  zoomButtons.appendChild(switchCameraBtn);
  zoomButtons.appendChild(showGoalBtn);
  zoomButtons.appendChild(zoomUp);
  zoomButtons.appendChild(zoomDown);
  background.appendChild(grid);
  renderPlayer(player.pos);
  drawDecorations();
  centerPlayerInScreen();
  setTimeout(function showGameGrid() {
    grid.classList.add('show');
  }, 300); // Button events

  switchCameraBtn.addEventListener('click', function handle() {
    toggleCenterMode();
  });
  showGoalBtn.addEventListener('click', function handle() {
    showGoal();
  });
  zoomUp.addEventListener('click', function handle() {
    grid.classList.add('no-anim'); // Move characters instantly during zoom

    sessionStats.zoomLevel++;
    zoomLevelStyle.innerHTML = '#display-wrapper #game-grid .row .cell {height: ' + sessionStats.zoomLevel * 8 + 'px !important; width: ' + sessionStats.zoomLevel * 8 + 'px !important;}';
    renderPlayer(player.pos);
    renderEnemies();
    centerPlayerInScreen();
    grid.classList.remove('no-anim');
  });
  zoomDown.addEventListener('click', function handle() {
    if (sessionStats.zoomLevel > 1) {
      grid.classList.add('no-anim'); // Move characters instantly during zoom

      sessionStats.zoomLevel--;
      zoomLevelStyle.innerHTML = '#display-wrapper #game-grid .row .cell {height: ' + sessionStats.zoomLevel * 8 + 'px !important; width: ' + sessionStats.zoomLevel * 8 + 'px !important;}';
      renderPlayer(player.pos);
      renderEnemies();
      centerPlayerInScreen();
      grid.classList.remove('no-anim');
    }
  });
}

function drawDecorations() {
  // After the levelStore is initialized, go over it again and add the floor and wall decorations
  for (var rowStore = 0; rowStore < levelStore[currentLevel].length; rowStore++) {
    for (var cellStore = 0; cellStore < levelStore[currentLevel][rowStore].length; cellStore++) {
      var cell = levelStore[currentLevel][rowStore][cellStore];

      if (cell.type === 'floor') {
        var wallTop = levelStore[currentLevel][rowStore - 1][cellStore].type === 'wall';
        var wallRight = levelStore[currentLevel][rowStore][cellStore + 1].type === 'wall';
        var wallBottom = levelStore[currentLevel][rowStore + 1][cellStore].type === 'wall';
        var wallLeft = levelStore[currentLevel][rowStore][cellStore - 1].type === 'wall'; // Sidewall top

        if (wallTop && !wallRight && !wallBottom && !wallLeft) {
          cell.elem.classList.add('sidewall');
          cell.elem.classList.add('top');
          continue;
        } // Sidewall right


        if (!wallTop && wallRight && !wallBottom && !wallLeft) {
          cell.elem.classList.add('sidewall');
          cell.elem.classList.add('right');
          continue;
        } // Sidewall bottom


        if (!wallTop && !wallRight && wallBottom && !wallLeft) {
          cell.elem.classList.add('sidewall');
          cell.elem.classList.add('bottom');
          continue;
        } // Sidewall left


        if (!wallTop && !wallRight && !wallBottom && wallLeft) {
          cell.elem.classList.add('sidewall');
          cell.elem.classList.add('left');
          continue;
        } // Corner hall sideways


        if (wallTop && !wallRight && wallBottom && !wallLeft) {
          cell.elem.classList.add('hall');
          cell.elem.classList.add('side');
          continue;
        } // Corner hall vertical


        if (!wallTop && wallRight && !wallBottom && wallLeft) {
          cell.elem.classList.add('hall');
          cell.elem.classList.add('up');
          continue;
        } // Corner top left


        if (wallTop && !wallRight && !wallBottom && wallLeft) {
          cell.elem.classList.add('corner');
          cell.elem.classList.add('top-left');
          continue;
        } // Corner top right


        if (wallTop && wallRight && !wallBottom && !wallLeft) {
          cell.elem.classList.add('corner');
          cell.elem.classList.add('top-right');
          continue;
        } // Corner bottom left


        if (!wallTop && !wallRight && wallBottom && wallLeft) {
          cell.elem.classList.add('corner');
          cell.elem.classList.add('bottom-left');
          continue;
        } // Corner bottom right


        if (!wallTop && wallRight && wallBottom && !wallLeft) {
          cell.elem.classList.add('corner');
          cell.elem.classList.add('bottom-right');
          continue;
        } // Corner cap top


        if (!wallTop && wallRight && wallBottom && wallLeft) {
          cell.elem.classList.add('cap');
          cell.elem.classList.add('top');
          continue;
        } // Corner cap right


        if (wallTop && !wallRight && wallBottom && wallLeft) {
          cell.elem.classList.add('cap');
          cell.elem.classList.add('right');
          continue;
        } // Corner cap bottom


        if (wallTop && wallRight && !wallBottom && wallLeft) {
          cell.elem.classList.add('cap');
          cell.elem.classList.add('bottom');
          continue;
        } // Corner cap left


        if (wallTop && wallRight && wallBottom && !wallLeft) {
          cell.elem.classList.add('cap');
          cell.elem.classList.add('left');
          continue;
        }
      }
    }
  }
}

function toggleCenterMode() {
  if (options.centerMode === false) {
    options.centerMode = true;
    centerPlayerInScreen();
  } else {
    options.centerMode = false;
    centerPlayerInScreen();
  }
}

function centerPlayerInScreen() {
  var topLevelOffset;
  var leftLevelOffset;
  var top;
  var left; // Take the player's distance from the center of the level and multiply it by the half the zoom formula to give a lower weight

  topLevelOffset = (levelStore[currentLevel].length / 2 - player.pos[0]) * sessionStats.zoomLevel * 4;
  leftLevelOffset = (levelStore[currentLevel][0].length / 2 - player.pos[1]) * sessionStats.zoomLevel * 4;

  if (options.centerMode === false) {
    // Player position less the half the screen dimensions and half a tile (centered), modified by a weighted value that pulls to the middle of the level with a screen dimenstions min/max
    top = player.elem.offsetTop * -1 - sessionStats.zoomLevel * 4 + window.innerHeight / 2 - Math.min(Math.max(parseInt(topLevelOffset * 0.75), window.innerHeight / 3 * -1), window.innerHeight / 3);
    left = player.elem.offsetLeft * -1 - sessionStats.zoomLevel * 4 + window.innerWidth / 2 - Math.min(Math.max(parseInt(leftLevelOffset * 0.75), window.innerWidth / 3 * -1), window.innerWidth / 3); //console.log ('Top: ' + top + ', Left: ' + left + ', Max height: ' + (window.innerHeight - (window.innerHeight / 3)) + ', Max Width: ' + (window.innerWidth - (window.innerWidth / 3)) + '\nWindow height: ' + window.innerHeight + ', Window width: ' + window.innerWidth);
  } else {
    // Follow centered only
    top = player.elem.offsetTop * -1 - sessionStats.zoomLevel * 4 + window.innerHeight / 2;
    left = player.elem.offsetLeft * -1 - sessionStats.zoomLevel * 4 + window.innerWidth / 2;
  }

  overrides.innerHTML = '#display-wrapper #game-grid {top: ' + top + 'px; left: ' + left + 'px;}'; // Center mode will return the camera to the player. This can dysync the viewing goal state, so reset it here

  if (viewingGoal) {
    viewingGoal = false;
  }
}

function showGoal() {
  var top,
      left,
      goal = document.querySelector('.goal');

  if (viewingGoal) {
    centerPlayerInScreen();
    viewingGoal = false;
  } else {
    top = goal.offsetTop * -1 - sessionStats.zoomLevel * 4 + window.innerHeight / 2;
    left = goal.offsetLeft * -1 - sessionStats.zoomLevel * 4 + window.innerWidth / 2;
    overrides.innerHTML = '#display-wrapper #game-grid {top: ' + top + 'px; left: ' + left + 'px;}';
    viewingGoal = true;
  }
}

function enemyAITurn() {
  // Iterate on each enemy
  for (var i = 0; i < enemies[currentLevel].length; i++) {
    moveEnemy(enemies[currentLevel][i], randomDirection());
  }
}

function moveEnemy(enemyObject, direction) {
  if (sessionStats.dead) {
    return;
  }

  var newCell, newPos;

  switch (direction) {
    case 1:
      // Up
      newPos = [enemyObject.pos[0] - 1, enemyObject.pos[1]];
      break;

    case 2:
      // Right
      newPos = [enemyObject.pos[0], enemyObject.pos[1] + 1];
      break;

    case 3:
      // Down
      newPos = [enemyObject.pos[0] + 1, enemyObject.pos[1]];
      break;

    case 4:
      // Left
      newPos = [enemyObject.pos[0], enemyObject.pos[1] - 1];
      break;
  }

  newCell = levelStore[currentLevel][newPos[0]][newPos[1]].elem; // Do not allow movement onto a wall or another enemy

  if (levelStore[currentLevel][newPos[0]][newPos[1]].type != 'wall' && levelStore[currentLevel][newPos[0]][newPos[1]].inside.indexOf('enemy') === -1) {
    if (levelStore[currentLevel][newPos[0]][newPos[1]].inside.indexOf('player') > -1) {
      death();
    } // Update the level database


    levelStore[currentLevel][enemyObject.pos[0]][enemyObject.pos[1]].inside.splice(levelStore[currentLevel][enemyObject.pos[0]][enemyObject.pos[1]].inside.indexOf('enemy'), 1);
    levelStore[currentLevel][newPos[0]][newPos[1]].inside.push('enemy'); // Update the visuals

    renderEnemy(enemyObject, newPos); // Update enemy object

    enemyObject.pos = newPos;
    enemyObject.elem = newCell;
    enemyObject.moveTries = 0;
  } else {
    enemyObject.moveTries++;

    if (enemyObject.moveTries < 3) {
      moveEnemy(enemyObject, randomDirection());
    }
  }
}

function randomDirection() {
  // Returns 1 - 4, where 1 = Up, 2 = Right, 3 = Down, and 4 = Left
  return Math.floor(Math.random() * 4 + 1);
}

function movePlayer(direction) {
  var newCell, newPos;

  switch (direction) {
    case 1:
      // Up
      newPos = [player.pos[0] - 1, player.pos[1]];
      break;

    case 2:
      // Right
      newPos = [player.pos[0], player.pos[1] + 1];
      break;

    case 3:
      // Down
      newPos = [player.pos[0] + 1, player.pos[1]];
      break;

    case 4:
      // Left
      newPos = [player.pos[0], player.pos[1] - 1];
      break;
  }

  newCell = levelStore[currentLevel][newPos[0]][newPos[1]].elem; // Ran into an enemy

  if (levelStore[currentLevel][newPos[0]][newPos[1]].inside.indexOf('enemy') > -1) {
    death();
    return;
  }

  if (levelStore[currentLevel][newPos[0]][newPos[1]].type != 'wall') {
    // Update the visuals
    renderPlayer(newPos); // Update the levelStore

    levelStore[currentLevel][player.pos[0]][player.pos[1]].inside.splice(levelStore[currentLevel][player.pos[0]][player.pos[1]].inside.indexOf('player'), 1);
    levelStore[currentLevel][newPos[0]][newPos[1]].inside.push('player'); // Update player object

    player.pos = newPos;
    player.elem = newCell;
    centerPlayerInScreen();
  }
}

function renderPlayer(pos) {
  stylePlayer.innerHTML = "#display-wrapper #game-grid .row .cell.floor.player::after {top: " + pos[0] * sessionStats.zoomLevel * 8 + "px; left: " + pos[1] * sessionStats.zoomLevel * 8 + "px; height: " + sessionStats.zoomLevel * 8 + "px;width: " + sessionStats.zoomLevel * 8 + "px;}";
}

function renderEnemy(enemyObj, pos) {
  enemyObj.stylePos.innerHTML = '#display-wrapper #game-grid .row .cell.floor.enemy-' + enemyObj.id + '::after {top: ' + pos[0] * sessionStats.zoomLevel * 8 + 'px; left: ' + pos[1] * sessionStats.zoomLevel * 8 + 'px; height: ' + sessionStats.zoomLevel * 8 + 'px;width: ' + sessionStats.zoomLevel * 8 + 'px;}';
}

function renderEnemies() {
  for (var enemyIndex = 0; enemyIndex < enemies[currentLevel].length; enemyIndex++) {
    var enemyObj = enemies[currentLevel][enemyIndex];
    renderEnemy(enemyObj, enemyObj.pos);
  }
}

function cleanupEnemyStyles(level) {
  for (var enemyIndex = 0; enemyIndex < enemies[level].length; enemyIndex++) {
    var enemyObj = enemies[level][enemyIndex];
    enemyObj.stylePos.parentNode.removeChild(enemyObj.stylePos);
  }
}

function checkVictory() {
  if (levelStore[currentLevel][player.pos[0]][player.pos[1]].inside.indexOf('stairsDown') > -1) {
    return true;
  } else {
    return false;
  }
}

function retryLevel() {
  // Reset player
  player = {}; // Clean up enemies

  cleanupEnemyStyles(currentLevel);
  enemies.splice(currentLevel, 1);
  enemyCounter = 0; // Reset level store

  levelStore.splice(currentLevel, 1); // Redraw and fix up level values

  refreshScreen();
  sessionStats.turnsLevel = 0;
  sessionStats.dead = false;
  sessionStats.retries += 1;
}

function refreshScreen() {
  eraseScreen();
  drawScreen(levelData[currentLevel]);
}

function eraseScreen() {
  var background = document.querySelector('#display-wrapper'),
      grid = document.querySelector('#game-grid'),
      ui = document.querySelector('#ui-display');
  background.removeChild(ui);
  background.removeChild(grid);
}

function goToNewLevel(newLevel) {
  sessionStats.turnsLevel = 0;
  enemyCounter = 0; // Erase screen

  eraseScreen(); // Clean up enemy stlye elements in head

  try {
    cleanupEnemyStyles(currentLevel);
  } catch (error) {// Error happens when using newGame since the enemy array is already deleted. Revist.
  }

  currentLevel = newLevel;
  drawScreen(levelData[newLevel]);
}

function newGame() {
  levelStore.length = 0; // Wipe out the levelStore

  cleanupEnemyStyles(currentLevel);
  enemies.length = 0; // Erase all the enemies

  sessionStats.turnsTotal = 0; // Reset total turns

  goToNewLevel(0); // Go to level 1
}

function displayMessageBox(messageText, btnText, action) {
  var messageBox = document.querySelector('#message');
  var message = document.createElement('p');
  var button = document.createElement('a');
  message.textContent = messageText;
  button.classList.add('btn');
  button.textContent = btnText;
  button.addEventListener('click', function handle(e) {
    e.preventDefault();

    switch (action) {
      case 'dismiss':
        closeMessageWindow();
        break;

      default:
        closeMessageWindow();
        break;
    }
  });
  messageBox.appendChild(message);
  messageBox.appendChild(button);
  messageBox.classList.add('top');
  messageBox.classList.add('show');

  function closeMessageWindow() {
    messageBox.classList.remove('show');
    setTimeout(function destroyMessage() {
      messageBox.classList.remove('top');
      messageBox.removeChild(message);
      messageBox.removeChild(button);
      button.removeEventListener('click', closeMessageWindow);
    }, 360);
  }
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  var oldCookie = getCookie('highscores');

  if (oldCookie !== '') {
    cvalue = oldCookie + '|' + cvalue;
  }

  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');

  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];

    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }

    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }

  return '';
}

function submitHighscore() {
  setCookie('highscores', sessionStats.turnsTotal + '-' + sessionStats.retries, 1000000);
}

function getHighscoreList() {
  var list = [];
  var cookieOutput = getCookie('highscores');
  list = cookieOutput.split('|'); // Split the turns and retires into another array, since the first

  for (var i = 0; i < list.length; i++) {
    list[i] = list[i].split('-');
  } // First sort by number of retries, then sort by number of turns


  list.sort(function handle(a, b) {
    if (a[1] === b[1]) {
      return a[0] - b[0];
    }

    return a[1] - b[1];
  });
  return list;
}

function displayVictoryMessage() {
  var messageBox = document.querySelector('#message');
  var message = document.createElement('p');
  var button = document.createElement('a');
  var button2 = document.createElement('a');
  message.innerHTML = 'You beat level ' + (currentLevel + 1) + '!<br /><br />You completed it in ' + sessionStats.turnsLevel + ' turns. Good job!';
  button.classList.add('btn');
  button.textContent = 'Play again';
  button2.classList.add('btn');
  button2.textContent = 'Go to level ' + (currentLevel + 2); // Plus 2 because it's the next level and we're dealing with a 0-based value

  if (levelData.length === currentLevel + 1) {
    // Only happens if you're on the last level
    if (sessionStats.retries === 0) {
      message.innerHTML = 'Perfect run! You beat the game with no reties.<br /><br />You completed level ' + (currentLevel + 1) + ' in ' + sessionStats.turnsLevel + ' turns, and beat the game in ' + sessionStats.turnsTotal + ' turns. Good job!';
    } else {
      message.innerHTML = 'You win! You beat the game.<br /><br />You completed level ' + (currentLevel + 1) + ' in ' + sessionStats.turnsLevel + ' turns, and beat the game in ' + sessionStats.turnsTotal + ' turns, with ' + sessionStats.retries + ' retries. Good job!';
    }

    button.textContent = 'Start a new game';
    setCookie('highscores', '50-0', 1);
  }

  button.addEventListener('click', function handle(e) {
    e.preventDefault();
    closeMessageWindow();

    if (levelData.length === currentLevel + 1) {
      // Only happens if you're on the last level
      // Start a new game from level 1
      setTimeout(function retry() {
        newGame();
      }, 360);
    } else {
      // Reset gameboard and retry current level
      setTimeout(function retry() {
        retryLevel();
      }, 360);
    }
  });
  button2.addEventListener('click', function handle(e) {
    e.preventDefault();
    closeMessageWindow(); // Go to new level

    setTimeout(function load() {
      goToNewLevel(currentLevel + 1);
    }, 360);
  });
  messageBox.appendChild(message);
  messageBox.appendChild(button);

  if (levelData.length > currentLevel + 1) {
    // Only happens in you aren't on the last level
    messageBox.appendChild(button2);
  }

  messageBox.classList.add('top');
  messageBox.classList.add('show');

  function closeMessageWindow() {
    messageBox.classList.remove('show');
    setTimeout(function destroyMessage() {
      messageBox.classList.remove('top');
      messageBox.removeChild(message);
      messageBox.removeChild(button);
      button.removeEventListener('click', closeMessageWindow);
    }, 360);
  }
}

function newTurn() {
  sessionStats.turnsLevel++;
  sessionStats.turnsTotal++;

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
  var playerGraphic = document.querySelector('.player');
  playerGraphic.classList.add('ashes');
  sessionStats.dead = true;
  message.innerHTML = 'You died.<br /><br />The fire vortex consumed you in an instant, leaving only a pile of ash where you once stood.<br /><br />You lasted ' + sessionStats.turnsLevel + ' turns.';
  button.classList.add('btn');
  button.textContent = 'Try again';
  button.addEventListener('click', closeMessageWindow);
  messageBox.appendChild(message);
  messageBox.appendChild(button);
  messageBox.classList.add('top');
  messageBox.classList.add('show');

  function closeMessageWindow(e) {
    e.preventDefault();
    messageBox.classList.remove('show');
    setTimeout(function destroyMessage() {
      messageBox.classList.remove('top');
      messageBox.removeChild(message);
      messageBox.removeChild(button);
      button.removeEventListener('click', closeMessageWindow); // Reset gameboard

      retryLevel();
    }, 360);
  }
} // Start touch controls


document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);

function handleTouchStart(evt) {
  xDown = evt.touches[0].clientX;
  yDown = evt.touches[0].clientY;
}

function handleTouchMove(evt) {
  if (!xDown || !yDown) {
    return;
  }

  if (sessionStats.dead) {
    return;
  }

  var xUp = evt.touches[0].clientX;
  var yUp = evt.touches[0].clientY;
  var xDiff = xDown - xUp;
  var yDiff = yDown - yUp;
  /* Determine touch direction */

  if (!sessionStats.dead && !document.getElementById('message').classList.contains('show')) {
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (xDiff > 0) {
        /* left swipe */
        movePlayer(4); // Left
      } else {
        /* right swipe */
        movePlayer(2); // Right
      }
    } else {
      if (yDiff > 0) {
        /* up swipe */
        movePlayer(1); // Up
      } else {
        /* down swipe */
        movePlayer(3); // Down
      }
    }
    /* reset values */


    xDown = null;
    yDown = null;
    newTurn();
  }
} // End touch controls


document.addEventListener('keydown', function input(e) {
  var keyList = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'Space', 'Up', 'Right', 'Down', 'Left', 'Spacebar'];

  if (!sessionStats.dead && !document.getElementById('message').classList.contains('show')) {
    // The message window isn't displayed, and you're not dead
    if (keyList.indexOf(e.key) > -1) {
      // Key matches one of the permitted keys
      switch (e.key) {
        case 'ArrowUp':
        case 'Up':
          movePlayer(1); // Up

          break;

        case 'ArrowRight':
        case 'Right':
          movePlayer(2); // Right

          break;

        case 'ArrowDown':
        case 'Down':
          movePlayer(3); // Down

          break;

        case 'ArrowLeft':
        case 'Left':
          movePlayer(4); // Left

          break;
      }

      newTurn();
    }
  }
});
window.addEventListener('resize', centerPlayerInScreen); // Draw the screen for the first time

drawTitleScreen(); // }());
