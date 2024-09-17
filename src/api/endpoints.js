'use strict';

const endpoints = [
  {
    name: "get_voice_member",
    type: "private",
    params: [
      { name: "key", type: "string", mandatory: true, length: 32 },
      { name: "userid", type: "int", mandatory: true, range: [17, 18] },
    ],
  },
  {
    name: "get_message",
    type: "private",
    params: [
      { name: "key", type: "string", mandatory: true, length: 32 },
      { name: "id", type: "int", mandatory: true, range: [18, 19] },
    ],
  },
];

module.exports = endpoints;
