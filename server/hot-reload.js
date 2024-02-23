const fs = require("fs");
const { exec } = require("child_process");

let childProcess;

function startServer() {
  console.log("Compiling and starting server...");

  if (childProcess) childProcess.kill();
  childProcess = exec("tsc && node --env-file=.env dist/index.js");
  childProcess.stdout.on("data", console.log);
}

startServer();

fs.watch("src", { recursive: true }, (eventType, filename) => {
  if (eventType === "change" && filename.endsWith(".ts")) {
    console.log("File changed, recompiling and restarting...");
    startServer();
  }
});
