import { Blob } from "buffer";
import fs from "fs/promises";
import crypto from "crypto";
import colors from "colors/safe.js";

import { extensionAssets } from "./private/static.js";

const readFile = async (filepath) => {
  // check if file exists
  const fileStats = await fs.stat(filepath).catch((e) => null);

  // if exists return file contents, else null
  if (fileStats) return await fs.readFile(filepath);
  return null;
};

const hashup = async (string) => {
  return crypto.createHash("sha256").update(string).digest("hex");
};

/**
 * Quasar App Extension install script
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/install-api
 */
export default async function (api, ctx) {
  console.log();
  console.log(colors.cyan(`Running installation of ${api.extId}.`));
  console.log();

  for (let asset of extensionAssets) {
    // read user and ext file
    let srcBuff = Buffer.from([]),
      outBuff = Buffer.from([]);

    outBuff = await readFile(api.resolve.app(asset.out));
    srcBuff = await readFile(
      api.resolve.cli(
        `../../quasar-app-extension-hybrid-render/src/${asset.src}`
      )
    );

    let renderRequired = false;

    // if user doesnt have file, serve
    if (outBuff === null) renderRequired = true;

    // if users file differs from current, ask to serve
    if (!renderRequired) {
      // Convert buffers to strings using UTF-8 encoding
      const srcStr = await hashup(srcBuff.toString("utf-8") || "");
      const outStr = await hashup(outBuff.toString("utf-8") || "");
      renderRequired = srcStr !== outStr;
    }

    // TODO: learn to not make false possitives sometimes?
    // comapare files and check if out is up to date
    if (renderRequired && srcBuff !== null) {
      console.log(
        colors.yellow(
          `☒ Asset "${asset.out}" differs from fresh version (new size: ${
            new Blob(srcBuff || []).size
          } B, old size: ${new Blob(outBuff || []).size} B)`
        )
      );
      // copy src to out
      await api.renderFile(asset.src, asset.out, {
        engine: api.hasVite ? "vite" : "webpack",
      });
    } else console.log(`☑ Asset "${asset.out}" up to date, skipping...`);
  }

  console.log();
  console.log();
  api.onExitLog(colors.cyan(`Installation of ${api.extId} done.`));
}
