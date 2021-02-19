var Room = require('./mock/room-mock');
var Spawn = require('./mock/spawn-mock');

var RoomManager = require('../src/manager.room');
var assert = require('assert');

var TileArray = require('../src/tile.array');

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
						{ type: LOOK_STRUCTURES, structure: { structureType: STRUCTURE_SPAWN } },

						{ type: LOOK_STRUCTURES, structure: { structureType: STRUCTURE_WALL } },
						{ type: LOOK_STRUCTURES, structure: { structureType: STRUCTURE_RAMPART } },
					]));
		});
		it('TILES_TO_BE_BUILD', () => {
			RoomManager.TILES_TO_BE_BUILD.forEach(constant => testConstant(constant,
					[
						// acceptedStructures
						{ type: LOOK_STRUCTURES, structure: { structureType: STRUCTURE_EXTENSION } },
						{ type: LOOK_STRUCTURES, structure: { structureType: STRUCTURE_SPAWN } },
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
						{ type: LOOK_STRUCTURES, structure: { structureType: STRUCTURE_SPAWN } },
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
			testFetchTileAt({ type: LOOK_TERRAIN,  terrain: 'plain' }, RoomManager.TILE_TERRAIN_PLAIN);
		});
		it('swamp', () => {
			testFetchTileAt({ type: LOOK_TERRAIN,  terrain: 'swamp' }, RoomManager.TILE_TERRAIN_SWAMP);
		});
		it('wall', () => {
			testFetchTileAt({ type: LOOK_TERRAIN,  terrain: 'wall' }, RoomManager.TILE_TERRAIN_WALL);
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
		it('spawn', () => {
			testFetchTileAt({ type: LOOK_STRUCTURES, structure: { structureType: STRUCTURE_SPAWN } }, RoomManager.TILE_SPAWN);
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
			assert.equal(expectedResult, result, 'Unexpected result for fetchFreeBuildingSlots()! roomLevel=' + roomLevel + ', usedStructures=' + usedStructures);
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

		it('spawn', () => {
			// "spawn": {0: 0, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 2, 8: 3}
			testFetchFreeBuildingSlots(RoomManager.TILE_SPAWN, 0, 0, 0);
			testFetchFreeBuildingSlots(RoomManager.TILE_SPAWN, 1, 0, 1);
			testFetchFreeBuildingSlots(RoomManager.TILE_SPAWN, 2, 1, 0);
			testFetchFreeBuildingSlots(RoomManager.TILE_SPAWN, 3, 0, 1);
			testFetchFreeBuildingSlots(RoomManager.TILE_SPAWN, 4, 1, 0);
			testFetchFreeBuildingSlots(RoomManager.TILE_SPAWN, 5, 0, 1);
			testFetchFreeBuildingSlots(RoomManager.TILE_SPAWN, 6, 1, 0);
			testFetchFreeBuildingSlots(RoomManager.TILE_SPAWN, 7, 0, 2);
			testFetchFreeBuildingSlots(RoomManager.TILE_SPAWN, 8, 3, 0);
		});
	});

	describe('#generateLayout', () => {
		it('default', () => {
			const startY = 42;
	
			var room = new Room();
			room.lookAt = (x, y) => (y == startY && x < allTiles.length) ? [ allTiles[x].stuff ] : [];
			
			var roomManager = new RoomManager(room);
			var array = roomManager._generateLayout();
	
			assert.notEqual(undefined, array);
			for (var i = 0; i < allTiles.length; i++) {
				assert.equal(allTiles[i].expectedCharacter, array.get(i, startY));
			}
		});

		it('with array', () => {
			const startY = 1;
	
			var room = new Room();
			room.lookAt = (x, y) => (y == startY && x < allTiles.length) ? [ allTiles[x + 3].stuff ] : [];

			var array = new TileArray(5, 3);
			
			var roomManager = new RoomManager(room);
			roomManager._generateLayout(array);

			var compactString = 
				"?????" +
				"Ø©oSw" + 
				"?????";
	
			assert.notEqual(undefined, array);
			assert.equal(compactString, array.toCompactString());
		});

		it('with spawn', () => {
			var spawn = new Spawn();
			spawn.pos.x = 1;
			spawn.pos.y = 1;
			
			var room = new Room();
			room.lookAt = (x, y) => 
				(x == spawn.pos.x && y ==spawn.pos.y) ? 
					[ { type: LOOK_STRUCTURES, structure: spawn } ] : 
					[ { type: LOOK_TERRAIN,  terrain: 'plain' } ];
			room.find = () => [ spawn ];

			var array = new TileArray(5, 3);
			
			var roomManager = new RoomManager(room);
			roomManager._generateLayout(array);

			var compactString = 
				"o o o" +
				" S o " + 
				"o o o";
	
			assert.notEqual(undefined, array);
			assert.equal(compactString, array.toCompactString());
		});

		it('with spawn & extension count', () => {
			var spawn = new Spawn();
			spawn.pos.x = 1;
			spawn.pos.y = 1;
			
			var room = new Room();
			room.lookAt = (x, y) => 
				(x == spawn.pos.x && y ==spawn.pos.y) ? 
					[ { type: LOOK_STRUCTURES, structure: spawn } ] : 
					[ { type: LOOK_TERRAIN,  terrain: 'plain' } ];
			room.find = () => [ spawn ];

			var array = new TileArray(5, 3);
			
			var roomManager = new RoomManager(room);
			roomManager._getExtensionsCount = () => 5;
			roomManager._generateLayout(array);

			var compactString = 
				"o o  " +
				" S o " + 
				"o o  ";
	
			assert.notEqual(undefined, array);
			assert.equal(compactString, array.toCompactString());
		});

		it('with spawn & terrain', () => {
			var spawn = new Spawn();
			spawn.pos.x = 1;
			spawn.pos.y = 1;
			
			var room = new Room();
			room.lookAt = (x, y) => {
				if (x == spawn.pos.x && y == spawn.pos.y) {
					return [ { type: LOOK_STRUCTURES, structure: spawn } ];
				}
				if (x == 0) {
					return [ { type: LOOK_TERRAIN,  terrain: 'wall' } ];
				}
				if (x == 2) {
					return [ { type: LOOK_TERRAIN,  terrain: 'swamp' } ];
				}
				return [ { type: LOOK_TERRAIN,  terrain: 'plain' } ];
			}
			room.find = () => [ spawn ];

			
			var roomManager = new RoomManager(room);
			
			// test 1 - no extensions

			var array = new TileArray(5, 3);
			roomManager._getExtensionsCount = () => 0;
			roomManager._generateExistingTiles(array);

			var compactString = 
				"█ ~  " +
				"█S~  " + 
				"█ ~  ";
	
			assert.notEqual(undefined, array);
			assert.equal(compactString, array.toCompactString());
			
			// test 2 - many extensions

			array = new TileArray(5, 3);
			roomManager._getExtensionsCount = () => 10;
			roomManager._generateLayout(array);

			compactString = 
				"█ o o" +
				"█S~o " + 
				"█ o o";
	
			assert.notEqual(undefined, array);
			assert.equal(compactString, array.toCompactString());
		});

		it('with spawn & existing extensions', () => {
			var spawn = new Spawn();
			spawn.pos.x = 1;
			spawn.pos.y = 1;
			
			var room = new Room();
			room.lookAt = (x, y) => {
				if (x == spawn.pos.x && y == spawn.pos.y) {
					return [ { type: LOOK_STRUCTURES, structure: spawn } ];
				}
				if (x == 0) {
					return [ { type: LOOK_STRUCTURES, structure: { structureType: STRUCTURE_EXTENSION } } ];
				}
				return [ { type: LOOK_TERRAIN,  terrain: 'plain' } ];
			}
			room.find = () => [ spawn ];

			var array = new TileArray(5, 3);
			
			var roomManager = new RoomManager(room);
			roomManager._getExtensionsCount = () => 5;
			roomManager._generateLayout(array);

			var compactString = 
				"o o  " +
				"oS   " + 
				"o o  ";
	
			assert.notEqual(undefined, array);
			assert.equal(compactString, array.toCompactString());
		});
	});

	describe('#generateLayoutForRoom', () => {
		it('default', () => {
			var spawn = new Spawn();
			spawn.pos.x = 1;
			spawn.pos.y = 1;
			
			var room = new Room();
			room.lookAt = (x, y) => {
				if (x == spawn.pos.x && y == spawn.pos.y) {
					return [ { type: LOOK_STRUCTURES, structure: spawn } ];
				}
				if (x == 0) {
					return [ { type: LOOK_TERRAIN,  terrain: 'wall' } ];
				}
				if (x == 2) {
					return [ { type: LOOK_TERRAIN,  terrain: 'swamp' } ];
				}
				return [ { type: LOOK_TERRAIN,  terrain: 'plain' } ];
			}
			room.find = () => [ spawn ];

			var layout = RoomManager.generateLayoutForRoom(room, new TileArray(5, 3));

			var compactString = 
				"█ o o" +
				"█S~o " + 
				"█ o o";
	
			assert.notEqual(undefined, layout);
			assert.equal(compactString, layout);
			assert.equal(compactString, room.memory.roomManager.layout);
		});
	});
	
	// _printRoom()

});

