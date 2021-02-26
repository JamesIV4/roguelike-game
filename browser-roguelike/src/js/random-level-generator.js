/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

function generateRandomLevel(currentLevel) {
	var levelDatabase = [];
	var roomNum = Math.floor((Math.random() * (currentLevel + 3)) + 2);
	var rooms = [];
	var levelHeight = 0;
	var levelWidth = 0;

	function Room(id) {
		this.id = id;
		this.height = Math.floor((Math.random() * (10)) + 4);
		this.width = Math.floor((Math.random() * (10)) + 4);
	}

	// Create the rooms
	for (var i = 0; i < roomNum; i++) {
		rooms.push(new Room(i));
	}

	// Find the right positions for the rooms
	for (var ii = 0; ii < rooms.length; ii++) {
		var room = rooms[ii];
		var determineNewRow = Math.floor((Math.random() * 2) + 1);

		if (ii === 0) { // First room only
			room.pos = [1, 1];

			levelHeight = room.height + 2; // One extra row above and below
			levelWidth = room.width + 2; // One extra col on both sides
		} else {
			if (determineNewRow === 1) { // We want this room on a new row below the last room
				room.pos = [(levelHeight + 1), 1];
				console.log('Room ' + (ii+1) + ' is on a new row');
				
				// Increase level width and height
				levelHeight += room.height + 2;	
				
				if (room.width > levelWidth) { // If the room is wider than the level, expand it by the difference plus 2
					levelWidth += (room.width - rooms[ii - 1].width) + 2;
				}
				
			} else { // We want this room to the right of the last room
				room.pos = [rooms[ii - 1].pos[0], (rooms[ii - 1].pos[1] + rooms[ii - 1].width + 2)]; // top is same as the last room, left is last room position + width + 2
				console.log('Room ' + (ii+1) + ' stacking to the right');
				
				// Increase level width and height
				levelWidth += room.width + 2;
				
				if (room.height > levelHeight) { // If the room is taller than the level, expand it by the difference plus 2
					levelHeight += (room.height - rooms[ii - 1].height) + 2;
				}
			}
		}
	}
	
	console.log('levelWidth: ' + levelWidth);
	console.log('levelHeight: ' + levelHeight);
	console.log(rooms);
}

generateRandomLevel();