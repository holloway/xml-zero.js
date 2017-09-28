# What's the Damage? ...of running that script in CPU and memory usage

Runs scripts and benchmarks their execution time, CPU usage, and memory usage by running each script many times, and returning min/max/mean/standard-deviation of results.

Usage:

    npm install whats-the-damage
    
    import DamageOf from 'whats-the-damage';
    DamageOf(['./script1.js', './script2.js']).then(results => {
        console.log(results);
    })

Will return data that looks like,

    {
      "damages": [
        {
          "time": {
            "mean": 5.582625195,
            "median": 5.582625195,
            "standardDeviation": 0.028913015000000097,
            "max": 5.61153821,
            "min": 5.55371218
          },
          "cpu": {
            "user": {
              ...
            },
            "system": {
              ...
            }
          },
          "memory": {
            "heapUsed": {
              "mean": 75520,
              "median": 75520,
              "standardDeviation": 0,
              "max": 75520,
              "min": 75520
            },
            "rss": {
              ...
            },
            "heapTotal": {
              ...
            },
            "external": {
              ...
            }
          },
          "snapshots": [
            {
                "cpu": 0,
                "memory": 3854336,
                "time": 0.11318108
            },
            {
                "cpu": 4,
                "memory": 27856896,
                "time": 1.12216727
            },
            ...
            ]
          ]
        },        
        {
          "time": {
            "mean": 5.582625195,
            "median": 5.582625195,
            "standardDeviation": 0.028913015000000097,
            "max": 5.61153821,
            "min": 5.55371218
          },
          "cpu": {
            "user": {
              ...
            },
            "system": {
              ...
            }
          },
          "memory": {
            "heapUsed": {
              "mean": 75520,
              "median": 75520,
              "standardDeviation": 0,
              "max": 75520,
              "min": 75520
            },
            "rss": {
              ...
            },
            "heapTotal": {
              ...
            },
            "external": {
              ...
            }
          },
          "snapshots": [
            {
                "cpu": 0,
                "memory": 3854336,
                "time": 0.11318108
            },
            {
                "cpu": 4,
                "memory": 27856896,
                "time": 1.12216727
            },
            ...
            ]
          ]
        }
      ],
      "meta": {
        "arch": "x64",
        "type": "Linux"
        "totalmem": 8244043776,        
        "versions": {
          "http_parser": "2.7.0",
          "node": "7.10.0",
          "v8": "5.5.372.43",
          "uv": "1.11.0",
          "zlib": "1.2.11",
          "ares": "1.10.1-DEV",
          "modules": "51",
          "openssl": "1.0.2k",
          "icu": "58.2",
          "unicode": "9.0",
          "cldr": "30.0.3",
          "tz": "2016j"
        },        
        "cpus": [
          {
            "model": "Intel(R) Core(TM) i7-4770 CPU @ 3.40GHz",
            "speed": 3899,
            "times": {
              "user": 93851600,
              "nice": 58800,
              "sys": 8229200,
              "idle": 2656804100,
              "irq": 0
            }
          },
          ...
        ]        
      }
    }



Nothing much here..

Part of [XML-Zero.js](https://github.com/holloway/xml-zero.js)
