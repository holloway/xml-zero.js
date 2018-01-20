// Basic Node.js webserver with bonus slow features

var http = require("http"),
  url = require("url"),
  path = require("path"),
  fs = require("fs"),
  spawn = require("child_process").spawn;

const delayMilliseconds = 500;
const eachBit = 10;

function slow(res, data) {
  var i = 0;
  var timer;
  function writeNextBit() {
    if (i > data.length) {
      res.end();
      return;
    }
    res.write(data.slice(i, i + eachBit));
    i += eachBit;
    res.flush();
    timer = setTimeout(writeNextBit, delayMilliseconds);
  }
  writeNextBit();
}

var changeCounter = 0;

var app = http.createServer(function(req, res) {
  var parsed_url = url.parse(req.url),
    relative_path = parsed_url.pathname.endsWith("/")
      ? path.join(parsed_url.pathname, "index.html")
      : parsed_url.pathname,
    root = path.join(__dirname, "build"),
    file_path = path.resolve(path.join(root, relative_path));

  if (!file_path.startsWith(root)) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.write("Not serving that file.");
    res.end();
    return;
  }

  if (relative_path.startsWith("/doctored-reload-onchange")) {
    res.write(
      "window.doctoredReloadCounter && window.doctoredReloadCounter !== " +
        changeCounter +
        " ? window.location.reload() : setTimeout(function(){ window.doctoredReloadCounter = " +
        changeCounter +
        "; document.body.removeChild(document.querySelector('[data-reload]')); var script = document.createElement('script'); script.src='/doctored-reload-onchange?cache-buster=' + Math.random(); script.setAttribute('data-reload', true); document.body.appendChild(script); }, 1000);"
    );
    res.end();
    return;
  }

  fs.readFile(file_path, function(err, data) {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.write(file_path);
      res.write("\n");
      res.write(err.toString());
      res.end();
      return;
    }
    var i = 0;

    const extensionToMime = {
      ".xml": "text/plain",
      ".html": "text/html",
      ".js": "text/javascript"
    };

    const extension = file_path.substr(file_path.lastIndexOf("."));

    res.writeHead(200, {
      Connection: "Transfer-Encoding",
      "Content-Type":
        (extensionToMime[extension] || "text/plain") + "; charset=utf-8",
      "Transfer-Encoding": "chunked"
    });

    if (file_path.endsWith(".xml")) {
      slow(res, data);
    } else {
      res.write(data);
      res.end();
    }
  });
});

var watcherTimer;
fs.watch(path.join(__dirname, "src"), function() {
  if (watcherTimer) clearTimeout(watcherTimer);
  watcherTimer = setTimeout(function() {
    console.log("Change! Rebuilding /src"); // npm run build: ${data}
    const build = spawn("npm", ["run", "build"]);
    build.stdout.on("data", data => {
      changeCounter++;
    });
  }, 250);
});

// Listen on port 3000
app.listen(3000);
console.log("Listening on http://localhost:3000/");
console.log("WARNING: This file should only used for local development");
console.log("there are likely to be security issues so it shouldn't be");
console.log("used for production");
console.log("");
console.log("PURPOSE: This web server ensures that");
console.log("(1) XML files are served very slowly so you can see them");
console.log("    streaming in.");
console.log("(2) Does a full page reload when /src changes.");
