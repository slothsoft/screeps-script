/*
 * A two dimensional array that holds information for x and y coordinates. 
 */

class TileArray {
	
	constructor(width = 0, height = 0) {
		this.width = width;
		this.height = height;
		
		this._array = new Array(width);
		for (var x = 0; x < width; x++) {
			this._array[x] = new Array(height);
		}
	}
	
	/*
	 * Sets the value on the coordinates x and y.
	 */
	
	set(x, y, value) {
		this._array[x][y] = value;
	}

	/*
	 * Returns the value on the coordinates x and y.
	 */
	
	get(x, y) {
		return this._array[x][y];
	}

	/*
	 * Returns a single string from the array.
	 */
	
	toCompactString(opt = {}) {
		var defaultOpt = {
			paddingChar: ' ',
		};
		opt = Object.assign(defaultOpt, opt);
		
		var flatMap = this._flatMap();
		var maxLength = Math.max(...flatMap.map(value => value ? ("" + value).length : 0));
		return flatMap.map(value =>  value ? ("" + value).padStart(maxLength, opt.paddingChar) : opt.paddingChar.repeat(maxLength)).join('');
	}

	/*
	 * Sets the array values from a single string.
	 */

	fromCompactString(string, opt = {}) {
		var defaultOpt = {
			paddingChar: ' ',
		};
		opt = Object.assign(defaultOpt, opt);
		var valueLength = string.length / this.width / this.height;

		for (var y = 0; y < this.height; y++) {
			for (var x = 0; x < this.width; x++) {
				var position = (x + y * this.width) * valueLength;
				this.set(x, y, string.substring(position, position + valueLength).split(opt.paddingChar).join(''));
			}
		}
	}
	
	_flatMap() {
		var result = [];
		for (var y = 0; y < this.height; y++) {
			for (var x = 0; x < this.width; x++) {
				result.push(this._array[x][y]);
			}
		}
		return result;
	}
}

module.exports = TileArray;