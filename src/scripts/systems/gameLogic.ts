import { Enemy, Player, Gold, goldTypes } from '../entities/types.js';
import { playWalkSound, playGoldPickupSound, playDieSound, stopGoldSummarySound } from './audioSystem.js';
import { showGoldCollectionText } from './renderSystem.js';
import { showMessageBox } from '../ui/messageBox.js';

export const createGameLogic = () => {
  const randomDirection = () => Math.floor(Math.random() * 4 + 1);

  const moveEnemy = (enemyObject: Enemy, direction: number, levelStore: any[][], isDead: boolean) => {
    if (isDead) return;
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

    const newCellData = levelStore[newPos[0]]?.[newPos[1]];
    if (newCellData && newCellData.type !== 'wall' && !newCellData.inside.includes('enemy')) {
      if (newCellData.inside.includes('player')) {
        return 'player_hit';
      }
      const oldCellInside = levelStore[enemyObject.pos[0]][enemyObject.pos[1]].inside;
      oldCellInside.splice(oldCellInside.indexOf('enemy'), 1);
      newCellData.inside.push('enemy');
      enemyObject.pos = newPos;
      enemyObject.elem = newCellData.elem;
      enemyObject.moveTries = 0;
    } else if (enemyObject.moveTries < 3) {
      enemyObject.moveTries++;
      return moveEnemy(enemyObject, randomDirection(), levelStore, isDead);
    }
    return null;
  };

  const enemyAITurn = (enemies: Enemy[], levelStore: any[][], isDead: boolean) => {
    for (const enemy of enemies) {
      const result = moveEnemy(enemy, randomDirection(), levelStore, isDead);
      if (result === 'player_hit') {
        return 'player_hit';
      }
    }
    return null;
  };

  const movePlayer = (
    direction: number,
    player: Player,
    levelStore: any[][],
    goldPieces: Gold[],
    sessionStats: any,
    collectedGold: { value: number; type: string }[]
  ) => {
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

    const newCellData = levelStore[newPos[0]]?.[newPos[1]];
    if (!newCellData || newCellData.type === 'wall') return false;

    if (newCellData.inside.includes('enemy')) {
      return 'death';
    }

    playWalkSound();
    if (newCellData.inside.includes('gold')) {
      collectGoldAt(newPos, goldPieces, levelStore, sessionStats, collectedGold);
    }

    const oldCellInside = levelStore[player.pos[0]][player.pos[1]].inside;
    oldCellInside.splice(oldCellInside.indexOf('player'), 1);
    newCellData.inside.push('player');

    player.pos = newPos;
    player.elem = newCellData.elem;

    return true;
  };

  const collectGoldAt = (
    pos: number[],
    goldPieces: Gold[],
    levelStore: any[][],
    sessionStats: any,
    collectedGold: { value: number; type: string }[]
  ) => {
    const goldIndex = goldPieces.findIndex((g: Gold) => g.pos[0] === pos[0] && g.pos[1] === pos[1]);
    if (goldIndex === -1) return;

    const [goldObj] = goldPieces.splice(goldIndex, 1);
    const cell = levelStore[pos[0]][pos[1]];

    showGoldCollectionText(pos, goldObj.value, sessionStats.zoomLevel);
    playGoldPickupSound(goldObj.type);
    collectedGold.push({ value: goldObj.value, type: goldObj.type });
    sessionStats.goldLevel += goldObj.value;
    sessionStats.goldTotal += goldObj.value;

    if (goldPieces.length === 1) {
      stopGoldSummarySound();
    }

    const goldCounterElem = document.querySelector('#gold-counter');
    if (goldCounterElem) goldCounterElem.textContent = `Gold: ${sessionStats.goldTotal}`;

    const cellInside = cell.inside;
    cellInside.splice(cellInside.indexOf('gold'), 1);
    cell.elem.classList.remove('gold', `gold-${goldObj.id}`, goldObj.type);
  };

  const checkVictory = (player: Player, levelStore: any[][]) => {
    return levelStore[player.pos[0]][player.pos[1]].inside.includes('stairsDown');
  };

  const death = (sessionStats: any, onRetry: () => void, onBackToTitle: () => void) => {
    playDieSound();
    const playerGraphic = document.querySelector('.player');
    playerGraphic?.classList.add('ashes');
    sessionStats.dead = true;

    const message = 'You died.<br /><br />The fire vortex consumed you in an instant, leaving only a pile of ash where you once stood.<br /><br />You lasted ' + sessionStats.turnsLevel + ' turns.';
    showMessageBox(message, [
      { text: 'Try Again', action: onRetry },
      { text: 'Back to Title Screen', action: onBackToTitle }
    ]);
  };

  return {
    movePlayer,
    enemyAITurn,
    checkVictory,
    death,
    collectGoldAt
  };
};