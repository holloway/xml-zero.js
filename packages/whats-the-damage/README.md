# What's the Damage? ...of running that script in CPU and memory usage

Runs scripts and benchmarks their execution time, CPU usage, and memory usage by running each script many times, and returning a benchmark of averages (max/min/mean/median/standard deviation).

Install:

    npm install whats-the-damage

Usage:
  
    import DamageOf from 'whats-the-damage';
    
    DamageOf(['/path/to/script1.js', '/path/to/script2.js']).then(results => {
        console.log(results);
    })

Because it's a promise you can `await` the results too of course.

The promise will result with an array of results,

     [
       SCRIPT_RESULT,
       SCRIPT_RESULT,
     ]

Where SCRIPT_RESULT looks like,

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
        "everyMilliseconds": 1,
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
      "exitCode": 0
    }
    
Where AVERAGE is a statisitical analysis of multiple executions of your script (`options.repeat`), and this AVERAGE object looks like,

    {
      "mean": 5.584533965,
      "median": 5.584533965,
      "standardDeviation": 0.08703098499999973,
      "max": 5.67156495,
      "min": 5.49750298
    }


So if you just want to see how long your script takes to run (on average) you would do something like,

    const results = await DamageOf(['/path/to/script1.js']);
    console.log(results[0].time.mean);

# How does it work?

It forks your scripts and runs them sequentially while monitoring the processes' memory and CPU usage, and duration.



Part of [XML-Zero.js](https://github.com/holloway/xml-zero.js)
