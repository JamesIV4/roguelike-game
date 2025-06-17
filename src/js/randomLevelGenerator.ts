export const generateRandomLevel = (currentLevel: number, levelHeight: number, levelWidth: number): string => {
  let randLevelDatabase: any[] = [];
  const roomNum: number = Math.floor(Math.random() * (currentLevel + 4) + 3);
  const rooms: Room[] = []; // Specify the type of rooms
  const enemies: number = Math.floor(Math.random() * 5) + 3; // Random number of enemies
  let playerPlaced: boolean = false;

  // Initialize a 2D array filled with empty spaces
  const levelGrid: string[][] = Array.from({ length: levelHeight }, () => new Array(levelWidth).fill('.'));

  class Room {
    public corners: { topLeft: number[]; bottomRight: number[] };

    constructor(
      public id: number,
      public extraSize: number,
      public height: number = Math.floor(Math.random() * 10 + 4) + extraSize,
      public width: number = Math.floor(Math.random() * 10 + 4) + extraSize,
      public centerPos: number[] = [Math.floor(Math.random() * 30 + 1), Math.floor(Math.random() * 30 + 1)]
    ) {
      this.corners = { topLeft: [], bottomRight: [] };
      this.calculateCorners();
    }

    private calculateCorners = () => {
      this.corners.topLeft = [Math.round(this.centerPos[0] - this.height / 2), Math.round(this.centerPos[1] - this.width / 2)];
      this.corners.bottomRight = [this.corners.topLeft[0] + this.height, this.corners.topLeft[1] + this.width];
    };

    public addRoomToGrid = (grid: string[][]) => {
      for (let i = this.corners.topLeft[0]; i < this.corners.bottomRight[0]; i++) {
        for (let j = this.corners.topLeft[1]; j < this.corners.bottomRight[1]; j++) {
          if (i >= 0 && i < grid.length && j >= 0 && j < grid[i].length) {
            if (
              i === this.corners.topLeft[0] || // Top wall
              i === this.corners.bottomRight[0] - 1 || // Bottom wall
              j === this.corners.topLeft[1] || // Left wall
              j === this.corners.bottomRight[1] - 1 // Right wall
            ) {
              grid[i][j] = '#'; // Set walls
            } else {
              grid[i][j] = ''; // Set floor as an empty string
            }
          }
        }
      }
    };

    public getCenter = (): number[] => {
      return [Math.floor((this.corners.topLeft[0] + this.corners.bottomRight[0]) / 2), Math.floor((this.corners.topLeft[1] + this.corners.bottomRight[1]) / 2)];
    };
  }

  const overlapCheck = (id: number): boolean => {
    if (id >= rooms.length || id < 0) {
      return false; // Return false if id is out of bounds
    }

    const roomChecking = rooms[id];

    for (let comparingIndex = 0; comparingIndex < rooms.length; comparingIndex++) {
      const roomComparingTo = rooms[comparingIndex];
      if (roomChecking.id !== roomComparingTo.id) {
        // Overlap detection logic
        if (
          roomChecking.corners.bottomRight[0] > roomComparingTo.corners.topLeft[0] &&
          roomChecking.corners.topLeft[0] < roomComparingTo.corners.bottomRight[0] &&
          roomChecking.corners.bottomRight[1] > roomComparingTo.corners.topLeft[1] &&
          roomChecking.corners.topLeft[1] < roomComparingTo.corners.bottomRight[1]
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
    if (newRoom.corners.topLeft[0] >= 0 && newRoom.corners.bottomRight[0] < levelHeight && newRoom.corners.topLeft[1] >= 0 && newRoom.corners.bottomRight[1] < levelWidth) {
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

  // Function to connect rooms with hallways
  const connectRooms = (roomA: Room, roomB: Room) => {
    // Get center coordinates [y, x] for both rooms
    const [y1, x1] = roomA.getCenter();
    const [y2, x2] = roomB.getCenter();

    if (Math.random() < 0.5) {
      // First, carve a horizontal corridor
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        if (y1 >= 0 && y1 < levelHeight && x >= 0 && x < levelWidth) {
          if (levelGrid[y1][x] === '.') levelGrid[y1][x] = ''; // Carve floor
          // Place walls if adjacent is empty
          if (y1 > 0 && levelGrid[y1 - 1][x] === '.') levelGrid[y1 - 1][x] = '#';
          if (y1 < levelHeight - 1 && levelGrid[y1 + 1][x] === '.') levelGrid[y1 + 1][x] = '#';
        }
      }
      // Then, carve a vertical corridor
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        if (y >= 0 && y < levelHeight && x2 >= 0 && x2 < levelWidth) {
          if (levelGrid[y][x2] === '.') levelGrid[y][x2] = ''; // Carve floor
          // Place walls if adjacent is empty
          if (x2 > 0 && levelGrid[y][x2 - 1] === '.') levelGrid[y][x2 - 1] = '#';
          if (x2 < levelWidth - 1 && levelGrid[y][x2 + 1] === '.') levelGrid[y][x2 + 1] = '#';
        }
      }
    } else {
      // First, carve a vertical corridor
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        if (y >= 0 && y < levelHeight && x1 >= 0 && x1 < levelWidth) {
          if (levelGrid[y][x1] === '.') levelGrid[y][x1] = ''; // Carve floor
          // Place walls if adjacent is empty
          if (x1 > 0 && levelGrid[y][x1 - 1] === '.') levelGrid[y][x1 - 1] = '#';
          if (x1 < levelWidth - 1 && levelGrid[y][x1 + 1] === '.') levelGrid[y][x1 + 1] = '#';
        }
      }
      // Then, carve a horizontal corridor
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        if (y2 >= 0 && y2 < levelHeight && x >= 0 && x < levelWidth) {
          if (levelGrid[y2][x] === '.') levelGrid[y2][x] = ''; // Carve floor
          // Place walls if adjacent is empty
          if (y2 > 0 && levelGrid[y2 - 1][x] === '.') levelGrid[y2 - 1][x] = '#';
          if (y2 < levelHeight - 1 && levelGrid[y2 + 1][x] === '.') levelGrid[y2 + 1][x] = '#';
        }
      }
    }
  };

  // Connect all rooms
  if (rooms.length > 1) {
    for (let i = 0; i < rooms.length - 1; i++) {
      connectRooms(rooms[i], rooms[i + 1]);
    }
  }

  // Place a player randomly in a room and return the room object
  const placePlayer = (): Room | null => {
    if (rooms.length === 0) return null;
    const startRoom = rooms[Math.floor(Math.random() * rooms.length)];
    let placed = false;
    while (!placed) {
      const y = startRoom.corners.topLeft[0] + 1 + Math.floor(Math.random() * (startRoom.height - 2));
      const x = startRoom.corners.topLeft[1] + 1 + Math.floor(Math.random() * (startRoom.width - 2));
      if (y < levelHeight && x < levelWidth && levelGrid[y][x] === '') {
        levelGrid[y][x] = '@';
        placed = true;
      }
    }
    return startRoom;
  };

  // Place the goal 'C' in the room furthest from the player's start
  const placeGoal = (playerStartRoom: Room) => {
    let furthestRoom: Room | null = null;
    let maxDist = -1;

    for (const room of rooms) {
      if (room.id === playerStartRoom.id) continue;
      const [y1, x1] = playerStartRoom.getCenter();
      const [y2, x2] = room.getCenter();
      const distance = Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
      if (distance > maxDist) {
        maxDist = distance;
        furthestRoom = room;
      }
    }

    if (!furthestRoom) {
      furthestRoom = playerStartRoom; // Fallback to the same room if it's the only one
    }

    let placed = false;
    while (!placed) {
      const y = furthestRoom.corners.topLeft[0] + 1 + Math.floor(Math.random() * (furthestRoom.height - 2));
      const x = furthestRoom.corners.topLeft[1] + 1 + Math.floor(Math.random() * (furthestRoom.width - 2));
      if (y < levelHeight && x < levelWidth && levelGrid[y][x] === '') {
        levelGrid[y][x] = 'C';
        placed = true;
      }
    }
  };

  // Place enemies randomly on empty floor tiles
  const placeEnemies = (numEnemies: number) => {
    let placed: number = 0;
    let tries = 0;
    while (placed < numEnemies && tries < levelHeight * levelWidth) {
      const y: number = Math.floor(Math.random() * levelHeight);
      const x: number = Math.floor(Math.random() * levelWidth);
      if (levelGrid[y][x] === '') {
        levelGrid[y][x] = 'F'; // Place an enemy
        placed++;
      }
      tries++;
    }
  };

  // Place everything on the grid if rooms were generated
  if (rooms.length > 0) {
    const playerRoom = placePlayer();
    if (playerRoom) {
      placeGoal(playerRoom);
    }
    placeEnemies(enemies);
  }

  // Convert grid to CSV
  const csvOutput: string = levelGrid.map((row) => row.join(',')).join('\n');

  console.log('GENERATED LEVEL:', csvOutput);

  return csvOutput;
};
