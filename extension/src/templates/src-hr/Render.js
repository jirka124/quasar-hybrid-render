import { promises as fs } from "fs";
import path from "path";
import { getNormPathname, getDefaultFilename, addExtension } from "./utils.js";
import { config } from "./config.js";

export class Render {
  constructor({ SSRContext, middleParams }) {
    this._SSRContext = SSRContext;
    this._middleParams = middleParams;
    this._normPath = null;
    this._filePath = null;
    this._fileName = null;
    this._fullFilePath = null;
    this._renderedHTML = null;
    this._renderRequired = null;
    this._hybridConf = config();
  }

  get hr() {
    return this._SSRContext.req.hybridRender || {};
  }
  get route() {
    return this.hr.route || {};
  }
  get req() {
    return this._SSRContext.req || {};
  }
  get res() {
    return this._SSRContext.res || {};
  }
  get srcDir() {
    return `${process.env.DEV ? ".quasar/" : ""}${
      this._hybridConf.srcDir || "hybrid_render"
    }`;
  }

  async run() {
    if (this.preRun) await this.preRun();

    if (this.prePrepare) await this.prePrepare();
    if (this.prepare) await this.prepare();
    if (this.postPrepare) await this.postPrepare();

    if (this.preRenderHTML) await this.preRenderHTML();
    if (this.renderHTML) await this.renderHTML();
    if (this.postRenderHTML) await this.postRenderHTML();

    if (this.preServeHTML) await this.preServeHTML();
    if (this.serveHTML) await this.serveHTML();
    if (this.postServeHTML) await this.postServeHTML();

    if (this.postRun) await this.postRun();
  }

  async prepare() {
    await this.resolvePathname(); // normalize requested url pathname
    await this.resolveFilepath(); // set a path of final file
    await this.resolveFilename(); // set a name of final file
    await this.resolveFullFilepath(); // combine file's path and name and make absolute
    await this.resolveUrl(); // set request's url attr to a defined one or default received
    await this.resolveRenderRequired(); // say if render is required or not for HTML
  }

  async renderHTML() {
    // render page or read a page file
    if (this._renderRequired) await this.renderPage();
    else await this.readPage();
  }

  async serveHTML() {
    if (this._renderedHTML === null) {
      if (process.env.DEBUGGING) console.error("page file not provided");
      this.res.status(500).send("500 | Internal Server Error");
    } else {
      this.res.setHeader("Content-Type", "text/html");
      this.res.send(this._renderedHTML);
    }
  }

  resolvePathname() {
    // get pathname part of url without trailing slash
    this._normPath = getNormPathname(this.req.originalUrl);
  }
  resolveFilepath() {
    // Resolve defined filepath if defined, if not default to pathname of url
    if (this.hr.filepath) this._filePath = this.hr.filepath;
    else this._filePath = this._normPath;
  }
  resolveFilename() {
    // Resolve defined filename if defined and make sure it is .html, if not default to index.html
    if (this.hr.filename)
      this._fileName = addExtension({
        filename: this.hr.filename,
        config: this.hr.config,
      });
    else this._fileName = getDefaultFilename(this.hr.config);
  }
  resolveFullFilepath() {
    // get full filepath of page
    this._fullFilePath = this._middleParams.resolve.root(
      this.srcDir,
      this.route.type,
      this._filePath,
      this._fileName
    );
  }
  resolveUrl() {
    // set requested url to defined one, or leave only the pathname section
    if (this.hr.ownUrl) this.req.url = this.hr.ownUrl;
    else this.req.url = this._normPath;
  }
  resolveRenderRequired() {
    this._renderRequired = true;
  }

  async readFile(filePath) {
    // check if requested file exists
    const fileStats = await fs.stat(filePath).catch((e) => null);

    // read and save index.html contents or null if doesn't exists
    if (fileStats) return await fs.readFile(filePath, "utf8");
    return null;
  }

  async writeFile(filePath, content) {
    // save HTML into a given file on system
    if (content !== null) {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content);
    } else throw new Error("make some error system already!!");
  }

  async readPage() {
    this._renderedHTML = await this.readFile(this._fullFilePath);
  }

  writePage() {
    return this.writeFile(this._fullFilePath, this._renderedHTML);
  }

  async renderPage() {
    try {
      // use Quasar's method to render page with a given SSRContext
      this._renderedHTML = await this._middleParams.render(this._SSRContext);
    } catch (err) {
      // catch and serve redirects, no match, errors...
      if (err.url) {
        if (err.code) return this.res.redirect(err.code, err.url);
        return this.res.redirect(err.url);
      } else if (err.code === 404)
        return this.res.status(404).send("404 | Page Not Found");
      else if (process.env.DEV)
        return this._middleParams.serve.error({
          err,
          req: this.req,
          res: this.res,
        });
      else {
        if (process.env.DEBUGGING) console.error(err.stack);
        return this.res.status(500).send("500 | Internal Server Error");
      }
    }
  }
}

export class RenderCSR extends Render {
  /* client is always served with prepared SPA index */

  constructor({ SSRContext, middleParams }) {
    super({ SSRContext, middleParams });
  }

  prepare() {
    // make sure that CSR entry is simply re-used
    this._renderRequired = false;
    this._fullFilePath = this._middleParams.resolve.root(
      this.srcDir,
      "csr/index.html"
    );
  }
}

export class RenderSSG extends Render {
  /* first HTML gets saved, then client is served */

  constructor({ SSRContext, middleParams }) {
    super({ SSRContext, middleParams });
  }

  async resolveRenderRequired() {
    // check if page file exists
    const fileStats = await fs.stat(this._fullFilePath).catch((e) => null);

    // render of SSG is required only if file doesn't exist yet
    this._renderRequired = !fileStats;
  }

  async preServeHTML() {
    // save HTML to filesystem
    await this.writePage();
  }

  async serveHTML() {
    // server HTML to user
    await super.serveHTML();
  }
}

export class RenderISR extends Render {
  /* first client is served, then HTML gets saved */

  constructor({ SSRContext, middleParams }) {
    super({ SSRContext, middleParams });
  }

  async resolveRenderRequired() {
    // check if page file exists
    const fileStats = await fs.stat(this._fullFilePath).catch((e) => null);

    // render of ISR is needed if doesn't exist yet, or is expired
    this._renderRequired = !fileStats;
    if (fileStats && this.route.ttl !== null && this.route.ttl !== undefined) {
      // set render required if ttl expired, (undefined | null) means never expire
      const ttl = Number(this.route.ttl) || 0;
      if ((new Date() - new Date(fileStats.mtime)) / 1000 > ttl)
        this._renderRequired = true;
    }
  }

  async serveHTML() {
    // server HTML to user
    await super.serveHTML();
  }
  async postServeHTML() {
    // save HTML to filesystem
    await this.writePage();
  }
}