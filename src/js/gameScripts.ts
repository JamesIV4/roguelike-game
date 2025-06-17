import { levelData } from './levels.js';
import { generateRandomLevel } from './randomLevelGenerator.js';

type SessionStats = {
  turnsTotal: number;
  turnsLevel: number;
  retries: number;
  zoomLevel: number;
  dead: boolean;
  mode: 'normal' | 'procedural';
};

(() => {
  let currentLevel = 0;
  let levelStore: any[] = [];
  let enemies: any[] = [];
  let enemyCounter = 0;
  let player: Player;
  let viewingGoal = false;
  let options = {
    centerMode: false
  };
  let sessionStats: SessionStats = {
    turnsTotal: 0,
    turnsLevel: 0,
    retries: 0,
    zoomLevel: 4,
    dead: false,
    mode: 'normal'
  };

  // Touch controls variables
  let xDown: number | null = null;
  let yDown: number | null = null;

  // Style overrides block
  const overrides = document.createElement('style');
  const zoomLevelStyle = document.createElement('style');
  const stylePlayer = document.createElement('style');
  document.querySelector('head')?.appendChild(overrides);
  document.querySelector('head')?.appendChild(zoomLevelStyle);
  document.querySelector('head')?.appendChild(stylePlayer);

  // Unit type classes
  class Enemy {
    constructor(
      public elem: HTMLElement,
      public id: number,
      public pos: number[],
      public type: string,
      public health: number,
      public stylePos: HTMLStyleElement = document.createElement('style'),
      public moveTries: number = 0
    ) {
      // Append style element to the head
      document.querySelector('head')?.appendChild(this.stylePos);
    }
  }

  class Player {
    constructor(
      public elem: HTMLElement,
      public id: number,
      public pos: number[],
      public type: string,
      public health: number
    ) {}

    reset() {
      // Reset to default values
      this.pos = [];
      this.health = 100;
    }
  }

  // Map classes
  class Cell {
    constructor(
      public elem: HTMLElement,
      public id: any,
      public type?: string,
      public inside: any[] = []
    ) {}
  }

  // Game code functions
  const beginGame = () => {
    if (sessionStats.mode === 'normal') {
      drawScreen(levelData[0]);
    } else {
      drawScreen(generateRandomLevel(0, 40, 40));
    }
  };

  const drawTitleScreen = () => {
    const background = document.querySelector('#display-wrapper'),
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

    background?.classList.add('titlescreen');

    titleHeader.textContent = 'Fire Gauntlet';
    btnStartNormal.textContent = 'Start Normal Game';
    btnStartProcudural.textContent = 'Start Procedural Game';

    background?.appendChild(uiElem);
    titleContainer.appendChild(titleHeader);
    titleContainer.appendChild(buttonContainer);
    buttonContainer.appendChild(btnStartNormal);
    buttonContainer.appendChild(btnStartProcudural);
    uiElem.appendChild(messageWindow);
    uiElem.appendChild(titleContainer);

    setTimeout(() => {
      titleContainer.classList.add('show');
    }, 150);

    const closeTitlescreen = () => {
      background?.classList.remove('titlescreen');
      titleContainer.classList.remove('show');

      setTimeout(() => {
        uiElem.removeChild(titleContainer);
        background?.removeChild(uiElem);
      }, 1000);
    };

    btnStartNormal.addEventListener('click', () => {
      closeTitlescreen();
      sessionStats.mode = 'normal';
      beginGame();
    });

    btnStartProcudural.addEventListener('click', () => {
      closeTitlescreen();
      sessionStats.mode = 'procedural';
      beginGame();
    });
  };

  const drawScreen = (selectedLevel: any) => {
    const background = document.querySelector('#display-wrapper'),
      grid = document.createElement('div'),
      messageWindow = document.createElement('div'),
      uiElem = document.createElement('div'),
      zoomButtons = document.createElement('div'),
      zoomUp = document.createElement('div'),
      zoomDown = document.createElement('div'),
      showGoalBtn = document.createElement('div'),
      switchCameraBtn = document.createElement('div');
    let levelRows;

    grid.id = 'game-grid';

    uiElem.id = 'ui-display';
    messageWindow.id = 'message';

    zoomButtons.id = 'zoom-container';
    zoomUp.id = 'zoom-up';
    zoomUp.textContent = '+';

    zoomDown.id = 'zoom-down';
    zoomDown.textContent = '-';

    showGoalBtn.id = 'show-goal';

    switchCameraBtn.id = 'switch-camera';

    // Initialize level storage
    if (levelStore.length === currentLevel) {
      // If we're in a NEW level, add new arrays
      levelStore.splice(currentLevel, 0, [new Array()]); // Create new array in the appropriate place.. may not work right, have to revisit
      enemies.splice(currentLevel, 0, new Array());
    }

    // Read level data
    levelRows = selectedLevel.split('\n');

    // Row creation logic
    for (let rowIndex = 0; rowIndex < levelRows.length; rowIndex++) {
      let levelCells = levelRows[rowIndex].split(','),
        elemRow = document.createElement('div');

      elemRow.classList.add('row');
      grid.appendChild(elemRow);

      // Level store row creation
      levelStore[currentLevel].push(new Array());

      // Cell creation logic
      for (let cellIndex = 0; cellIndex < levelCells.length; cellIndex++) {
        let cell = levelCells[cellIndex],
          elemCell = document.createElement('div');

        elemCell.classList.add('cell');
        elemCell.id = rowIndex + '-' + cellIndex;
        elemRow.appendChild(elemCell);

        // Add to level store tracking
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

    background?.appendChild(uiElem);
    uiElem.appendChild(zoomButtons);
    uiElem.appendChild(messageWindow);
    zoomButtons.appendChild(switchCameraBtn);
    zoomButtons.appendChild(showGoalBtn);
    zoomButtons.appendChild(zoomUp);
    zoomButtons.appendChild(zoomDown);
    background?.appendChild(grid);

    renderPlayer(player.pos);
    drawDecorations();
    centerPlayerInScreen();

    setTimeout(() => {
      grid.classList.add('show');
    }, 300);

    // Button events
    switchCameraBtn.addEventListener('click', () => {
      toggleCenterMode();
    });
    showGoalBtn.addEventListener('click', () => {
      showGoal();
    });
    zoomUp.addEventListener('click', () => {
      grid.classList.add('no-anim'); // Move characters instantly during zoom

      sessionStats.zoomLevel++;
      zoomLevelStyle.innerHTML = '#display-wrapper #game-grid .row .cell {height: ' + sessionStats.zoomLevel * 8 + 'px !important; width: ' + sessionStats.zoomLevel * 8 + 'px !important;}';
      renderPlayer(player.pos);
      renderEnemies();
      centerPlayerInScreen();

      grid.classList.remove('no-anim');
    });
    zoomDown.addEventListener('click', () => {
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
  };

  const drawDecorations = () => {
    // After the levelStore is initialized, go over it again and add the floor and wall decorations
    for (let rowStore = 0; rowStore < levelStore[currentLevel].length; rowStore++) {
      for (let cellStore = 0; cellStore < levelStore[currentLevel][rowStore].length; cellStore++) {
        let cell = levelStore[currentLevel][rowStore][cellStore];
        if (cell === '' || cell === undefined) continue; // Skip if cell is empty or undefined

        // Ensure cell is valid and has a 'type'
        if (cell.type === 'floor') {
          // Safeguard against out-of-bounds access
          const wallTop = (rowStore > 0 && levelStore[currentLevel][rowStore - 1][cellStore]?.type === 'wall') || false;
          const wallRight = (cellStore < levelStore[currentLevel][rowStore].length - 1 && levelStore[currentLevel][rowStore][cellStore + 1]?.type === 'wall') || false;
          const wallBottom = (rowStore < levelStore[currentLevel].length - 1 && levelStore[currentLevel][rowStore + 1][cellStore]?.type === 'wall') || false;
          const wallLeft = (cellStore > 0 && levelStore[currentLevel][rowStore][cellStore - 1]?.type === 'wall') || false;

          // Sidewall top
          if (wallTop && !wallRight && !wallBottom && !wallLeft) {
            cell.elem.classList.add('sidewall');
            cell.elem.classList.add('top');
            continue;
          }

          // Sidewall right
          if (!wallTop && wallRight && !wallBottom && !wallLeft) {
            cell.elem.classList.add('sidewall');
            cell.elem.classList.add('right');
            continue;
          }

          // Sidewall bottom
          if (!wallTop && !wallRight && wallBottom && !wallLeft) {
            cell.elem.classList.add('sidewall');
            cell.elem.classList.add('bottom');
            continue;
          }

          // Sidewall left
          if (!wallTop && !wallRight && !wallBottom && wallLeft) {
            cell.elem.classList.add('sidewall');
            cell.elem.classList.add('left');
            continue;
          }

          // Corner hall sideways
          if (wallTop && !wallRight && wallBottom && !wallLeft) {
            cell.elem.classList.add('hall');
            cell.elem.classList.add('side');
            continue;
          }

          // Corner hall vertical
          if (!wallTop && wallRight && !wallBottom && wallLeft) {
            cell.elem.classList.add('hall');
            cell.elem.classList.add('up');
            continue;
          }

          // Corner top left
          if (wallTop && !wallRight && !wallBottom && wallLeft) {
            cell.elem.classList.add('corner');
            cell.elem.classList.add('top-left');
            continue;
          }

          // Corner top right
          if (wallTop && wallRight && !wallBottom && !wallLeft) {
            cell.elem.classList.add('corner');
            cell.elem.classList.add('top-right');
            continue;
          }

          // Corner bottom left
          if (!wallTop && !wallRight && wallBottom && wallLeft) {
            cell.elem.classList.add('corner');
            cell.elem.classList.add('bottom-left');
            continue;
          }

          // Corner bottom right
          if (!wallTop && wallRight && wallBottom && !wallLeft) {
            cell.elem.classList.add('corner');
            cell.elem.classList.add('bottom-right');
            continue;
          }

          // Corner cap top
          if (!wallTop && wallRight && wallBottom && wallLeft) {
            cell.elem.classList.add('cap');
            cell.elem.classList.add('top');
            continue;
          }

          // Corner cap right
          if (wallTop && !wallRight && wallBottom && wallLeft) {
            cell.elem.classList.add('cap');
            cell.elem.classList.add('right');
            continue;
          }

          // Corner cap bottom
          if (wallTop && wallRight && !wallBottom && wallLeft) {
            cell.elem.classList.add('cap');
            cell.elem.classList.add('bottom');
            continue;
          }

          // Corner cap left
          if (wallTop && wallRight && wallBottom && !wallLeft) {
            cell.elem.classList.add('cap');
            cell.elem.classList.add('left');
            continue;
          }
        }
      }
    }
  };

  const toggleCenterMode = () => {
    if (options.centerMode === false) {
      options.centerMode = true;
      centerPlayerInScreen();
    } else {
      options.centerMode = false;
      centerPlayerInScreen();
    }
  };

  const centerPlayerInScreen = () => {
    let topLevelOffset;
    let leftLevelOffset;
    let top;
    let left;

    // Take the player's distance from the center of the level and multiply it by the half the zoom formula to give a lower weight
    topLevelOffset = (levelStore[currentLevel].length / 2 - player.pos[0]) * sessionStats.zoomLevel * 4;
    leftLevelOffset = (levelStore[currentLevel][0].length / 2 - player.pos[1]) * sessionStats.zoomLevel * 4;

    if (options.centerMode === false) {
      // Player position less the half the screen dimensions and half a tile (centered), modified by a weighted value that pulls to the middle of the level with a screen dimensions min/max
      top = player.elem.offsetTop * -1 - sessionStats.zoomLevel * 4 + window.innerHeight / 2 - Math.min(Math.max(topLevelOffset * 0.75, (window.innerHeight / 3) * -1), window.innerHeight / 3);

      left = player.elem.offsetLeft * -1 - sessionStats.zoomLevel * 4 + window.innerWidth / 2 - Math.min(Math.max(leftLevelOffset * 0.75, (window.innerWidth / 3) * -1), window.innerWidth / 3);

      //console.log ('Top: ' + top + ', Left: ' + left + ', Max height: ' + (window.innerHeight - (window.innerHeight / 3)) + ', Max Width: ' + (window.innerWidth - (window.innerWidth / 3)) + '\nWindow height: ' + window.innerHeight + ', Window width: ' + window.innerWidth);
    } else {
      // Follow centered only
      top = player.elem.offsetTop * -1 - sessionStats.zoomLevel * 4 + window.innerHeight / 2;
      left = player.elem.offsetLeft * -1 - sessionStats.zoomLevel * 4 + window.innerWidth / 2;
    }

    overrides.innerHTML = '#display-wrapper #game-grid {top: ' + top + 'px; left: ' + left + 'px;}';

    // Center mode will return the camera to the player. This can de-sync the viewing goal state, so reset it here
    if (viewingGoal) {
      viewingGoal = false;
    }
  };

  const showGoal = () => {
    let top,
      left,
      goal: HTMLElement = document.querySelector('.goal')!;

    if (viewingGoal) {
      centerPlayerInScreen();
      viewingGoal = false;
    } else {
      top = goal?.offsetTop * -1 - sessionStats.zoomLevel * 4 + window.innerHeight / 2;
      left = goal?.offsetLeft * -1 - sessionStats.zoomLevel * 4 + window.innerWidth / 2;

      overrides.innerHTML = '#display-wrapper #game-grid {top: ' + top + 'px; left: ' + left + 'px;}';
      viewingGoal = true;
    }
  };

  const enemyAITurn = () => {
    // Iterate on each enemy
    for (let i = 0; i < enemies[currentLevel].length; i++) {
      moveEnemy(enemies[currentLevel][i], randomDirection());
    }
  };

  const moveEnemy = (enemyObject: Enemy, direction: number) => {
    if (sessionStats.dead) {
      return;
    }

    let newCell,
      newPos: number[] = [];

    switch (direction) {
      case 1: // Up
        newPos = [enemyObject.pos[0] - 1, enemyObject.pos[1]];
        break;
      case 2: // Right
        newPos = [enemyObject.pos[0], enemyObject.pos[1] + 1];
        break;
      case 3: // Down
        newPos = [enemyObject.pos[0] + 1, enemyObject.pos[1]];
        break;
      case 4: // Left
        newPos = [enemyObject.pos[0], enemyObject.pos[1] - 1];
        break;
    }

    newCell = levelStore[currentLevel][newPos[0]][newPos[1]].elem;

    // Do not allow movement onto a wall or another enemy
    if (levelStore[currentLevel][newPos[0]][newPos[1]].type != 'wall' && levelStore[currentLevel][newPos[0]][newPos[1]].inside.indexOf('enemy') === -1) {
      if (levelStore[currentLevel][newPos[0]][newPos[1]].inside.indexOf('player') > -1) {
        death();
      }

      // Update the level database
      levelStore[currentLevel][enemyObject.pos[0]][enemyObject.pos[1]].inside.splice(levelStore[currentLevel][enemyObject.pos[0]][enemyObject.pos[1]].inside.indexOf('enemy'), 1);
      levelStore[currentLevel][newPos[0]][newPos[1]].inside.push('enemy');

      // Update the visuals
      renderEnemy(enemyObject, newPos);

      // Update enemy object
      enemyObject.pos = newPos;
      enemyObject.elem = newCell;
      enemyObject.moveTries = 0;
    } else {
      enemyObject.moveTries++;
      if (enemyObject.moveTries < 3) {
        moveEnemy(enemyObject, randomDirection());
      }
    }
  };

  const randomDirection = () => {
    // Returns 1 - 4, where 1 = Up, 2 = Right, 3 = Down, and 4 = Left
    return Math.floor(Math.random() * 4 + 1);
  };

  const movePlayer = (direction: number) => {
    let newCell,
      newPos: number[] = [];

    switch (direction) {
      case 1: // Up
        newPos = [player.pos[0] - 1, player.pos[1]];
        break;
      case 2: // Right
        newPos = [player.pos[0], player.pos[1] + 1];
        break;
      case 3: // Down
        newPos = [player.pos[0] + 1, player.pos[1]];
        break;
      case 4: // Left
        newPos = [player.pos[0], player.pos[1] - 1];
        break;
    }

    newCell = levelStore[currentLevel][newPos[0]][newPos[1]].elem;

    // Ran into an enemy
    if (levelStore[currentLevel][newPos[0]][newPos[1]].inside.indexOf('enemy') > -1) {
      death();
      return;
    }

    if (levelStore[currentLevel][newPos[0]][newPos[1]].type != 'wall') {
      // Update the visuals
      renderPlayer(newPos);

      // Update the levelStore
      levelStore[currentLevel][player.pos[0]][player.pos[1]].inside.splice(levelStore[currentLevel][player.pos[0]][player.pos[1]].inside.indexOf('player'), 1);
      levelStore[currentLevel][newPos[0]][newPos[1]].inside.push('player');

      // Update player object
      player.pos = newPos;
      player.elem = newCell;

      centerPlayerInScreen();
    }
  };

  const renderPlayer = (pos: number[]) => {
    stylePlayer.innerHTML =
      '#display-wrapper #game-grid .row .cell.floor.player::after {top: ' +
      pos[0] * sessionStats.zoomLevel * 8 +
      'px; left: ' +
      pos[1] * sessionStats.zoomLevel * 8 +
      'px; height: ' +
      sessionStats.zoomLevel * 8 +
      'px;width: ' +
      sessionStats.zoomLevel * 8 +
      'px;}';
  };

  const renderEnemy = (enemyObj: Enemy, pos: number[]) => {
    enemyObj.stylePos.innerHTML =
      '#display-wrapper #game-grid .row .cell.floor.enemy-' +
      enemyObj.id +
      '::after {top: ' +
      pos[0] * sessionStats.zoomLevel * 8 +
      'px; left: ' +
      pos[1] * sessionStats.zoomLevel * 8 +
      'px; height: ' +
      sessionStats.zoomLevel * 8 +
      'px;width: ' +
      sessionStats.zoomLevel * 8 +
      'px;}';
  };

  const renderEnemies = () => {
    for (let enemyIndex = 0; enemyIndex < enemies[currentLevel].length; enemyIndex++) {
      let enemyObj = enemies[currentLevel][enemyIndex];

      renderEnemy(enemyObj, enemyObj.pos);
    }
  };

  const cleanupEnemyStyles = (level: number) => {
    for (let enemyIndex = 0; enemyIndex < enemies[level].length; enemyIndex++) {
      let enemyObj = enemies[level][enemyIndex];

      enemyObj.stylePos.parentNode.removeChild(enemyObj.stylePos);
    }
  };

  const checkVictory = () => {
    if (levelStore[currentLevel][player.pos[0]][player.pos[1]].inside.indexOf('stairsDown') > -1) {
      return true;
    } else {
      return false;
    }
  };

  const retryLevel = () => {
    // Reset player
    player.reset();

    // Clean up enemies
    cleanupEnemyStyles(currentLevel);
    enemies.splice(currentLevel, 1);
    enemyCounter = 0;

    // Reset level store
    levelStore.splice(currentLevel, 1);

    // Redraw and fix up level values
    refreshScreen();
    sessionStats.turnsLevel = 0;
    sessionStats.dead = false;
    sessionStats.retries += 1;
  };

  const refreshScreen = () => {
    eraseScreen();

    if (sessionStats.mode === 'normal') {
      drawScreen(levelData[currentLevel]);
    } else {
      drawScreen(generateRandomLevel(currentLevel, 40, 40));
    }
  };

  const eraseScreen = () => {
    let background = document.querySelector('#display-wrapper'),
      grid = document.querySelector('#game-grid'),
      ui = document.querySelector('#ui-display');

    background?.removeChild(ui!);
    background?.removeChild(grid!);
  };

  const goToNewLevel = (newLevel: number) => {
    sessionStats.turnsLevel = 0;
    enemyCounter = 0;

    // Erase screen
    eraseScreen();

    // Clean up enemy style elements in head
    try {
      cleanupEnemyStyles(currentLevel);
    } catch (error) {
      // Error happens when using newGame since the enemy array is already deleted. Revisit.
    }

    currentLevel = newLevel;

    // Check game mode to load the correct level type
    if (sessionStats.mode === 'normal') {
      drawScreen(levelData[newLevel]);
    } else {
      drawScreen(generateRandomLevel(currentLevel, 40, 40));
    }
  };

  const newGame = () => {
    levelStore.length = 0; // Wipe out the levelStore

    cleanupEnemyStyles(currentLevel);
    enemies.length = 0; // Erase all the enemies

    sessionStats.turnsTotal = 0; // Reset total turns
    goToNewLevel(0); // Go to level 1
  };

  const displayMessageBox = (messageText: string, btnText: string, action: 'dismiss') => {
    const messageBox = document.querySelector('#message');
    const message = document.createElement('p');
    const button = document.createElement('a');

    message.textContent = messageText;

    button.classList.add('btn');
    button.textContent = btnText;

    button.addEventListener('click', (e) => {
      e.preventDefault();

      switch (action) {
        case 'dismiss':
          closeMessageWindow();
          break;
      }
    });

    messageBox?.appendChild(message);
    messageBox?.appendChild(button);

    messageBox?.classList.add('top');
    messageBox?.classList.add('show');

    const closeMessageWindow = () => {
      messageBox?.classList.remove('show');

      setTimeout(() => {
        messageBox?.classList.remove('top');
        messageBox?.removeChild(message);
        messageBox?.removeChild(button);
      }, 360);
    };
  };

  const setCookie = (cname: string, cvalue: string, exdays: number) => {
    let d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    let expires = 'expires=' + d.toUTCString();

    let oldCookie = getCookie('highscores');

    if (oldCookie !== '') {
      cvalue = oldCookie + '|' + cvalue;
    }

    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
  };

  const getCookie = (cname: string) => {
    let name = cname + '=';
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  };

  const submitHighscore = () => {
    setCookie('highscores', sessionStats.turnsTotal + '-' + sessionStats.retries, 1000000);
  };

  const getHighscoreList = () => {
    let list: any[] = [];
    let cookieOutput = getCookie('highscores');

    list = cookieOutput.split('|');

    // Split the turns and retires into another array, since the first
    for (let i = 0; i < list.length; i++) {
      list[i] = list[i].split('-');
    }

    // First sort by number of retries, then sort by number of turns
    list.sort((a, b) => {
      if (a[1] === b[1]) {
        return a[0] - b[0];
      }
      return a[1] - b[1];
    });

    return list;
  };

  const displayVictoryMessage = () => {
    const messageBox = document.querySelector('#message');
    const message = document.createElement('p');
    const btnPlayAgain = document.createElement('a');
    const btnNextLevel = document.createElement('a');

    // This function closes the message window and removes the buttons.
    const closeMessageWindow = () => {
      messageBox?.classList.remove('show');
      setTimeout(() => {
        messageBox?.classList.remove('top');
        messageBox?.removeChild(message);
        messageBox?.removeChild(btnPlayAgain);
        if (messageBox?.contains(btnNextLevel)) {
          messageBox?.removeChild(btnNextLevel);
        }
      }, 360);
    };

    // Configure the "Play again" / "New Game" button
    btnPlayAgain.classList.add('btn');
    btnPlayAgain.textContent = 'Play again';
    btnPlayAgain.addEventListener('click', (e) => {
      e.preventDefault();
      closeMessageWindow();
      if (sessionStats.mode === 'normal' && levelData.length === currentLevel + 1) {
        setTimeout(() => {
          newGame();
        }, 360); // Start a new game if it was the last level
      } else {
        setTimeout(() => {
          retryLevel();
        }, 360); // Otherwise, just retry the current level
      }
    });

    // Configure the "Next Level" button
    btnNextLevel.classList.add('btn');
    btnNextLevel.textContent = 'Go to level ' + (currentLevel + 2);
    btnNextLevel.addEventListener('click', (e) => {
      e.preventDefault();
      closeMessageWindow();
      setTimeout(() => {
        goToNewLevel(currentLevel + 1);
      }, 360);
    });

    // Set the main message text.
    message.innerHTML = 'You beat level ' + (currentLevel + 1) + '!<br /><br />You completed it in ' + sessionStats.turnsLevel + ' turns. Good job!';

    // Special message for the final level of normal mode.
    if (sessionStats.mode === 'normal' && levelData.length === currentLevel + 1) {
      if (sessionStats.retries === 0) {
        message.innerHTML =
          'Perfect run! You beat the game with no retries.<br /><br />You completed level ' +
          (currentLevel + 1) +
          ' in ' +
          sessionStats.turnsLevel +
          ' turns, and beat the game in ' +
          sessionStats.turnsTotal +
          ' turns. Good job!';
      } else {
        message.innerHTML =
          'You win! You beat the game.<br /><br />You completed level ' +
          (currentLevel + 1) +
          ' in ' +
          sessionStats.turnsLevel +
          ' turns, and beat the game in ' +
          sessionStats.turnsTotal +
          ' turns, with ' +
          sessionStats.retries +
          ' retries. Good job!';
      }
      btnPlayAgain.textContent = 'Start a new game';
      setCookie('highscores', '50-0', 1);
    }

    // Add the elements to the message box
    messageBox?.appendChild(message);
    messageBox?.appendChild(btnPlayAgain);

    // Add the "Next Level" button if it's not the last level in normal mode, or for any procedural level.
    if (sessionStats.mode === 'procedural' || (sessionStats.mode === 'normal' && levelData.length > currentLevel + 1)) {
      messageBox?.appendChild(btnNextLevel);
    }

    // Show the message box
    messageBox?.classList.add('top');
    messageBox?.classList.add('show');
  };

  const newTurn = () => {
    sessionStats.turnsLevel++;
    sessionStats.turnsTotal++;

    if (!checkVictory()) {
      enemyAITurn();
    } else {
      displayVictoryMessage();
    }
  };

  const death = () => {
    const messageBox = document.querySelector('#message');
    const message = document.createElement('p');
    const button = document.createElement('a');
    const playerGraphic = document.querySelector('.player');

    playerGraphic?.classList.add('ashes');

    sessionStats.dead = true;

    message.innerHTML =
      'You died.<br /><br />The fire vortex consumed you in an instant, leaving only a pile of ash where you once stood.<br /><br />You lasted ' + sessionStats.turnsLevel + ' turns.';

    button.classList.add('btn');
    button.textContent = 'Try again';

    const closeMessageWindow = () => {
      messageBox?.classList.remove('show');
      setTimeout(() => {
        messageBox?.classList.remove('top');
        messageBox?.removeChild(message);
        messageBox?.removeChild(button);
        // Reset gameboard
        retryLevel();
      }, 360);
    };

    button.addEventListener('click', (e) => {
      e.preventDefault();
      closeMessageWindow();
    });

    messageBox?.appendChild(message);
    messageBox?.appendChild(button);

    messageBox?.classList.add('top');
    messageBox?.classList.add('show');
  };

  const handleTouchStart = (evt: TouchEvent) => {
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
  };

  const handleTouchMove = (evt: TouchEvent) => {
    if (!xDown || !yDown) {
      return;
    }

    if (sessionStats.dead) {
      return;
    }

    let xUp = evt.touches[0].clientX;
    let yUp = evt.touches[0].clientY;

    let xDiff = xDown - xUp;
    let yDiff = yDown - yUp;

    /* Determine touch direction */
    if (!sessionStats.dead && !document.getElementById('message')?.classList.contains('show')) {
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
  };
  // End touch controls

  // Start touch controls
  document.addEventListener('touchstart', handleTouchStart, false);
  document.addEventListener('touchmove', handleTouchMove, false);

  document.addEventListener('keydown', (e) => {
    const keyList = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'Space', 'Up', 'Right', 'Down', 'Left', 'Spacebar'];

    if (!sessionStats.dead && !document.getElementById('message')?.classList.contains('show')) {
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

  window.addEventListener('resize', centerPlayerInScreen);

  // Draw the screen for the first time
  drawTitleScreen();
})();
