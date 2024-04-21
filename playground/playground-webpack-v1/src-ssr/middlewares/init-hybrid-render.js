import { ssrMiddleware } from "quasar/wrappers/index";
import { init } from "../../src-hr/config.js";
import { extendConfig } from "../../src-hr/utils.js";

export default ssrMiddleware(({ app, resolve, render, serve }) => {
  app.get(resolve.urlPath("*"), async (req, res, next) => {
    // initiate hybridRender with defaults
    req.hybridRender = init();

    // bind hybridRender's extendConfig with itself
    req.hybridRender.extendConfig = extendConfig.bind(null, req.hybridRender);

    next();
  });
});
