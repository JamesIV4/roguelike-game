const handleKeyboardConfirm = (e?: KeyboardEvent) => (e && (e.key === 'Enter' || e.key === ' ')) || !e;

export const drawTitleScreen = (onStartGame: (mode: 'normal' | 'procedural') => void) => {
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

  const buttons = [btnStartNormal, btnStartProcudural];
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
    btnStartNormal.focus();
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

  const handleStartButton = async (gameMode: 'normal' | 'procedural', e?: KeyboardEvent | MouseEvent) => {
    if (!e || e.type === 'click' || handleKeyboardConfirm(e as KeyboardEvent)) {
      closeTitlescreen();
      onStartGame(gameMode);
    }
  };

  btnStartNormal.addEventListener('click', (e) => handleStartButton('normal', e), { once: true });
  btnStartNormal.addEventListener('keydown', (e) => handleStartButton('normal', e), { once: true });
  btnStartProcudural.addEventListener('click', (e) => handleStartButton('procedural', e), { once: true });
  btnStartProcudural.addEventListener('keydown', (e) => handleStartButton('procedural', e), { once: true });
};