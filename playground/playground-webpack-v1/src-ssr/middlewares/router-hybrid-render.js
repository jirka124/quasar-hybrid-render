import { ssrMiddleware } from "quasar/wrappers/index";
import { routes } from "../../src-hr/config.js";
import { getNormPathname } from "../../src-hr/utils.js";

export default ssrMiddleware(({ app, resolve, render, serve }) => {
  app.get(resolve.urlPath("*"), async (req, res, next) => {
    const hybridRoutes = routes();

    // get normalization pathname from url
    const pathname = getNormPathname(req.originalUrl);

    // filter all route rules that do not match
    const matches = hybridRoutes.routes.filter(([regExp, route]) =>
      regExp.test(pathname)
    );

    // reward each match based on its segments
    matches.map((m) => {
      const routeObj = m[1];
      if (routeObj.url === pathname) routeObj.points = Infinity;
      else {
        const segments = routeObj.url.split("/"); // exact match Infinity
        routeObj.points = segments.reduce((sum, s) => {
          if (s === "") return sum; // dont count the initial /
          if (/^\*\*$/.test(s)) return sum + 1; // segment only of **
          if (s.includes("**")) return sum + 2; // segment containing **
          if (/^\*$/.test(s)) return sum + 3; // segment only of *
          if (s.includes("*")) return sum + 4; // segment containing *
          return sum + 5; // segment not using requlars
        }, 0);
      }
    });

    // if same priority, first will win (js sort is stable now)
    // order by the points from max to min
    matches.sort((a, b) => b[1].points - a[1].points);
    const bestMatch = matches[0];

    if (bestMatch) {
      // in case of match, use route rules
      const route = bestMatch[1];

      if (Object.hasOwn(route, "type")) {
        const type = route.type;

        if (type === "csr" || type === "ssg") {
          req.hybridRender.extendConfig({
            route: { type },
          });
        } else if (type === "isr") {
          const ttl = Object.hasOwn(route, "ttl") ? route.ttl : null;

          req.hybridRender.extendConfig({
            route: { type, ttl },
          });
        }
      }

      req.hybridRender.matches = matches;
    }
    next();
  });
});
