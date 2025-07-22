const handleKeyboardConfirm = (e?: KeyboardEvent) => (e && (e.key === 'Enter' || e.key === ' ')) || !e;

export const showMessageBox = (messageText: string, buttons: Array<{ text: string; action: () => void }>, layout: 'vertical' | 'inline' = 'vertical') => {
  const messageBox = document.querySelector('#message');
  if (!messageBox) return;

  messageBox.innerHTML = '';
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

  setTimeout(() => buttonElements[0]?.focus(), 100);
};