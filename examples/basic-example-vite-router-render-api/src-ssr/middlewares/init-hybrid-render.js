/*
  THIS FILE IS AUTO-GENERATED by hybrid-render extension of Quasar.
  You should not temper with this file, unless really needed.
*/

const { ssrMiddleware } = require("quasar/wrappers/index");
const { init } = require("../../src-hr/config.js");
const { handleError } = require("../../src-hr/utils.js");
const { extendConfig } = require("../../src-hr/utils.js");

module.exports = ssrMiddleware(({ app, resolve, render, serve }) => {
  app.get(resolve.urlPath("*"), async (req, res, next) => {
    try {
      // initiate hybridRender with defaults
      req.hybridRender = init();

      // bind hybridRender's extendConfig with itself
      req.hybridRender.extendConfig = extendConfig.bind(null, req.hybridRender);

      next();
    } catch (err) {
      // propagate error to error handler
      next(handleError(err));
    }
  });
});
