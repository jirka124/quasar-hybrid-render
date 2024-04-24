import { ssrMiddleware } from "quasar/wrappers/index";

import { promises as fs } from "fs";
import { config } from "../../src-hr/config.js";

export default ssrMiddleware(({ app, resolve, render, serve }) => {
  app.post("/api/path-reinv", async (req, res, next) => {
    // some kind of AUTH...
    // some kind of reinvalidation logic...
    // probably don't want to await reinvalidation in real app, its just example

    const hybridConf = config();

    let srcDir = hybridConf.srcDir || "hybrid_render";
    srcDir = process.env.PROD ? srcDir : `.quasar/${srcDir}`;

    // delete the page to reinvalidate
    const fullFilepath = resolve.root(srcDir, "isr/custom-isr/index.html");
    const fileStats = await fs.stat(fullFilepath).catch((e) => null);
    if (fileStats) await fs.unlink(fullFilepath);

    return res.status(200).json({ reqState: null, result: true });
  });
});
