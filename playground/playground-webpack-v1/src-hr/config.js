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

module.exports.init = init;
module.exports.config = config;
