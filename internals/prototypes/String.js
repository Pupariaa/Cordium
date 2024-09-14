'use strict';

const colorCodesRegex = new RegExp(
    Object.values(global.colors)
        .map((colorCode) => colorCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|'),
    'g'
);

String.prototype.trueLength = function () {
    return this.replace(colorCodesRegex, '').length;
};