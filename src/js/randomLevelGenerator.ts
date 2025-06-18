export const generateRandomLevel = (currentLevel: number, levelHeight: number, levelWidth: number): string => {
  let randLevelDatabase: any[] = [];
  const roomNum: number = Math.floor(Math.random() * (currentLevel + 4) + 3);
  const rooms: Room[] = []; // Specify the type of rooms
  const enemies: number = Math.floor(Math.random() * 5) + 3 + Math.floor(Math.random() * currentLevel * 2); // Random number of enemies, with more based on the level
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
  let creationAttempts = 0;
  // This loop ensures the generator tries to create the desired number of rooms,
  // with a failsafe to prevent it from running forever.
  while (rooms.length < roomNum && creationAttempts < 200) {
    // The 'id' for a new room should be the current number of rooms,
    // as the createRoom and overlapCheck functions rely on this index.
    createRoom(rooms.length);
    creationAttempts++;
  }

  // Function to connect rooms with hallways
  const connectRooms = (roomA: Room, roomB: Room) => {
    const [y1, x1] = roomA.getCenter();
    const [y2, x2] = roomB.getCenter();

    // Carve a path, overwriting anything (empty, wall) with floor
    const carveFloor = (y: number, x: number) => {
      if (y >= 0 && y < levelHeight && x >= 0 && x < levelWidth) {
        levelGrid[y][x] = '';
      }
    };

    // Place a wall tile, but only on empty space
    const placeWall = (y: number, x: number) => {
      if (y >= 0 && y < levelHeight && x >= 0 && x < levelWidth) {
        if (levelGrid[y][x] === '.') {
          levelGrid[y][x] = '#';
        }
      }
    };

    if (Math.random() < 0.5) {
      // Horizontal then vertical corridor
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        carveFloor(y1, x);
        placeWall(y1 - 1, x);
        placeWall(y1 + 1, x);
      }
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        carveFloor(y, x2);
        placeWall(y, x2 - 1);
        placeWall(y, x2 + 1);
      }
      
      // Add corner walls at the bend
      placeWall(y1 - 1, x2 - 1); // Top-left corner
      placeWall(y1 - 1, x2 + 1); // Top-right corner
      placeWall(y1 + 1, x2 - 1); // Bottom-left corner
      placeWall(y1 + 1, x2 + 1); // Bottom-right corner
    } else {
      // Vertical then horizontal corridor
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        carveFloor(y, x1);
        placeWall(y, x1 - 1);
        placeWall(y, x1 + 1);
      }
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        carveFloor(y2, x);
        placeWall(y2 - 1, x);
        placeWall(y2 + 1, x);
      }
      
      // Add corner walls at the bend
      placeWall(y2 - 1, x1 - 1); // Top-left corner
      placeWall(y2 - 1, x1 + 1); // Top-right corner
      placeWall(y2 + 1, x1 - 1); // Bottom-left corner
      placeWall(y2 + 1, x1 + 1); // Bottom-right corner
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
      if (rooms.length > 1) {
        // Pick any other room if the furthest is not found for some reason
        furthestRoom = rooms.find((r) => r.id !== playerStartRoom.id) || null;
      }
      if (!furthestRoom) {
        furthestRoom = playerStartRoom; // Fallback to the same room if it's the only one
      }
    }

    let placed = false;
    while (!placed) {
      const y = furthestRoom.corners.topLeft[0] + 1 + Math.floor(Math.random() * (furthestRoom.height - 2));
      const x = furthestRoom.corners.topLeft[1] + 1 + Math.floor(Math.random() * (furthestRoom.width - 2));
      if (y >= 0 && y < levelHeight && x >= 0 && x < levelWidth && levelGrid[y][x] === '') {
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

  // Find the bounds of the actual content
  let minY = levelHeight;
  let maxY = 0;
  let minX = levelWidth;
  let maxX = 0;

  // Find the actual bounds of the level content
  for (let y = 0; y < levelHeight; y++) {
    for (let x = 0; x < levelWidth; x++) {
      if (levelGrid[y][x] !== '.') {
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
    }
  }

  // Calculate content dimensions and offsets for centering
  const contentHeight = maxY - minY + 1;
  const contentWidth = maxX - minX + 1;
  const offsetY = Math.floor((levelHeight - contentHeight) / 2) - minY;
  const offsetX = Math.floor((levelWidth - contentWidth) / 2) - minX;

  // Create a new centered grid
  const centeredGrid: string[][] = Array.from({ length: levelHeight }, () => new Array(levelWidth).fill('.'));

  // Copy content to centered position
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const newY = y + offsetY;
      const newX = x + offsetX;
      if (newY >= 0 && newY < levelHeight && newX >= 0 && newX < levelWidth) {
        centeredGrid[newY][newX] = levelGrid[y][x];
      }
    }
  }

  // Convert grid to CSV
  const csvOutput: string = centeredGrid.map((row) => row.join(',')).join('\n');

  return csvOutput;
};
