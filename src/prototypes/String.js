'use strict';

// Example prototype, see internals\prototypes for more (all files under src\prototypes are loaded by default when the bot starts)
String.prototype.abbreviate = function (maxLength, mustEndWith = '') {
	if (!maxLength) return '...';
	if (this.trueLength() <= maxLength) return this;
	return `${this.substring(0, maxLength - 3 - mustEndWith.trueLength())}...${mustEndWith}`;
};