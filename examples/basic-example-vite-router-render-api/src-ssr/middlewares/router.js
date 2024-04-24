import { ssrMiddleware } from "quasar/wrappers/index";

export default ssrMiddleware(({ app, resolve, render, serve }) => {
  app.get(resolve.urlPath("*"), async (req, res, next) => {
    console.log(req.url);

    // rest of rules is taken of Router API
    if (req.url === "/isr") {
      req.hybridRender.extendConfig({
        route: { type: "isr", ttl: 20 },
        filepath: "/custom-isr",
      });
    }

    next();
  });
});
