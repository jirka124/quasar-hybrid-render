import { ssrMiddleware } from "quasar/wrappers/index";

import { RenderCSR, RenderSSG, RenderISR } from "../../src-hr/Render.js";
import { config } from "../../src-hr/config.js";

export default ssrMiddleware(({ app, resolve, render, serve }) => {
  // process hybrid routing (ISR, SSG, CSR)
  app.get(resolve.urlPath("*"), async (req, res, next) => {
    const hybridConf = config();

    // default to SSR and skip SSR as its performed by Quasar SSR
    if (!req.hybridRender || !req.hybridRender.route) return next();

    if (!req.hybridRender.route.type || req.hybridRender.route.type === "ssr")
      return next();

    if (req.hybridRender.route.type === "ssg" && hybridConf.SSG.actAsSSR)
      return next();
    if (req.hybridRender.route.type === "isr" && hybridConf.ISR.actAsSSR)
      return next();

    const hr = req.hybridRender;
    const route = hr.route;

    hr.initialUrl = req.url;

    let renderer = null;
    const renderOptions = {
      SSRContext: { req, res },
      middleParams: { resolve, render, serve },
    };

    // choose appropriate renderer and run it to serve request
    if (hr.renderer) renderer = renderer;
    else if (route.type === "csr") renderer = new RenderCSR(renderOptions);
    else if (route.type === "ssg") renderer = new RenderSSG(renderOptions);
    else if (route.type === "isr") renderer = new RenderISR(renderOptions);

    if (!renderer) next();
    else await renderer.run();
  });

  // Reset initial URL for the purpose of SSR render resolvement
  app.get(resolve.urlPath("*"), async (req, res, next) => {
    if (req.hybridRender && req.hybridRender.initialUrl)
      req.url = req.hybridRender.initialUrl;
    next();
  });
});
