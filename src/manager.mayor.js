/*
 * The mayor is a helper to find issues with the base (and even fix them).
 */
 
var game = require('./main.game');
var info = require('./main.info');

var RoadManager = require('./manager.road');

class MayorManager {

	/*
	 * Performs 'runBase()' on an instance of BaseManager for each room.
	 * 
	 * @param allRoles
	 */
	
	static runAll() {
	    game.findAllRooms().forEach(room => new MayorManager(room).run());
	}
	

	constructor(room) {
		this._room = room;
		this._memory = this._fetchMemoryOfMayor();
	}

	/*
	 * Fetches the memory of the room's console.
	 * 
	 * @param {Room} room
	 */
	
	_fetchMemoryOfMayor() { 
		var defaultArray = {
			x: 10,
			y: 0,
			mode: MayorManager.MODE_DEFAULT,
			temp: {},
		};
		if (this._room.memory.mayor) {
			this._room.memory.mayor = Object.assign(defaultArray, this._room.memory.mayor);
		} else {
			this._room.memory.mayor = defaultArray;
		}
		return this._room.memory.mayor;
	}
	
	/*
	 * Runs the mayor logic for a specific room.
	 */

	run() {
		this.errors = [];
		this.warnings = [];
		
		this._validate();
		this._fixProblems();
		this._visualize();
	}

	/*
	 * Validates the current room as is.
	 */
	
	_validate() {
		// TODO: creating roads is nice, but they should be removed if not used
		// TODO: if can build extractor but was not build -> build
		// TODO: if has extractor but no courier -> build?
		
		this._validateRoads();
		this._validateCreeps();
	}

	/*
	 * Validates the road network.
	 */
	
	_validateRoads() {
		// if there is no creep in this room, roads are the least of our problems
		if (this._room.find(FIND_MY_CREEPS).length == 0) {
			return;
		}
		// if the base is not far along to need builders, we don't need roles yet
		if (this._room.memory.base.roleConfig.Builder.requiredNumber == 0) {
			return;
		}
		
		
		var roadManager = new RoadManager(this._room);
		var roadPositions = roadManager.fetchPositionsOverThreshold().filter(pos => {
			if (pos.look().filter(obj => obj.structure && obj.structure.structureType == STRUCTURE_ROAD).length > 0) {
				// there is already a road at this position
				return false;
			}
			return true;
		});
		if (roadPositions.length > 0) {
			this.warnings.push({ 
				text: 'Roads are missing.' , 
				solution: 'I\'m building roads.',
				act: () => this._buildRoads(roadPositions),
			});
		}
	}

	/*
	 * Builds one or many roads at specific road positions.
	 */

	_buildRoads(roadPositions) {
		// if there are already road construction sites, we won't do anything for now
		var roadConstructionSites = this._room.find(FIND_CONSTRUCTION_SITES, { filter: site => site.structureType == STRUCTURE_ROAD });
		if (roadConstructionSites.length > 0) {
			return;
		}
		// now we build a new road
		for (var i = 0; i < roadPositions.length; i++) {
			if (roadPositions[i].createConstructionSite(STRUCTURE_ROAD) == OK) {
				info.log('👷‍♀️ Mayor built a road at: ' + roadPositions[i]);
			}
			break;
		}
	}
	
	_validateCreeps() {
		if (this._room.find(FIND_CREEPS).length == 0) {
			// We have ZERO creeps. That's our biggest problem!
			this.errors.push({ 
				text: 'Harvester is missing.' , 
				solution: 'Spawning Harvester.',
				act: this.spawnOnlyHarvesters,
			});
			return;
		}
		if (this._room.memory.base.roleConfig.Upgrader.requiredNumber == 0) {
			this.errors.push({ 
				text: 'Upgrader is missing.' , 
				solution: 'Spawning Upgrader.',
				act: () => this._room.memory.base.roleConfig.Upgrader.requiredNumber = 1,
			});
			return;
		}
		if (this._room.find(FIND_CONSTRUCTION_SITES).length > 0 && this._room.memory.base.roleConfig.Builder.requiredNumber == 0) {
			this.errors.push({ 
				text: 'Builder is missing.' , 
				solution: 'Spawning Builder.',
				act: () => this._room.memory.base.roleConfig.Builder.requiredNumber = 1,
			});
			return;
		}
		if (this._room.find(FIND_STRUCTURES, { filter: s => s.hits < s.hitsMax }).length > 0 && this._room.memory.base.roleConfig.Handyman.requiredNumber == 0) {
			this.errors.push({ 
				text: 'Handyman is missing.' , 
				solution: 'Spawning Handyman.',
				act: () => this._room.memory.base.roleConfig.Handyman.requiredNumber = 1,
			});
			return;
		}
	}

	_spawnOnlyHarvesters() {
		// reset every other role to 0
		for (var roleConfig in this._room.memory.base.roleConfig) {
			if (roleConfig.requiredNumber) {
				roleConfig.requiredNumber = 0;
			}
		}
		// now increment harvesters
		this._room.memory.base.roleConfig.Harvester.requiredNumber = 1;
	}

	/*
	 * Fixes the problems the mayor has found - if the mode is auto.
	 */
	
	_fixProblems() {
		if (this._memory.mode === MayorManager.MODE_AUTO) {
			 this.errors.forEach(error => error.act());
			 this.warnings.forEach(warning => warning.act());
		}
	}

	/*
	 * Visualizes the mayor problems.
	 */

    _visualize() {   
        var x = this._memory.x;
        var y = this._memory.y;

        this._room.visual.text('👷‍♀️ ' + this._getModeDisplayName(this._memory.mode), x, y++, { align: 'left', opacity: 0.8});
        
        if (this._memory.mode === MayorManager.MODE_OFF) {
        	return;
        }
        
        var warn = this._memory.mode !== MayorManager.MODE_AUTO;
        
        this.errors.forEach(error => {
            this._room.visual.text('🔴 ' + (warn ? error.text : error.solution), x + 1, y++, { align: 'left', opacity: 0.8, color: '#ff0000' });
        });

        if (this.errors.length <= 3) {
	        this.warnings.forEach(warning => {
	        	this._room.visual.text('🟡 ' + (warn ? warning.text : warning.solution), x + 1, y++, { align: 'left', opacity: 0.8, color: '#ffff00' });
	        });
        }
    }
    
    /*
     * Gets the display name of the mode. 
     */
    
    _getModeDisplayName(mode) {
    	switch (mode) {
    		case MayorManager.MODE_OFF:
    			return 'Mayor is off';
    		case MayorManager.MODE_WARN:
    			return 'Mayor will warn you';
    		case MayorManager.MODE_AUTO:
    			return 'Mayor will act';
    		default:
    			return '???';
    	}
    }
};

MayorManager.MODE_OFF = 'off';
MayorManager.MODE_WARN = 'warn';
MayorManager.MODE_AUTO = 'auto';
MayorManager.MODE_DEFAULT = MayorManager.MODE_AUTO;
MayorManager.MODES_ALL = [ MayorManager.MODE_OFF, MayorManager.MODE_WARN, MayorManager.MODE_AUTO ];

module.exports = MayorManager;