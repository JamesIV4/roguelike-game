// Generated: Friday, October 4, 2024 at 04:37:15 PM EDT
export const generateRandomLevel = (currentLevel, levelHeight, levelWidth) => {
    let randLevelDatabase = [];
    const roomNum = Math.floor(Math.random() * (currentLevel + 4) + 3);
    const rooms = []; // Specify the type of rooms
    const enemies = Math.floor(Math.random() * 5) + 3; // Random number of enemies
    let playerPlaced = false;
    // Initialize a 2D array filled with empty spaces
    const levelGrid = Array.from({ length: levelHeight }, () => new Array(levelWidth).fill('.'));
    class Room {
        constructor(id, extraSize, height = Math.floor(Math.random() * 10 + 4) + extraSize, width = Math.floor(Math.random() * 10 + 4) + extraSize, centerPos = [
            Math.floor(Math.random() * 30 + 1),
            Math.floor(Math.random() * 30 + 1)
        ]) {
            this.id = id;
            this.extraSize = extraSize;
            this.height = height;
            this.width = width;
            this.centerPos = centerPos;
            this.calculateCorners = () => {
                this.corners.topLeft = [
                    Math.round(this.centerPos[0] - this.height / 2),
                    Math.round(this.centerPos[1] - this.width / 2)
                ];
                this.corners.bottomRight = [
                    this.corners.topLeft[0] + this.height,
                    this.corners.topLeft[1] + this.width
                ];
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
                return [
                    Math.floor((this.corners.topLeft[0] + this.corners.bottomRight[0]) / 2),
                    Math.floor((this.corners.topLeft[1] + this.corners.bottomRight[1]) / 2)
                ];
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
                if (roomChecking.corners.bottomRight[0] >
                    roomComparingTo.corners.topLeft[0] &&
                    roomChecking.corners.topLeft[0] <
                        roomComparingTo.corners.bottomRight[0] &&
                    roomChecking.corners.bottomRight[1] >
                        roomComparingTo.corners.topLeft[1] &&
                    roomChecking.corners.topLeft[1] <
                        roomComparingTo.corners.bottomRight[1]) {
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
        if (newRoom.corners.topLeft[0] >= 0 &&
            newRoom.corners.bottomRight[0] < levelHeight &&
            newRoom.corners.topLeft[1] >= 0 &&
            newRoom.corners.bottomRight[1] < levelWidth) {
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
    for (let roomIndex = 0; roomIndex < roomNum; roomIndex++) {
        createRoom(roomIndex);
    }
    // Function to connect rooms with hallways
    const connectRooms = (roomA, roomB) => {
        const centerA = roomA.getCenter();
        const centerB = roomB.getCenter();
        const [startX, startY] = centerA;
        const [endX, endY] = centerB;
        if (Math.random() < 0.5) {
            // Horizontal then vertical
            for (let x = Math.min(startX, endX); x <= Math.max(startX, endX); x++) {
                if (levelGrid[startY][x] !== undefined) {
                    levelGrid[startY][x] = '#'; // Horizontal hallway walls
                    if (startY - 1 >= 0)
                        levelGrid[startY - 1][x] = '.'; // Empty space above
                    if (startY + 1 < levelHeight)
                        levelGrid[startY + 1][x] = '.'; // Empty space below
                }
            }
            for (let y = Math.min(startY, endY); y <= Math.max(startY, endY); y++) {
                if (levelGrid[y]) {
                    levelGrid[y][endX] = '#'; // Vertical hallway walls
                    if (endX - 1 >= 0)
                        levelGrid[y][endX - 1] = '.'; // Empty space to the left
                    if (endX + 1 < levelWidth)
                        levelGrid[y][endX + 1] = '.'; // Empty space to the right
                }
            }
        }
        else {
            // Vertical then horizontal
            for (let y = Math.min(startY, endY); y <= Math.max(startY, endY); y++) {
                if (levelGrid[y]) {
                    levelGrid[y][startX] = '#'; // Vertical hallway walls
                    if (startX - 1 >= 0)
                        levelGrid[y][startX - 1] = '.'; // Empty space to the left
                    if (startX + 1 < levelWidth)
                        levelGrid[y][startX + 1] = '.'; // Empty space to the right
                }
            }
            for (let x = Math.min(startX, endX); x <= Math.max(startX, endX); x++) {
                if (levelGrid[endY]) {
                    levelGrid[endY][x] = '#'; // Horizontal hallway walls
                    if (endY - 1 >= 0)
                        levelGrid[endY - 1][x] = '.'; // Empty space above
                    if (endY + 1 < levelHeight)
                        levelGrid[endY + 1][x] = '.'; // Empty space below
                }
            }
        }
    };
    // Connect all rooms
    for (let i = 0; i < rooms.length - 1; i++) {
        connectRooms(rooms[i], rooms[i + 1]);
    }
    // Place enemies randomly on the grid
    const placeEnemies = (numEnemies) => {
        let placed = 0;
        while (placed < numEnemies) {
            const x = Math.floor(Math.random() * levelHeight);
            const y = Math.floor(Math.random() * levelWidth);
            if (levelGrid[x][y] === '') {
                levelGrid[x][y] = 'F'; // Place an enemy
                placed++;
            }
        }
    };
    // Place a player randomly on the grid
    const placePlayer = () => {
        let placed = false;
        while (!placed) {
            const x = Math.floor(Math.random() * levelHeight);
            const y = Math.floor(Math.random() * levelWidth);
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
    const csvOutput = levelGrid.map((row) => row.join(',')).join('\n');
    console.log('GENERATED LEVEL:', csvOutput);
    return csvOutput;
};
