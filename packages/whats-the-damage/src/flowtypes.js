export type MemoryStat = {
  rss: number,
  heapTotal: number,
  heapUsed: number,
  external: number
};

export type Snapshot = {
  cpu: number,
  memory: number,
  time: number
};

export type Snapshots = Array<Snapshot>;

export type Damage = {
  time: number,
  memory: MemoryStat,
  cpu: {
    user: number,
    system: number
  },
  snapshots: Snapshots,
  exitCode: number
};

export type Damages = Array<Damage>;

export type DamagesRows = Array<Damages>;

export type DamageOptions = {
  async: boolean,
  snapshotEveryMilliseconds: number,
  repeat: number,
  progressCallback: Function
};

export type DamageScript = Array<string | Array<string>>;
export type DamageScripts = Array<DamageScript>;
export type DamageOfResponse = {
  damages: DamageResponses,
  meta: Object
};

export type AverageValue = {
  mean: number,
  median: number,
  standardDeviation: number
};

export type AverageDamage = {
  time: AverageValue,
  cpu: {
    user: AverageValue,
    system: AverageValue
  },
  memory: {
    rss: AverageValue,
    heapTotal: AverageValue,
    heapUsed: AverageValue,
    eternal: AverageValue
  },
  snapshots: Snapshots
};

export type AverageDamages = Array<AverageDamage>;

export type Cpu = {
  model: string,
  speed: number,
  times: {
    user: number,
    nice: number,
    sys: number,
    idle: number,
    irq: number
  }
};

export type DamageMeta = {
  versions: { [string]: string },
  arch: string,
  cpus: Array<Cpu>,
  totalmem: number,
  type: string
};

export type DamageOfResponse = {
  meta: DamageMeta,
  damages: AverageDamages
};
