# What's the Damage? ...of running that script in time, CPU and memory usage

Runs scripts and benchmarks their execution time, CPU usage, and memory usage by running each script many times, and returning a average of all results.

Install:

    npm install whats-the-damage

Usage:
  
    import DamageOf from 'whats-the-damage';
    
    DamageOf([
      '/path/to/script1.js',
      '/path/to/script2.js'
    ]).then(damages => {
        console.log(damages);
    })

(because it's a promise you can `await` the results too of course)

The promise will return an array of results, each of which look like...

    {
      "time": AVERAGE,
      "cpu": {
        "user": AVERAGE,
        "system": AVERAGE
      },
      "memory": {
        "rss": AVERAGE,
        "heapTotal": AVERAGE,
        "heapUsed": AVERAGE,
        "external": AVERAGE
      },
      "snapshot": {
        "everyMilliseconds": 1000,
        "snapshots": [
          {
            "cpu": AVERAGE,
            "memory": AVERAGE,
            "time": AVERAGE
          },
          {
            "cpu": AVERAGE,
            "memory": AVERAGE,
            "time": AVERAGE
          },
          ...
        ]
      },
      "exitCode": 0,
      "repeat": 10
    }
    
AVERAGE is a statisitical analysis of multiple executions of your script which looks like,

    {
      "mean": 5.584533965,
      "median": 5.584533965,
      "standardDeviation": 0.08703098499999973,
      "max": 5.67156495,
      "min": 5.49750298
    }

So if you just want to see how long (on average) your script takes to run you could...

    const damages = await DamageOf(['/path/to/script1.js']);
    console.log(damages[0].time.mean);

# How does it work?

It forks your scripts and runs them sequentially while monitoring the processes' memory and CPU usage, and duration.

# API

## DamageOf

    DamageOf(pathsArray, OPTIONS);

I've already explained the first argument (an array of full script paths).

OPTIONS is an optional object that is merged with default options, which are,

    async: false, // Boolean.
                  // Running tests in parallel will cause eratic results.
                  // so not recommended to set to true.
                  // Perhaps useful if you're trying to get a quick and
                  // broad overview of results though.

    snapshotEveryMilliseconds: 1000, // number in milliseconds
                                     // when watching the script, snapshot
                                     // the memory/cpu/time this frequently

    repeat: 10, // number of times to run each script

    progress: (...args) => {} // A callback that receives progress updates
                              // because benchmarks can take a while.
                              // Defaults to printing to console.log.
                              // Can be set to null to silence it.
                              // The args can be anything and this isn't yet
                              // standardised

## getEnvironment()

Returns an object that looks like,

    {
      versions: process.versions,
      arch: os.arch(),
      cpus: os.cpus(),
      totalmem: os.totalmem(),
      type: os.type()
    }

Useful for distinguishing benchmarks across different machines. See [Node.js `os`](https://nodejs.org/api/os.html) for more.



`whats-the-damage` is part of the [XML-Zero.js](https://github.com/holloway/xml-zero.js) project.
