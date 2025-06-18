// Generated: Wednesday, June 18, 2025 at 11:49:24 AM EDT
export const generateRandomLevel = (currentLevel, levelHeight, levelWidth) => {
    let randLevelDatabase = [];
    const roomNum = Math.floor(Math.random() * (currentLevel + 4) + 3);
    const rooms = []; // Specify the type of rooms
    const enemies = Math.floor(Math.random() * 5) + 3; // Random number of enemies
    let playerPlaced = false;
    // Initialize a 2D array filled with empty spaces
    const levelGrid = Array.from({ length: levelHeight }, () => new Array(levelWidth).fill('.'));
    class Room {
        constructor(id, extraSize, height = Math.floor(Math.random() * 10 + 4) + extraSize, width = Math.floor(Math.random() * 10 + 4) + extraSize, centerPos = [Math.floor(Math.random() * 30 + 1), Math.floor(Math.random() * 30 + 1)]) {
            this.id = id;
            this.extraSize = extraSize;
            this.height = height;
            this.width = width;
            this.centerPos = centerPos;
            this.calculateCorners = () => {
                this.corners.topLeft = [Math.round(this.centerPos[0] - this.height / 2), Math.round(this.centerPos[1] - this.width / 2)];
                this.corners.bottomRight = [this.corners.topLeft[0] + this.height, this.corners.topLeft[1] + this.width];
            };
            this.addRoomToGrid = (grid) => {
                for (let i = this.corners.topLeft[0]; i < this.corners.bottomRight[0]; i++) {
                    for (let j = this.corners.topLeft[1]; j < this.corners.bottomRight[1]; j++) {
                        if (i >= 0 && i < grid.length && j >= 0 && j < grid[i].length) {
                            if (i === this.corners.topLeft[0] || // Top wall
                                i === this.corners.bottomRight[0] - 1 || // Bottom wall
                                j === this.corners.topLeft[1] || // Left wall
                                j === this.corners.bottomRight[1] - 1 // Right wall
                            ) {
                                grid[i][j] = '#'; // Set walls
                            }
                            else {
                                grid[i][j] = ''; // Set floor as an empty string
                            }
                        }
                    }
                }
            };
            this.getCenter = () => {
                return [Math.floor((this.corners.topLeft[0] + this.corners.bottomRight[0]) / 2), Math.floor((this.corners.topLeft[1] + this.corners.bottomRight[1]) / 2)];
            };
            this.corners = { topLeft: [], bottomRight: [] };
            this.calculateCorners();
        }
    }
    const overlapCheck = (id) => {
        if (id >= rooms.length || id < 0) {
            return false; // Return false if id is out of bounds
        }
        const roomChecking = rooms[id];
        for (let comparingIndex = 0; comparingIndex < rooms.length; comparingIndex++) {
            const roomComparingTo = rooms[comparingIndex];
            if (roomChecking.id !== roomComparingTo.id) {
                // Overlap detection logic
                if (roomChecking.corners.bottomRight[0] > roomComparingTo.corners.topLeft[0] &&
                    roomChecking.corners.topLeft[0] < roomComparingTo.corners.bottomRight[0] &&
                    roomChecking.corners.bottomRight[1] > roomComparingTo.corners.topLeft[1] &&
                    roomChecking.corners.topLeft[1] < roomComparingTo.corners.bottomRight[1]) {
                    return true; // Overlap detected
                }
            }
        }
        return false;
    };
    const createRoom = (id) => {
        const bigger = Math.random() < 0.15;
        const howMuch = Math.floor(Math.random() * 6 + 2);
        let tries = 0;
        const newRoom = new Room(id, bigger ? howMuch : 0);
        // Ensure the room fits within the grid before adding it
        if (newRoom.corners.topLeft[0] >= 0 && newRoom.corners.bottomRight[0] < levelHeight && newRoom.corners.topLeft[1] >= 0 && newRoom.corners.bottomRight[1] < levelWidth) {
            rooms.push(newRoom);
            if (!overlapCheck(id)) {
                newRoom.addRoomToGrid(levelGrid); // Add room to the grid
            }
            else {
                rooms.pop();
                tries += 1;
                if (tries <= 5)
                    createRoom(id); // Try again if overlap
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
    const connectRooms = (roomA, roomB) => {
        const [y1, x1] = roomA.getCenter();
        const [y2, x2] = roomB.getCenter();
        // Carve a path, overwriting anything (empty, wall) with floor
        const carveFloor = (y, x) => {
            if (y >= 0 && y < levelHeight && x >= 0 && x < levelWidth) {
                levelGrid[y][x] = '';
            }
        };
        // Place a wall tile, but only on empty space
        const placeWall = (y, x) => {
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
        }
        else {
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
        }
    };
    // Connect all rooms
    if (rooms.length > 1) {
        for (let i = 0; i < rooms.length - 1; i++) {
            connectRooms(rooms[i], rooms[i + 1]);
        }
    }
    // Place a player randomly in a room and return the room object
    const placePlayer = () => {
        if (rooms.length === 0)
            return null;
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
    const placeGoal = (playerStartRoom) => {
        let furthestRoom = null;
        let maxDist = -1;
        for (const room of rooms) {
            if (room.id === playerStartRoom.id)
                continue;
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
    const placeEnemies = (numEnemies) => {
        let placed = 0;
        let tries = 0;
        while (placed < numEnemies && tries < levelHeight * levelWidth) {
            const y = Math.floor(Math.random() * levelHeight);
            const x = Math.floor(Math.random() * levelWidth);
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
    const csvOutput = levelGrid.map((row) => row.join(',')).join('\n');
    console.log('GENERATED LEVEL:', csvOutput);
    return csvOutput;
};
