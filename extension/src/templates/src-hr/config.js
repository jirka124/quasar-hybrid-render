/*
hybridRender : {
  custom: {}, // reserved for user custom usage
  config: {
    filename: 'index',
    extension: '.html',
    autoAddExt: true
  },
  route: {
    type: ["ssr", "csr", "ssg", "isr"], // defaults to "ssr"
    ?ttl: [Number, undefined, null], // some can have time-to-live in secs, or null/undefined for never expire (ISR only)
  },
  renderer: any render compatible obj, // default not set
  matches: Route[], // internally filled by Router API with matched routes
  filepath: String, // a path to save/get page, defaults to pathname of requested url
  filename: String, // a filename of page to save/get, defaults to index.html or index.${extension?}
  ownUrl: String, // url path that should be requested and rendered, defaults to pathname of requested url
}
*/

const init = () => {
  return {
    custom: {}, // reserved for user custom usage
    config: {
      filename: "index", // if no filename specified, index will be used
      extension: ".html", // if no extension specified, .html will be used
      autoAddExt: true, // if filename has no extension, default extension will be appended
    },
    route: {
      type: "ssr", // if no specified, "ssr" is used
    },
  };
};

const config = () => {
  return {
    killSwitch: false, // set true to temporarly disable extension
    srcDir: "hybrid_render", // project relative path
    SSG: {
      actAsSSR: process.env.PROD ? false : true, // will act as SSR in DEV
      queueConcurrence: 2, // how many pages prerender at a time
      queueCooling: 600, // how many [ms] to wait between renders
    },
    ISR: {
      actAsSSR: false, // will not act as SSR
    },
  };
};

const routeList = () => {
  return {
    /* EDIT WITH APPROPRIATE RULES */
  };
};

const routes = () => {
  const routes = Object.entries(routeList()).map(([urlPattern, options]) => {
    // remove trailing / character if not / path
    let url =
      urlPattern.endsWith("/") && urlPattern !== "/"
        ? urlPattern.slice(0, -1)
        : urlPattern;

    // match a single * and resolve it as allow 1+ of not "/" chars
    // for /a/* will allow /a/b but not /a/b/c, ...
    url = url.replaceAll(/(?<!\*)\*(?!\*)/g, "[^/]+");

    // match a double ** preceded by / and resolve it as allow 1+ of any characters
    // for /a/** will allow /a/b and /a/b/c, ... but not /a
    url = url.replaceAll("/**", "/.+");

    // match a double ** and resolve it as allow 0+ of any characters
    // for /a** will allow /a and /a/b and /a/b/c, ...
    url = url.replaceAll("**", ".*");

    const regExp = new RegExp(`^${url}$`);
    return [regExp, { ...options, url: urlPattern }];
  });

  return {
    routes,
  };
};

module.exports.init = init;
module.exports.config = config;
module.exports.routes = routes;
