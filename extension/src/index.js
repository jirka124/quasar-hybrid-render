const { PrepareSPA, PrepareSSG } = require("./private/Prepare.js");

// adds/removes middlewares used based on requested feature set
const manageMiddlewares = ({
  middlewares: middles,
  usesRouterApi,
  usesRenderApi,
}) => {
  // check if has middleware already, is used always for compatibility with same codebase even when off
  let index = middles.indexOf("init-hybrid-render");
  if (index < 0) middles.unshift("init-hybrid-render"); // add as first, if not yet there

  let indexRouter = middles.indexOf("router-hybrid-render");
  if (usesRouterApi) {
    // make sure router API middleware is used
    if (indexRouter < 0) {
      // place router right after the init if not yet placed
      if (index < 0) middles.splice(1, 0, "router-hybrid-render");
      else middles.splice(index + 1, 0, "router-hybrid-render");
    }
  } else {
    // make sure router API middleware is not used
    if (indexRouter > -1) {
      // delete the middleware
      middles.splice(indexRouter, 1);
    }
  }

  // check if has middleware already
  index = middles.indexOf("hybrid-render");

  if (usesRenderApi) {
    // make sure render API middleware is used
    if (index < 0) {
      // check if contains render at least
      index = middles.indexOf("render");

      if (index > -1) middles.splice(index, 0, "hybrid-render");
      // if render exists, put in front of
      else middles.push("hybrid-render"); // if doesnt, push as last
    }
  } else {
    // make sure render API middleware is not used
    if (index > -1) {
      // delete the middleware
      middles.splice(index, 1);
    }
  }
};

/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 */
module.exports = async function (api, ctx) {
  //export default async function (api, ctx) {
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

  const { config } = require(api.resolve.app("src-hr/config.js"));
  const hybridConf = config();

  const usesRouterApi =
    !hybridConf.killSwitch &&
    ["routerRenderApi", "routerApi"].includes(api.prompts.apiSet);

  const usesRenderApi =
    !hybridConf.killSwitch &&
    ["routerRenderApi", "renderApi"].includes(api.prompts.apiSet);

  api.extendQuasarConf((conf, api) => {
    // manage runtime middlewares
    manageMiddlewares({
      middlewares: conf.ssr.middlewares,
      usesRouterApi,
      usesRenderApi,
    });
  });

  // kill after middleware management if no render API (middles must run so they are removed appropriate)
  if (!usesRenderApi) return;

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
};
