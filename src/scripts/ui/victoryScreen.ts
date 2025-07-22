import { playSuccessSound, playGoldSummarySound, stopGoldSummarySound } from '../systems/audioSystem.js';
import { SessionStats } from '../entities/types.js';

const handleKeyboardConfirm = (e?: KeyboardEvent) => (e && (e.key === 'Enter' || e.key === ' ')) || !e;

export const displayVictoryMessage = (
  sessionStats: SessionStats,
  currentLevel: number,
  collectedGold: { value: number; type: string }[],
  levelDataLength: number,
  onPlayAgain: () => void,
  onNextLevel: () => void,
  onBackToTitle: () => void
) => {
  playSuccessSound();
  const messageBox = document.querySelector('#message');
  if (!messageBox) return;

  messageBox.innerHTML = '';

  const goldDisplay = document.createElement('div');
  const goldText = document.createElement('div');
  const goldVisual = document.createElement('div');
  const message = document.createElement('p');
  const btnPlayAgain = document.createElement('button');
  const btnNextLevel = document.createElement('button');
  const btnBackToTitle = document.createElement('button');

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

  const playAgainOrNewGame = () => {
    if (sessionStats.mode === 'normal' && levelDataLength === currentLevel + 1) {
      setTimeout(onPlayAgain, 360);
    } else {
      setTimeout(onPlayAgain, 360);
    }
  };

  btnPlayAgain.classList.add('btn');
  btnPlayAgain.textContent = 'Play again';
  btnPlayAgain.setAttribute('tabindex', '0');
  const handleBtnPlayAgain = (e?: Event) => {
    if (!e || (e instanceof KeyboardEvent && handleKeyboardConfirm(e)) || e.type === 'click') {
      e?.preventDefault?.();
      closeMessageWindow();
      playAgainOrNewGame();
    }
  };
  btnPlayAgain.addEventListener('click', handleBtnPlayAgain);
  btnPlayAgain.addEventListener('keydown', (e) => handleBtnPlayAgain(e));

  btnNextLevel.classList.add('btn');
  btnNextLevel.textContent = 'Go to level ' + (currentLevel + 2);
  btnNextLevel.setAttribute('tabindex', '0');
  const handleNextLevelBtn = (e?: Event) => {
    if (!e || (e instanceof KeyboardEvent && handleKeyboardConfirm(e)) || e.type === 'click') {
      e?.preventDefault?.();
      closeMessageWindow();
      setTimeout(onNextLevel, 360);
    }
  };
  btnNextLevel.addEventListener('click', handleNextLevelBtn);
  btnNextLevel.addEventListener('keydown', (e) => handleNextLevelBtn(e));

  message.innerHTML = 'You beat level ' + (currentLevel + 1) + '!<br /><br />You completed it in ' + sessionStats.turnsLevel + ' turns. Good job!';
  if (sessionStats.mode === 'normal' && levelDataLength === currentLevel + 1) {
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

  btnBackToTitle.classList.add('btn');
  btnBackToTitle.textContent = 'Back to Title Screen';
  btnBackToTitle.setAttribute('tabindex', '0');
  const handleBackToTitleScreen = (e?: Event) => {
    if (!e || (e instanceof KeyboardEvent && handleKeyboardConfirm(e)) || e.type === 'click') {
      e?.preventDefault?.();
      closeMessageWindow();
      setTimeout(onBackToTitle, 360);
    }
  };
  btnBackToTitle.addEventListener('click', handleBackToTitleScreen);
  btnBackToTitle.addEventListener('keydown', (e) => handleBackToTitleScreen(e));

  messageBox.appendChild(goldDisplay);
  messageBox.appendChild(message);
  messageBox.appendChild(btnPlayAgain);
  buttons.push(btnPlayAgain);

  if (sessionStats.mode === 'procedural' || (sessionStats.mode === 'normal' && levelDataLength > currentLevel + 1)) {
    messageBox.appendChild(btnNextLevel);
    buttons.push(btnNextLevel);
  }

  messageBox.appendChild(btnBackToTitle);
  buttons.push(btnBackToTitle);

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
  if (messageBox.contains(btnNextLevel)) {
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