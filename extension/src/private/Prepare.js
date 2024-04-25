const _ = require("lodash");
const path = require("path");
const axios = require("axios");
const fs = require("fs").promises;

class PrepareSPA {
  _quasarApi;
  _quasarConf;
  _hybridConf;

  constructor({ api, quasarConf, hybridConf }) {
    this._quasarApi = api;
    this._quasarConf = quasarConf;
    this._hybridConf = hybridConf;
  }

  get qa() {
    return this._quasarApi;
  }
  get qc() {
    return this._quasarConf;
  }
  get hc() {
    return this._hybridConf;
  }
  get distDir() {
    return this.qc.build.distDir || this.qa.resolve.app("dist/ssr");
  }
  get srcDir() {
    return this.hc.srcDir || "hybrid_render";
  }

  async run() {
    // read user defined index.html file
    const indexHTML = await this.readIndexHtml();

    // generate spa entry file based on index.html
    let html = await this.generateEntryFile(indexHTML);

    // resolve root directory of pages
    const outDir = this.resolveOutDir();

    // alter the entry file to use production entry in production
    html = await this.modifyEntry(html);

    // save entry file to file system
    await this.saveEntryFile(outDir, html);
  }

  readIndexHtml() {
    if (this.qa.hasVite)
      return fs.readFile(this.qa.resolve.app(`index.html`), "utf8");
    return fs.readFile(this.qa.resolve.src(`index.template.html`), "utf8");
  }

  async generateEntryFile(indexHTML) {
    if (this.qa.hasWebpack) {
      const compiledTemplate = _.template(indexHTML);

      const html = compiledTemplate(this.qc.htmlVariables);

      return html;
    }

    // TODO: if brakes ask and get help
    //"@quasar/app-vite/lib/helpers/html-template.js"
    const { transformHtml } = require(this.qa.resolve.cli(
      "lib/helpers/html-template.js"
    ));

    const origMode = this.qc.ctx.mode;
    const origModeName = this.qc.ctx.modeName;

    // confuse builder into thinking we run spa
    this.qc.ctx.mode = { spa: true };
    this.qc.ctx.modeName = "spa";
    this.qc.htmlVariables.MODE = "spa";

    // use quasar helper to build the entry
    const html = transformHtml(indexHTML, this.qc);

    // regress initial configuration
    this.qc.ctx.mode = origMode;
    this.qc.ctx.modeName = origModeName;
    this.qc.htmlVariables.MODE = origModeName;

    return html;
  }

  resolveOutDir() {
    if (this.qc.ctx.prod) return this.distDir;
    return this.qa.resolve.app(`.quasar/`);
  }

  async modifyEntry(html) {
    if (this.qa.hasWebpack) {
      let vendorJsEntry = `<script defer src=/js/vendor.js></script>`;
      let vendorCSSEntry = `<link href=/css/app.css rel=stylesheet>`;
      let appJsEntry = `<script defer src=/js/app.js></script>`;
      let appCSSEntry = `<link href=/css/vendor.css rel=stylesheet>`;

      if (this.qc.ctx.prod) {
        // read all built assets
        const jsFiles = await fs.readdir(
          path.join(this.distDir, "www/js")
          //this.qa.resolve.app(`${this.distDir}/www/js`)
        );
        const cssFiles = await fs.readdir(
          path.join(this.distDir, "www/css")
          // this.qa.resolve.app(`${this.distDir}/www/css`)
        );

        // prepare reqExps to match index files
        const jsVendorRegex = /^vendor\.[a-z0-9]+\.js$/;
        const cssVendorRegex = /^vendor\.[a-z0-9]+\.css$/;
        const jsAppRegex = /^app\.[a-z0-9]+\.js$/;
        const cssAppRegex = /^app\.[a-z0-9]+\.css$/;

        // find index files
        const vendorJSFile = jsFiles.find((file) => jsVendorRegex.test(file));
        const vendorCSSFile = cssFiles.find((file) =>
          cssVendorRegex.test(file)
        );
        const appJSFile = jsFiles.find((file) => jsAppRegex.test(file));
        const appCSSFile = cssFiles.find((file) => cssAppRegex.test(file));

        vendorJsEntry =
          vendorJSFile !== undefined
            ? `<script defer src=/js/${vendorJSFile}></script>`
            : null;
        vendorCSSEntry =
          vendorCSSFile !== undefined
            ? `<link href=/css/${vendorCSSFile} rel=stylesheet>`
            : null;
        appJsEntry =
          appJSFile !== undefined
            ? `<script defer src=/js/${appJSFile}></script>`
            : null;
        appCSSEntry =
          appCSSFile !== undefined
            ? `<link href=/css/${appCSSFile} rel=stylesheet>`
            : null;
      }

      // replace template entry with real entry
      const devEntry = "</head>";
      const prodEntry = `
          ${vendorJsEntry || ""}
          ${vendorCSSEntry || ""}
          ${appJsEntry || ""}
          ${appCSSEntry || ""}
        </head>
      `;

      return html.replace(devEntry, prodEntry);
    }

    if (this.qc.ctx.dev) return html;

    // TODO: look for better option to get current hashes of index files, manifest or something

    // read all built assets
    const files = await fs.readdir(
      path.join(this.distDir, "client/assets")
      //this.qa.resolve.app(`${this.distDir}/client/assets`)
    );

    // prepare reqExps to match index files
    const jsRegex = /^index\.[a-z0-9]+\.js$/;
    const cssRegex = /^index\.[a-z0-9]+\.css$/;

    // find index files
    const indexJSFile = files.find((file) => jsRegex.test(file));
    const indexCSSFile = files.find((file) => cssRegex.test(file));

    const devEntry =
      "<script type=module src=/.quasar/client-entry.js></script>";
    const prodEntry = `
      <script type="module" crossorigin src="/assets/${indexJSFile}"></script>
      <link rel="stylesheet" href="/assets/${indexCSSFile}" />
    `;

    // replace DEV entry with PROD entry
    return html.replace(devEntry, prodEntry);
  }

  async saveEntryFile(outDir, html) {
    await fs.mkdir(path.join(outDir, this.srcDir, "csr/"), {
      recursive: true,
    });
    await fs.writeFile(path.join(outDir, this.srcDir, `csr/index.html`), html);
  }
}

class PrepareSSG {
  _quasarApi;
  _quasarConf;
  _hybridConf;

  constructor({ api, quasarConf, hybridConf }) {
    this._quasarApi = api;
    this._quasarConf = quasarConf;
    this._hybridConf = hybridConf;
  }

  get qa() {
    return this._quasarApi;
  }
  get qc() {
    return this._quasarConf;
  }
  get hc() {
    return this._hybridConf;
  }
  get srcDir() {
    return this.hc.srcDir || "hybrid_render";
  }

  async run() {
    // read ssg defined routes from file if exists
    const ssgRoutes = await this.getDefinedRouteList();

    // check if generation is needed for any routes
    const shouldRunGenerate = await this.isNeededGeneration(ssgRoutes);

    // if dev then delete all ssg assets
    await this.deleteCurrentPages(shouldRunGenerate);

    // start PROD server and return its instance, in dev null
    const prodServer = await this.startProdServer(shouldRunGenerate);

    // perform page generation logic
    if (shouldRunGenerate) await this.runGeneration({ prodServer, ssgRoutes });
  }

  async getDefinedRouteList() {
    let ssgRoutesManual = [];

    // read user defined ssgRoutes if exists
    const routesPath = this.qa.resolve.app(`src-hr/ssg-routes.json`);
    const routesStats = await fs.stat(routesPath).catch((e) => null);
    if (routesStats) {
      const routesFile = await fs.readFile(routesPath, "utf8");
      ssgRoutesManual = JSON.parse(routesFile);
    }

    // import config defined route rules
    const { routes } = require(this.qa.resolve.app("src-hr/config.js"));
    const hybridRoutes = routes();

    // filter out ssg routes and its url segments
    const ssgRoutesAuto = hybridRoutes.routes
      .filter((r) => r[1].type === "ssg")
      .map((r) => {
        const route = r[1];
        if (Array.isArray(route.list) && route.list.length > 0) {
          return route.list.map((rr) => rr);
        } else if (route.url.includes("*"))
          console.warn(
            `${route.url} is not primitive, please provide list of urls...`
          );
        return route.url;
      })
      .flat();

    // join user defined and auto resolved
    return [...ssgRoutesManual, ssgRoutesAuto];
  }

  async isNeededGeneration(ssgRoutes) {
    // no routes, no needed
    let shouldRunGenerate = ssgRoutes.length > 0;

    // check if gone through generation already for prod, if yes do not generate
    if (this.qc.ctx.prod && shouldRunGenerate) {
      const filePath = path.join(this.distDir, this.srcDir, "ssg");
      const fileStats = await fs.stat(filePath).catch((e) => null);
      if (fileStats) shouldRunGenerate = false;
    }

    return shouldRunGenerate;
  }

  async deleteCurrentPages(shouldRunGenerate) {
    if (this.qc.ctx.dev && shouldRunGenerate)
      await fs
        .rm(this.qa.resolve.app(path.join(this.srcDir, "ssg")), {
          recursive: true,
        })
        .catch((e) => null);
  }

  async startProdServer(shouldRunGenerate) {
    let server = null;
    if (this.qc.ctx.prod && shouldRunGenerate) {
      // run server and get its details
      const { default: srv } = require(path.join(this.distDir, "index.js"));

      server = await srv.default;
    }
    return server;
  }

  getServerListeningParams(prodServer) {
    let usedPort, usedHostname;

    if (prodServer) {
      // get port and hostname of running server instance
      usedPort = prodServer.address().port;
      usedHostname = prodServer.address().address;

      // normalize hostnames of localhost
      // TODO: add "127.0.0.1"?
      usedHostname =
        usedHostname === "0.0.0.0" || usedHostname === "::"
          ? "localhost"
          : usedHostname;
    } else {
      // get quasar configured port, will fail if wasn't empty
      usedPort = this.qc.devServer.port;
      usedHostname = "localhost";
    }

    return { port: usedPort, host: usedHostname };
  }

  generateRoutes(urls) {
    // get configured queue options
    const CONCURRENT_GENS = +this.hc.SSG.queueConcurrence || 2;
    const COOLING_TIMEOUT = +this.hc.SSG.queueCooling || 600;

    // make list of callbacks for route generations
    const calls = urls.map((url) => {
      return () =>
        axios.get(url).catch((err) => {
          console.error("SSG prerender failed with: ", err);
        });
    });

    // create and run parallel queue
    const queue = new ConcurrentQueue(
      { concurrentNumber: CONCURRENT_GENS, coolingTimeout: COOLING_TIMEOUT },
      calls
    );
    return queue.run();
  }

  async runGeneration({ prodServer, ssgRoutes }) {
    // skip generation if SSG acts as SSR
    if (this.hc.SSG.actAsSSR) return;

    const { port, host } = this.getServerListeningParams(prodServer);

    // TODO: what if uses TLS
    // compose url pointing to the running server
    const urlPrefix = `http://${host}:${port}`;

    // join url prefix with given routes
    const urls = ssgRoutes.map((r) => `${urlPrefix}${r}`);

    // when PROD, server is running already so async generate.
    // when DEV, server not yet started, simulate some time TODO: find how to run this better, and make configurable
    if (this.qc.ctx.prod) await this.generateRoutes(urls);
    else
      setTimeout(() => {
        this.generateRoutes(urls);
      }, 6000);

    // kill instance if was generating and is PROD
    if (this.qc.ctx.prod) process.exit(0);
  }
}

class ConcurrentQueue {
  _concurrentNumber;
  _coolingTimeout;
  _calls = [];

  #enqueueActive = false;
  #queuePromise = null;
  #queueIndex = 0;
  #enqueued = 0;
  #enqueueTimeouts = [];

  constructor(config, calls) {
    this._concurrentNumber = Object.hasOwn(config, "concurrentNumber")
      ? config.concurrentNumber
      : 2;
    this._coolingTimeout = Object.hasOwn(config, "coolingTimeout")
      ? config.coolingTimeout
      : 500;
    this._calls = calls || [];
  }

  async run() {
    // enqueue first batch
    this.enqueue();

    // save and return a promise of run end
    return new Promise((res, rej) => {
      this.#queuePromise = { res, rej };
    });
  }

  deleteTimeout(timeout) {
    // clear and delete defined timeout from queue
    const index = this.#enqueueTimeouts.indexOf(timeout);

    if (index > -1) {
      clearTimeout(this.#enqueueTimeouts[index]);
      this.#enqueueTimeouts.splice(index, 1);
    }
  }

  async enqueue() {
    // make sure method is access only by one thread at a time
    if (this.#enqueueActive) return setTimeout(this.enqueue, 0);
    this.#enqueueActive = true;

    const remainingCallCount = this._calls.length - this.#queueIndex;
    const enqueableCount =
      this._concurrentNumber - (this.#enqueued + this.#enqueueTimeouts.length);
    const toQueueCount = Math.min(remainingCallCount, enqueableCount);

    // resolve if all calls made and done
    if (remainingCallCount < 1 && this.#enqueued < 1)
      return this.#queuePromise.res();

    // enqueue allowed calls in parrallel
    for (let i = 0; i < toQueueCount; i++) {
      const call = this._calls[this.#queueIndex++];
      this.#enqueued++;

      call()
        .then((r) => {
          this.#enqueued--;
          const timeout = setTimeout(() => {
            // delete timeout from queue
            this.deleteTimeout(timeout);

            // perform new enqueuement
            this.enqueue();
          }, this._coolingTimeout);
          this.#enqueueTimeouts.push(timeout);
        })
        .catch((e) => {
          this.#enqueueActive = false;
          this.#enqueueTimeouts.map((t) => this.deleteTimeout(t));
          this.#queuePromise.rej(e);
        });
    }

    this.#enqueueActive = false;
  }
}

module.exports = { PrepareSPA, PrepareSSG, ConcurrentQueue };
