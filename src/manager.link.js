/*
 * This manager handles the links and to send resources.
 */

var constants = require('./main.constants');
var game = require('./main.game');
var info = require('./main.info');

var MemoryManager = require('./manager.memory');

const TYPE_TARGET = constants.LINK_TYPE_TARGET;
const TYPE_SOURCE = constants.LINK_TYPE_SOURCE;

class LinkManager {
	 
	/*
	 * Performs 'runLinks()' on an instance of LinkManager for each room. 
	 * 
	 * @param allRoles
	 */
	
	static runAll() {
	    game.findAllRooms().forEach(room => new LinkManager(room).runLinks());
	}
	
	/*
	 * Adds the type 'target' to the game object with the specified ID.
	 * 
	 * @param linkId
	 */

	static makeLinkTarget(linkId) {
		this.makeLinkType(linkId, TYPE_TARGET);
	}

	/*
	 * Adds the type 'source' to the game object with the specified ID.
	 * 
	 * @param linkId
	 */

	static makeLinkSource(linkId) {
		this.makeLinkType(linkId, TYPE_SOURCE);
	}

	/*
	 * Adds the specified type to the game object with the specified ID.
	 * 
	 * @param linkId
	 * @param type
	 */

	static makeLinkType(linkId, type) {
		var object = Game.getObjectById(linkId);
		// TODO: why doesn't variable work here?
		var memory = require('./main.game').fetchMemoryOfStructure(object);
		memory.type = type; 
	}
	
	constructor(room) {
	    this.room = room;
	}
	
	/*
	 * Handles all links in this room.
	 */
	
	runLinks() { 
		// TODO: implement transferId 
		
		var allSourceLinks = this.findSourceLinks();
		allSourceLinks.forEach(sourceLink => this.runLink(sourceLink));
	}

	/*
	 * Finds all links that are sources for link-to-link communication.
	 */
	
	findSourceLinks() {
		return this.room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
            	if (structure.structureType != STRUCTURE_LINK) {
            		return false;
            	}
        		var memory = game.fetchMemoryOfStructure(structure);
            	if (!memory.type) {
            		memory.type = TYPE_SOURCE;
            	}
                return memory.type == TYPE_SOURCE 
                	&& structure.store.getUsedCapacity(RESOURCE_ENERGY) >  0;
            }
		});
	}

	/*
	 * Handles the specific link in this room.
	 */
	
	runLink(sourceLink) { 

		if (sourceLink.cooldown) {
			return;
		}
		
		// transfer my energy
		var targetLink = this.findTargetLink(sourceLink);
		if (targetLink) {
			sourceLink.transferEnergy(targetLink);  
			info.log('💫 transfering resources from ' + sourceLink.id + ' to ' + targetLink.id);
		}
	}

	/*
	 * Finds a target for the specific source link.
	 */
	
	findTargetLink(sourceLink) { 
		// TODO: sort by capacity?
		var targetLinks = this.room.find(FIND_MY_STRUCTURES, {
	        filter: (structure) => {
	        	if (structure.structureType != STRUCTURE_LINK) {
	        		return false;
	        	}
	            return game.fetchMemoryOfStructure(structure).type == TYPE_TARGET
	            	&& structure.store.getFreeCapacity(RESOURCE_ENERGY) >  0;
	        }
		});
		if (targetLinks.length == 0) {
			info.error('Did not find targets');
			return null;
		}
		return targetLinks[0];
	}
};

module.exports = LinkManager;