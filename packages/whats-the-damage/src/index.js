import path from "path";
import { fork } from "child_process";
import os from "os";

const harnessPath = path.join(__dirname, "./harness.js");

const forker = async (script: string | Array<string>) => {
  const args = Array.isArray(script) ? script : [script];
  const startTime = process.hrtime();
  const forkee = fork(harnessPath, args, { silent: true });

  return new Promise((resolve: Function, reject: Function) => {
    let memoryStart, memoryEnd;
    forkee.on("message", message => {
      if (message.memoryStart) {
        memoryStart = message.memoryStart;
      } else if (message.memoryEnd) {
        memoryEnd = message.memoryEnd;
      } else {
        console.log("Unrecognised message", message);
      }
    });

    forkee.stdout.on("data", data => {
      console.log("stdout:", data);
    });

    forkee.stderr.on("data", data => {
      console.log("error", data);
      reject({ error: data });
    });

    forkee.on("close", code => {
      const duration = process.hrtime(startTime);
      resolve({
        duration: parseFloat(duration.join(".")),
        memoryDiff: memoryDiff(memoryStart, memoryEnd),
        memoryStart,
        memoryEnd,
        exitCode: code
      });
    });
  });
};

type MemoryStat = {
  rss: number,
  heapTotal: number,
  heapUsed: number,
  external: number
};

const memoryDiff = (start: MemoryStat, end: MemoryStat) => {
  return {
    ...Object.keys(start).map(key => ({
      [key]: end[key] - start[key]
    }))
  };
};

const DamageOf = (scripts: Array<string | Array<string>>) =>
  new Promise((resolve: Function, reject: Function) =>
    Promise.all(scripts.map(forker))
      .then(damages => {
        resolve({
          meta: {
            versions: process.versions,
            arch: os.arch(),
            cpus: os.cpus(),
            totalmem: os.totalmem(),
            type: os.type()
          },
          damages
        });
      })
      .catch(reject)
  );

export default DamageOf;
