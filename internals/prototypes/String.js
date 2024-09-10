'use strict';

String.trim = function (maxLength) {
    if (this.length <= maxLength) {
        return this;
    }
    return this.substring(0, maxLength - 3) + '...';
}