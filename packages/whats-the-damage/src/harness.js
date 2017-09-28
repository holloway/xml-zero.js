process.send({ memoryStart: process.memoryUsage() });
const cpuUsageStart = process.cpuUsage();

const [node, harness, script] = process.argv;
const target = require(script); // script can read process.argv themselves

process.send({ memoryEnd: process.memoryUsage() });
process.send({ cpuUsageEnd: process.cpuUsage(cpuUsageStart) });
