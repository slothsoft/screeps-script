/*
 * This class maps the entire room to string and back to let the user mark
 * where to build structures if and when they become available.
 */

var MainInfo = require('./main.info');

var TileArray = require('./tile.array');

class RoomManager {

	constructor(room) {
		this._room = room;
	}

	/*
	 * Returns the positions for all building sites for the tile character. 
	 * Should be in the array TILES_TO_BE_BUILD, but other characters might work, too.
	 * 
	 * @return {RoomPosition}
	 */
	
	fetchBuildingSitePositionsForTile(character) {
		this._initArrayIfNecessary();
		
		var result = [];
		
		for (var x = 0; x < 50; x++) {
			for (var y = 0; y < 50; y++) {
				var value = this._array.get(x, y); 
				if (value === character) {
					var pos = new RoomPosition(x, y, this._room.name);
					result.push(pos);
				}
			}
		}	
		return result;
	}
	
	
	/*
	 * Initializes the array for the build plans for this room. Does nothing if the
	 * array was already initialized this round.
	 */

	_initArrayIfNecessary() {
		if (!this._array) {
			this._initArray();
		}
	}

	/*
	 * Initializes the array for the build plans for this room. 
	 */
	
	_initArray() {
		this._memory = this._fetchMemoryOfManager();
		this._array = new TileArray(50, 50);
		
		if (this._memory.layout) {
			this._array.fromCompactString(this._memory.layout);
		} else {
			for (var x = 0; x < 50; x++) {
				for (var y = 0; y < 50; y++) {
					var value = this._fetchTileAt(x, y); 
					this._array.set(x, y, value);
				}
			}	
		}
		
		this._memory.layout = this._array.toCompactString();
		
		if (this._memory.debug) {
			this._printRoom(array);
		}
	}

	/*
	 * Fetches the memory for this manager from the room.
	 */
	
	_fetchMemoryOfManager() {
		var defaultArray = {
			debug: false,
		};
		if (this._room.memory.roomManager) {
			this._room.memory.roomManager = Object.assign(defaultArray, this._room.memory.roomManager);
		} else {
			this._room.memory.roomManager = defaultArray;
		}
		return this._room.memory.roomManager;
	}

	/*
	 * Fetches the tile's internal character for a specific index.
	 */

	_fetchTileAt(x, y) {
		var stuffs =  this._room.lookAt(x, y);

		var toBeBuild = this._filterByTiles(stuffs, RoomManager.TILES_TO_BE_BUILD);
		if (toBeBuild.length > 0) {
			return toBeBuild[0].character;
		}

		var endless = this._filterByTiles(stuffs, RoomManager.TILES_ENDLESS_STRUCTURES);
		if (endless.length > 0) {
			return endless[0].character;
		}
		
		var preset = this._filterByTiles(stuffs, RoomManager.TILES_PRESET);
		if (preset.length > 0) {
			return preset[0].character;
		}

		var terrain = this._filterByTiles(stuffs, RoomManager.TILES_TERRAIN);
		if (terrain.length > 0) {
			return terrain[0].character;
		}
		return RoomManager.TILE_UNKNOWN;
	}
	
	/*
	 * Filter method.
	 */

	_filterByTiles(stuffs, tiles) {
		return stuffs.map(stuff => {
			var filteredTiles = tiles.filter(tile => tile.isEqual(stuff));
			if (filteredTiles.length > 0) {
				return filteredTiles[0];
			}
			null;
		}).filter(tile => tile != null);
	}

	/*
	 * Returns the slots that can still be used to build stuff.
	 */
	
	fetchFreeBuildingSlots(tileCharacter) {
		var tiles = RoomManager.TILES_TO_BE_BUILD.filter(tile => tile.character == tileCharacter);
		if (tiles.length == 0) {
			MainInfo.error('Could not find building for character "' + tileCharacter + '"!');
			return;
		}
		var tile = tiles[0]; // RoomStructureTile
		var availableSlots = this._fetchAvailableSlots(tile.structureType);
		var usedSlots = this._fetchUsedSlots(tile.structureType);
		return availableSlots - usedSlots;
	}
	
	/*
	 * Finds the number of how many structures of the type you can build.
	 */

	_fetchAvailableSlots(structureType) {
		return CONTROLLER_STRUCTURES[structureType][this._room.controller.level];
	}

	/*
	 * Finds the number of how many structures of the type are already built.
	 */
	
	_fetchUsedSlots(structureType) {
		return this._room.find(FIND_STRUCTURES, { filter: structure => (structure.structureType == structureType) }).length;
	}

	/*
	 * Prints the array to the screen.
	 */
	
	_printRoom(array) {
		for (var x = 0; x < 50; x++) {
			for (var y = 0; y < 50; y++) {
				var value = array.get(x, y);
				if (value !== undefined) {
					this._room.visual.text(value, x, y, {align: 'center', opacity: 0.8});
				}
			}
		}
	}
}

/*
 * Section of tiles that are the terrain of the room.
 */

class RoomTerrainTile {

	constructor(character, terrain) {
		this.character = character;
		this._terrain = terrain;
	}
	
	isEqual(stuff) {
		return ((stuff.type === LOOK_TERRAIN) && (stuff.terrain == this._terrain));
	}
}

RoomManager.TILE_TERRAIN_PLAIN = ' ';
RoomManager.TILE_TERRAIN_SWAMP = '~';
RoomManager.TILE_TERRAIN_WALL = '█';
RoomManager.TILES_TERRAIN = [
	new RoomTerrainTile(RoomManager.TILE_TILE_TERRAIN_PLAIN, 'plain'), 
	new RoomTerrainTile(RoomManager.TILE_TILE_TERRAIN_SWAMP, 'swamp'), 
	new RoomTerrainTile(RoomManager.TILE_TILE_TERRAIN_WALL, 'wall'), 
];

/*
 * Section of tiles that are the preset for the room.
 */

class RoomPresetTile {

	constructor(character, type, structureType) {
		this.character = character;
		this._type = type;
		this._structureType = structureType;
	}

	isEqual(stuff) {
		return (stuff.type === this._type) && 
			(!this._structureType || (stuff.structure && (stuff.structure.structureType == this._structureType)));
	}
}

RoomManager.TILE_CONTROLLER = 'Ø';
RoomManager.TILE_MINERAL = '©';
RoomManager.TILE_SOURCE = 'Ⓢ';
RoomManager.TILES_PRESET = [
	new RoomPresetTile(RoomManager.TILE_CONTROLLER, LOOK_STRUCTURES, STRUCTURE_CONTROLLER), 
	new RoomPresetTile(RoomManager.TILE_MINERAL, LOOK_MINERALS), 
	new RoomPresetTile(RoomManager.LOOK_SOURCES, LOOK_MINERALS), 
];

/*
 * Section of tiles that are structures that were build and can be build in the
 * room.
 */

class RoomStructureTile {

	constructor(character, structureType) {
		this.character = character;
		this.structureType = structureType;
	}

	isEqual(stuff) {
		return stuff.type === LOOK_STRUCTURES && 
			(stuff.structure &&  stuff.structure.structureType == this.structureType);
	}
}

RoomManager.TILE_EXTENSION = 'o';

RoomManager.TILES_TO_BE_BUILD = [ 
	new RoomStructureTile(RoomManager.TILE_EXTENSION, STRUCTURE_EXTENSION),
];

/*
 * Section of tiles that are structures that were build and can be build in the
 * room without limit.
 */

RoomManager.TILE_WALL = 'w';
RoomManager.TILE_RAMPART = 'r';

RoomManager.TILES_ENDLESS_STRUCTURES = [ 
	new RoomStructureTile(RoomManager.TILE_RAMPART, STRUCTURE_RAMPART),
	new RoomStructureTile(RoomManager.TILE_WALL, STRUCTURE_WALL),
];
	
RoomManager.TILE_UNKNOWN = '?';


module.exports = RoomManager;