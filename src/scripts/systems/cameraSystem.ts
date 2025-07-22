import { Player } from '../entities/types.js';

export const createCameraSystem = () => {
  let viewingGoal = false;
  let options = { centerMode: false };

  const toggleCenterMode = () => {
    options.centerMode = !options.centerMode;
  };

  const centerPlayerInScreen = (player: Player, levelStore: any[][], zoomLevel: number, overrides: HTMLStyleElement) => {
    let top, left;
    const topLevelOffset = (levelStore.length / 2 - player.pos[0]) * zoomLevel * 4;
    const leftLevelOffset = (levelStore[0].length / 2 - player.pos[1]) * zoomLevel * 4;

    if (!options.centerMode) {
      top = player.elem.offsetTop * -1 - zoomLevel * 4 + window.innerHeight / 2 - Math.min(Math.max(topLevelOffset * 0.75, -window.innerHeight / 3), window.innerHeight / 3);
      left = player.elem.offsetLeft * -1 - zoomLevel * 4 + window.innerWidth / 2 - Math.min(Math.max(leftLevelOffset * 0.75, -window.innerWidth / 3), window.innerWidth / 3);
    } else {
      top = player.elem.offsetTop * -1 - zoomLevel * 4 + window.innerHeight / 2;
      left = player.elem.offsetLeft * -1 - zoomLevel * 4 + window.innerWidth / 2;
    }

    overrides.innerHTML = `#display-wrapper #game-grid {top: ${top}px; left: ${left}px;}`;
    if (viewingGoal) viewingGoal = false;
  };

  const centerOnGoal = (zoomLevel: number, overrides: HTMLStyleElement) => {
    const goal: HTMLElement = document.querySelector('.goal')!;
    if (!goal) return;
    const top = goal.offsetTop * -1 - zoomLevel * 4 + window.innerHeight / 2;
    const left = goal.offsetLeft * -1 - zoomLevel * 4 + window.innerWidth / 2;
    overrides.innerHTML = `#display-wrapper #game-grid {top: ${top}px; left: ${left}px;}`;
    viewingGoal = true;
  };

  const showGoal = (player: Player, levelStore: any[][], zoomLevel: number, overrides: HTMLStyleElement) => {
    viewingGoal ? centerPlayerInScreen(player, levelStore, zoomLevel, overrides) : centerOnGoal(zoomLevel, overrides);
  };

  return {
    toggleCenterMode,
    centerPlayerInScreen,
    centerOnGoal,
    showGoal,
    getViewingGoal: () => viewingGoal
  };
};