'use strict';
const { config: { colors } } = require('extend-console');

const colorCodesRegex = new RegExp(
    Object.values(colors)
        .map((colorCode) => colorCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|'),
    'g'
);

String.prototype.trueLength = function () {
    return this.replace(colorCodesRegex, '').length;
};