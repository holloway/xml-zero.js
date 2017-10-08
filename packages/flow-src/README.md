# Flow-Src

[Flow](https://flow.org/) goes into `/node_modules/` looking for typing errors, but because those errors are typically in 3rd-party modules you (as a developer) can't fix them so the default Flow configuration has a lot of noise that `flow-src` filters for you.

Note that Flow does have an `[ignore]` config option where you could add `/node_modules/` but this would prevent Flow going into that directory entirely, and what we want is slightly different. We want flow to check that directory but we only want results when we could fix them ourselves.

Install:

    npm install flow-src

Usage:
  
    ./node_modules/.bin/flow-src



`flow-src` is part of the [XML-Zero.js](https://github.com/holloway/xml-zero.js) project.
