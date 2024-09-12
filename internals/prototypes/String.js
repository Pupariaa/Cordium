'use strict';

String.prototype.abbreviate = function (maxLength, mustEndWith = '') {
    if (!maxLength) return '...';
    if (this.trueLength() <= maxLength) return this;
    return `${this.substring(0, maxLength - 3 - mustEndWith.trueLength())}...${mustEndWith}`;
};

const colorCodesRegex = new RegExp(
    Object.values(global.colors)
        .map((colorCode) => colorCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|'),
    'g'
);

String.prototype.trueLength = function () {
    return this.replace(colorCodesRegex, '').length;
};