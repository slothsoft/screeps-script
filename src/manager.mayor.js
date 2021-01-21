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
	
	/*
	 * Fetches the memory of the room's console.
	 * 
	 * @param {Room} room
	 */
	
	static fetchMemoryOfMayor(room) { // TODO make less static
		var defaultArray = {
			x: 10,
			y: 0,
			mode: this.MODE_DEFAULT,
		};
		if (room.memory.mayor) {
			room.memory.mayor = Object.assign(defaultArray, room.memory.mayor);
		} else {
			room.memory.mayor = defaultArray;
		}
		return room.memory.mayor;
	}

	constructor(room) {
		this.room = room;
	}
	
	/*
	 * Runs the mayor logic for a specific room.
	 */

	run() {
		this.errors = [];
		this.warnings = [];
		
		this.validate();
		this.fixProblems();
		this.visualize();
	}

	/*
	 * Validates the current room as is.
	 */
	
	validate() {
		// TODO: if construction sites but no builder -> spawn
		// TODO: if no upgrader -> spawn
		// TODO: if broken structures and no handyman -> spawn
		// TODO: creating roads is nice, but they should be removed if not used
		// TODO: if can build extractor but was not build -> build
		// TODO: if has extractor but no courier -> build?
		
		this.validateRoads();
	}

	/*
	 * Validates the road network.
	 */
	
	validateRoads() {
		// if there is no creep in this room, roads are the least of our problems
		if (this.room.find(FIND_MY_CREEPS).length == 0) {
			return;
		}
		
		
		var roadManager = new RoadManager(this.room);
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
				act: () => this.buildRoads(roadPositions),
			});
		}
	}

	/*
	 * Builds one or many roads at specific road positions.
	 */

	buildRoads(roadPositions) {
		// if there are already road construction sites, we won't do anything for now
		var roadConstructionSites = this.room.find(FIND_CONSTRUCTION_SITES, { filter: site => site.structureType == STRUCTURE_ROAD });
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
	
	/*
	 * Fixes the problems the mayor has found - if the mode is auto.
	 */
	
	fixProblems() {
		if (MayorManager.fetchMemoryOfMayor(this.room).mode === MayorManager.MODE_AUTO) {
			 this.errors.forEach(error => error.act());
			 this.warnings.forEach(warning => warning.act());
		}
	}

	/*
	 * Visualizes the mayor problems.
	 */

    visualize() {   
        var mayor = MayorManager.fetchMemoryOfMayor(this.room);
        var x = mayor.x;
        var y = mayor.y;

        this.room.visual.text('👷‍♀️ ' + this.getModeDisplayName(mayor.mode), x, y++, { align: 'left', opacity: 0.8});
        
        if (mayor.mode === MayorManager.MODE_OFF) {
        	return;
        }
        
        var warn = mayor.mode !== MayorManager.MODE_AUTO;
        
        this.errors.forEach(error => {
            this.room.visual.text('🔴 ' + (warn ? error.text : error.solution), x + 1, y++, { align: 'left', opacity: 0.8, color: '#ff0000' });
        });

        if (this.errors.length <= 3) {
	        this.warnings.forEach(warning => {
	        	this.room.visual.text('🟡 ' + (warn ? warning.text : warning.solution), x + 1, y++, { align: 'left', opacity: 0.8, color: '#ffff00' });
	        });
        }
    }
    
    /*
     * Gets the display name of the mode. 
     */
    
    getModeDisplayName(mode) {
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