/*
 * API for Creeps: https://docs.screeps.com/api/#Creep
 */

require('./game-mock');

var RoomPosition = require('./room-position-mock.js');

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

	constructor(id, body, memory = {}) {
		this.id = id;
	    Game.creeps[this.id] = this;
		
	    this.body = body;
	    this.memory = Memory.creeps[this.id] = memory;
		this.pos = new RoomPosition();
	}
	
	moveTo(target) {
		this.pos.x = target.pos.x;
		this.pos.y = target.pos.y;
	}

	harvest(target) {}
	
}

module.exports = Creep;
