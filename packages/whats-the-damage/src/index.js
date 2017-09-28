// @flow
import path from "path";
import { fork } from "child_process";
import stats from "stats-lite";
import os from "os";
import pidusage from "pidusage";
import type {
  DamageOfResponse,
  DamagesRows,
  Damages,
  Damage,
  AverageDamage,
  AverageDamages,
  DamageScripts,
  DamageResponse,
  MemoryStat,
  Snapshots,
  Snapshot,
  AverageDamageValue,
  DamageOptions
} from "./flowtypes";

const harnessPath = path.join(__dirname, "./harness.js");

const forker = (script: string | Array<string>, opts: DamageOptions) => {
  const args = Array.isArray(script) ? script : [script];
  const timeStart = process.hrtime();
  const forkee = fork(harnessPath, args, { silent: true });
  let closed = false;

  return new Promise(
    (
      resolve: (result: Promise<Damage> | Damage) => void,
      reject: (error: Object) => void
    ) => {
      const messages = {};
      const snapshots = [];

      forkee.on("message", message => {
        const keys = Object.keys(message);
        keys.forEach(key => {
          switch (key) {
            case "memoryStart":
            case "memoryEnd":
            case "cpuUsageEnd":
              messages[key] = message[key];
              break;
            default:
              console.log(
                "Unknown message from",
                script,
                `message[${key}]=`,
                message[key]
              );
          }
        });
      });

      const watchPid = () => {
        if (closed) return;
        pidusage.stat(forkee.pid, (err, stat) => {
          const hrtime = process.hrtime(timeStart);
          const snapshot = {
            ...stat,
            time: parseFloat(hrtime.join("."))
          };
          snapshots.push(snapshot);
        });
        setTimeout(watchPid, opts.snapshotEveryMilliseconds);
      };
      watchPid();

      forkee.stdout.on("data", data => {
        console.log("stdout from", script, "(ignoring): ", data);
      });

      forkee.stderr.on("data", data => {
        console.log("stderr from", script, "(failing)", data);
        reject({ error: data });
      });

      forkee.on("close", exitCode => {
        const duration = process.hrtime(timeStart);
        closed = true;
        setTimeout(() => {
          resolve({
            time: parseFloat(duration.join(".")),
            memory: memoryDiff(messages.memoryStart, messages.memoryEnd),
            cpu: messages.cpuUsageEnd,
            snapshots,
            exitCode
          });
        }, opts.snapshotEveryMilliseconds); // wait until any snapshot might finish
      });
    }
  );
};

const memoryDiff = (start: MemoryStat, end: MemoryStat): MemoryStat => {
  return Object.assign(
    {},
    ...Object.keys(start).map(key => ({
      [key]: end[key] - start[key]
    }))
  );
};

const runScriptsOnce = async (
  scripts: DamageScripts,
  opts: DamageOptions
): Damages => {
  if (opts.async) {
    // asynchronous ... less accurate (more competition for resources) but useful sometimes.
    // Maybe useful when it's not a close race between scripts (exclude outliers)
    return await Promise.all(scripts.map(script => forker(script, opts)));
  } else {
    // synchronous ... more accurate (less competition for resources)
    const damages = [];
    for (let i = 0; i < scripts.length; i++) {
      damages.push(await forker(scripts[i], opts));
    }
    return damages;
  }
};

const averageDamagesRows = (damagesRows: DamagesRows): AverageDamages =>
  damagesRows[0].map((damageResponse, i) => ({
    time: getAverages(damagesRows.map(d => d[i].time)),
    cpu: {
      user: getAverages(damagesRows.map(d => d[i].cpu.user)),
      system: getAverages(damagesRows.map(d => d[i].cpu.system))
    },
    memory: {
      rss: getAverages(damagesRows.map(d => d[i].memory.rss)),
      heapTotal: getAverages(damagesRows.map(d => d[i].memory.heapTotal)),
      heapUsed: getAverages(damagesRows.map(d => d[i].memory.heapUsed)),
      external: getAverages(damagesRows.map(d => d[i].memory.external))
    },
    snapshots: damagesRows.map(d => d[i].snapshots)
  }));

const getAverages = (values: Array<number>): AverageDamageValue => ({
  mean: stats.mean(values),
  median: stats.median(values),
  standardDeviation: stats.stdev(values),
  max: Math.max(...values),
  min: Math.min(...values)
});

const defaultOptions: DamageOptions = {
  async: false, // running tests in parallel will cause eratic stats. not recommended.
  snapshotEveryMilliseconds: 1000,
  repeat: 2,
  progress: (...args) => {
    console.log(...args);
  }
};

const DamageOf = async (
  scripts: DamageScripts,
  options: DamageOptions
): Promise<DamageOfResponse> => {
  const opts = {
    ...defaultOptions,
    ...options
  };
  const meta = {
    versions: process.versions,
    arch: os.arch(),
    cpus: os.cpus(),
    totalmem: os.totalmem(),
    type: os.type()
  };

  const damagesRows = [];
  for (let i = 0; i < opts.repeat; i++) {
    opts.progress(`Attempt #${i}`);
    damagesRows.push(await runScriptsOnce(scripts, opts));
  }

  const averageDamages = averageDamagesRows(damagesRows);

  return {
    damages: averageDamages,
    meta
  };
};

export default DamageOf;
