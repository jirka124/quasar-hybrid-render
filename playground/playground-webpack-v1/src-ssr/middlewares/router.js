import { ssrMiddleware } from "quasar/wrappers/index";

export default ssrMiddleware(({ app, resolve, render, serve }) => {
  app.get(resolve.urlPath("*"), async (req, res, next) => {
    console.log(req.url);

    if (req.url === "/csr") req.hybridRender.route.type = "csr";
    else if (req.url === "/ssg") {
      req.hybridRender.extendConfig({
        route: { type: "ssg" },
        filepath: "/custom-ssg",
        filename: "index2.html",
      });
    } else if (req.url === "/isr") {
      req.hybridRender.extendConfig({
        route: { type: "isr", ttl: 20 },
        filepath: "/custom-isr",
      });
    }

    next();
  });
});
