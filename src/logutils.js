// src/utils/logUtils.js

// Check if __line is already defined to avoid redefining it
if (!global.__line) {
    Object.defineProperty(global, '__line', {
        get: function () {
            const e = new Error();
            const frame = e.stack.split("\n")[2]; // Adjust the index if needed
            const lineNumber = frame.split(":").reverse()[1];
            return lineNumber;
        }
    });
}
