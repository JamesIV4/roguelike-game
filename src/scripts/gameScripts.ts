import { levelData } from './levels.js';
import { generateRandomLevel } from './randomLevelGenerator.js';

type SessionStats = {
  turnsTotal: number;
  turnsLevel: number;
  retries: number;
  zoomLevel: number;
  dead: boolean;
  playing: boolean;
  mode: string;
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
  { id: 'g4', minValue: 15, maxValue: 20, image: 'gold-4.png' },
  { id: 'g5', minValue: 20, maxValue: 30, image: 'gold-5.png' },
  { id: 'g6', minValue: 30, maxValue: 50, image: 'gold-6.png' },
  { id: 'g7', minValue: 50, maxValue: 60, image: 'gold-7.png' },
  { id: 'g8', minValue: 60, maxValue: 70, image: 'gold-8.png' },
  { id: 'g9', minValue: 70, maxValue: 85, image: 'gold-9.png' },
  { id: 'g10', minValue: 85, maxValue: 100, image: 'gold-10.png' }
];

(() => {
  // Helper functions
  const isMobileScreen = () => {
    return window.matchMedia('(max-width: 767px)').matches;
  };
  const handleKeyboardConfirm = (e?: KeyboardEvent) => (e && (e.key === 'Enter' || e.key === ' ')) || !e;

  // Helper functions to safely convert between UTF‑8 strings and Base64.
  // These avoid deprecated escape()/unescape() and work across browsers.
  const stringToBase64 = (str: string): string => {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary);
  };

  const base64ToString = (base64: string): string => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  };

  // Prime IndexedDB on page load to work around Safari's first‑access bug.
  try {
    const primingReq = indexedDB.open('probe');
    primingReq.onupgradeneeded = primingReq.onsuccess = () => {
      primingReq.result.close();
    };
  } catch (err) {
    console.warn('IndexedDB priming failed:', err);
  }

  // --- Web Audio API Setup for High-Performance Sound ---
  // This new system replaces the old HTML5 Audio pools. It offers low-latency playback
  // crucial for responsive game audio on all devices, especially mobile.
  let audioContext: AudioContext;
  const audioBuffers: Map<string, AudioBuffer> = new Map();
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
  const initAudioSystem = async () => {
    if (audioContext) return; // Already initialized

    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Load all sounds in parallel
      await Promise.all(
        soundAssets.map(async (asset) => {
          const response = await fetch(asset.url);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          audioBuffers.set(asset.name, audioBuffer);
        })
      );
      soundsLoaded = true;
    } catch (error) {
      console.error('Audio system failed to initialize:', error);
      // Game can continue without sound
      soundsLoaded = false;
    }
  };
  // ---- Audio resume/unlock helpers ----
  const resumeAudioIfNeeded = async () => {
    if (!audioContext) return;
    if (audioContext.state === 'suspended') {
      try {
        await audioContext.resume();
      } catch (e) {
        console.warn('AudioContext resume failed, will require user gesture', e);
      }
    } else if (audioContext.state === 'closed') {
      // Recreate and reload
      audioContext = undefined as any;
      soundsLoaded = false;
      await initAudioSystem();
    }
  };

  const unlockAudio = async () => {
    await initAudioSystem();
    if (audioContext && audioContext.state !== 'running') {
      try {
        await audioContext.resume();
      } catch (e) {
        console.warn('AudioContext resume needs a user gesture', e);
      }
    }
    if (audioContext && audioContext.state === 'running') {
      // play a silent buffer to force some mobile browsers to unlock
      const buffer = audioContext.createBuffer(1, 1, 22050);
      const src = audioContext.createBufferSource();
      src.buffer = buffer;
      src.connect(audioContext.destination);
      src.start(0);
    }
  };

  // Generic function to play any pre-loaded sound from its buffer.
  // MODIFIED: Now returns both the source and the gain node for more control.
  const playSound = (soundName: string, volume: number = 1): { source: AudioBufferSourceNode; gainNode: GainNode } | null => {
    if (!soundsLoaded || !audioBuffers.has(soundName) || !audioContext) return null;

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffers.get(soundName)!;

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    source.start(0);
    return { source, gainNode };
  };

  // --- Sound Effect Wrappers ---
  // These functions now use the high-performance playSound function.
  const playWalkSound = (pitchRange: number = 200) => {
    // Access the 'source' property from the object returned by playSound.
    const sound = playSound('walk', 0.5);
    if (sound) {
      sound.source.detune.value = Math.random() * 2 * pitchRange;
    }
  };
  const playGoldPickupSound = (goldType: string) => {
    const soundKey = ['g7', 'g8', 'g9', 'g10'].includes(goldType) ? 'pickup-2' : 'pickup-1';
    playSound(soundKey, 0.7);
  };
  const playSuccessSound = () => playSound('success', 1);
  const playDieSound = () => playSound('die', 0.8);
  const playButtonClickSound = () => playSound('button-click', 0.7);
  const playUIHoverSound = () => playSound('ui-hover', 0.7);

  // Special handling for the summary sound which needs to be stoppable.
  let goldSummarySound: { source: AudioBufferSourceNode; gainNode: GainNode } | null = null;
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
    const target = e.target as HTMLElement;
    if (target && target.classList.contains('btn')) {
      playButtonClickSound();
    }
  });
  document.addEventListener('keydown', (e) => {
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
    zoomLevel: isMobileScreen() ? 3 : 4,
    dead: false,
    playing: true,
    mode: 'procedural',
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
  const goldStyles = document.createElement('style');
  const enemyStyles = document.createElement('style');
  document.querySelector('head')?.appendChild(overrides);
  document.querySelector('head')?.appendChild(zoomLevelStyle);
  document.querySelector('head')?.appendChild(stylePlayer);
  document.querySelector('head')?.appendChild(goldStyles);
  document.querySelector('head')?.appendChild(enemyStyles);

  // Unit type classes
  class Enemy {
    constructor(
      public elem: HTMLElement,
      public id: number,
      public pos: number[],
      public type: string,
      public health: number,
      public moveTries: number = 0
    ) {}
  }

  class Gold {
    constructor(
      public elem: HTMLElement,
      public id: number,
      public pos: number[],
      public type: string,
      public value: number
    ) {}
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
      this.pos = [];
      this.health = 100;
      this.elem = null as any;
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

  // --- IndexedDB Save/Load Functions ---
  const DB_NAME = 'roguelike_game_db';
  const DB_VERSION = 1;
  const STORE_NAME = 'game_saves';

  // High score constants
  // Additional object store to persist top scores
  const HIGH_SCORES_STORE_NAME = 'high_scores';
  const MAX_HIGH_SCORES = 25;

  function openGameDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        // Always create or upgrade both stores
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
        if (!db.objectStoreNames.contains(HIGH_SCORES_STORE_NAME)) {
          db.createObjectStore(HIGH_SCORES_STORE_NAME);
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        // Defensive: If for any reason the store is missing, upgrade again
        if (!db.objectStoreNames.contains(HIGH_SCORES_STORE_NAME)) {
          db.close();
          // Force upgrade by bumping version
          const upgradeRequest = indexedDB.open(DB_NAME, db.version + 1);
          upgradeRequest.onupgradeneeded = () => {
            const upgradeDb = upgradeRequest.result;
            if (!upgradeDb.objectStoreNames.contains(HIGH_SCORES_STORE_NAME)) {
              upgradeDb.createObjectStore(HIGH_SCORES_STORE_NAME);
            }
          };
          upgradeRequest.onsuccess = () => resolve(upgradeRequest.result);
          upgradeRequest.onerror = () => reject(upgradeRequest.error);
        } else {
          resolve(db);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  function getHighScores(): Promise<Array<{ date: string; gold: number; turns: number; level: number }>> {
    return openGameDB().then((db) => {
      return new Promise((resolve) => {
        const tx = db.transaction(HIGH_SCORES_STORE_NAME, 'readonly');
        const store = tx.objectStore(HIGH_SCORES_STORE_NAME);
        const request = store.get('scores');
        request.onsuccess = () => {
          const result = request.result;
          if (!result) {
            resolve([]);
          } else {
            try {
              // decode using the safe helper
              const json = base64ToString(result);
              resolve(JSON.parse(json));
            } catch {
              resolve([]);
            }
          }
        };
        request.onerror = () => resolve([]);
      });
    });
  }

  /**
   * Persist a new high score entry. This function reads the existing score
   * list, appends the new entry, sorts it according to our ranking rules,
   * trims it to the maximum allowed number of entries and writes it back.
   *
   * Scores are ranked primarily by gold (descending), then by level reached
   * (descending) and finally by turns taken (ascending) to break ties.
   */
  function saveHighScoreEntry(entry: { date: string; gold: number; turns: number; level: number }): void {
    openGameDB()
      .then((db) => {
        const tx = db.transaction(HIGH_SCORES_STORE_NAME, 'readwrite');
        const store = tx.objectStore(HIGH_SCORES_STORE_NAME);
        const getReq = store.get('scores');
        getReq.onsuccess = () => {
          let scores: Array<{ date: string; gold: number; turns: number; level: number }> = [];
          if (getReq.result) {
            try {
              const json = base64ToString(getReq.result);
              scores = JSON.parse(json);
            } catch {
              scores = [];
            }
          }
          scores.push(entry);
          scores.sort((a, b) => {
            if (b.gold !== a.gold) return b.gold - a.gold;
            if (b.level !== a.level) return b.level - a.level;
            return a.turns - b.turns;
          });
          if (scores.length > MAX_HIGH_SCORES) {
            scores = scores.slice(0, MAX_HIGH_SCORES);
          }
          try {
            const jsonString = JSON.stringify(scores);
            // encode using the safe helper
            const base64String = stringToBase64(jsonString);
            store.put(base64String, 'scores');
          } catch (err) {
            console.error('Failed to write high scores:', err);
          }
        };
        getReq.onerror = () => {
          try {
            const jsonString = JSON.stringify([entry]);
            const base64String = stringToBase64(jsonString);
            store.put(base64String, 'scores');
          } catch (err) {
            console.error('Failed to write high scores:', err);
          }
        };
        tx.oncomplete = () => db.close();
        tx.onerror = () => {
          console.error('Failed to update high scores:', tx.error);
          db.close();
        };
      })
      .catch((e) => {
        console.error('IndexedDB error when saving high score:', e);
      });
  }

  /**
   * Create a high score entry based on the current session statistics and
   * persist it. Should be called when the game session ends (either by
   * player death or by completing the last level).
   */
  function recordHighScore(): void {
    // Do not record a score if the game has not properly started yet.
    if (!sessionStats.playing && sessionStats.turnsTotal === 0) {
      return;
    }
    const entry = {
      date: new Date().toISOString(),
      gold: sessionStats.goldTotal,
      turns: sessionStats.turnsTotal,
      level: currentLevel + 1
    };
    saveHighScoreEntry(entry);
  }

  /**
   * Display the list of high scores to the user on the title screen. It
   * retrieves the scores asynchronously and constructs an HTML list which
   * is passed to the generic showMessageBox helper. A "Back" button is
   * provided to close the message box. The title screen remains visible
   * behind the overlay.
   */
  function showHighScores(): void {
    getHighScores().then((scores) => {
      let html = '<h2>High Scores</h2>';
      if (!scores || scores.length === 0) {
        html += '<p>No high scores recorded yet.</p>';
      } else {
        html += '<ol class="high-scores-list">';
        scores.forEach((s) => {
          html += `<li>Gold: ${s.gold} -- Turns: ${s.turns} -- Level: ${s.level}</li>`;
        });
        html += '</ol>';
      }
      showMessageBox(html, [
        {
          text: 'Back',
          action: () => {
            // No-op; the closeMessageWindow within showMessageBox will hide the overlay
          }
        }
      ]);
    });
  }

  function saveGameToStorage() {
    // Collect all relevant game state into a single object
    const gameState = {
      sessionStats,
      player: player
        ? {
            pos: player.pos,
            health: player.health,
            id: player.id,
            type: player.type
          }
        : null,
      currentLevel,
      collectedGold,
      levelStore,
      goldPieces,
      enemies
    };
    // Convert to JSON and then Base64 encode
    const json = JSON.stringify(gameState);
    const base64 = stringToBase64(json);

    openGameDB()
      .then((db) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(base64, SAVE_COOKIE_NAME);
        tx.oncomplete = () => {
          console.log('Game saved to IndexedDB (Base64).');
          db.close();
        };
        tx.onerror = () => {
          console.error('Failed to save game to IndexedDB:', tx.error);
          db.close();
        };
      })
      .catch((e) => {
        console.error('IndexedDB error:', e);
      });
  }

  function drawScreenFromStore() {
    eraseScreen();
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

    // Recreate grid from levelStore
    const levelData = levelStore[currentLevel];
    for (let rowIndex = 0; rowIndex < levelData.length; rowIndex++) {
      const elemRow = document.createElement('div');
      elemRow.classList.add('row');
      grid.appendChild(elemRow);
      for (let cellIndex = 0; cellIndex < levelData[rowIndex].length; cellIndex++) {
        const cellObj = levelData[rowIndex][cellIndex];
        const elemCell = document.createElement('div');
        elemCell.classList.add('cell');
        elemCell.id = rowIndex + '-' + cellIndex;
        elemRow.appendChild(elemCell);
        cellObj.elem = elemCell;
        if (cellObj.type === 'empty') {
          elemCell.classList.add('empty');
        } else if (cellObj.type === 'wall') {
          elemCell.classList.add('wall');
        } else if (cellObj.type === 'floor') {
          elemCell.classList.add('floor');
        }
        if (cellObj.inside.includes('player')) {
          elemCell.classList.add('player');
          if (player) player.elem = elemCell;
        }
        if (cellObj.inside.includes('enemy')) {
          const enemy = enemies[currentLevel]?.find((e: Enemy) => e.pos[0] === rowIndex && e.pos[1] === cellIndex);
          if (enemy) {
            enemy.elem = elemCell;
            // Add the enemy type and id class for styling, just like original drawScreen
            elemCell.classList.add('floor', 'enemy', 'enemy-' + enemy.id);
          } else {
            elemCell.classList.add('enemy');
          }
        }
        if (cellObj.inside.includes('stairsDown')) {
          elemCell.classList.add('goal');
        }
        if (cellObj.inside.includes('gold')) {
          const gold = goldPieces[currentLevel]?.find((g: Gold) => g.pos[0] === rowIndex && g.pos[1] === cellIndex);
          if (gold) elemCell.classList.add('gold', 'gold-' + gold.id, gold.type);
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
    renderEnemies();
    drawDecorations();
    centerPlayerInScreen();

    setTimeout(() => {
      grid.classList.add('show');
    }, 300);

    // Re-attach event listeners (copied from drawScreen)
    const backToTitleScreenMessageBox = () =>
      showMessageBox(
        'Abandon the current game and return to the Title Screen?',
        [
          {
            text: 'Save Game',
            action: () => {
              saveGameToStorage();
              showMessageBox('Game saved!', [{ text: 'Confirm', action: backToTitleScreen }], 'inline');
            }
          },
          { text: 'Exit to Title Screen', action: () => backToTitleScreen() },
          { text: 'Cancel', action: () => {} }
        ],
        'vertical'
      );

    const handleBackBtnPress = (e?: KeyboardEvent) => {
      if (handleKeyboardConfirm(e)) {
        backToTitleScreenMessageBox();
      }
    };
    document.addEventListener('keydown', (e) => {
      if (sessionStats.dead || !sessionStats.playing || document.getElementById('message')?.classList.contains('show')) return;
      if (e.key === 'Escape') {
        backToTitleScreenMessageBox();
      }
    });
    backButton.addEventListener('click', () => handleBackBtnPress());
    backButton.addEventListener('keydown', (e) => handleBackBtnPress(e));

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
  }

  function loadGameFromStorage() {
    // Reset all game variables to their default state before loading
    currentLevel = 0;
    levelStore = [];
    enemies = [];
    enemyCounter = 0;
    goldPieces = [];
    goldCounter = 0;
    collectedGold = [];
    player = undefined as any;
    viewingGoal = false;
    options = { centerMode: false };
    sessionStats = {
      turnsTotal: 0,
      turnsLevel: 0,
      retries: 0,
      zoomLevel: sessionStats.zoomLevel,
      dead: false,
      playing: true,
      mode: sessionStats.mode,
      goldTotal: 0,
      goldLevel: 0
    };

    openGameDB()
      .then((db) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(SAVE_COOKIE_NAME);
        request.onsuccess = () => {
          const base64 = request.result;
          if (!base64) {
            db.close();
            return false;
          }
          // decode using the helper
          const json = base64ToString(base64);
          const gameState = JSON.parse(json);

          sessionStats = gameState.sessionStats;
          player = gameState.player ? Object.assign(new Player(null as any, gameState.player.id, gameState.player.pos, gameState.player.type, gameState.player.health), gameState.player) : undefined;
          currentLevel = gameState.currentLevel;
          collectedGold = gameState.collectedGold;
          levelStore = gameState.levelStore;
          goldPieces = gameState.goldPieces;
          enemies = gameState.enemies;

          drawScreenFromStore();
          db.close();
        };
        request.onerror = () => {
          console.error('Failed to load game from IndexedDB:', request.error);
          db.close();
        };
      })
      .catch((e) => {
        console.error('IndexedDB error:', e);
      });
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
    sessionStats.playing = true;
    sessionStats.goldTotal = 0;
    sessionStats.goldLevel = 0;
    collectedGold = [];

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
      btnStartGame = document.createElement('div'),
      btnLoadGame = document.createElement('div'),
      btnHighScores = document.createElement('div'),
      btnOptions = document.createElement('div');

    uiElem.id = 'ui-display';
    titleContainer.classList.add('titlescreen-container');
    titleHeader.classList.add('title-header');
    messageWindow.id = 'message';
    buttonContainer.classList.add('button-container');
    btnStartGame.classList.add('btn');
    btnLoadGame.classList.add('btn');
    btnHighScores.classList.add('btn');
    btnOptions.classList.add('btn');

    btnStartGame.setAttribute('tabindex', '0');
    btnLoadGame.setAttribute('tabindex', '0');
    btnHighScores.setAttribute('tabindex', '0');
    btnOptions.setAttribute('tabindex', '0');

    background?.classList.add('titlescreen');

    titleHeader.textContent = 'Fire Gauntlet';
    btnStartGame.textContent = 'Start Game';
    btnLoadGame.textContent = 'Load Game';
    btnHighScores.textContent = 'High Scores';
    btnOptions.textContent = 'Options';

    background?.appendChild(uiElem);
    titleContainer.appendChild(titleHeader);
    titleContainer.appendChild(buttonContainer);
    buttonContainer.appendChild(btnStartGame);
    buttonContainer.appendChild(btnLoadGame);
    buttonContainer.appendChild(btnHighScores);
    buttonContainer.appendChild(btnOptions);
    uiElem.appendChild(messageWindow);
    uiElem.appendChild(titleContainer);

    const buttons = [btnStartGame, btnLoadGame, btnHighScores, btnOptions];
    // Options button logic
    const handleOptions = (e?: KeyboardEvent | MouseEvent) => {
      if (!e || e.type === 'click' || handleKeyboardConfirm(e as KeyboardEvent)) {
        showMessageBox(
          '<h2>Options</h2><p>Clear all saved game and high score data?</p>',
          [
            {
              text: sessionStats.mode === 'normal' ? 'Legacy Game Mode: On' : 'Legacy Game Mode: Off',
              action: () => {
                sessionStats.mode = sessionStats.mode === 'normal' ? 'procedural' : 'normal';
                // Reopen the options box to update the button text
                handleOptions();
              }
            },
            {
              text: 'Clear Data',
              action: () => {
                // Clear IndexedDB game and high score data
                openGameDB().then((db) => {
                  // Clear game saves
                  if (db.objectStoreNames.contains(STORE_NAME)) {
                    const tx1 = db.transaction(STORE_NAME, 'readwrite');
                    const store1 = tx1.objectStore(STORE_NAME);
                    store1.clear();
                  }
                  // Clear high scores
                  if (db.objectStoreNames.contains(HIGH_SCORES_STORE_NAME)) {
                    const tx2 = db.transaction(HIGH_SCORES_STORE_NAME, 'readwrite');
                    const store2 = tx2.objectStore(HIGH_SCORES_STORE_NAME);
                    store2.clear();
                  }
                  db.close();
                });
                showMessageBox('<p>All saved data has been cleared.</p>', [{ text: 'Back', action: () => {} }]);
              }
            },
            { text: 'Cancel', action: () => {} }
          ],
          'vertical'
        );
      }
    };
    btnOptions.addEventListener('click', (e) => handleOptions(e));
    btnOptions.addEventListener('keydown', (e) => handleOptions(e));
    let currentFocusIndex = 0;

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

    buttons.forEach((button, index) => {
      button.addEventListener('keydown', handleKeyNavigation);
      button.addEventListener('mouseover', () => {
        currentFocusIndex = index;
        button.focus();
      });
    });

    setTimeout(() => {
      titleContainer.classList.add('show');
      if (!isMobileScreen()) {
        btnStartGame.focus();
      }
    }, 150);

    const closeTitlescreen = () => {
      buttons.forEach((button) => {
        button.removeEventListener('keydown', handleKeyNavigation);
      });
      background?.classList.remove('titlescreen');
      titleContainer.classList.remove('show');
      setTimeout(() => {
        if (uiElem.parentNode) {
          uiElem.parentNode.removeChild(uiElem);
        }
      }, 1000);
    };

    const handleStartGame = (e?: KeyboardEvent | MouseEvent) => {
      if (!e || e.type === 'click' || handleKeyboardConfirm(e as KeyboardEvent)) {
        closeTitlescreen();
        beginGame();
      }
    };
    btnStartGame.addEventListener('click', (e) => handleStartGame(e), { once: true });
    btnStartGame.addEventListener('keydown', (e) => handleStartGame(e), { once: true });

    // Show high scores when clicking or pressing Enter/Space on the button
    const handleHighScores = (e?: KeyboardEvent | MouseEvent) => {
      // Allow both mouse clicks and keyboard confirmation to trigger
      if (!e || e.type === 'click' || handleKeyboardConfirm(e as KeyboardEvent)) {
        // Prevent losing focus on button when clicking
        showHighScores();
      }
    };
    btnHighScores.addEventListener('click', (e) => handleHighScores(e));
    btnHighScores.addEventListener('keydown', (e) => handleHighScores(e));

    // Check IndexedDB for saved game and enable/disable Load Game button accordingly
    openGameDB().then((db) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(SAVE_COOKIE_NAME);
      request.onsuccess = () => {
        if (!request.result) {
          btnLoadGame.classList.add('disabled');
          btnLoadGame.setAttribute('aria-disabled', 'true');
        } else {
          btnLoadGame.classList.remove('disabled');
          btnLoadGame.setAttribute('aria-disabled', 'false');
        }
        db.close();
      };
      request.onerror = () => {
        btnLoadGame.classList.add('disabled');
        btnLoadGame.setAttribute('aria-disabled', 'true');
        db.close();
      };
    });

    btnLoadGame.addEventListener('click', () => {
      if (btnLoadGame.classList.contains('disabled')) return;
      loadGameFromStorage();
      closeTitlescreen();
      sessionStats.playing = true;
    });

    btnLoadGame.addEventListener('keydown', (e) => {
      if (btnLoadGame.classList.contains('disabled')) return;
      if (handleKeyboardConfirm(e)) {
        loadGameFromStorage();
        closeTitlescreen();
        sessionStats.playing = true;
      }
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
      switchCameraBtn = document.createElement('div'),
      backButton = document.createElement('div');
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
      let levelCells = levelRows[rowIndex].split(','),
        elemRow = document.createElement('div');

      elemRow.classList.add('row');
      grid.appendChild(elemRow);

      levelStore[currentLevel].push(new Array());

      for (let cellIndex = 0; cellIndex < levelCells.length; cellIndex++) {
        let cell = levelCells[cellIndex],
          elemCell = document.createElement('div');

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
    renderEnemies();
    drawDecorations();
    centerPlayerInScreen();

    setTimeout(() => {
      grid.classList.add('show');
    }, 300);

    const backToTitleScreenMessageBox = () =>
      showMessageBox(
        'Abandon the current game and return to the Title Screen?',
        [
          {
            text: 'Save Game',
            action: () => {
              saveGameToStorage();
              // Optionally show a confirmation message
              showMessageBox('Game saved!', [{ text: 'Confirm', action: backToTitleScreen }], 'inline');
            }
          },
          { text: 'Exit to Title Screen', action: () => backToTitleScreen() },
          { text: 'Cancel', action: () => {} }
        ],
        'vertical'
      );

    const handleBackBtnPress = (e?: KeyboardEvent) => {
      if (handleKeyboardConfirm(e)) {
        backToTitleScreenMessageBox();
      }
    };
    document.addEventListener('keydown', (e) => {
      if (sessionStats.dead || !sessionStats.playing || document.getElementById('message')?.classList.contains('show')) return;
      if (e.key === 'Escape') {
        backToTitleScreenMessageBox();
      }
    });
    backButton.addEventListener('click', () => handleBackBtnPress());
    backButton.addEventListener('keydown', (e) => handleBackBtnPress(e));

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
    for (let rowStore = 0; rowStore < levelStore[currentLevel].length; rowStore++) {
      for (let cellStore = 0; cellStore < levelStore[currentLevel][rowStore].length; cellStore++) {
        let cell = levelStore[currentLevel][rowStore][cellStore];
        if (!cell || cell.type !== 'floor') continue;

        const wallTop = rowStore > 0 && levelStore[currentLevel][rowStore - 1][cellStore]?.type === 'wall';
        const wallRight = cellStore < levelStore[currentLevel][rowStore].length - 1 && levelStore[currentLevel][rowStore][cellStore + 1]?.type === 'wall';
        const wallBottom = rowStore < levelStore[currentLevel].length - 1 && levelStore[currentLevel][rowStore + 1][cellStore]?.type === 'wall';
        const wallLeft = cellStore > 0 && levelStore[currentLevel][rowStore][cellStore - 1]?.type === 'wall';

        if (wallTop && !wallRight && !wallBottom && !wallLeft) cell.elem.classList.add('sidewall', 'top');
        else if (!wallTop && wallRight && !wallBottom && !wallLeft) cell.elem.classList.add('sidewall', 'right');
        else if (!wallTop && !wallRight && wallBottom && !wallLeft) cell.elem.classList.add('sidewall', 'bottom');
        else if (!wallTop && !wallRight && !wallBottom && wallLeft) cell.elem.classList.add('sidewall', 'left');
        else if (wallTop && !wallRight && wallBottom && !wallLeft) cell.elem.classList.add('hall', 'side');
        else if (!wallTop && wallRight && !wallBottom && wallLeft) cell.elem.classList.add('hall', 'up');
        else if (wallTop && !wallRight && !wallBottom && wallLeft) cell.elem.classList.add('corner', 'top-left');
        else if (wallTop && wallRight && !wallBottom && !wallLeft) cell.elem.classList.add('corner', 'top-right');
        else if (!wallTop && !wallRight && wallBottom && wallLeft) cell.elem.classList.add('corner', 'bottom-left');
        else if (!wallTop && wallRight && wallBottom && !wallLeft) cell.elem.classList.add('corner', 'bottom-right');
        else if (!wallTop && wallRight && wallBottom && wallLeft) cell.elem.classList.add('cap', 'top');
        else if (wallTop && !wallRight && wallBottom && wallLeft) cell.elem.classList.add('cap', 'right');
        else if (wallTop && wallRight && !wallBottom && wallLeft) cell.elem.classList.add('cap', 'bottom');
        else if (wallTop && wallRight && wallBottom && !wallLeft) cell.elem.classList.add('cap', 'left');
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
    } else {
      top = player.elem.offsetTop * -1 - sessionStats.zoomLevel * 4 + window.innerHeight / 2;
      left = player.elem.offsetLeft * -1 - sessionStats.zoomLevel * 4 + window.innerWidth / 2;
    }

    overrides.innerHTML = `#display-wrapper #game-grid {top: ${top}px; left: ${left}px;}`;
    if (viewingGoal) viewingGoal = false;
  };

  const centerOnGoal = () => {
    const goal: HTMLElement = document.querySelector('.goal')!;
    if (!goal) return;
    const top = goal.offsetTop * -1 - sessionStats.zoomLevel * 4 + window.innerHeight / 2;
    const left = goal.offsetLeft * -1 - sessionStats.zoomLevel * 4 + window.innerWidth / 2;
    overrides.innerHTML = `#display-wrapper #game-grid {top: ${top}px; left: ${left}px;}`;
    viewingGoal = true;
  };

  const showGoal = () => {
    viewingGoal ? centerPlayerInScreen() : centerOnGoal();
  };

  const enemyAITurn = () => {
    enemies[currentLevel].forEach((enemy: Enemy) => moveEnemy(enemy, randomDirection()));
  };

  const moveEnemy = (enemyObject: Enemy, direction: number) => {
    if (sessionStats.dead) return;
    let newPos: number[] = [...enemyObject.pos];
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

    const newCellData = levelStore[currentLevel][newPos[0]]?.[newPos[1]];
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
    } else if (enemyObject.moveTries < 3) {
      enemyObject.moveTries++;
      moveEnemy(enemyObject, randomDirection());
    }
  };

  const randomDirection = () => Math.floor(Math.random() * 4 + 1);

  const movePlayer = (direction: number) => {
    let newPos: number[] = [...player.pos];
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

    const newCellData = levelStore[currentLevel][newPos[0]]?.[newPos[1]];
    if (!newCellData || newCellData.type === 'wall') return;

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

  const renderPlayer = (pos: number[]) => {
    const tileSize = sessionStats.zoomLevel * 8;
    stylePlayer.innerHTML = `#display-wrapper #game-grid .row .cell.floor.player::after {top: ${pos[0] * tileSize}px; left: ${pos[1] * tileSize}px; height: ${tileSize}px; width: ${tileSize}px;}`;
  };

  const renderEnemies = () => {
    const tileSize = sessionStats.zoomLevel * 8;
    enemyStyles.innerHTML = enemies[currentLevel]
      .map(
        (enemyObj: Enemy) => `
      #display-wrapper #game-grid .row .cell.floor.enemy-${enemyObj.id}::after {
        top: ${enemyObj.pos[0] * tileSize}px;
        left: ${enemyObj.pos[1] * tileSize}px;
        height: ${tileSize}px;
        width: ${tileSize}px;
      }
    `
      )
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
    if (ui) background?.removeChild(ui);
    if (grid) background?.removeChild(grid);
  };

  const goToNewLevel = (newLevel: number) => {
    sessionStats.playing = true;
    sessionStats.turnsLevel = 0;
    sessionStats.goldLevel = 0;
    enemyCounter = 0;
    goldCounter = 0;
    collectedGold = [];
    eraseScreen();
    currentLevel = newLevel;
    refreshScreen();
  };

  // const newGame = () => {
  //   levelStore.length = 0;
  //   enemies.length = 0;
  //   goldPieces.length = 0;
  //   sessionStats.turnsTotal = 0;
  //   sessionStats.goldTotal = 0;
  //   sessionStats.playing = true;
  //   goToNewLevel(0);
  // };

  const backToTitleScreen = () => {
    // Reset all game variables to their default state when returning to title
    currentLevel = 0;
    levelStore = [];
    enemies = [];
    enemyCounter = 0;
    goldPieces = [];
    goldCounter = 0;
    collectedGold = [];
    player = undefined as any;
    viewingGoal = false;
    options = { centerMode: false };
    sessionStats = {
      turnsTotal: 0,
      turnsLevel: 0,
      retries: 0,
      zoomLevel: sessionStats.zoomLevel,
      dead: false,
      playing: false,
      mode: sessionStats.mode,
      goldTotal: 0,
      goldLevel: 0
    };
    eraseScreen();
    setTimeout(drawTitleScreen, 50);
  };

  const showMessageBox = (messageText: string, buttons: Array<{ text: string; action: () => void }>, layout: 'vertical' | 'inline' = 'vertical') => {
    const messageBox = document.querySelector('#message');
    if (!messageBox) return;

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

    const buttonElements: HTMLElement[] = [];
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

    const keydownHandler = (e: KeyboardEvent) => {
      const btn = e.target as HTMLElement;
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
      } else {
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

    setTimeout(() => {
      if (!isMobileScreen()) {
        buttonElements[0]?.focus();
      }
    }, 100);
  };

  const displayVictoryMessage = () => {
    playSuccessSound();

    // If the player has completed the final level in normal mode, capture
    // their run as a high score. For procedural mode or intermediate
    // levels the score will be recorded upon death or when returning to
    // the title screen.
    if (sessionStats.mode === 'normal' && levelData.length === currentLevel + 1) {
      recordHighScore();
    }
    const messageBox = document.querySelector('#message');
    if (!messageBox) return;

    messageBox.innerHTML = ''; // Clear existing content

    const goldDisplay = document.createElement('div');
    const goldText = document.createElement('div');
    const goldVisual = document.createElement('div');
    const message = document.createElement('p');
    const btnNextLevel = document.createElement('button');
    const btnBackToTitle = document.createElement('button');

    // Setup gold display
    goldDisplay.className = 'gold-display';
    goldText.className = 'gold-text';
    goldText.textContent = `Gold found: 0`;
    goldVisual.className = 'gold-visual';

    goldDisplay.appendChild(goldText);
    goldDisplay.appendChild(goldVisual);

    const buttons: HTMLElement[] = [];

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

    btnNextLevel.classList.add('btn');
    btnNextLevel.textContent = 'Go to level ' + (currentLevel + 2);
    btnNextLevel.setAttribute('tabindex', '0');
    const handleNextLevelBtn = (e?: Event) => {
      if (!e || (e instanceof KeyboardEvent && handleKeyboardConfirm(e)) || e.type === 'click') {
        e?.preventDefault?.();
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
    }

    btnBackToTitle.classList.add('btn');
    btnBackToTitle.textContent = 'Back to Title Screen';
    btnBackToTitle.setAttribute('tabindex', '0');
    const handleBackToTitleScreen = (e?: Event) => {
      if (!e || (e instanceof KeyboardEvent && handleKeyboardConfirm(e)) || e.type === 'click') {
        e?.preventDefault?.();
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

    if (sessionStats.mode === 'procedural' || (sessionStats.mode === 'normal' && levelData.length > currentLevel + 1)) {
      messageBox.appendChild(btnNextLevel);
      buttons.push(btnNextLevel);
    }

    // Only on the last level of a normal game, show the back to title button
    if (sessionStats.mode === 'normal' && levelData.length === currentLevel + 1) {
      messageBox.appendChild(btnBackToTitle);
      buttons.push(btnBackToTitle);
    }

    const sortedGold = [...collectedGold].sort((a, b) => a.value - b.value);
    let runningTotal = 0;
    playGoldSummarySound();
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

    if (sortedGold.length > 0) {
      setTimeout(stopGoldSummarySound, 300 + (sortedGold.length - 1) * 200 + 400);
    } else {
      setTimeout(stopGoldSummarySound, 700);
    }

    let currentFocusIndex = 0;
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
    if (!isMobileScreen()) {
      setTimeout(() => {
        btnNextLevel.focus();
        currentFocusIndex = buttons.indexOf(btnNextLevel);
      }, focusDelay);
    }
  };

  const newTurn = () => {
    sessionStats.turnsLevel++;
    sessionStats.turnsTotal++;
    if (!checkVictory()) {
      enemyAITurn();
      renderEnemies();
    } else {
      displayVictoryMessage();
    }
  };

  const death = () => {
    playDieSound();
    const playerGraphic = document.querySelector('.player');
    playerGraphic?.classList.add('ashes');
    sessionStats.dead = true;
    sessionStats.playing = false;

    // Record the player's score when they die. This captures the current
    // session statistics (gold collected, turns taken and level reached) and
    // appends them to the high score list. The high score list is trimmed
    // internally so only the top entries are retained.
    recordHighScore();

    const message = 'You died.<br /><br />The fire vortex consumed you in an instant, leaving only a pile of ash where you once stood.<br /><br />You lasted ' + sessionStats.turnsLevel + ' turns.';
    showMessageBox(message, [
      { text: 'Try Again', action: retryLevel },
      { text: 'Back to Title Screen', action: backToTitleScreen }
    ]);
  };

  const renderGoldPieces = () => {
    const tileSize = sessionStats.zoomLevel * 8;
    goldStyles.innerHTML = goldPieces[currentLevel]
      .map(
        (goldObj: Gold) => `
      #display-wrapper #game-grid .row .cell.floor.gold-${goldObj.id}::after {
        top: ${goldObj.pos[0] * tileSize}px;
        left: ${goldObj.pos[1] * tileSize}px;
        height: ${tileSize}px;
        width: ${tileSize}px;
      }
    `
      )
      .join('');
  };

  const showGoldCollectionText = (pos: number[], value: number) => {
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
    document.querySelector('#game-grid')?.appendChild(textElement);
    setTimeout(() => textElement.remove(), 1000);
  };

  const collectGoldAt = (pos: number[]) => {
    const goldIndex = goldPieces[currentLevel].findIndex((g: Gold) => g.pos[0] === pos[0] && g.pos[1] === pos[1]);
    if (goldIndex === -1) return;

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
    if (goldCounterElem) goldCounterElem.textContent = `Gold: ${sessionStats.goldTotal}`;

    const cellInside = cell.inside;
    cellInside.splice(cellInside.indexOf('gold'), 1);
    cell.elem.classList.remove('gold', `gold-${goldObj.id}`, goldObj.type);
    renderGoldPieces();
  };

  const handleTouchStart = (evt: TouchEvent) => {
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
  };

  const handleTouchEnd = (evt: TouchEvent) => {
    if (!xDown || !yDown || sessionStats.dead) return;

    const xUp = evt.changedTouches[0].clientX;
    const yUp = evt.changedTouches[0].clientY;
    const xDiff = xDown - xUp;
    const yDiff = yDown - yUp;
    const swipeThreshold = 10;

    if (Math.abs(xDiff) < swipeThreshold && Math.abs(yDiff) < swipeThreshold) {
      xDown = yDown = null;
      return;
    }

    if (!document.getElementById('message')?.classList.contains('show')) {
      if (Math.abs(xDiff) > Math.abs(yDiff)) {
        movePlayer(xDiff > 0 ? 4 : 2); // Left or Right
      } else {
        movePlayer(yDiff > 0 ? 1 : 3); // Up or Down
      }
      newTurn();
    }

    xDown = yDown = null;
  };

  document.addEventListener('touchstart', handleTouchStart, false);
  document.addEventListener('touchend', handleTouchEnd, false);

  document.addEventListener('keydown', (e) => {
    if (sessionStats.dead || document.getElementById('message')?.classList.contains('show')) return;

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

  // Re-initialize or resume audio when coming back from background or when the user interacts.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      resumeAudioIfNeeded();
    }
  });
  window.addEventListener('pageshow', () => {
    resumeAudioIfNeeded();
  });
  window.addEventListener('focus', () => {
    resumeAudioIfNeeded();
  });

  const unlockEvents: (keyof WindowEventMap)[] = ['pointerdown', 'touchstart', 'click', 'keydown'];
  unlockEvents.forEach((evt) => {
    window.addEventListener(
      evt,
      () => {
        unlockAudio();
      },
      { passive: true, once: false }
    );
  });

  const SAVE_COOKIE_NAME = 'roguelike_save';

  drawTitleScreen();
  initAudioSystem();
})();
