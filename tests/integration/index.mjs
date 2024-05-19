import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import args from "./src/arg-parser.js";
import { fileStat } from "./src/utils.js";
import { delay } from "./src/utils.js";

import testSeqSSR from "./src/test-seqs/ssr-serial.js";
import testParSSR from "./src/test-seqs/ssr-parallel.js";

import testSeqCSR from "./src/test-seqs/csr-serial.js";
import testParCSR from "./src/test-seqs/csr-parallel.js";

import testSeqSSG from "./src/test-seqs/ssg-serial.js";
import testParSSG from "./src/test-seqs/ssg-parallel.js";

import testSeqISR from "./src/test-seqs/isr-serial.js";
import testParISR from "./src/test-seqs/isr-parallel.js";

import testSeqSWR from "./src/test-seqs/swr-serial.js";
import testParSWR from "./src/test-seqs/swr-parallel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUILD = args.b || "vite";
const TARGET = args.t || "playground";

let PROJECT_ROOT;
if (TARGET === "playground") {
  PROJECT_ROOT = path.join(
    __dirname,
    `../../playground/playground-${BUILD}-v1`
  );
} else {
  PROJECT_ROOT = path.join(
    __dirname,
    `../../examples/basic-example-${BUILD}-router-render-api`
  );
}
const EXT_SRC = path.join(PROJECT_ROOT, `.quasar/hybrid_render`);

const runTestApp = async () => {
  const child = spawn("quasar", ["dev", "-m", "ssr"], {
    cwd: PROJECT_ROOT,
    shell: true,
  });

  child.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  child.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
  });

  // await for server listening
  await new Promise((res, rej) => {
    child.stdout.on("data", (data) => {
      // server notifies being ready for testing
      if (`${data}`.includes("SERVER READY FOR REQUESTS"))
        setTimeout(() => {
          res();
        }, 10000);
      if (`${data}`.includes("/ssg")) res();
    });
  });

  return child;
};

const runTestSequence = async ({ browser }) => {
  const statuses = [];

  let status = null;

  status = await testSeqSSR({ browser });
  statuses.push(status);
  console.log(`SSR * sequence * ${status.state ? "OK" : "FAIL"}`);

  status = await testParSSR({ browser });
  statuses.push(status);
  console.log(`SSR * parallel * ${status.state ? "OK" : "FAIL"}`);

  status = await testSeqCSR({ browser });
  statuses.push(status);
  console.log(`CSR * sequence * ${status.state ? "OK" : "FAIL"}`);

  status = await testParCSR({ browser });
  statuses.push(status);
  console.log(`CSR * parallel * ${status.state ? "OK" : "FAIL"}`);

  status = await testSeqSSG({ browser });
  statuses.push(status);
  console.log(`SSG * sequence * ${status.state ? "OK" : "FAIL"}`);

  status = await testParSSG({ browser });
  statuses.push(status);
  console.log(`SSG * parallel * ${status.state ? "OK" : "FAIL"}`);

  status = await testSeqISR({ browser });
  statuses.push(status);
  console.log(`ISR * sequence * ${status.state ? "OK" : "FAIL"}`);

  status = await testParISR({ browser });
  statuses.push(status);
  console.log(`ISR * parallel * ${status.state ? "OK" : "FAIL"}`);

  status = await testSeqSWR({ browser });
  statuses.push(status);
  console.log(`SWR * sequence * ${status.state ? "OK" : "FAIL"}`);

  status = await testParSWR({ browser });
  statuses.push(status);
  console.log(`SWR * parallel * ${status.state ? "OK" : "FAIL"}`);

  if (statuses.every((s) => s.state)) {
    console.log();
    console.log("ALL TESTS PASSED!");
    console.log();
  } else {
    console.log();
    console.log("SOME TEST/S FAILED!");
    console.log();

    statuses.map((status) => {
      if (!status.state) {
        status.states.map((stat) => {
          if (!stat.state) {
            console.log(`${status.name} : ${stat.id} : `, stat);
          }
        });
      }
    });
    console.log();
  }
};

const runTest = async () => {
  console.log("-- RUNNING APP TEST --");
  console.log(` - tested engine: ${BUILD}`);
  console.log(` - tested target: ${TARGET}`);
  console.log();

  const browser = await puppeteer.launch({
    headless: false,
  });

  // delete extension srcFolder (all pages must vanish)
  const folderStats = fileStat(EXT_SRC);

  if (folderStats && folderStats.isDirectory())
    fs.rmSync(EXT_SRC, { recursive: true });

  console.log("QUASAR SERVER STARTING ");

  // start the quasar instance using spawn
  const app = await runTestApp();

  console.log("QUASAR SERVER LISTENING");
  console.log();

  // wait some time or wait for /ssg generation
  await delay(2000);

  // navigate through and check render time
  await runTestSequence({ browser });

  await browser.close();

  // shutdown tested app
  app.stdin.end();
  if (!app.killed) {
    app.kill("SIGTERM");

    setTimeout(() => {
      if (!app.killed) app.kill("SIGKILL");
    }, 10000);

    setInterval(() => {
      if (app.killed) {
        console.log("-- KILLING APP TEST --");
        process.exit(0);
      }
    }, 200);
  }
};

// start the code execution
const start = async () => {
  await runTest();
};

await start();
