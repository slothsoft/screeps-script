var Room = require('./mock/room-mock');

var RoomManager = require('../src/manager.room');
var assert = require('assert');

/*
 * If you want to add another supported tile type, add it to:
 * - constants (if it's a new group of constants)
 * - #fetchTileAt
 * - #fetchFreeBuildingSlots (if it's a building tile)
 */

describe('manager.room', () => {
	before(() => {
	    global.Game = require('./mock/game-mock').Game;
	});

	beforeEach(() => {
		Game.clearAll();
	});
	
	it('exists', () => {
		var startsWith = 'class RoomManager';
		assert.equal(startsWith, RoomManager.toString().substring(0, startsWith.length));
	});

	describe('constants', () => {
		var testConstant = function(constant, acceptedStructures, notExpectedStructures) {
			assert.notEqual(true, constant.character == true, 'Could not find character for ' + JSON.stringify(constant));
			assert.notEqual(undefined, constant.isEqual, 'Could not find isEqual() for ' + constant.character + " (" + JSON.stringify(constant) + ")");
			
			var structures = acceptedStructures.filter(structure => constant.isEqual(structure));
			assert.equal(1, structures.length, 'Could not find accepted structure for ' + constant.character + " (" + JSON.stringify(constant) + ")");

			var structures = notExpectedStructures.filter(structure => constant.isEqual(structure));
			assert.equal(0, structures.length, 'Found not accepted structure for ' + constant.character + " (" + JSON.stringify(constant) + "): " + JSON.stringify(structures));
		};
		it('TILES_TERRAIN', () => {
			RoomManager.TILES_TERRAIN.forEach(constant => testConstant(constant,
					[
						// acceptedStructures
						{ type: LOOK_TERRAIN,  terrain: 'plain' },
						{ type: LOOK_TERRAIN,  terrain: 'swamp' },
						{ type: LOOK_TERRAIN,  terrain: 'wall' },
					],
					[
						// notExpectedStructures
						{ type: LOOK_STRUCTURES, structure: { structureType: STRUCTURE_CONTROLLER } },
						{ type: LOOK_MINERALS },

						{ type: LOOK_STRUCTURES, structure: { structureType: STRUCTURE_EXTENSION } },

						{ type: LOOK_STRUCTURES, structure: { structureType: STRUCTURE_WALL } },
						{ type: LOOK_STRUCTURES, structure: { structureType: STRUCTURE_RAMPART } },
					]));
		});
		it('TILES_PRESET', () => {
			RoomManager.TILES_PRESET.forEach(constant => testConstant(constant,
					[
						// acceptedStructures
						{ type: LOOK_STRUCTURES, structure: { structureType: STRUCTURE_CONTROLLER } },
						{ type: LOOK_MINERALS },
					],
					[
						// notExpectedStructures
						{ type: LOOK_TERRAIN,  terrain: 'plain' },
						{ type: LOOK_TERRAIN,  terrain: 'swamp' },
						{ type: LOOK_TERRAIN,  terrain: 'wall' },

						{ type: LOOK_STRUCTURES, structure: { structureType: STRUCTURE_EXTENSION } },

						{ type: LOOK_STRUCTURES, structure: { structureType: STRUCTURE_WALL } },
						{ type: LOOK_STRUCTURES, structure: { structureType: STRUCTURE_RAMPART } },
					]));
		});
		it('TILES_TO_BE_BUILD', () => {
			RoomManager.TILES_TO_BE_BUILD.forEach(constant => testConstant(constant,
					[
						// acceptedStructures
						{ type: LOOK_STRUCTURES, structure: { structureType: STRUCTURE_EXTENSION } },
					],
					[
						// notExpectedStructures
						{ type: LOOK_TERRAIN,  terrain: 'plain' },
						{ type: LOOK_TERRAIN,  terrain: 'swamp' },
						{ type: LOOK_TERRAIN,  terrain: 'wall' },

						{ type: LOOK_STRUCTURES, structure: { structureType: STRUCTURE_CONTROLLER } },
						{ type: LOOK_MINERALS },

						{ type: LOOK_STRUCTURES, structure: { structureType: STRUCTURE_WALL } },
						{ type: LOOK_STRUCTURES, structure: { structureType: STRUCTURE_RAMPART } },
					]));
		});
		it('TILES_ENDLESS_STRUCTURES', () => {
			RoomManager.TILES_ENDLESS_STRUCTURES.forEach(constant => testConstant(constant,
					[
						// acceptedStructures
						{ type: LOOK_STRUCTURES, structure: { structureType: STRUCTURE_WALL } },
						{ type: LOOK_STRUCTURES, structure: { structureType: STRUCTURE_RAMPART } },
					],
					[
						// notExpectedStructures
						{ type: LOOK_TERRAIN,  terrain: 'plain' },
						{ type: LOOK_TERRAIN,  terrain: 'swamp' },
						{ type: LOOK_TERRAIN,  terrain: 'wall' },

						{ type: LOOK_STRUCTURES, structure: { structureType: STRUCTURE_CONTROLLER } },
						{ type: LOOK_MINERALS },

						{ type: LOOK_STRUCTURES, structure: { structureType: STRUCTURE_EXTENSION } },
					]));
		});
	});
	
	describe('#fetchMemoryOfManager', () => {
		it('no memory', () => {
			var room = new Room();
	
			var result = new RoomManager(room)._fetchMemoryOfManager();
			
			var expecting = {
				debug: false,
			};
			
			assert.deepEqual(expecting, result);
			assert.deepEqual(expecting, room.memory.roomManager);
		});

		it('some memory', () => {
			var room = new Room();
			room.memory.roomManager = {
				debug: true,
			};
	
			var result = new RoomManager(room)._fetchMemoryOfManager();
			
			var expecting = {
				debug: true,
			};
			
			assert.deepEqual(expecting, result);
			assert.deepEqual(expecting, room.memory.roomManager);
		});

		it('memory present', () => {
			var room = new Room();
			room.memory.roomManager = {
				debug: true,
			};
	
			var result = new RoomManager(room)._fetchMemoryOfManager();
			
			var expecting = {
				debug: true,
			};
			
			assert.deepEqual(expecting, result);
			assert.deepEqual(expecting, room.memory.roomManager);
		});
	});
	
	var allTiles = [];
	
	describe('#fetchTileAt', () => { // & filterByTiles()
		var testFetchTileAt = function(stuff, expectedCharacter) {
			allTiles.push({ stuff: stuff, expectedCharacter: expectedCharacter});
			
			var room = new Room();
			room.lookAt = (x, y) => [ stuff ];
			
			var roomManager = new RoomManager(room);
			var character = roomManager._fetchTileAt(1, 2);

			assert.equal(expectedCharacter, character, 'Could not get character from ' + JSON.stringify(stuff));
		};
		it('plain', () => {
			testFetchTileAt({ type: LOOK_TERRAIN,  terrain: 'plain' }, RoomManager.TILE_TILE_TERRAIN_PLAIN);
		});
		it('swamp', () => {
			testFetchTileAt({ type: LOOK_TERRAIN,  terrain: 'swamp' }, RoomManager.TILE_TILE_TERRAIN_SWAMP);
		});
		it('wall', () => {
			testFetchTileAt({ type: LOOK_TERRAIN,  terrain: 'wall' }, RoomManager.TILE_TILE_TERRAIN_WALL);
		});
		it('controller', () => {
			testFetchTileAt({ type: LOOK_STRUCTURES, structure: { structureType: STRUCTURE_CONTROLLER } }, RoomManager.TILE_CONTROLLER);
		});
		it('mineral', () => {
			testFetchTileAt({ type: LOOK_MINERALS }, RoomManager.TILE_MINERAL);
		});
		it('extension', () => {
			testFetchTileAt({ type: LOOK_STRUCTURES, structure: { structureType: STRUCTURE_EXTENSION } }, RoomManager.TILE_EXTENSION);
		});
		it('wall', () => {
			testFetchTileAt({ type: LOOK_STRUCTURES, structure: { structureType: STRUCTURE_WALL } }, RoomManager.TILE_WALL);
		});
		it('rampart', () => {
			testFetchTileAt({ type: LOOK_STRUCTURES, structure: { structureType: STRUCTURE_RAMPART } }, RoomManager.TILE_RAMPART);
		});
	});

	it('#initArray', () => {
		const startY = 42;

		var room = new Room();
		room.lookAt = (x, y) => (y == startY && x < allTiles.length) ? [ allTiles[x].stuff ] : [];
		
		var roomManager = new RoomManager(room);
		roomManager._initArray();

		assert.notEqual(undefined, roomManager._array);
		for (var i = 0; i < allTiles.length; i++) {
			assert.equal(allTiles[i].expectedCharacter, roomManager._array.get(i, startY));
		}
	});

	it('#initArrayIfNecessary', () => {
		var startY = 42;

		var room = new Room();
		room.lookAt = (x, y) => ((y == startY) && (x < allTiles.length)) ? [ allTiles[x].stuff ] : [];
		
		var roomManager = new RoomManager(room);
		roomManager._initArrayIfNecessary();
		
		roomManager._initArray = () => { assert.fail('_initArray() should not have been called again!') };
		roomManager._initArrayIfNecessary();
		roomManager._initArrayIfNecessary();
		roomManager._initArrayIfNecessary();

		assert.notEqual(undefined, roomManager._array);
		for (var i = 0; i < allTiles.length; i++) {
			assert.equal(allTiles[i].expectedCharacter, roomManager._array.get(i, startY));
		}
	});
	
	describe('#fetchBuildingSitePositionsForTile', () => { 
		var testFetchBuildingSitePositionsForTile = function(tile) {
			var room = new Room();
			room.lookAt = (x, y) => ((x == 13) && (y == 42)) ? [ tile.stuff ] : [];
			
			var roomManager = new RoomManager(room);
			var positions = roomManager.fetchBuildingSitePositionsForTile(tile.expectedCharacter);
			
			assert.notEqual(undefined, positions, 'Positions for ' + JSON.stringify(tile.stuff) + ' was undefined!');
			assert.equal(1, positions.length, 'Could not find ' + JSON.stringify(tile.stuff) + ' in room!');

			assert.equal(13, positions[0].x);
			assert.equal(42, positions[0].y);
			assert.equal(room.name, positions[0].roomName);
		}
		it('find', () => {
			allTiles.forEach(tile => testFetchBuildingSitePositionsForTile(tile));
		});
		it('no find', () => {
			var room = new Room();
			room.lookAt = (x, y) => [];
			
			var roomManager = new RoomManager(room);
			var positions = roomManager.fetchBuildingSitePositionsForTile('Ü');
			
			assert.notEqual(undefined, positions);
			assert.equal(0, positions.length);
		});
	});
	
	describe('#fetchFreeBuildingSlots', () => { // fetchAvailableSlots & fetchUsedSlots
		var testFetchFreeBuildingSlots = function(tileCharacter, roomLevel, usedStructures, expectedResult) {
			var room = new Room();
			room.controller = { level: roomLevel };
			room.find = () => { 
				var tile = allTiles.filter(tile => tile.expectedCharacter == tileCharacter)[0];
				var result = []
				for (var i = 0; i < usedStructures; i++) {
					result.push(tile.structure);
				}
				return result;
			};
			
			var roomManager = new RoomManager(room);
			var result = roomManager.fetchFreeBuildingSlots(tileCharacter);
			
			assert.notEqual(undefined, result);
			assert.equal(expectedResult, result);
		}
		it('extensions', () => {
			// Available {0: 0, 1: 0, 2: 5, 3: 10, 4: 20, 5: 30, 6: 40, 7: 50, 8: 60}
			testFetchFreeBuildingSlots(RoomManager.TILE_EXTENSION, 0, 0, 0);
			testFetchFreeBuildingSlots(RoomManager.TILE_EXTENSION, 1, 0, 0);
			testFetchFreeBuildingSlots(RoomManager.TILE_EXTENSION, 2, 3, 2);
			testFetchFreeBuildingSlots(RoomManager.TILE_EXTENSION, 3, 10, 0);
			testFetchFreeBuildingSlots(RoomManager.TILE_EXTENSION, 4, 0, 20);
			testFetchFreeBuildingSlots(RoomManager.TILE_EXTENSION, 5, 13, 17);
			testFetchFreeBuildingSlots(RoomManager.TILE_EXTENSION, 6, 5, 35);
			testFetchFreeBuildingSlots(RoomManager.TILE_EXTENSION, 7, 55, -5);
			testFetchFreeBuildingSlots(RoomManager.TILE_EXTENSION, 8, 44, 16);
		});
	});
	
	// _printRoom()

});

