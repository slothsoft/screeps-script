/*
 * API for Creeps: https://docs.screeps.com/api/#Creep
 */

require('./game-mock');

var Room = require('./room-mock.js');
var RoomPosition = require('./room-position-mock.js');
var Store = require('./store-mock.js');

global.MOVE = 'move';
global.WORK = 'work';
global.CARRY = 'carry';
global.ATTACK = 'attack';
global.RANGED_ATTACK = 'ranged_attack';
global.TOUGH = 'tough';
global.HEAL = 'heal';
global.CLAIM = 'claim';

global.BODYPART_COST = {
	'move': 50,
	'work': 100,
	'carry': 80,
	'attack': 50,
	'heal': 250,
	'ranged_attack': 150,
	'tough': 10,
	'claim': 600
};

class Creep {

	constructor(id, body = [], memory = {}) {
		this.id = id ? id : 'Creep' + Creep.nextId++;
		this.name = this.id;
	    Game.creeps[this.id] = this;
		
	    this.body = body;
	    this.memory = Memory.creeps[this.id] = memory;
		this.pos = new RoomPosition();
		this.room = new Room();
		this.store = new Store(body.filter(part => part == CARRY).length * 50);
	}
	
	moveTo(target) {
		this.pos.x = target.pos.x;
		this.pos.y = target.pos.y;
	}

	harvest(target) {
		if (this.pos.x == target.pos.x && this.pos.y == target.pos.y) {
			var usedAmount = this.store.getFreeCapacity();
			target.store.usedCapacity -= usedAmount;
			this.store.usedCapacity += usedAmount;
			return OK;
		}
		return ERR_NOT_IN_RANGE;
	}
	
	transfer(target, resourceType, amount) {
		if (this.pos.x == target.pos.x && this.pos.y == target.pos.y) {
			var usedAmount = amount ? amount : this.store.getUsedCapacity();
			target.store.usedCapacity += usedAmount;
			this.store.usedCapacity -= usedAmount;
			
			if (!this.store.usedCapacity) {
				this.store[resourceType] = null;
			}
			
			return OK;
		}
		return ERR_NOT_IN_RANGE;
	}
	
	build(target) {
		if (this.pos.x == target.pos.x && this.pos.y == target.pos.y) {
			target.memory.wasBuilt = true;
			this.store.usedCapacity = 0;
			return OK;
		}
		return ERR_NOT_IN_RANGE;
	}

	repair(target) {
		if (this.pos.x == target.pos.x && this.pos.y == target.pos.y) {
			var usedAmount = Math.min(this.store.getUsedCapacity(), target.hitsMax - target.hits);
			target.hits += usedAmount;
			this.store.usedCapacity -= usedAmount;
			return OK;
		}
		return ERR_NOT_IN_RANGE;
	}

	withdraw(target) {
		return this.harvest(target);
	}
	
	upgradeController(target) {
		return this.transfer(target, RESOURCE_ENERGY);
	}
	
	suicide() {
	    Game.creeps[this.id] = null;
	}
}
Creep.nextId = 1;

module.exports = Creep;
