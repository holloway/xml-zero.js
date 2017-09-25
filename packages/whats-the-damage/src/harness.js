process.send({ memoryStart: process.memoryUsage() });

const [node, harness, script, ...args] = process.argv;

const target = require(script);

process.send({ memoryEnd: process.memoryUsage() });
