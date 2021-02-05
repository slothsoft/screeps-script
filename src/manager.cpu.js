/*
 * This module is used to display GPC measurements on screen, so that I know where to optimize.
 */
 
var MainUtil = require('./main.util');

class GcManager {

    /*
	 * Displays the collected GC measurements.
	 */
    
	static initRound() {
		this._measurements = [];
	}
	
    /*
	 * Displays the collected GC measurements on the screen.
	 */
    
	static visualize() {   
		MainUtil.findAllRooms().forEach(room => this._visualizeMeasurements(room));
    }

    /*
	 * Displays the GC measurements for a specific room on the screen.
	 * 
	 * @param {Room} room
	 */
    
	static _visualizeMeasurements(room) {   
		const memory = this._fetchMemoryOfRoomCpu(room);
        var x = memory.x;
        var y = memory.y;
        var spaceToUsedTicks = 7;

    	room.visual.text('CPU Watcher', x, y, {align: 'left', opacity: memory.opacity + 0.2});
    	y++;
    	
        this._measurements.forEach(measurement => {
        	var color = measurement.usedTicks > 10 ? 'red' : 'white';
        	room.visual.text(measurement.name, x, y, {align: 'left', opacity: memory.opacity, color: color});
        	room.visual.text(this._format.format(measurement.usedTicks), x + spaceToUsedTicks, y, {align: 'right', opacity: memory.opacity, color: color});
        	y++;
        });
    }

	/*
	 * Fetches the memory of the room's CPU manager.
	 * 
	 * @param {Room} room
	 */
	
	static _fetchMemoryOfRoomCpu(room) {
		var defaultArray = {
			x: 20,
			y: 0,
			opacity: 0.5,
		};
		if (room.memory.cpu) {
			room.memory.cpu = Object.assign(defaultArray, room.memory.cpu);
		} else {
			room.memory.cpu = defaultArray;
		}
		return room.memory.cpu;
	}
	
	/*
	 * Measures the CPU usage of a specific function. 
	 * 
	 * @param name 
	 * @param executedFunction
	 */

	static measure(name, executedFunction) {   
		var usedTicks = Game.cpu.getUsed();
		executedFunction();
		usedTicks = Game.cpu.getUsed() - usedTicks;
		
        this._measurements.push( { 
        	name: name,
        	usedTicks: usedTicks,
        });
    }

};

GcManager._measurements = [];
GcManager._format = new Intl.NumberFormat('en', { maximumSignificantDigits: 1 });

module.exports = GcManager;