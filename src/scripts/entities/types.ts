export type SessionStats = {
  turnsTotal: number;
  turnsLevel: number;
  retries: number;
  zoomLevel: number;
  dead: boolean;
  mode: 'normal' | 'procedural';
  goldTotal: number;
  goldLevel: number;
};

export type GoldType = {
  id: string;
  minValue: number;
  maxValue: number;
  image: string;
};

export const goldTypes: GoldType[] = [
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

export class Enemy {
  constructor(
    public elem: HTMLElement,
    public id: number,
    public pos: number[],
    public type: string,
    public health: number,
    public moveTries: number = 0
  ) {}
}

export class Gold {
  constructor(
    public elem: HTMLElement,
    public id: number,
    public pos: number[],
    public type: string,
    public value: number
  ) {}
}

export class Player {
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

export class Cell {
  constructor(
    public elem: HTMLElement,
    public id: any,
    public type?: string,
    public inside: any[] = []
  ) {}
}