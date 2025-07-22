// Generated: Tuesday, July 22, 2025 at 05:13:48 PM EDT
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { levelData } from './levels.js';
import { generateRandomLevel } from './randomLevelGenerator.js';
const goldTypes = [
    { id: 'g1', minValue: 1, maxValue: 1, image: 'gold-1.png' },
    { id: 'g2', minValue: 2, maxValue: 5, image: 'gold-2.png' },
    { id: 'g3', minValue: 5, maxValue: 15, image: 'gold-3.png' },
    { id: 'g4', minValue: 15, maxValue: 20, image: 'gold-4.png' },
    { id: 'g5', minValue: 20, maxValue: 30, image: 'gold-5.png' },
    { id: 'g6', minValue: 30, maxValue: 50, image: 'gold-6.png' },
    { id: 'g7', minValue: 50, maxValue: 60, image: 'gold-7.png' },
    { id: 'g8', minValue: 60, maxValue: 70, image: 'gold-8.png' },
    { id: 'g9', minValue: 70, maxValue: 85, image: 'gold-9.png' },
    { id: 'g10', minValue: 85, maxValue: 100, image: 'gold-10.png' }
];
(() => {
    var _a, _b, _c, _d, _e;
    // Helper functions
    const isMobileScreen = () => {
        return window.matchMedia('(max-width: 767px)').matches;
    };
    const handleKeyboardConfirm = (e) => (e && (e.key === 'Enter' || e.key === ' ')) || !e;
    // --- Web Audio API Setup for High-Performance Sound ---
    // This new system replaces the old HTML5 Audio pools. It offers low-latency playback
    // crucial for responsive game audio on all devices, especially mobile.
    let audioContext;
    const audioBuffers = new Map();
    let soundsLoaded = false;
    // List of all sound assets to be loaded
    const soundAssets = [
        { name: 'pickup-1', url: 'sfx/pickup-1-alt.mp3' },
        { name: 'pickup-2', url: 'sfx/pickup-2.mp3' },
        { name: 'success', url: 'sfx/success-1.mp3' },
        { name: 'gold-summary', url: 'sfx/gold-summary.mp3' },
        { name: 'die', url: 'sfx/die.mp3' },
        { name: 'walk', url: 'sfx/walk.mp3' },
        { name: 'button-click', url: 'sfx/button-click.mp3' },
        { name: 'ui-hover', url: 'sfx/ui-hover.mp3' }
    ];
    // Initialize AudioContext on the first user gesture to comply with browser autoplay policies.
    const initAudioSystem = () => __awaiter(void 0, void 0, void 0, function* () {
        if (audioContext)
            return; // Already initialized
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            // Load all sounds in parallel
            yield Promise.all(soundAssets.map((asset) => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield fetch(asset.url);
                const arrayBuffer = yield response.arrayBuffer();
                const audioBuffer = yield audioContext.decodeAudioData(arrayBuffer);
                audioBuffers.set(asset.name, audioBuffer);
            })));
            soundsLoaded = true;
        }
        catch (error) {
            console.error('Audio system failed to initialize:', error);
            // Game can continue without sound
            soundsLoaded = false;
        }
    });
    // Generic function to play any pre-loaded sound from its buffer.
    // MODIFIED: Now returns both the source and the gain node for more control.
    const playSound = (soundName, volume = 1) => {
        if (!soundsLoaded || !audioBuffers.has(soundName) || !audioContext)
            return null;
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffers.get(soundName);
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        source.start(0);
        return { source, gainNode };
    };
    // --- Sound Effect Wrappers ---
    // These functions now use the high-performance playSound function.
    const playWalkSound = (pitchRange = 200) => {
        // Access the 'source' property from the object returned by playSound.
        const sound = playSound('walk', 0.5);
        if (sound) {
            sound.source.detune.value = Math.random() * 2 * pitchRange;
        }
    };
    const playGoldPickupSound = (goldType) => {
        const soundKey = ['g7', 'g8', 'g9', 'g10'].includes(goldType) ? 'pickup-2' : 'pickup-1';
        playSound(soundKey, 0.7);
    };
    const playSuccessSound = () => playSound('success', 1);
    const playDieSound = () => playSound('die', 0.8);
    const playButtonClickSound = () => playSound('button-click', 0.7);
    const playUIHoverSound = () => playSound('ui-hover', 0.7);
    // Special handling for the summary sound which needs to be stoppable.
    let goldSummarySound = null;
    let goldSummaryFading = false;
    const playGoldSummarySound = () => {
        goldSummarySound = playSound('gold-summary', 0.5);
    };
    const stopGoldSummarySound = () => {
        if (goldSummarySound && audioContext && !goldSummaryFading) {
            goldSummaryFading = true;
            const { source, gainNode } = goldSummarySound;
            const fadeTime = 0.3; // 300ms
            // Use the existing gainNode to fade out.
            // This ensures we're modifying the sound that's actually playing.
            gainNode.gain.cancelScheduledValues(audioContext.currentTime); // Clear any future gain changes
            gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime); // Start fade from current volume
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + fadeTime);
            // Schedule the source to stop *after* the fade is complete.
            // This prevents the abrupt cutoff sound.
            source.stop(audioContext.currentTime + fadeTime);
            // Use a timeout to reset our state variables after the sound has stopped.
            setTimeout(() => {
                goldSummarySound = null;
                goldSummaryFading = false;
            }, fadeTime * 1000);
        }
    };
    // Attach global event listeners for button click and hover sounds
    document.addEventListener('pointerdown', (e) => {
        const target = e.target;
        if (target && target.classList.contains('btn')) {
            playButtonClickSound();
        }
    });
    document.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && document.activeElement && document.activeElement.classList.contains('btn')) {
            playButtonClickSound();
        }
    });
    document.addEventListener('pointerenter', (e) => {
        const target = e.target;
        if (target && target.classList.contains('btn')) {
            playUIHoverSound();
        }
    }, true);
    document.addEventListener('focusin', (e) => {
        const target = e.target;
        if (target && target.classList.contains('btn')) {
            playUIHoverSound();
        }
    });
    // Game variables
    let currentLevel = 0;
    let levelStore = [];
    let enemies = [];
    let enemyCounter = 0;
    let goldPieces = [];
    let goldCounter = 0;
    let collectedGold = [];
    let player;
    let viewingGoal = false;
    let options = {
        centerMode: false
    };
    let sessionStats = {
        turnsTotal: 0,
        turnsLevel: 0,
        retries: 0,
        zoomLevel: isMobileScreen() ? 3 : 4,
        dead: false,
        mode: 'normal',
        goldTotal: 0,
        goldLevel: 0
    };
    // Touch controls variables
    let xDown = null;
    let yDown = null;
    // Style overrides block
    const overrides = document.createElement('style');
    const zoomLevelStyle = document.createElement('style');
    const stylePlayer = document.createElement('style');
    const goldStyles = document.createElement('style');
    const enemyStyles = document.createElement('style');
    (_a = document.querySelector('head')) === null || _a === void 0 ? void 0 : _a.appendChild(overrides);
    (_b = document.querySelector('head')) === null || _b === void 0 ? void 0 : _b.appendChild(zoomLevelStyle);
    (_c = document.querySelector('head')) === null || _c === void 0 ? void 0 : _c.appendChild(stylePlayer);
    (_d = document.querySelector('head')) === null || _d === void 0 ? void 0 : _d.appendChild(goldStyles);
    (_e = document.querySelector('head')) === null || _e === void 0 ? void 0 : _e.appendChild(enemyStyles);
    // Unit type classes
    class Enemy {
        constructor(elem, id, pos, type, health, moveTries = 0) {
            this.elem = elem;
            this.id = id;
            this.pos = pos;
            this.type = type;
            this.health = health;
            this.moveTries = moveTries;
        }
    }
    class Gold {
        constructor(elem, id, pos, type, value) {
            this.elem = elem;
            this.id = id;
            this.pos = pos;
            this.type = type;
            this.value = value;
        }
    }
    class Player {
        constructor(elem, id, pos, type, health) {
            this.elem = elem;
            this.id = id;
            this.pos = pos;
            this.type = type;
            this.health = health;
        }
        reset() {
            this.pos = [];
            this.health = 100;
            this.elem = null;
        }
    }
    // Map classes
    class Cell {
        constructor(elem, id, type, inside = []) {
            this.elem = elem;
            this.id = id;
            this.type = type;
            this.inside = inside;
        }
    }
    // Game code functions
    const beginGame = () => {
        levelStore = [];
        enemies = [];
        goldPieces = [];
        currentLevel = 0;
        enemyCounter = 0;
        goldCounter = 0;
        sessionStats.turnsTotal = 0;
        sessionStats.turnsLevel = 0;
        sessionStats.retries = 0;
        sessionStats.dead = false;
        sessionStats.goldTotal = 0;
        sessionStats.goldLevel = 0;
        collectedGold = [];
        if (player) {
            player.reset();
        }
        if (sessionStats.mode === 'normal') {
            drawScreen(levelData[0]);
        }
        else {
            drawScreen(generateRandomLevel(0, 40, 40));
        }
    };
    const drawTitleScreen = () => {
        const background = document.querySelector('#display-wrapper'), uiElem = document.createElement('div'), titleContainer = document.createElement('div'), titleHeader = document.createElement('h1'), messageWindow = document.createElement('div'), buttonContainer = document.createElement('div'), btnStartNormal = document.createElement('div'), btnStartProcudural = document.createElement('div');
        uiElem.id = 'ui-display';
        titleContainer.classList.add('titlescreen-container');
        titleHeader.classList.add('title-header');
        messageWindow.id = 'message';
        buttonContainer.classList.add('button-container');
        btnStartNormal.classList.add('btn');
        btnStartProcudural.classList.add('btn');
        btnStartNormal.setAttribute('tabindex', '0');
        btnStartProcudural.setAttribute('tabindex', '0');
        background === null || background === void 0 ? void 0 : background.classList.add('titlescreen');
        titleHeader.textContent = 'Fire Gauntlet';
        btnStartNormal.textContent = 'Start Normal Game';
        btnStartProcudural.textContent = 'Start Procedural Game';
        background === null || background === void 0 ? void 0 : background.appendChild(uiElem);
        titleContainer.appendChild(titleHeader);
        titleContainer.appendChild(buttonContainer);
        buttonContainer.appendChild(btnStartNormal);
        buttonContainer.appendChild(btnStartProcudural);
        uiElem.appendChild(messageWindow);
        uiElem.appendChild(titleContainer);
        const buttons = [btnStartNormal, btnStartProcudural];
        let currentFocusIndex = 0;
        const handleKeyNavigation = (e) => {
            if (e.key === 'ArrowUp' || e.key === 'Up') {
                e.preventDefault();
                currentFocusIndex = (currentFocusIndex - 1 + buttons.length) % buttons.length;
                buttons[currentFocusIndex].focus();
            }
            else if (e.key === 'ArrowDown' || e.key === 'Down') {
                e.preventDefault();
                currentFocusIndex = (currentFocusIndex + 1) % buttons.length;
                buttons[currentFocusIndex].focus();
            }
        };
        buttons.forEach((button, index) => {
            button.addEventListener('keydown', handleKeyNavigation);
            button.addEventListener('mouseover', () => {
                currentFocusIndex = index;
                button.focus();
            });
        });
        setTimeout(() => {
            titleContainer.classList.add('show');
            btnStartNormal.focus();
        }, 150);
        const closeTitlescreen = () => {
            buttons.forEach((button) => {
                button.removeEventListener('keydown', handleKeyNavigation);
            });
            background === null || background === void 0 ? void 0 : background.classList.remove('titlescreen');
            titleContainer.classList.remove('show');
            setTimeout(() => {
                if (uiElem.parentNode) {
                    uiElem.parentNode.removeChild(uiElem);
                }
            }, 1000);
        };
        const handleStartButton = (gameMode, e) => __awaiter(void 0, void 0, void 0, function* () {
            // Allow both mouse clicks and keyboard (Enter/Space) to trigger
            if (!e || e.type === 'click' || handleKeyboardConfirm(e)) {
                closeTitlescreen();
                sessionStats.mode = gameMode;
                beginGame();
            }
        });
        btnStartNormal.addEventListener('click', (e) => handleStartButton('normal', e), { once: true });
        btnStartNormal.addEventListener('keydown', (e) => handleStartButton('normal', e), { once: true });
        btnStartProcudural.addEventListener('click', (e) => handleStartButton('procedural', e), { once: true });
        btnStartProcudural.addEventListener('keydown', (e) => handleStartButton('procedural', e), { once: true });
    };
    const drawScreen = (selectedLevel) => {
        const background = document.querySelector('#display-wrapper'), grid = document.createElement('div'), messageWindow = document.createElement('div'), uiElem = document.createElement('div'), zoomButtons = document.createElement('div'), zoomUp = document.createElement('div'), zoomDown = document.createElement('div'), showGoalBtn = document.createElement('div'), switchCameraBtn = document.createElement('div'), backButton = document.createElement('div');
        let levelRows;
        grid.id = 'game-grid';
        uiElem.id = 'ui-display';
        messageWindow.id = 'message';
        const levelIndicator = document.createElement('div');
        levelIndicator.id = 'level-indicator';
        levelIndicator.textContent = `Level ${currentLevel + 1}`;
        const goldCounterElement = document.createElement('div');
        goldCounterElement.id = 'gold-counter';
        goldCounterElement.textContent = `Gold: ${sessionStats.goldTotal}`;
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
        if (levelStore.length === currentLevel) {
            levelStore.splice(currentLevel, 0, [new Array()]);
            enemies.splice(currentLevel, 0, new Array());
            goldPieces.splice(currentLevel, 0, new Array());
        }
        levelRows = selectedLevel.split('\n');
        for (let rowIndex = 0; rowIndex < levelRows.length; rowIndex++) {
            let levelCells = levelRows[rowIndex].split(','), elemRow = document.createElement('div');
            elemRow.classList.add('row');
            grid.appendChild(elemRow);
            levelStore[currentLevel].push(new Array());
            for (let cellIndex = 0; cellIndex < levelCells.length; cellIndex++) {
                let cell = levelCells[cellIndex], elemCell = document.createElement('div');
                elemCell.classList.add('cell');
                elemCell.id = rowIndex + '-' + cellIndex;
                elemRow.appendChild(elemCell);
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
                        elemCell.classList.add('floor', 'player');
                        levelStore[currentLevel][rowIndex][cellIndex].type = 'floor';
                        levelStore[currentLevel][rowIndex][cellIndex].inside.push('player');
                        break;
                    case 'F':
                        enemyCounter++;
                        enemies[currentLevel].push(new Enemy(elemCell, enemyCounter, [rowIndex, cellIndex], 'fire-vortex', 100));
                        elemCell.classList.add('floor', 'enemy', 'enemy-' + enemyCounter);
                        levelStore[currentLevel][rowIndex][cellIndex].type = 'floor';
                        levelStore[currentLevel][rowIndex][cellIndex].inside.push('enemy');
                        break;
                    case 'C':
                        elemCell.classList.add('floor', 'goal');
                        levelStore[currentLevel][rowIndex][cellIndex].type = 'floor';
                        levelStore[currentLevel][rowIndex][cellIndex].inside.push('stairsDown');
                        break;
                    default:
                        const goldType = goldTypes.find((g) => g.id === cell);
                        if (goldType) {
                            goldCounter++;
                            const goldValue = Math.floor(Math.random() * (goldType.maxValue - goldType.minValue + 1)) + goldType.minValue;
                            goldPieces[currentLevel].push(new Gold(elemCell, goldCounter, [rowIndex, cellIndex], goldType.id, goldValue));
                            elemCell.classList.add('floor', 'gold', 'gold-' + goldCounter, goldType.id);
                            levelStore[currentLevel][rowIndex][cellIndex].type = 'floor';
                            levelStore[currentLevel][rowIndex][cellIndex].inside.push('gold');
                        }
                        else {
                            elemCell.classList.add('floor');
                            levelStore[currentLevel][rowIndex][cellIndex].type = 'floor';
                        }
                        break;
                }
            }
        }
        background === null || background === void 0 ? void 0 : background.appendChild(uiElem);
        uiElem.appendChild(levelIndicator);
        uiElem.appendChild(goldCounterElement);
        uiElem.appendChild(backButton);
        uiElem.appendChild(zoomButtons);
        uiElem.appendChild(messageWindow);
        zoomButtons.appendChild(switchCameraBtn);
        zoomButtons.appendChild(showGoalBtn);
        zoomButtons.appendChild(zoomUp);
        zoomButtons.appendChild(zoomDown);
        background === null || background === void 0 ? void 0 : background.appendChild(grid);
        renderPlayer(player.pos);
        renderGoldPieces();
        renderEnemies();
        drawDecorations();
        centerPlayerInScreen();
        setTimeout(() => {
            grid.classList.add('show');
        }, 300);
        const handleBackBtn = (e) => {
            if (handleKeyboardConfirm(e)) {
                showMessageBox('Abandon the current game and return to the Title Screen?', [
                    { text: 'Confirm', action: () => backToTitleScreen() },
                    { text: 'Cancel', action: () => { } }
                ], 'inline');
            }
        };
        backButton.addEventListener('click', () => handleBackBtn());
        backButton.addEventListener('keydown', (e) => handleBackBtn(e));
        const handleSwitchCameraBtn = (e) => {
            if (handleKeyboardConfirm(e)) {
                toggleCenterMode();
            }
        };
        switchCameraBtn.addEventListener('click', () => handleSwitchCameraBtn());
        switchCameraBtn.addEventListener('keydown', (e) => handleSwitchCameraBtn(e));
        const handleShowGoalBtn = (e) => {
            if (handleKeyboardConfirm(e)) {
                showGoal();
            }
        };
        showGoalBtn.addEventListener('click', () => handleShowGoalBtn());
        showGoalBtn.addEventListener('keydown', (e) => handleShowGoalBtn(e));
        const changeZoom = (type, e) => {
            if (type === 'up' || (type === 'down' && sessionStats.zoomLevel > 1)) {
                if (handleKeyboardConfirm(e)) {
                    grid.classList.add('instant-camera');
                    type === 'up' ? sessionStats.zoomLevel++ : sessionStats.zoomLevel--;
                    zoomLevelStyle.innerHTML = `#display-wrapper #game-grid .row .cell {height: ${sessionStats.zoomLevel * 8}px !important; width: ${sessionStats.zoomLevel * 8}px !important;}`;
                    renderPlayer(player.pos);
                    renderEnemies();
                    renderGoldPieces();
                    viewingGoal ? centerOnGoal() : centerPlayerInScreen();
                    setTimeout(() => grid.classList.remove('instant-camera'), 20);
                }
            }
        };
        zoomUp.addEventListener('click', () => changeZoom('up'));
        zoomUp.addEventListener('keydown', (e) => changeZoom('up', e));
        zoomDown.addEventListener('click', () => changeZoom('down'));
        zoomDown.addEventListener('keydown', (e) => changeZoom('down', e));
        grid.classList.add('instant-camera');
        showGoal();
        setTimeout(() => {
            grid.classList.remove('instant-camera');
            grid.classList.add('slow-pan');
            centerPlayerInScreen();
        }, 20);
        setTimeout(() => grid.classList.remove('slow-pan'), 2500);
    };
    const drawDecorations = () => {
        var _a, _b, _c, _d;
        for (let rowStore = 0; rowStore < levelStore[currentLevel].length; rowStore++) {
            for (let cellStore = 0; cellStore < levelStore[currentLevel][rowStore].length; cellStore++) {
                let cell = levelStore[currentLevel][rowStore][cellStore];
                if (!cell || cell.type !== 'floor')
                    continue;
                const wallTop = rowStore > 0 && ((_a = levelStore[currentLevel][rowStore - 1][cellStore]) === null || _a === void 0 ? void 0 : _a.type) === 'wall';
                const wallRight = cellStore < levelStore[currentLevel][rowStore].length - 1 && ((_b = levelStore[currentLevel][rowStore][cellStore + 1]) === null || _b === void 0 ? void 0 : _b.type) === 'wall';
                const wallBottom = rowStore < levelStore[currentLevel].length - 1 && ((_c = levelStore[currentLevel][rowStore + 1][cellStore]) === null || _c === void 0 ? void 0 : _c.type) === 'wall';
                const wallLeft = cellStore > 0 && ((_d = levelStore[currentLevel][rowStore][cellStore - 1]) === null || _d === void 0 ? void 0 : _d.type) === 'wall';
                if (wallTop && !wallRight && !wallBottom && !wallLeft)
                    cell.elem.classList.add('sidewall', 'top');
                else if (!wallTop && wallRight && !wallBottom && !wallLeft)
                    cell.elem.classList.add('sidewall', 'right');
                else if (!wallTop && !wallRight && wallBottom && !wallLeft)
                    cell.elem.classList.add('sidewall', 'bottom');
                else if (!wallTop && !wallRight && !wallBottom && wallLeft)
                    cell.elem.classList.add('sidewall', 'left');
                else if (wallTop && !wallRight && wallBottom && !wallLeft)
                    cell.elem.classList.add('hall', 'side');
                else if (!wallTop && wallRight && !wallBottom && wallLeft)
                    cell.elem.classList.add('hall', 'up');
                else if (wallTop && !wallRight && !wallBottom && wallLeft)
                    cell.elem.classList.add('corner', 'top-left');
                else if (wallTop && wallRight && !wallBottom && !wallLeft)
                    cell.elem.classList.add('corner', 'top-right');
                else if (!wallTop && !wallRight && wallBottom && wallLeft)
                    cell.elem.classList.add('corner', 'bottom-left');
                else if (!wallTop && wallRight && wallBottom && !wallLeft)
                    cell.elem.classList.add('corner', 'bottom-right');
                else if (!wallTop && wallRight && wallBottom && wallLeft)
                    cell.elem.classList.add('cap', 'top');
                else if (wallTop && !wallRight && wallBottom && wallLeft)
                    cell.elem.classList.add('cap', 'right');
                else if (wallTop && wallRight && !wallBottom && wallLeft)
                    cell.elem.classList.add('cap', 'bottom');
                else if (wallTop && wallRight && wallBottom && !wallLeft)
                    cell.elem.classList.add('cap', 'left');
            }
        }
    };
    const toggleCenterMode = () => {
        options.centerMode = !options.centerMode;
        centerPlayerInScreen();
    };
    const centerPlayerInScreen = () => {
        let top, left;
        const topLevelOffset = (levelStore[currentLevel].length / 2 - player.pos[0]) * sessionStats.zoomLevel * 4;
        const leftLevelOffset = (levelStore[currentLevel][0].length / 2 - player.pos[1]) * sessionStats.zoomLevel * 4;
        if (!options.centerMode) {
            top = player.elem.offsetTop * -1 - sessionStats.zoomLevel * 4 + window.innerHeight / 2 - Math.min(Math.max(topLevelOffset * 0.75, -window.innerHeight / 3), window.innerHeight / 3);
            left = player.elem.offsetLeft * -1 - sessionStats.zoomLevel * 4 + window.innerWidth / 2 - Math.min(Math.max(leftLevelOffset * 0.75, -window.innerWidth / 3), window.innerWidth / 3);
        }
        else {
            top = player.elem.offsetTop * -1 - sessionStats.zoomLevel * 4 + window.innerHeight / 2;
            left = player.elem.offsetLeft * -1 - sessionStats.zoomLevel * 4 + window.innerWidth / 2;
        }
        overrides.innerHTML = `#display-wrapper #game-grid {top: ${top}px; left: ${left}px;}`;
        if (viewingGoal)
            viewingGoal = false;
    };
    const centerOnGoal = () => {
        const goal = document.querySelector('.goal');
        if (!goal)
            return;
        const top = goal.offsetTop * -1 - sessionStats.zoomLevel * 4 + window.innerHeight / 2;
        const left = goal.offsetLeft * -1 - sessionStats.zoomLevel * 4 + window.innerWidth / 2;
        overrides.innerHTML = `#display-wrapper #game-grid {top: ${top}px; left: ${left}px;}`;
        viewingGoal = true;
    };
    const showGoal = () => {
        viewingGoal ? centerPlayerInScreen() : centerOnGoal();
    };
    const enemyAITurn = () => {
        enemies[currentLevel].forEach((enemy) => moveEnemy(enemy, randomDirection()));
    };
    const moveEnemy = (enemyObject, direction) => {
        var _a;
        if (sessionStats.dead)
            return;
        let newPos = [...enemyObject.pos];
        switch (direction) {
            case 1:
                newPos[0]--;
                break;
            case 2:
                newPos[1]++;
                break;
            case 3:
                newPos[0]++;
                break;
            case 4:
                newPos[1]--;
                break;
        }
        const newCellData = (_a = levelStore[currentLevel][newPos[0]]) === null || _a === void 0 ? void 0 : _a[newPos[1]];
        if (newCellData && newCellData.type !== 'wall' && !newCellData.inside.includes('enemy')) {
            if (newCellData.inside.includes('player')) {
                death();
                return;
            }
            const oldCellInside = levelStore[currentLevel][enemyObject.pos[0]][enemyObject.pos[1]].inside;
            oldCellInside.splice(oldCellInside.indexOf('enemy'), 1);
            newCellData.inside.push('enemy');
            enemyObject.pos = newPos;
            enemyObject.elem = newCellData.elem;
            enemyObject.moveTries = 0;
        }
        else if (enemyObject.moveTries < 3) {
            enemyObject.moveTries++;
            moveEnemy(enemyObject, randomDirection());
        }
    };
    const randomDirection = () => Math.floor(Math.random() * 4 + 1);
    const movePlayer = (direction) => {
        var _a;
        let newPos = [...player.pos];
        switch (direction) {
            case 1:
                newPos[0]--;
                break;
            case 2:
                newPos[1]++;
                break;
            case 3:
                newPos[0]++;
                break;
            case 4:
                newPos[1]--;
                break;
        }
        const newCellData = (_a = levelStore[currentLevel][newPos[0]]) === null || _a === void 0 ? void 0 : _a[newPos[1]];
        if (!newCellData || newCellData.type === 'wall')
            return;
        if (newCellData.inside.includes('enemy')) {
            death();
            return;
        }
        playWalkSound();
        if (newCellData.inside.includes('gold')) {
            collectGoldAt(newPos);
        }
        const oldCellInside = levelStore[currentLevel][player.pos[0]][player.pos[1]].inside;
        oldCellInside.splice(oldCellInside.indexOf('player'), 1);
        newCellData.inside.push('player');
        player.pos = newPos;
        player.elem = newCellData.elem;
        renderPlayer(newPos);
        centerPlayerInScreen();
    };
    const renderPlayer = (pos) => {
        const tileSize = sessionStats.zoomLevel * 8;
        stylePlayer.innerHTML = `#display-wrapper #game-grid .row .cell.floor.player::after {top: ${pos[0] * tileSize}px; left: ${pos[1] * tileSize}px; height: ${tileSize}px; width: ${tileSize}px;}`;
    };
    const renderEnemies = () => {
        const tileSize = sessionStats.zoomLevel * 8;
        enemyStyles.innerHTML = enemies[currentLevel]
            .map((enemyObj) => `
      #display-wrapper #game-grid .row .cell.floor.enemy-${enemyObj.id}::after {
        top: ${enemyObj.pos[0] * tileSize}px;
        left: ${enemyObj.pos[1] * tileSize}px;
        height: ${tileSize}px;
        width: ${tileSize}px;
      }
    `)
            .join('');
    };
    const checkVictory = () => levelStore[currentLevel][player.pos[0]][player.pos[1]].inside.includes('stairsDown');
    const retryLevel = () => {
        sessionStats.goldTotal -= sessionStats.goldLevel;
        player.reset();
        enemies.splice(currentLevel, 1);
        goldPieces.splice(currentLevel, 1);
        enemyCounter = 0;
        goldCounter = 0;
        levelStore.splice(currentLevel, 1);
        refreshScreen();
        sessionStats.turnsLevel = 0;
        sessionStats.goldLevel = 0;
        sessionStats.dead = false;
        sessionStats.retries++;
        collectedGold = [];
    };
    const refreshScreen = () => {
        eraseScreen();
        const levelSize = 40 + currentLevel * 5;
        const levelDataToLoad = sessionStats.mode === 'normal' ? levelData[currentLevel] : generateRandomLevel(currentLevel, levelSize, levelSize);
        drawScreen(levelDataToLoad);
    };
    const eraseScreen = () => {
        const background = document.querySelector('#display-wrapper');
        const grid = document.querySelector('#game-grid');
        const ui = document.querySelector('#ui-display');
        if (ui)
            background === null || background === void 0 ? void 0 : background.removeChild(ui);
        if (grid)
            background === null || background === void 0 ? void 0 : background.removeChild(grid);
    };
    const goToNewLevel = (newLevel) => {
        sessionStats.turnsLevel = 0;
        sessionStats.goldLevel = 0;
        enemyCounter = 0;
        goldCounter = 0;
        collectedGold = [];
        eraseScreen();
        currentLevel = newLevel;
        refreshScreen();
    };
    const newGame = () => {
        levelStore.length = 0;
        enemies.length = 0;
        goldPieces.length = 0;
        sessionStats.turnsTotal = 0;
        sessionStats.goldTotal = 0;
        goToNewLevel(0);
    };
    const backToTitleScreen = () => {
        eraseScreen();
        setTimeout(drawTitleScreen, 50);
    };
    const showMessageBox = (messageText, buttons, layout = 'vertical') => {
        const messageBox = document.querySelector('#message');
        if (!messageBox)
            return;
        messageBox.innerHTML = ''; // Clear previous content
        const message = document.createElement('p');
        message.innerHTML = messageText;
        messageBox.appendChild(message);
        messageBox.classList.add('top', 'show');
        messageBox.classList.toggle('inline-buttons', layout === 'inline');
        const buttonWrapper = layout === 'inline' ? document.createElement('div') : messageBox;
        if (layout === 'inline') {
            buttonWrapper.classList.add('button-wrapper');
            messageBox.appendChild(buttonWrapper);
        }
        const buttonElements = [];
        buttons.forEach((buttonConfig) => {
            const button = document.createElement('a');
            button.className = 'btn';
            button.textContent = buttonConfig.text;
            button.tabIndex = 0;
            buttonWrapper.appendChild(button);
            buttonElements.push(button);
        });
        const closeMessageWindow = () => {
            messageBox.classList.remove('show');
            setTimeout(() => {
                messageBox.classList.remove('top', 'inline-buttons');
                messageBox.innerHTML = '';
            }, 360);
        };
        const keydownHandler = (e) => {
            const btn = e.target;
            if (btn.classList.contains('btn') && handleKeyboardConfirm(e)) {
                const index = buttonElements.indexOf(btn);
                if (index > -1) {
                    closeMessageWindow();
                    setTimeout(buttons[index].action, 360);
                }
            }
        };
        buttonElements.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                closeMessageWindow();
                setTimeout(buttons[index].action, 360);
            });
            btn.addEventListener('keydown', (e) => keydownHandler(e));
        });
        let currentFocusIndex = 0;
        const handleKeyNavigation = (e) => {
            const prevKeys = layout === 'inline' ? ['ArrowLeft', 'Left'] : ['ArrowUp', 'Up'];
            const nextKeys = layout === 'inline' ? ['ArrowRight', 'Right'] : ['ArrowDown', 'Down'];
            if (prevKeys.includes(e.key)) {
                e.preventDefault();
                currentFocusIndex = (currentFocusIndex - 1 + buttonElements.length) % buttonElements.length;
                buttonElements[currentFocusIndex].focus();
            }
            else if (nextKeys.includes(e.key)) {
                e.preventDefault();
                currentFocusIndex = (currentFocusIndex + 1) % buttonElements.length;
                buttonElements[currentFocusIndex].focus();
            }
            else {
                return;
            }
        };
        buttonElements.forEach((button, index) => {
            button.addEventListener('keydown', handleKeyNavigation);
            button.addEventListener('mouseover', () => {
                currentFocusIndex = index;
                button.focus();
            });
        });
        const transitionEndHandler = () => {
            document.removeEventListener('keydown', handleKeyNavigation);
            buttonElements.forEach((btn) => btn.removeEventListener('keydown', keydownHandler));
            messageBox.removeEventListener('transitionend', transitionEndHandler);
        };
        messageBox.addEventListener('transitionend', transitionEndHandler);
        setTimeout(() => { var _a; return (_a = buttonElements[0]) === null || _a === void 0 ? void 0 : _a.focus(); }, 100);
    };
    const displayVictoryMessage = () => {
        playSuccessSound();
        const messageBox = document.querySelector('#message');
        if (!messageBox)
            return;
        messageBox.innerHTML = ''; // Clear existing content
        const goldDisplay = document.createElement('div');
        const goldText = document.createElement('div');
        const goldVisual = document.createElement('div');
        const message = document.createElement('p');
        const btnPlayAgain = document.createElement('button');
        const btnNextLevel = document.createElement('button');
        const btnBackToTitle = document.createElement('button');
        // Setup gold display
        goldDisplay.className = 'gold-display';
        goldText.className = 'gold-text';
        goldText.textContent = `Gold found: 0`;
        goldVisual.className = 'gold-visual';
        goldDisplay.appendChild(goldText);
        goldDisplay.appendChild(goldVisual);
        const buttons = [];
        const closeMessageWindow = () => {
            buttons.forEach((button) => {
                button.removeEventListener('keydown', handleKeyNavigation);
            });
            messageBox.classList.remove('show');
            setTimeout(() => {
                messageBox.classList.remove('top');
                messageBox.innerHTML = '';
            }, 360);
        };
        const playAgainOrNewGame = () => {
            if (sessionStats.mode === 'normal' && levelData.length === currentLevel + 1) {
                setTimeout(() => {
                    newGame();
                }, 360);
            }
            else {
                setTimeout(() => {
                    retryLevel();
                }, 360);
            }
        };
        btnPlayAgain.classList.add('btn');
        btnPlayAgain.textContent = 'Play again';
        btnPlayAgain.setAttribute('tabindex', '0');
        const handleBtnPlayAgain = (e) => {
            var _a;
            if (!e || (e instanceof KeyboardEvent && handleKeyboardConfirm(e)) || e.type === 'click') {
                (_a = e === null || e === void 0 ? void 0 : e.preventDefault) === null || _a === void 0 ? void 0 : _a.call(e);
                closeMessageWindow();
                playAgainOrNewGame();
            }
        };
        btnPlayAgain.addEventListener('click', handleBtnPlayAgain);
        btnPlayAgain.addEventListener('keydown', (e) => handleBtnPlayAgain(e));
        btnNextLevel.classList.add('btn');
        btnNextLevel.textContent = 'Go to level ' + (currentLevel + 2);
        btnNextLevel.setAttribute('tabindex', '0');
        const handleNextLevelBtn = (e) => {
            var _a;
            if (!e || (e instanceof KeyboardEvent && handleKeyboardConfirm(e)) || e.type === 'click') {
                (_a = e === null || e === void 0 ? void 0 : e.preventDefault) === null || _a === void 0 ? void 0 : _a.call(e);
                closeMessageWindow();
                setTimeout(() => {
                    goToNewLevel(currentLevel + 1);
                }, 360);
            }
        };
        btnNextLevel.addEventListener('click', handleNextLevelBtn);
        btnNextLevel.addEventListener('keydown', (e) => handleNextLevelBtn(e));
        message.innerHTML = 'You beat level ' + (currentLevel + 1) + '!<br /><br />You completed it in ' + sessionStats.turnsLevel + ' turns. Good job!';
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
            }
            else {
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
        btnBackToTitle.classList.add('btn');
        btnBackToTitle.textContent = 'Back to Title Screen';
        btnBackToTitle.setAttribute('tabindex', '0');
        const handleBackToTitleScreen = (e) => {
            var _a;
            if (!e || (e instanceof KeyboardEvent && handleKeyboardConfirm(e)) || e.type === 'click') {
                (_a = e === null || e === void 0 ? void 0 : e.preventDefault) === null || _a === void 0 ? void 0 : _a.call(e);
                closeMessageWindow();
                setTimeout(() => {
                    backToTitleScreen();
                }, 360);
            }
        };
        btnBackToTitle.addEventListener('click', handleBackToTitleScreen);
        btnBackToTitle.addEventListener('keydown', (e) => handleBackToTitleScreen(e));
        messageBox.appendChild(goldDisplay);
        messageBox.appendChild(message);
        messageBox.appendChild(btnPlayAgain);
        buttons.push(btnPlayAgain);
        if (sessionStats.mode === 'procedural' || (sessionStats.mode === 'normal' && levelData.length > currentLevel + 1)) {
            messageBox.appendChild(btnNextLevel);
            buttons.push(btnNextLevel);
        }
        messageBox.appendChild(btnBackToTitle);
        buttons.push(btnBackToTitle);
        const sortedGold = [...collectedGold].sort((a, b) => a.value - b.value);
        let runningTotal = 0;
        playGoldSummarySound();
        sortedGold.forEach((gold, index) => {
            setTimeout(() => {
                runningTotal += gold.value;
                goldText.textContent = `Gold found: ${runningTotal}`;
                const goldPiece = document.createElement('div');
                goldPiece.className = `gold-piece ${gold.type}`;
                goldPiece.style.cssText = `margin-left: ${index > 0 ? '-12px' : '0px'}; z-index: ${100 + index};`;
                goldVisual.appendChild(goldPiece);
            }, 300 + index * 200);
        });
        if (sortedGold.length > 0) {
            setTimeout(stopGoldSummarySound, 300 + (sortedGold.length - 1) * 200 + 400);
        }
        else {
            setTimeout(stopGoldSummarySound, 700);
        }
        let currentFocusIndex = 0;
        const handleKeyNavigation = (e) => {
            if (e.key === 'ArrowUp' || e.key === 'Up') {
                e.preventDefault();
                currentFocusIndex = (currentFocusIndex - 1 + buttons.length) % buttons.length;
                buttons[currentFocusIndex].focus();
            }
            else if (e.key === 'ArrowDown' || e.key === 'Down') {
                e.preventDefault();
                currentFocusIndex = (currentFocusIndex + 1) % buttons.length;
                buttons[currentFocusIndex].focus();
            }
        };
        buttons.forEach((button, index) => {
            button.addEventListener('keydown', handleKeyNavigation);
            button.addEventListener('mouseover', () => {
                currentFocusIndex = index;
                button.focus();
            });
        });
        messageBox.classList.add('top');
        messageBox.classList.add('show');
        const focusDelay = Math.max(100, sortedGold.length * 100 + 200);
        if (messageBox.contains(btnNextLevel)) {
            setTimeout(() => {
                btnNextLevel.focus();
                currentFocusIndex = buttons.indexOf(btnNextLevel);
            }, focusDelay);
        }
        else {
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
            renderEnemies();
        }
        else {
            displayVictoryMessage();
        }
    };
    const death = () => {
        playDieSound();
        const playerGraphic = document.querySelector('.player');
        playerGraphic === null || playerGraphic === void 0 ? void 0 : playerGraphic.classList.add('ashes');
        sessionStats.dead = true;
        const message = 'You died.<br /><br />The fire vortex consumed you in an instant, leaving only a pile of ash where you once stood.<br /><br />You lasted ' + sessionStats.turnsLevel + ' turns.';
        showMessageBox(message, [
            { text: 'Try Again', action: retryLevel },
            { text: 'Back to Title Screen', action: backToTitleScreen }
        ]);
    };
    const renderGoldPieces = () => {
        const tileSize = sessionStats.zoomLevel * 8;
        goldStyles.innerHTML = goldPieces[currentLevel]
            .map((goldObj) => `
      #display-wrapper #game-grid .row .cell.floor.gold-${goldObj.id}::after {
        top: ${goldObj.pos[0] * tileSize}px;
        left: ${goldObj.pos[1] * tileSize}px;
        height: ${tileSize}px;
        width: ${tileSize}px;
      }
    `)
            .join('');
    };
    const showGoldCollectionText = (pos, value) => {
        var _a;
        const textElement = document.createElement('div');
        const tileSize = sessionStats.zoomLevel * 8;
        textElement.className = 'gold-text-animation';
        textElement.setAttribute('data-gold-value', `+${value}`);
        textElement.style.cssText = `
      top: ${pos[0] * tileSize}px;
      left: ${pos[1] * tileSize}px;
      width: ${tileSize}px;
      height: ${tileSize}px;
      font-size: ${Math.max(sessionStats.zoomLevel * 4, 24)}px;
    `;
        (_a = document.querySelector('#game-grid')) === null || _a === void 0 ? void 0 : _a.appendChild(textElement);
        setTimeout(() => textElement.remove(), 1000);
    };
    const collectGoldAt = (pos) => {
        const goldIndex = goldPieces[currentLevel].findIndex((g) => g.pos[0] === pos[0] && g.pos[1] === pos[1]);
        if (goldIndex === -1)
            return;
        const [goldObj] = goldPieces[currentLevel].splice(goldIndex, 1);
        const cell = levelStore[currentLevel][pos[0]][pos[1]];
        showGoldCollectionText(pos, goldObj.value);
        playGoldPickupSound(goldObj.type);
        collectedGold.push({ value: goldObj.value, type: goldObj.type });
        sessionStats.goldLevel += goldObj.value;
        sessionStats.goldTotal += goldObj.value;
        // Start fading gold summary sound on second-to-last piece
        if (goldPieces[currentLevel].length === 1) {
            stopGoldSummarySound();
        }
        const goldCounterElem = document.querySelector('#gold-counter');
        if (goldCounterElem)
            goldCounterElem.textContent = `Gold: ${sessionStats.goldTotal}`;
        const cellInside = cell.inside;
        cellInside.splice(cellInside.indexOf('gold'), 1);
        cell.elem.classList.remove('gold', `gold-${goldObj.id}`, goldObj.type);
        renderGoldPieces();
    };
    const handleTouchStart = (evt) => {
        xDown = evt.touches[0].clientX;
        yDown = evt.touches[0].clientY;
    };
    const handleTouchEnd = (evt) => {
        var _a;
        if (!xDown || !yDown || sessionStats.dead)
            return;
        const xUp = evt.changedTouches[0].clientX;
        const yUp = evt.changedTouches[0].clientY;
        const xDiff = xDown - xUp;
        const yDiff = yDown - yUp;
        const swipeThreshold = 10;
        if (Math.abs(xDiff) < swipeThreshold && Math.abs(yDiff) < swipeThreshold) {
            xDown = yDown = null;
            return;
        }
        if (!((_a = document.getElementById('message')) === null || _a === void 0 ? void 0 : _a.classList.contains('show'))) {
            if (Math.abs(xDiff) > Math.abs(yDiff)) {
                movePlayer(xDiff > 0 ? 4 : 2); // Left or Right
            }
            else {
                movePlayer(yDiff > 0 ? 1 : 3); // Up or Down
            }
            newTurn();
        }
        xDown = yDown = null;
    };
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchend', handleTouchEnd, false);
    document.addEventListener('keydown', (e) => {
        var _a;
        if (sessionStats.dead || ((_a = document.getElementById('message')) === null || _a === void 0 ? void 0 : _a.classList.contains('show')))
            return;
        let direction = 0;
        switch (e.key) {
            case 'ArrowUp':
            case 'Up':
                direction = 1;
                break;
            case 'ArrowRight':
            case 'Right':
                direction = 2;
                break;
            case 'ArrowDown':
            case 'Down':
                direction = 3;
                break;
            case 'ArrowLeft':
            case 'Left':
                direction = 4;
                break;
        }
        if (direction > 0) {
            e.preventDefault();
            movePlayer(direction);
            newTurn();
        }
    });
    window.addEventListener('resize', centerPlayerInScreen);
    drawTitleScreen();
    initAudioSystem();
})();
