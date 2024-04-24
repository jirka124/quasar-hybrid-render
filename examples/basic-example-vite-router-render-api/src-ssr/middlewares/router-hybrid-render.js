/*
  THIS FILE IS AUTO-GENERATED by hybrid-render extension of Quasar.
  You should not temper with this file, unless really needed.
*/

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
          return sum + 5; // segment not using regulars
        }, 0);
      }
    });

    // if same priority, last will win (js sort is stable now)
    // order by the points from min to max
    matches.sort((a, b) => a[1].points - b[1].points);

    // loop all matches and make joined route object (using override)
    const routeObj = matches.reduce((obj, m) => ({ ...obj, ...m[1] }), {});

    // join route object with config
    req.hybridRender.extendConfig({
      route: routeObj,
    });

    req.hybridRender.matches = matches;

    next();
  });
});
