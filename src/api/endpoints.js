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
  {
    name: "get_messages",
    type: "private",
    params: [
      { name: "key", type: "string", mandatory: false, length: 32 },
      { name: "startAt", type: "int", mandatory: false },
      { name: "endAt", type: "int", mandatory: false },
      { name: "limit", type: "int", mandatory: false, range: [1, 100000] },
      { name: "channelsIds", type: "string", mandatory: false },
      { name: "usersIds", type: "string", mandatory: false },
    ],
  },
];

module.exports = endpoints;
