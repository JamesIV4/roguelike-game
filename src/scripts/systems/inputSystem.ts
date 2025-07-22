export const createInputSystem = (
  onMove: (direction: number) => void,
  isGameActive: () => boolean
) => {
  let xDown: number | null = null;
  let yDown: number | null = null;

  const handleTouchStart = (evt: TouchEvent) => {
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
  };

  const handleTouchEnd = (evt: TouchEvent) => {
    if (!xDown || !yDown || !isGameActive()) return;

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
        onMove(xDiff > 0 ? 4 : 2); // Left or Right
      } else {
        onMove(yDiff > 0 ? 1 : 3); // Up or Down
      }
    }

    xDown = yDown = null;
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isGameActive() || document.getElementById('message')?.classList.contains('show')) return;

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
      onMove(direction);
    }
  };

  document.addEventListener('touchstart', handleTouchStart, false);
  document.addEventListener('touchend', handleTouchEnd, false);
  document.addEventListener('keydown', handleKeyDown);

  return {
    cleanup: () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('keydown', handleKeyDown);
    }
  };
};