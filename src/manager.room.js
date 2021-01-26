/*
 * This class maps the entire room to string and back to let the user mark
 * where to build structures if and when they become available.
 */

var game = require('./main.game');
var info = require('./main.info');

var TileArray = require('./tile.array');

class RoomManager {

	constructor(room) {
		this._room = room;
		this._array = new TileArray(50, 50);
	}

	run() {
		for (var x = 0; x < 50; x++) {
			for (var y = 0; y < 50; y++) {
				var value = this._fetchTileAt(x, y); 
		        this._array.set(x, y, value);
			}
		}
		
		this._printRoom(this._array);
	}

	_fetchTileAt(x, y) {
		var stuffs =  this._room.lookAt(x, y);

		var structures = stuffs.filter(stuff => stuff.type === 'structure' && stuff.structure && 
				(stuff.structure.structureType == 'controller'));
		if (structures.length > 0) {
			switch (structures[0].structure.structureType) {
				case 'controller': 
					return TILE_CONTROLLER;
				default:
					// fall through
			}
		}

		var minerals = stuffs.filter(stuff => stuff.type === 'mineral');
		if (minerals.length > 0) {
			return TILE_MINERAL;
		}

		var terrain = stuffs.filter(stuff => stuff.type === LOOK_TERRAIN);
		if (terrain.length > 0) {
			switch (terrain[0].terrain) {
				case 'plain':
					return TILE_PLAIN;
				case 'swamp':
					return TILE_SWAMP;
				case 'wall':
					return TILE_WALL;
				default:
					return TILE_UNKNOWN;
			}
		}
		return TILE_UNKNOWN;
	}
	
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


RoomManager.TILE_PLAIN = ' ';
RoomManager.TILE_SWAMP = '~';
RoomManager.TILE_WALL = '█';

RoomManager.TILE_CONTROLLER = 'Ø';
RoomManager.TILE_MINERAL = '©';

RoomManager.TILE_EXTENSIONS = 'o';

RoomManager.TILES_TO_BE_BUILD = [ RoomManager.TILE_EXTENSIONS ];
	
RoomManager.TILE_UNKNOWN = '?';


module.exports = RoomManager;