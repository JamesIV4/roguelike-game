export const generateRandomLevel = (
  currentLevel: number,
  levelHeight: number,
  levelWidth: number
): string => {
  let randLevelDatabase: any[] = [];
  const roomNum: number = Math.floor(Math.random() * (currentLevel + 4) + 3);
  const rooms: Room[] = []; // Specify the type of rooms
  const enemies: number = Math.floor(Math.random() * 5) + 3; // Random number of enemies
  let playerPlaced: boolean = false;

  // Initialize a 2D array filled with empty spaces
  const levelGrid: string[][] = Array.from({ length: levelHeight }, () =>
    new Array(levelWidth).fill('.')
  );

  class Room {
    public corners: { topLeft: number[]; bottomRight: number[] };

    constructor(
      public id: number,
      public extraSize: number,
      public height: number = Math.floor(Math.random() * 10 + 4) + extraSize,
      public width: number = Math.floor(Math.random() * 10 + 4) + extraSize,
      public centerPos: number[] = [
        Math.floor(Math.random() * 30 + 1),
        Math.floor(Math.random() * 30 + 1)
      ]
    ) {
      this.corners = { topLeft: [], bottomRight: [] };
      this.calculateCorners();
    }

    private calculateCorners = () => {
      this.corners.topLeft = [
        Math.round(this.centerPos[0] - this.height / 2),
        Math.round(this.centerPos[1] - this.width / 2)
      ];
      this.corners.bottomRight = [
        this.corners.topLeft[0] + this.height,
        this.corners.topLeft[1] + this.width
      ];
    };

    public addRoomToGrid = (grid: string[][]) => {
      for (
        let i = this.corners.topLeft[0];
        i < this.corners.bottomRight[0];
        i++
      ) {
        for (
          let j = this.corners.topLeft[1];
          j < this.corners.bottomRight[1];
          j++
        ) {
          if (i >= 0 && i < grid.length && j >= 0 && j < grid[i].length) {
            if (
              i === this.corners.topLeft[0] || // Top wall
              i === this.corners.bottomRight[0] - 1 || // Bottom wall
              j === this.corners.topLeft[1] || // Left wall
              j === this.corners.bottomRight[1] - 1 // Right wall
            ) {
              grid[i][j] = '#'; // Fill room with walls
            } else {
              grid[i][j] = ''; // Fill room with floor (empty space)
            }
          }
        }
      }
    };
  }

  const overlapCheck = (id: number): boolean => {
    if (id >= rooms.length || id < 0) {
      return false; // Return false if id is out of bounds
    }

    const roomChecking = rooms[id];

    for (
      let comparingIndex = 0;
      comparingIndex < rooms.length;
      comparingIndex++
    ) {
      const roomComparingTo = rooms[comparingIndex];
      if (roomChecking.id !== roomComparingTo.id) {
        // Overlap detection logic
        if (
          roomChecking.corners.bottomRight[0] >
            roomComparingTo.corners.topLeft[0] &&
          roomChecking.corners.topLeft[0] <
            roomComparingTo.corners.bottomRight[0] &&
          roomChecking.corners.bottomRight[1] >
            roomComparingTo.corners.topLeft[1] &&
          roomChecking.corners.topLeft[1] <
            roomComparingTo.corners.bottomRight[1]
        ) {
          return true; // Overlap detected
        }
      }
    }
    return false;
  };

  const createRoom = (id: number) => {
    const bigger: boolean = Math.random() < 0.15;
    const howMuch: number = Math.floor(Math.random() * 6 + 2);
    let tries: number = 0;

    const newRoom = new Room(id, bigger ? howMuch : 0);

    // Ensure the room fits within the grid before adding it
    if (
      newRoom.corners.topLeft[0] >= 0 &&
      newRoom.corners.bottomRight[0] < levelHeight &&
      newRoom.corners.topLeft[1] >= 0 &&
      newRoom.corners.bottomRight[1] < levelWidth
    ) {
      rooms.push(newRoom);
      if (!overlapCheck(id)) {
        newRoom.addRoomToGrid(levelGrid); // Add room to the grid
      } else {
        rooms.pop();
        tries += 1;
        if (tries <= 5) createRoom(id); // Try again if overlap
      }
    }
  };

  // Create rooms and add them to the grid
  for (let roomIndex = 0; roomIndex < roomNum; roomIndex++) {
    createRoom(roomIndex);
  }

  // Place enemies randomly on the grid
  const placeEnemies = (numEnemies: number) => {
    let placed: number = 0;
    while (placed < numEnemies) {
      const x: number = Math.floor(Math.random() * levelHeight);
      const y: number = Math.floor(Math.random() * levelWidth);
      if (levelGrid[x][y] === '') {
        levelGrid[x][y] = 'F'; // Place an enemy
        placed++;
      }
    }
  };

  // Place a player randomly on the grid
  const placePlayer = () => {
    let placed: boolean = false;
    while (!placed) {
      const x: number = Math.floor(Math.random() * levelHeight);
      const y: number = Math.floor(Math.random() * levelWidth);
      if (levelGrid[x][y] === '') {
        levelGrid[x][y] = '@'; // Place the player
        placed = true;
      }
    }
  };

  // Place enemies and player on the grid
  placeEnemies(enemies);
  placePlayer();

  // Convert grid to CSV
  const csvOutput: string = levelGrid.map((row) => row.join(',')).join('\n');

  console.log('GENERATED LEVEL:', csvOutput);

  return csvOutput;
};
