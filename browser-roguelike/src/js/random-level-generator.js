/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
function generateRandomLevel(currentLevel) {
	var randLevelDatabase = [];
	var roomNum = Math.floor((Math.random() * (currentLevel + 4)) + 3);
	var rooms = [];
	var levelHeight = 0;
	var levelWidth = 0;

	function Room(id, roomSize, extraSize) {
		this.id = id;
		this.extraSize = extraSize;
		this.height = Math.floor((Math.random() * (10)) + 4) + extraSize;
		this.width = Math.floor((Math.random() * (10)) + 4) + extraSize;
		this.centerPos = [(Math.floor((Math.random() * roomSize) + 1)), (Math.floor((Math.random() * roomSize) + 1))];
		this.corners = {};
		this.corners.topLeft = [(Math.round(this.centerPos[0] + (this.centerPos[0] / 2))), (Math.round(this.centerPos[1] - (this.centerPos[1] / 2)))];
		this.corners.topRight = [this.corners.topLeft[0], this.corners.topLeft[1] + this.width];
		this.corners.bottomLeft = [this.corners.topLeft[0] + this.height, this.corners.topLeft[1]];
		this.corners.bottomRight = [this.corners.topLeft[0] + this.height, this.corners.topLeft[1] + this.width];
	}

	// Create the rooms
	for (var creationIndex = 0; creationIndex < roomNum; creationIndex++) {
		var bigger = Math.random() < 0.15;
		var howMuch = Math.floor((Math.random() * 6) + 2);

		// if (bigger) {
		// 	console.log('Making room ' + (creationIndex + 1) + ' ' + howMuch + ' tiles bigger');
		// 	rooms.push(new Room(creationIndex, 30, howMuch));
		// } else {
		// 	rooms.push(new Room(creationIndex, 30, 0));
		// }

		rooms.push(new Room(creationIndex, 30, 0));
	}

	// Find the right positions for the rooms
	for (var checkingIndex = 0; checkingIndex < rooms.length; checkingIndex++) {
		var roomChecking = rooms[checkingIndex];

		// Compare each room to the others
		for (let comparingIndex = 0; comparingIndex < rooms.length; comparingIndex++) {
			var roomComparingTo = rooms[comparingIndex];
			
			if (roomChecking.id != roomComparingTo.id) { // Do not compare a room to itself
				
				// Check the top left
				if (between(roomComparingTo.corners.topLeft[0], roomChecking.corners.topLeft[0], roomChecking.corners.bottomRight[0]) &&
					between(roomComparingTo.corners.topLeft[1], roomChecking.corners.topLeft[1], roomChecking.corners.bottomRight[1])) {
					console.log('Top left of room ' + comparingIndex + ' is in range of room ' + checkingIndex);
				}
				
				// Check the top right
				if (between(roomComparingTo.corners.topRight[0], roomChecking.corners.topLeft[0], roomChecking.corners.bottomRight[0]) &&
					between(roomComparingTo.corners.topRight[1], roomChecking.corners.topLeft[1], roomChecking.corners.bottomRight[1])) {
					console.log('Top right of room ' + comparingIndex + ' is in range of room ' + checkingIndex);
				}
				
				// Check the bottom left
				if (between(roomComparingTo.corners.bottomLeft[0], roomChecking.corners.topLeft[0], roomChecking.corners.bottomRight[0]) &&
					between(roomComparingTo.corners.bottomLeft[1], roomChecking.corners.topLeft[1], roomChecking.corners.bottomRight[1])) {
					console.log('Top right of room ' + comparingIndex + ' is in range of room ' + checkingIndex);
				}
				
				// Check the bottom right
				if (between(roomComparingTo.corners.bottomRight[0], roomChecking.corners.topLeft[0], roomChecking.corners.bottomRight[0]) &&
					between(roomComparingTo.corners.bottomRight[1], roomChecking.corners.topLeft[1], roomChecking.corners.bottomRight[1])) {
					console.log('Top right of room ' + comparingIndex + ' is in range of room ' + checkingIndex);
				}
			}				
		}
	}
	
	console.log(roomNum);
	console.log(rooms);

	function between(x, min, max) {
		return x >= min && x <= max;
	}
}

generateRandomLevel(0);