/*
 * A base is a 'virtual' construct. It most closely resembles a 'room'.
 * To configure a base, the first spawn is marked as such. To create more 
 * then one base, all further have to be marked manually?
 */
 
var MainUtil = require('./main.util');
var constants = require('./main.constants');
var info = require('./main.info');

var Harvester = require('./role.harvester');
var Builder = require('./role.builder');
var Courier = require('./role.courier');
var Upgrader = require('./role.upgrader');
var Handman = require('./role.handyman');
var Explorer = require('./role.explorer');
var Miner = require('./role.miner');
var StoreKeeper = require('./role.storekeeper');

var MemoryManager = require('./manager.memory');

class BaseManager {
	
	/*
	 * Performs 'runBase()' on an instance of BaseManager for each room. 
	 * 
	 * @param allRoles
	 */
	
	static runAll(allRoles = BaseManager.fetchAllRoles()) {
	    MainUtil.findAllRooms().forEach(room => new BaseManager(room, allRoles).runBase());
	}
    
	static fetchAllRoles() {
		return [
	    	new Harvester(), 
	    	new Builder(), 
	    	new Upgrader(), 
	    	new Handman(), 
	    	new Explorer(), 
	    	new Miner(),
	    	new StoreKeeper(),
	    	new Courier(),
	    ].sort((a, b) => b.priority - a.priority);
	}
	
	
	constructor(room, allRoles = BaseManager.fetchAllRoles()) {
	    this._room = room;
	    this._defaultRole = new Harvester();
	    this._allRoles = allRoles;
	}

	/*
	 * Runs this manager for the specific room it belongs too.
	 */	
    
    runBase() {  
    	if (this._room.memory.base) {
	        this._repopulateCreeps();
	        this._showSpawningAnimation();
	        this._moveCreeps();
    	}
    }

    
    /* 
     * Test for each role if enough creeps are present (else create them).
     */

    _repopulateCreeps() {    
    	var baseName = this._room.memory.base.name;
    	var alreadySpawned = false;
        this._allRoles.forEach(role => {
        	
        	if (alreadySpawned) return;
        	
            var foundCreeps = MainUtil.findAllCreeps().filter(creep => creep.memory.role == role.roleName && creep.memory.home == baseName);
            
            if (foundCreeps.length < MemoryManager.getRequiredNumberForRoomAndRole(this._room, role.roleName)) {
                if (this._spawnCreepForRole(role)) {
                	alreadySpawned = true;
                }
            }
        });
    }
       
    /* 
     * Spawns a creep in a room for a specific role.
     * 
	 * @param role
     */

    _spawnCreepForRole(role) {    
        var freeSpawn = this._fetchFreeSpawn(this._room.memory.base.name);
        if (freeSpawn) {
            var resultingCreep = role.spawnCreep(freeSpawn);
            if (resultingCreep && freeSpawn.memory.debug) {
            	info.log(role.symbol + ' Spawning new ' + role.roleName + ' (' + resultingCreep.body.length + 'p)', this._room);
            }
            return resultingCreep;
        } else if (this._room.memory.base.outsourceSpawn) {
        	// take any other free spawn
            var freeSpawn = this._fetchFreeSpawn();
            if (freeSpawn) {
                var resultingCreep = role.spawnCreep(freeSpawn);
                if (resultingCreep) {
                	resultingCreep.memory.home  = this._room.memory.base.name;
                	if (freeSpawn.memory.debug) {
                		info.log(role.symbol + ' Spawning new ' + role.roleName + ' (' + resultingCreep.body.length + 'p)', this._room);
                	}
                }
                return resultingCreep;
            }
        }
        return false;
    }

    /* 
     * Spawns a creep in a room for a specific role name.
     * 
	 * @param roleName
     */

    spawnCreepForRoleName(roleName) {
	    var roles = this._allRoles.filter(role => role.roleName == roleName);
	    if (roles.length > 0) {
	    	return this._spawnCreepForRole(roles[0]);
	    }
        info.error('Could not find role: ' + roleName);
        return false;
    }

    /* 
     * Fetches a free spawn for this particular room.
     * 
     * @param baseName the name of the base to search; null for any
     */
    
    _fetchFreeSpawn(baseName) {  
        var freeSpawns = MainUtil.findAllSpawns().filter(spawn => (!baseName || (spawn.memory.home == baseName)) && !spawn.spawning);
        return freeSpawns.length > 0 ? freeSpawns[0] : null;
    }  
        
    /*
     * Show spawning 'animation' for each spawn.
     */
    
    _showSpawningAnimation() {  
    	MainUtil.findAllSpawns().filter(spawn => spawn.spawning && spawn.room == this._room).forEach(spawn => {
            spawn.room.visual.text('🔁', spawn.pos.x - 1, spawn.pos.y, {align: 'left', opacity: 0.8});
        });
    }
    
    /*
     * Move the creeps around for a specific room.
     */
    
    _moveCreeps() {  
    	var baseName = this._room.memory.base.name;
        MainUtil.findAllCreeps()
	        	.filter(creep => creep.memory.home == baseName) // creeps of this base
	        	.filter(creep => !creep.spawning) // that are not spawning
	        	.forEach(creep => {
            try {
                var creepRole = this._findNecessaryMandatoryRole(creep.memory.role);
                creepRole.run(creep, this._room);

                // the creep counts for the room it is currently in, not the base's room
                var currentNumber = creep.room.memory.roleInfo[creepRole.roleName].currentNumber;
                creep.room.memory.roleInfo[creepRole.roleName].currentNumber = currentNumber ? currentNumber + 1 : 1;
                
                if (this._room.memory.base.roleConfig.showIcons && this._room == creep.room) {
                	this._room.visual.text(creepRole.symbol, creep.pos.x, creep.pos.y, {align: 'left', opacity: 0.8});
                }
            } catch (e) {
                console.log(e.stack);
                info.log(e);
            }
        });
    }

    /*
     * Find a role. Never returns null. The resulting roll is always necessary.
     */
    
    _findNecessaryMandatoryRole(roleName) {
        var result = this._findMandatoryRole(roleName);
        
        if (!result.isNecessary(this._room)) {
            // we have creeps in a role that is not necessary - try to find something better to do
            var necessaryRoles = this._allRoles.filter(role => role.isNecessary(this._room));
            if (necessaryRoles.length > 0) {
            	result = necessaryRoles[0];
            }
        }
        return result;
    }
    
    /*
     * Find a role. Never returns null, but the default role. Logs an error if role could not be found.
     */
    
    _findMandatoryRole(roleName) {
        var creepRoles = this._allRoles.filter(role => roleName == role.roleName);
        
        if(creepRoles.length > 0) {
            return creepRoles[0];
        } 
        // if no role could be found for a creep... he uses the default role
        info.error('COULD NOT FIND ROLE: ' + roleName + ' 🛑');
        return this._defaultRole;
    }
};

module.exports = BaseManager;