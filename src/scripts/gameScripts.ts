import { levelData } from './levels.js';
import { generateRandomLevel } from './randomLevelGenerator.js';

type SessionStats = {
  turnsTotal: number;
  turnsLevel: number;
  retries: number;
  zoomLevel: number;
  dead: boolean;
  mode: 'normal' | 'procedural';
  goldTotal: number;
  goldLevel: number;
};

type GoldType = {
  id: string;
  minValue: number;
  maxValue: number;
  image: string;
};

const goldTypes: GoldType[] = [
  { id: 'g1', minValue: 1, maxValue: 1, image: 'gold-1.png' },
  { id: 'g2', minValue: 2, maxValue: 5, image: 'gold-2.png' },
  { id: 'g3', minValue: 5, maxValue: 15, image: 'gold-3.png' },
  { id: 'g4', minValue: 10, maxValue: 25, image: 'gold-4.png' },
  { id: 'g5', minValue: 20, maxValue: 35, image: 'gold-5.png' },
  { id: 'g6', minValue: 30, maxValue: 50, image: 'gold-6.png' },
  { id: 'g7', minValue: 40, maxValue: 65, image: 'gold-7.png' },
  { id: 'g8', minValue: 55, maxValue: 80, image: 'gold-8.png' },
  { id: 'g9', minValue: 70, maxValue: 90, image: 'gold-9.png' },
  { id: 'g10', minValue: 85, maxValue: 100, image: 'gold-10.png' }
];

(() => {
  // Helper functions
  const isMobileScreen = () => {
    return window.matchMedia('(max-width: 767px)').matches;
  };
  const handleKeyboardConfirm = (e?: KeyboardEvent) => (e && (e.key === 'Enter' || e.key === ' ')) || !e;

  // --- Gold Pickup, Success, and Gold Summary Sound Effect Helpers (with audio pool for mobile reliability) ---
  const goldPickupAudioPool = {
    'pickup-1': Array.from({ length: 4 }, () => new Audio('sfx/pickup-1.mp3')),
    'pickup-2': Array.from({ length: 2 }, () => new Audio('sfx/pickup-2.mp3'))
  };
  let goldPickupAudioIndex = { 'pickup-1': 0, 'pickup-2': 0 };

  const successAudioPool = Array.from({ length: 2 }, () => new Audio('sfx/success-1.mp3'));
  let successAudioIndex = 0;

  const goldSummaryAudioPool = Array.from({ length: 2 }, () => new Audio('sfx/gold-summary.mp3'));
  let goldSummaryAudioIndex = 0;

  const dieAudioPool = Array.from({ length: 2 }, () => new Audio('sfx/die.mp3'));
  let dieAudioIndex = 0;

  // --- Walk Sound Effect Helper (with audio pool for mobile reliability) ---
  const walkAudioPool = Array.from({ length: 3 }, () => new Audio('sfx/walk.mp3'));
  let walkAudioIndex = 0;
  const playWalkSound = () => {
    const audio = walkAudioPool[walkAudioIndex];
    audio.currentTime = 0;
    audio.volume = 0.5;
    audio.play().catch(() => {});
    walkAudioIndex = (walkAudioIndex + 1) % walkAudioPool.length;
  };

  const playGoldPickupSound = (goldType: string) => {
    const soundKey: 'pickup-1' | 'pickup-2' = ['g8', 'g9', 'g10'].includes(goldType) ? 'pickup-2' : 'pickup-1';
    const pool = goldPickupAudioPool[soundKey];
    let idx = goldPickupAudioIndex[soundKey];
    const audio = pool[idx];
    // Reset audio if needed
    audio.currentTime = 0;
    audio.volume = 0.7;
    audio.play().catch(() => {}); // Ignore play errors
    goldPickupAudioIndex[soundKey] = (idx + 1) % pool.length;
  };

  const playSuccessSound = () => {
    const audio = successAudioPool[successAudioIndex];
    audio.currentTime = 0;
    audio.volume = 1;
    audio.play().catch(() => {});
    successAudioIndex = (successAudioIndex + 1) % successAudioPool.length;
  };

  const playGoldSummarySound = () => {
    const audio = goldSummaryAudioPool[goldSummaryAudioIndex];
    audio.currentTime = 0;
    audio.volume = 0.5;
    audio.play().catch(() => {});
    goldSummaryAudioIndex = (goldSummaryAudioIndex + 1) % goldSummaryAudioPool.length;
    return audio;
  };
  const stopGoldSummarySound = (audio: HTMLAudioElement) => {
    audio.pause();
    audio.currentTime = 0;
  };

  const playDieSound = () => {
    const audio = dieAudioPool[dieAudioIndex];
    audio.currentTime = 0;
    audio.volume = 0.8;
    audio.play().catch(() => {});
    dieAudioIndex = (dieAudioIndex + 1) % dieAudioPool.length;
  };

  // --- UI Button Sound Effects (with audio pool for mobile reliability) ---
  const buttonClickAudioPool = Array.from({ length: 3 }, () => new Audio('sfx/button-click.mp3'));
  let buttonClickAudioIndex = 0;
  const playButtonClickSound = () => {
    const audio = buttonClickAudioPool[buttonClickAudioIndex];
    audio.currentTime = 0;
    audio.volume = 0.7;
    audio.play().catch(() => {});
    buttonClickAudioIndex = (buttonClickAudioIndex + 1) % buttonClickAudioPool.length;
  };

  const uiHoverAudioPool = Array.from({ length: 3 }, () => new Audio('sfx/ui-hover.mp3'));
  let uiHoverAudioIndex = 0;
  const playUIHoverSound = () => {
    const audio = uiHoverAudioPool[uiHoverAudioIndex];
    audio.currentTime = 0;
    audio.volume = 0.7;
    audio.play().catch(() => {});
    uiHoverAudioIndex = (uiHoverAudioIndex + 1) % uiHoverAudioPool.length;
  };

  // Attach global event listeners for button click and hover sounds
  document.addEventListener('pointerdown', (e) => {
    const target = e.target as HTMLElement;
    if (target && target.classList.contains('btn')) {
      playButtonClickSound();
    }
  });
  document.addEventListener('keydown', (e) => {
    // Play click sound for keyboard activation (Enter/Space) on .btn
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement && document.activeElement.classList.contains('btn')) {
      playButtonClickSound();
    }
  });
  document.addEventListener(
    'pointerenter',
    (e) => {
      const target = e.target as HTMLElement;
      if (target && target.classList.contains('btn')) {
        playUIHoverSound();
      }
    },
    true
  );
  document.addEventListener('focusin', (e) => {
    const target = e.target as HTMLElement;
    if (target && target.classList.contains('btn')) {
      playUIHoverSound();
    }
  });

  // Game variables
  let currentLevel = 0;
  let levelStore: any[] = [];
  let enemies: any[] = [];
  let enemyCounter = 0;
  let goldPieces: any[] = [];
  let goldCounter = 0;
  let collectedGold: { value: number; type: string }[] = [];
  let player: Player;
  let viewingGoal = false;
  let options = {
    centerMode: false
  };
  let sessionStats: SessionStats = {
    turnsTotal: 0,
    turnsLevel: 0,
    retries: 0,
    zoomLevel: isMobileScreen() ? 3 : 4, // Start zoomed out more on mobile, to help fit more of the level on-screen
    dead: false,
    mode: 'normal',
    goldTotal: 0,
    goldLevel: 0
  };

  // Touch controls variables
  let xDown: number | null = null;
  let yDown: number | null = null;

  // Style overrides block
  const overrides = document.createElement('style');
  const zoomLevelStyle = document.createElement('style');
  const stylePlayer = document.createElement('style');
  const goldStyles = document.createElement('style'); // A single style element for all gold
  document.querySelector('head')?.appendChild(overrides);
  document.querySelector('head')?.appendChild(zoomLevelStyle);
  document.querySelector('head')?.appendChild(stylePlayer);
  document.querySelector('head')?.appendChild(goldStyles);

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

  class Gold {
    constructor(
      public elem: HTMLElement,
      public id: number,
      public pos: number[],
      public type: string,
      public value: number
    ) {} // Removed stylePos from Gold
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
      this.elem = null as any; // Clear element reference
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
    // Reset game state before starting a new game
    levelStore = [];
    enemies = [];
    goldPieces = [];
    currentLevel = 0;
    enemyCounter = 0;
    goldCounter = 0;

    // Reset session stats
    sessionStats.turnsTotal = 0;
    sessionStats.turnsLevel = 0;
    sessionStats.retries = 0;
    sessionStats.dead = false;
    sessionStats.goldTotal = 0;
    sessionStats.goldLevel = 0;
    collectedGold = [];

    // Reset player object if it exists
    if (player) {
      player.reset();
    }

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

    // Add tabindex for keyboard navigation
    btnStartNormal.setAttribute('tabindex', '0');
    btnStartProcudural.setAttribute('tabindex', '0');

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

    // Store buttons in an array for keyboard navigation
    const buttons = [btnStartNormal, btnStartProcudural];
    let currentFocusIndex = 0;

    // Add keyboard navigation between buttons
    const handleKeyNavigation = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'Up') {
        e.preventDefault();
        currentFocusIndex = (currentFocusIndex - 1 + buttons.length) % buttons.length;
        buttons[currentFocusIndex].focus();
      } else if (e.key === 'ArrowDown' || e.key === 'Down') {
        e.preventDefault();
        currentFocusIndex = (currentFocusIndex + 1) % buttons.length;
        buttons[currentFocusIndex].focus();
      }
    };

    // Add keyboard navigation event listeners to each button
    buttons.forEach((button) => {
      button.addEventListener('keydown', handleKeyNavigation);
    });

    setTimeout(() => {
      titleContainer.classList.add('show');
      // Focus on the Normal Game button
      btnStartNormal.focus();
    }, 150);

    const closeTitlescreen = () => {
      // Remove keyboard navigation event listeners
      buttons.forEach((button) => {
        button.removeEventListener('keydown', handleKeyNavigation);
      });

      background?.classList.remove('titlescreen');
      titleContainer.classList.remove('show');

      setTimeout(() => {
        uiElem.removeChild(titleContainer);
        background?.removeChild(uiElem);
      }, 1000);
    };

    const handleStartButton = (gameMode: 'normal' | 'procedural', e?: KeyboardEvent) => {
      if (handleKeyboardConfirm(e)) {
        closeTitlescreen();
        sessionStats.mode = gameMode;
        beginGame();
      }
    };

    btnStartNormal.addEventListener('click', () => handleStartButton('normal'));
    btnStartNormal.addEventListener('keydown', (e) => handleStartButton('normal', e));
    btnStartProcudural.addEventListener('click', () => handleStartButton('procedural'));
    btnStartProcudural.addEventListener('keydown', (e) => handleStartButton('procedural', e));
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
      switchCameraBtn = document.createElement('div'),
      backButton = document.createElement('div');
    let levelRows;

    grid.id = 'game-grid';

    uiElem.id = 'ui-display';
    messageWindow.id = 'message';

    // Create level indicator
    const levelIndicator = document.createElement('div');
    levelIndicator.id = 'level-indicator';
    levelIndicator.textContent = `Level ${currentLevel + 1}`;

    // Create gold counter
    const goldCounterElement = document.createElement('div');
    goldCounterElement.id = 'gold-counter';
    goldCounterElement.textContent = `Gold: ${sessionStats.goldTotal}`;

    // Create back button
    backButton.id = 'back-button';
    backButton.setAttribute('tabindex', '0');
    backButton.setAttribute('title', 'Return to Title Screen');

    zoomButtons.id = 'zoom-container';
    zoomUp.id = 'zoom-up';
    zoomUp.textContent = '+';
    zoomUp.setAttribute('tabindex', '0');

    zoomDown.id = 'zoom-down';
    zoomDown.textContent = '-';
    zoomDown.setAttribute('tabindex', '0');

    showGoalBtn.id = 'show-goal';
    showGoalBtn.setAttribute('tabindex', '0');

    switchCameraBtn.id = 'switch-camera';
    switchCameraBtn.setAttribute('tabindex', '0');

    // Initialize level storage
    if (levelStore.length === currentLevel) {
      // If we're in a NEW level, add new arrays
      levelStore.splice(currentLevel, 0, [new Array()]); // Create new array in the appropriate place.. may not work right, have to revisit
      enemies.splice(currentLevel, 0, new Array());
      goldPieces.splice(currentLevel, 0, new Array());
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
            elemCell.classList.add('floor');
            elemCell.classList.add('goal');

            levelStore[currentLevel][rowIndex][cellIndex].type = 'floor';
            levelStore[currentLevel][rowIndex][cellIndex].inside.push('stairsDown');
            break;
          default:
            const goldType = goldTypes.find((g) => g.id === cell);
            if (goldType) {
              goldCounter++;
              const goldValue = Math.floor(Math.random() * (goldType.maxValue - goldType.minValue + 1)) + goldType.minValue;
              goldPieces[currentLevel].push(new Gold(elemCell, goldCounter, [rowIndex, cellIndex], goldType.id, goldValue));

              elemCell.classList.add('floor');
              elemCell.classList.add('gold');
              elemCell.classList.add('gold-' + goldCounter);
              elemCell.classList.add(goldType.id); // Add the specific gold type class (e.g., 'g1', 'g2')

              levelStore[currentLevel][rowIndex][cellIndex].type = 'floor';
              levelStore[currentLevel][rowIndex][cellIndex].inside.push('gold');
            } else {
              elemCell.classList.add('floor');
              levelStore[currentLevel][rowIndex][cellIndex].type = 'floor';
            }
            break;
        }
      }
    }

    background?.appendChild(uiElem);
    uiElem.appendChild(levelIndicator);
    uiElem.appendChild(goldCounterElement);
    uiElem.appendChild(backButton);
    uiElem.appendChild(zoomButtons);
    uiElem.appendChild(messageWindow);
    zoomButtons.appendChild(switchCameraBtn);
    zoomButtons.appendChild(showGoalBtn);
    zoomButtons.appendChild(zoomUp);
    zoomButtons.appendChild(zoomDown);
    background?.appendChild(grid);

    renderPlayer(player.pos);
    renderGoldPieces();
    drawDecorations();
    centerPlayerInScreen();

    setTimeout(() => {
      grid.classList.add('show');
    }, 300);

    const handleBackBtn = (e?: KeyboardEvent) => {
      if (handleKeyboardConfirm(e)) {
        showMessageBox(
          'Abandon the current game and return to the Title Screen?',
          [
            { text: 'Confirm', action: () => backToTitleScreen() },
            { text: 'Cancel', action: () => {} }
          ],
          'inline'
        );
      }
    };

    // Button events
    backButton.addEventListener('click', () => handleBackBtn());
    backButton.addEventListener('keydown', (e) => handleBackBtn(e));

    const handleSwitchCameraBtn = (e?: KeyboardEvent) => {
      if (handleKeyboardConfirm(e)) {
        toggleCenterMode();
      }
    };

    switchCameraBtn.addEventListener('click', () => handleSwitchCameraBtn());
    switchCameraBtn.addEventListener('keydown', (e) => handleSwitchCameraBtn(e));

    const handleShowGoalBtn = (e?: KeyboardEvent) => {
      if (handleKeyboardConfirm(e)) {
        showGoal();
      }
    };

    showGoalBtn.addEventListener('click', () => handleShowGoalBtn());
    showGoalBtn.addEventListener('keydown', (e) => handleShowGoalBtn(e));

    const changeZoom = (type: 'up' | 'down', e?: KeyboardEvent) => {
      // Don't allow zoom below 1
      if (type === 'up' || (type === 'down' && sessionStats.zoomLevel > 1)) {
        // Verify keys if we're consuming a keyboard event
        if (handleKeyboardConfirm(e)) {
          grid.classList.add('instant-camera'); // Move characters and game grid instantly during zoom

          type === 'up' ? sessionStats.zoomLevel++ : sessionStats.zoomLevel--;
          zoomLevelStyle.innerHTML = '#display-wrapper #game-grid .row .cell {height: ' + sessionStats.zoomLevel * 8 + 'px !important; width: ' + sessionStats.zoomLevel * 8 + 'px !important;}';
          renderPlayer(player.pos);
          renderEnemies();
          renderGoldPieces();
          viewingGoal ? centerOnGoal() : centerPlayerInScreen();

          setTimeout(() => {
            grid.classList.remove('instant-camera');
          }, 20);
        }
      }
    };

    zoomUp.addEventListener('click', () => changeZoom('up'));
    zoomUp.addEventListener('keydown', (e) => changeZoom('up', e));
    zoomDown.addEventListener('click', () => changeZoom('down'));
    zoomDown.addEventListener('keydown', (e) => changeZoom('down', e));

    // Start with camera centered immediately at the goal
    grid.classList.add('instant-camera');
    showGoal();

    // Slow pan across the level showing the goal and ending on the player when starting a new level
    setTimeout(() => {
      grid.classList.remove('instant-camera');
      grid.classList.add('slow-pan');
      centerPlayerInScreen();
    }, 20);

    // After pan is finished, remove slow pan class
    setTimeout(() => {
      grid.classList.remove('slow-pan');
    }, 2500);
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

  const centerOnGoal = () => {
    let top,
      left,
      goal: HTMLElement = document.querySelector('.goal')!;

    top = goal?.offsetTop * -1 - sessionStats.zoomLevel * 4 + window.innerHeight / 2;
    left = goal?.offsetLeft * -1 - sessionStats.zoomLevel * 4 + window.innerWidth / 2;

    overrides.innerHTML = '#display-wrapper #game-grid {top: ' + top + 'px; left: ' + left + 'px;}';
    viewingGoal = true;
  };

  const showGoal = () => {
    if (viewingGoal) {
      centerPlayerInScreen();
      viewingGoal = false;
    } else {
      centerOnGoal();
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
      // Check for gold collection
      if (levelStore[currentLevel][newPos[0]][newPos[1]].inside.indexOf('gold') > -1) {
        collectGoldAt(newPos);
      }

      // Play walk sound effect
      playWalkSound();

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
    // Subtract current level gold from total gold
    sessionStats.goldTotal -= sessionStats.goldLevel;

    // Reset player
    player.reset();

    // Clean up enemies and gold
    cleanupEnemyStyles(currentLevel);
    enemies.splice(currentLevel, 1);
    goldPieces.splice(currentLevel, 1);
    enemyCounter = 0;
    goldCounter = 0;

    // Reset level store
    levelStore.splice(currentLevel, 1);

    // Redraw and fix up level values
    refreshScreen();
    sessionStats.turnsLevel = 0;
    sessionStats.goldLevel = 0;
    sessionStats.dead = false;
    sessionStats.retries += 1;
    collectedGold = [];
  };

  const refreshScreen = () => {
    eraseScreen();

    if (sessionStats.mode === 'normal') {
      drawScreen(levelData[currentLevel]);
    } else {
      const levelSize = 40 + currentLevel * 5; // Bigger levels the higher you go
      drawScreen(generateRandomLevel(currentLevel, levelSize, levelSize));
    }
  };

  const eraseScreen = (titleScreen?: boolean) => {
    let background = document.querySelector('#display-wrapper'),
      grid = document.querySelector('#game-grid'),
      ui = document.querySelector('#ui-display');

    background?.removeChild(ui!);
    background?.removeChild(grid!);
  };

  const goToNewLevel = (newLevel: number) => {
    sessionStats.turnsLevel = 0;
    sessionStats.goldLevel = 0;
    enemyCounter = 0;
    goldCounter = 0;
    collectedGold = [];

    // Erase screen
    eraseScreen();

    // Clean up enemy style elements in head
    try {
      cleanupEnemyStyles(currentLevel);
    } catch (error) {
      // Error happens when using newGame since arrays are already deleted. Revisit.
    }

    currentLevel = newLevel;

    // Check game mode to load the correct level type
    if (sessionStats.mode === 'normal') {
      drawScreen(levelData[newLevel]);
    } else {
      const levelSize = 40 + currentLevel * 5; // Bigger levels the higher you go
      drawScreen(generateRandomLevel(currentLevel, 40 + levelSize, 40 + levelSize));
    }
  };

  const newGame = () => {
    levelStore.length = 0; // Wipe out the levelStore

    cleanupEnemyStyles(currentLevel);
    enemies.length = 0; // Erase all the enemies
    goldPieces.length = 0; // Erase all the gold

    sessionStats.turnsTotal = 0; // Reset total turns
    sessionStats.goldTotal = 0; // Reset total gold
    goToNewLevel(0); // Go to level 1
  };

  const backToTitleScreen = () => {
    cleanupEnemyStyles(currentLevel);

    // Erase the screen
    eraseScreen();

    // Draw the title screen
    setTimeout(() => {
      drawTitleScreen();
    }, 50);
  };

  const showMessageBox = (messageText: string, buttons: Array<{ text: string; action: () => void }>, layout: 'vertical' | 'inline' = 'vertical') => {
    const messageBox = document.querySelector('#message');
    const message = document.createElement('p');
    const buttonElements: HTMLElement[] = [];

    message.innerHTML = messageText;

    messageBox?.appendChild(message);
    messageBox?.classList.add('top');

    // Add layout class to message box
    if (layout === 'inline') {
      messageBox?.classList.add('inline-buttons');
    } else {
      messageBox?.classList.remove('inline-buttons');
    }

    // Create button wrapper for inline layout
    const buttonWrapper = layout === 'inline' ? document.createElement('div') : null;
    if (buttonWrapper) {
      buttonWrapper.classList.add('button-wrapper');
      messageBox?.appendChild(buttonWrapper);
    }

    // Create buttons
    buttons.forEach((buttonConfig) => {
      const button = document.createElement('a');
      button.classList.add('btn');
      button.textContent = buttonConfig.text;
      button.setAttribute('tabindex', '0');

      const closeAndExecute = (e?: KeyboardEvent) => {
        if (handleKeyboardConfirm(e)) {
          closeMessageWindow();
          setTimeout(() => {
            buttonConfig.action();
          }, 360);
        }
      };

      button.addEventListener('click', () => closeAndExecute());
      button.addEventListener('keydown', (e) => closeAndExecute(e));

      buttonElements.push(button);
      (buttonWrapper || messageBox)?.appendChild(button);
    });

    const closeMessageWindow = () => {
      buttonElements.forEach((btn) => {
        btn.removeEventListener('keydown', handleKeyNavigation);
      });
      messageBox?.classList.remove('show');
      setTimeout(() => {
        messageBox?.classList.remove('top');
        messageBox?.classList.remove('inline-buttons');
        messageBox?.removeChild(message);
        if (buttonWrapper && messageBox?.contains(buttonWrapper)) {
          messageBox?.removeChild(buttonWrapper);
        } else {
          buttonElements.forEach((btn) => {
            if (messageBox?.contains(btn)) {
              messageBox?.removeChild(btn);
            }
          });
        }
      }, 360);
    };

    let currentFocusIndex = 0;

    const handleKeyNavigation = (e: KeyboardEvent) => {
      const prevKeys = layout === 'inline' ? ['ArrowLeft', 'Left'] : ['ArrowUp', 'Up'];
      const nextKeys = layout === 'inline' ? ['ArrowRight', 'Right'] : ['ArrowDown', 'Down'];

      if (prevKeys.includes(e.key)) {
        e.preventDefault();
        currentFocusIndex = (currentFocusIndex - 1 + buttonElements.length) % buttonElements.length;
        buttonElements[currentFocusIndex].focus();
      } else if (nextKeys.includes(e.key)) {
        e.preventDefault();
        currentFocusIndex = (currentFocusIndex + 1) % buttonElements.length;
        buttonElements[currentFocusIndex].focus();
      }
    };

    buttonElements.forEach((button) => {
      button.addEventListener('keydown', handleKeyNavigation);
    });

    messageBox?.classList.add('show');

    setTimeout(() => {
      buttonElements[0].focus();
      currentFocusIndex = 0;
    }, 100);
  };

  const displayVictoryMessage = () => {
    playSuccessSound();
    const messageBox = document.querySelector('#message');
    const goldDisplay = document.createElement('div');
    const goldText = document.createElement('div');
    const goldVisual = document.createElement('div');
    const message = document.createElement('p');
    const btnPlayAgain = document.createElement('a');
    const btnNextLevel = document.createElement('a');

    // Setup gold display
    goldDisplay.className = 'gold-display';
    goldText.className = 'gold-text';
    goldText.textContent = `Gold found: 0`;
    goldVisual.className = 'gold-visual';

    goldDisplay.appendChild(goldText);
    goldDisplay.appendChild(goldVisual);

    // This function closes the message window and removes the buttons.
    const closeMessageWindow = () => {
      // Remove keyboard navigation event listeners
      buttons.forEach((button) => {
        button.removeEventListener('keydown', handleKeyNavigation);
      });

      messageBox?.classList.remove('show');
      setTimeout(() => {
        messageBox?.classList.remove('top');
        messageBox?.removeChild(goldDisplay);
        messageBox?.removeChild(message);
        messageBox?.removeChild(btnPlayAgain);
        if (messageBox?.contains(btnNextLevel)) {
          messageBox?.removeChild(btnNextLevel);
        }
      }, 360);
    };

    const playAgainOrNewGame = () => {
      if (sessionStats.mode === 'normal' && levelData.length === currentLevel + 1) {
        setTimeout(() => {
          newGame();
        }, 360); // Start a new game if it was the last level
      } else {
        setTimeout(() => {
          retryLevel();
        }, 360); // Otherwise, just retry the current level
      }
    };

    // Configure the "Play again" / "New Game" button
    btnPlayAgain.classList.add('btn');
    btnPlayAgain.textContent = 'Play again';
    btnPlayAgain.setAttribute('tabindex', '0');

    const handleBtnPlayAgain = (e?: KeyboardEvent) => {
      if (handleKeyboardConfirm(e)) {
        closeMessageWindow();
        playAgainOrNewGame();
      }
    };
    btnPlayAgain.addEventListener('click', () => handleBtnPlayAgain());
    btnPlayAgain.addEventListener('keydown', (e) => handleBtnPlayAgain(e));

    // Configure the "Next Level" button
    btnNextLevel.classList.add('btn');
    btnNextLevel.textContent = 'Go to level ' + (currentLevel + 2);
    btnNextLevel.setAttribute('tabindex', '0');

    const handleNextLevelBtn = (e?: KeyboardEvent) => {
      if (handleKeyboardConfirm(e)) {
        closeMessageWindow();
        setTimeout(() => {
          goToNewLevel(currentLevel + 1);
        }, 360);
      }
    };
    btnNextLevel.addEventListener('click', () => handleNextLevelBtn());
    btnNextLevel.addEventListener('keydown', (e) => handleNextLevelBtn(e));

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
          ' turns and beat the game in ' +
          sessionStats.turnsTotal +
          ' turns with ' +
          sessionStats.goldTotal +
          ' total gold. Good job!';
      } else {
        message.innerHTML =
          'You win! You beat the game.<br /><br />You completed level ' +
          (currentLevel + 1) +
          ' in ' +
          sessionStats.turnsLevel +
          ' turns and beat the game in ' +
          sessionStats.turnsTotal +
          ' turns with ' +
          sessionStats.goldTotal +
          ' total gold, with ' +
          sessionStats.retries +
          ' retries. Good job!';
      }
      btnPlayAgain.textContent = 'Start a new game';
    }

    // Create "Back to Title Screen" button
    const btnBackToTitle = document.createElement('a');
    btnBackToTitle.classList.add('btn');
    btnBackToTitle.textContent = 'Back to Title Screen';
    btnBackToTitle.setAttribute('tabindex', '0');

    const handleBackToTitleScreen = (e?: KeyboardEvent) => {
      if (handleKeyboardConfirm(e)) {
        closeMessageWindow();
        setTimeout(() => {
          backToTitleScreen();
        }, 360);
      }
    };
    btnBackToTitle.addEventListener('click', () => handleBackToTitleScreen());
    btnBackToTitle.addEventListener('keydown', (e) => handleBackToTitleScreen(e));

    // Add the elements to the message box
    messageBox?.appendChild(goldDisplay);
    messageBox?.appendChild(message);
    messageBox?.appendChild(btnPlayAgain);

    // Animate gold pieces
    const sortedGold = [...collectedGold].sort((a, b) => a.value - b.value);
    let runningTotal = 0;
    // Play gold summary sound effect while animating gold
    const goldSummaryAudio = playGoldSummarySound();
    sortedGold.forEach((gold, index) => {
      setTimeout(
        () => {
          runningTotal += gold.value;
          goldText.textContent = `Gold found: ${runningTotal}`;
          const goldPiece = document.createElement('div');
          goldPiece.className = `gold-piece ${gold.type}`;
          goldPiece.style.cssText = `margin-left: ${index > 0 ? '-12px' : '0px'}; z-index: ${100 + index};`;
          goldVisual.appendChild(goldPiece);
        },
        300 + index * 200
      );
    });
    // Stop gold summary sound after animation finishes
    if (sortedGold.length > 0) {
      setTimeout(
        () => {
          stopGoldSummarySound(goldSummaryAudio);
        },
        300 + (sortedGold.length - 1) * 200 + 400
      );
    } else {
      setTimeout(() => {
        stopGoldSummarySound(goldSummaryAudio);
      }, 700);
    }

    // Add the "Next Level" button if it's not the last level in normal mode, or for any procedural level.
    if (sessionStats.mode === 'procedural' || (sessionStats.mode === 'normal' && levelData.length > currentLevel + 1)) {
      messageBox?.appendChild(btnNextLevel);
    }

    // Add the "Back to Title Screen" button
    messageBox?.appendChild(btnBackToTitle);

    // Create an array of buttons for keyboard navigation
    const buttons = [btnPlayAgain];
    if (sessionStats.mode === 'procedural' || (sessionStats.mode === 'normal' && levelData.length > currentLevel + 1)) {
      buttons.push(btnNextLevel);
    }
    buttons.push(btnBackToTitle);

    let currentFocusIndex = 0;

    // Add keyboard navigation between buttons
    const handleKeyNavigation = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'Up') {
        e.preventDefault();
        currentFocusIndex = (currentFocusIndex - 1 + buttons.length) % buttons.length;
        buttons[currentFocusIndex].focus();
      } else if (e.key === 'ArrowDown' || e.key === 'Down') {
        e.preventDefault();
        currentFocusIndex = (currentFocusIndex + 1) % buttons.length;
        buttons[currentFocusIndex].focus();
      }
    };

    // Add keyboard navigation event listeners to each button
    buttons.forEach((button) => {
      button.addEventListener('keydown', handleKeyNavigation);
    });

    // Show the message box
    messageBox?.classList.add('top');
    messageBox?.classList.add('show');

    // Focus on the Next Level button if it exists, otherwise focus on Play Again button
    const focusDelay = Math.max(100, sortedGold.length * 100 + 200);
    if (messageBox?.contains(btnNextLevel)) {
      setTimeout(() => {
        btnNextLevel.focus();
        currentFocusIndex = buttons.indexOf(btnNextLevel);
      }, focusDelay);
    } else {
      setTimeout(() => {
        btnPlayAgain.focus();
        currentFocusIndex = 0;
      }, focusDelay);
    }
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
    playDieSound();

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
    button.setAttribute('tabindex', '0');

    const closeMessageWindow = () => {
      // Remove keyboard navigation event listeners
      buttons.forEach((btn) => {
        btn.removeEventListener('keydown', handleKeyNavigation);
      });

      messageBox?.classList.remove('show');
      setTimeout(() => {
        messageBox?.classList.remove('top');
        messageBox?.removeChild(message);
        messageBox?.removeChild(button);
        if (messageBox?.contains(btnBackToTitle)) {
          messageBox?.removeChild(btnBackToTitle);
        }
        // Reset gameboard
        retryLevel();
      }, 360);
    };

    const handleCloseBtn = (e?: KeyboardEvent) => {
      if (handleKeyboardConfirm(e)) {
        closeMessageWindow();
      }
    };
    button.addEventListener('click', () => handleCloseBtn());
    button.addEventListener('keydown', (e) => handleCloseBtn(e));

    // Create "Back to Title Screen" button
    const btnBackToTitle = document.createElement('a');
    btnBackToTitle.classList.add('btn');
    btnBackToTitle.textContent = 'Back to Title Screen';
    btnBackToTitle.setAttribute('tabindex', '0');

    const handleBackToTitleBtn = (e?: KeyboardEvent) => {
      if (handleKeyboardConfirm(e)) {
        closeMessageWindow();
        setTimeout(() => {
          backToTitleScreen();
        }, 360);
      }
    };
    btnBackToTitle.addEventListener('click', () => handleBackToTitleBtn());
    btnBackToTitle.addEventListener('keydown', (e) => handleBackToTitleBtn(e));

    messageBox?.appendChild(message);
    messageBox?.appendChild(button);
    messageBox?.appendChild(btnBackToTitle);

    // Create an array of buttons for keyboard navigation
    const buttons = [button, btnBackToTitle];
    let currentFocusIndex = 0;

    // Add keyboard navigation between buttons
    const handleKeyNavigation = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'Up') {
        e.preventDefault();
        currentFocusIndex = (currentFocusIndex - 1 + buttons.length) % buttons.length;
        buttons[currentFocusIndex].focus();
      } else if (e.key === 'ArrowDown' || e.key === 'Down') {
        e.preventDefault();
        currentFocusIndex = (currentFocusIndex + 1) % buttons.length;
        buttons[currentFocusIndex].focus();
      }
    };

    // Add keyboard navigation event listeners to each button
    buttons.forEach((btn) => {
      btn.addEventListener('keydown', handleKeyNavigation);
    });

    messageBox?.classList.add('top');
    messageBox?.classList.add('show');

    // Focus on the Try Again button
    setTimeout(() => {
      button.focus();
      currentFocusIndex = 0;
    }, 100);
  };

  /**
   * Rewritten to generate all gold piece positioning styles at once
   * into a single <style> element for much better performance.
   */
  const renderGoldPieces = () => {
    let allGoldStyles = '';
    for (let goldIndex = 0; goldIndex < goldPieces[currentLevel].length; goldIndex++) {
      const goldObj = goldPieces[currentLevel][goldIndex];
      const pos = goldObj.pos;
      const tileSize = sessionStats.zoomLevel * 8;
      allGoldStyles += `
        #display-wrapper #game-grid .row .cell.floor.gold-${goldObj.id}::after {
          top: ${pos[0] * tileSize}px;
          left: ${pos[1] * tileSize}px;
          height: ${tileSize}px;
          width: ${tileSize}px;
        }
      `;
    }
    goldStyles.innerHTML = allGoldStyles;
  };

  const showGoldCollectionText = (pos: number[], value: number) => {
    const textElement = document.createElement('div');
    const tileSize = sessionStats.zoomLevel * 8;

    // Add the class and the data-attribute that the CSS will use.
    textElement.classList.add('gold-text-animation');
    textElement.setAttribute('data-gold-value', `+${value}`);

    // Apply dynamic styles directly to the element.
    // The animation and other static styles should be in your main CSS file.
    textElement.style.top = `${pos[0] * tileSize}px`;
    textElement.style.left = `${pos[1] * tileSize}px`;
    textElement.style.width = `${tileSize}px`;
    textElement.style.height = `${tileSize}px`;
    textElement.style.fontSize = `${Math.max(sessionStats.zoomLevel * 4, 24)}px`;

    // Add the new element to the grid.
    document.querySelector('#game-grid')?.appendChild(textElement);

    // Remove the element after the animation finishes.
    setTimeout(() => {
      textElement.parentNode?.removeChild(textElement);
    }, 1000);
  };

  const collectGoldAt = (pos: number[]) => {
    const cell = levelStore[currentLevel][pos[0]][pos[1]];

    for (let i = 0; i < goldPieces[currentLevel].length; i++) {
      const goldObj = goldPieces[currentLevel][i];
      if (goldObj.pos[0] === pos[0] && goldObj.pos[1] === pos[1]) {
        showGoldCollectionText(pos, goldObj.value);

        // Play gold pickup sound effect
        playGoldPickupSound(goldObj.type);

        collectedGold.push({ value: goldObj.value, type: goldObj.type });
        sessionStats.goldLevel += goldObj.value;
        sessionStats.goldTotal += goldObj.value;

        const goldCounterElem = document.querySelector('#gold-counter');
        if (goldCounterElem) {
          goldCounterElem.textContent = `Gold: ${sessionStats.goldTotal}`;
        }

        cell.inside.splice(cell.inside.indexOf('gold'), 1);
        cell.elem.classList.remove('gold');
        cell.elem.classList.remove('gold-' + goldObj.id);
        cell.elem.classList.remove(goldObj.type); // Remove the type class

        goldPieces[currentLevel].splice(i, 1);
        renderGoldPieces(); // Re-render the positioning styles for remaining gold
        break;
      }
    }
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
    const keyList = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowDown', 'ArrowLeft', '.', 'Up', 'Right', 'Down', 'Left', 'Spacebar'];

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
