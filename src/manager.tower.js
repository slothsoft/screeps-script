/*
 * This manager handles the watchtower and when and how they do what.
 * 
 * Watchtowers are 
 * - supposed to attack enemies any chance they get
 * - heal friendly creeps any chance they get
 * - TODO: heal other structures ...?
 */

var MainUtil = require('./main.util');
 
class TowerManager {

	/*
	 * Performs 'runTowers()' on an instance of TowerManager for each room. 
	 * 
	 * @param allRoles
	 */
	
	static runAll() {
	    MainUtil.findAllRooms().forEach(room => new TowerManager(room).runTowers());
	}
	
	constructor(room) {
	    this._room = room;
	}

	/*
	 * Runs logic for all towers of this room.
	 */
	
	runTowers() {
		var allTowers = this._findTowers();
		allTowers.forEach(tower => this._runTower(tower));
	}

	/*
	 * Finds all towers of this room.
	 */
	
	_findTowers() {
		return this._room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_TOWER;
            }
		});
	}

	/*
	 * Runs logic for specific tower of this room.
	 */
	
	_runTower(tower) {
		// 1st priority: kill attacking creeps
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (closestHostile) {
            tower.attack(closestHostile);
            return;
        } 

		// 2nd priority: heal my creeps
        
        var closestDamagedCreep = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: (creep) => creep.hits < creep.hitsMax
        });
        if(closestDamagedCreep) {
            tower.repair(closestDamagedCreep);
            return;
        }
	}

};

module.exports = TowerManager;