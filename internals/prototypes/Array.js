'use strict';

// crazy
Array.prototype.remove = function (element) {
	const index = this.indexOf(element);
	if (index !== -1) {
		this.splice(index, 1);
		return true;
	}
	return false;
};
