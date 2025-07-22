import { Enemy, Gold } from '../entities/types.js';

export const createStyleElements = () => {
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
  
  return { overrides, zoomLevelStyle, stylePlayer, goldStyles, enemyStyles };
};

export const renderPlayer = (pos: number[], zoomLevel: number, stylePlayer: HTMLStyleElement) => {
  const tileSize = zoomLevel * 8;
  stylePlayer.innerHTML = `#display-wrapper #game-grid .row .cell.floor.player::after {top: ${pos[0] * tileSize}px; left: ${pos[1] * tileSize}px; height: ${tileSize}px; width: ${tileSize}px;}`;
};

export const renderEnemies = (enemies: Enemy[], zoomLevel: number, enemyStyles: HTMLStyleElement) => {
  const tileSize = zoomLevel * 8;
  enemyStyles.innerHTML = enemies
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

export const renderGoldPieces = (goldPieces: Gold[], zoomLevel: number, goldStyles: HTMLStyleElement) => {
  const tileSize = zoomLevel * 8;
  goldStyles.innerHTML = goldPieces
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

export const drawDecorations = (levelStore: any[][]) => {
  for (let rowStore = 0; rowStore < levelStore.length; rowStore++) {
    for (let cellStore = 0; cellStore < levelStore[rowStore].length; cellStore++) {
      let cell = levelStore[rowStore][cellStore];
      if (!cell || cell.type !== 'floor') continue;

      const wallTop = rowStore > 0 && levelStore[rowStore - 1][cellStore]?.type === 'wall';
      const wallRight = cellStore < levelStore[rowStore].length - 1 && levelStore[rowStore][cellStore + 1]?.type === 'wall';
      const wallBottom = rowStore < levelStore.length - 1 && levelStore[rowStore + 1][cellStore]?.type === 'wall';
      const wallLeft = cellStore > 0 && levelStore[rowStore][cellStore - 1]?.type === 'wall';

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

export const showGoldCollectionText = (pos: number[], value: number, zoomLevel: number) => {
  const textElement = document.createElement('div');
  const tileSize = zoomLevel * 8;
  textElement.className = 'gold-text-animation';
  textElement.setAttribute('data-gold-value', `+${value}`);
  textElement.style.cssText = `
    top: ${pos[0] * tileSize}px;
    left: ${pos[1] * tileSize}px;
    width: ${tileSize}px;
    height: ${tileSize}px;
    font-size: ${Math.max(zoomLevel * 4, 24)}px;
  `;
  document.querySelector('#game-grid')?.appendChild(textElement);
  setTimeout(() => textElement.remove(), 1000);
};