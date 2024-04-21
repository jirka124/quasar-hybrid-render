import { PrepareSPA, PrepareSSG } from "./private/Prepare.js";

const addMiddlewares = (middles) => {
  // check if has middleware already
  let index = middles.indexOf("init-hybrid-render");
  if (index < 0) middles.unshift("init-hybrid-render"); // add as first, if not yet there

  // check if has middleware already
  index = middles.indexOf("hybrid-render");
  if (index < 0) {
    // check if contains render at least
    index = middles.indexOf("render");

    if (index > -1) middles.splice(index, 0, "hybrid-render");
    // if render exists, put in front of
    else middles.push("hybrid-render"); // if doesnt, push as last
  }
};

/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 */
export default async function (api, ctx) {
  // TODO: work with compatibility
  /*
  api.compatibleWith("quasar", "^2.0.0");

  if (api.hasVite === true) {
    api.compatibleWith("@quasar/app-vite", "^2.0.0-beta.1");
  } else {
    // api.hasWebpack === true
    api.compatibleWith("@quasar/app-webpack", "^4.0.0-beta.1");
  }
  */

  api.extendQuasarConf((conf, api) => {
    // add runtime middlewares
    addMiddlewares(conf.ssr.middlewares);
  });

  const { config } = await import(
    "file://" + api.resolve.app("src-hr/config.js")
  );

  const hybridConf = config();
  if (hybridConf.killSwitch) return;

  api.afterDev(async (api, { quasarConf }) => {
    if (quasarConf.ctx.modeName === "ssr") {
      // prepare dev SPA client entry index file
      await new PrepareSPA({ api, quasarConf, hybridConf }).run();

      // prerender SSG routes
      await new PrepareSSG({ api, quasarConf, hybridConf }).run();
    }
  });

  api.afterBuild(async (api, { quasarConf }) => {
    if (quasarConf.ctx.modeName === "ssr") {
      // prepare prod SPA client entry index file
      await new PrepareSPA({ api, quasarConf, hybridConf }).run();

      // prerender SSG routes
      await new PrepareSSG({ api, quasarConf, hybridConf }).run();
    }
  });
}
