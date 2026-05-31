const { execSync, spawn } = require("child_process");

const delayMs = Number(process.env.TEST_DEMO_DELAY_MS ?? 150);
const lines = [];
let busy = false;
let childClosed = false;
let exitCode = 1;

if (process.platform === "win32") {
  try {
    execSync("chcp 65001 > nul");
  } catch {
    // Demo still works if code page switching is blocked.
  }
}

const child =
  process.platform === "win32"
    ? spawn("cmd.exe", ["/d", "/s", "/c", "npm run test -- --reporter=verbose"], {
        stdio: ["ignore", "pipe", "pipe"],
        env: process.env,
      })
    : spawn("npm", ["run", "test", "--", "--reporter=verbose"], {
        stdio: ["ignore", "pipe", "pipe"],
        env: process.env,
      });

function enqueue(chunk) {
  lines.push(
    ...Buffer.from(chunk)
      .toString("utf8")
      .split(/\r?\n/)
      .filter(Boolean),
  );
  tick();
}

function tick() {
  if (busy || lines.length === 0) return;

  busy = true;
  console.log(lines.shift());

  setTimeout(() => {
    busy = false;
    tick();
    finishIfDone();
  }, delayMs);
}

function finishIfDone() {
  if (!childClosed || busy || lines.length > 0) return;

  console.log("\n\n============================================================");
  if (exitCode === 0) {
    console.log("      Kürkaya Yazılım Çözümleri - Tüm Testler Başarılı");
  } else {
    console.log("      Kürkaya Yazılım Çözümleri - Testlerde Hata Var");
  }
  console.log("============================================================\n");
  process.exit(exitCode);
}

child.stdout.on("data", enqueue);
child.stderr.on("data", enqueue);
child.on("close", (code) => {
  childClosed = true;
  exitCode = code ?? 1;
  finishIfDone();
});
