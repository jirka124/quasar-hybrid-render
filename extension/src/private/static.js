export const extensionAssets = [
  {
    src: "templates/middlewares/hybrid-render.js",
    out: "src-ssr/middlewares/hybrid-render.js",
  },
  {
    src: "templates/middlewares/init-hybrid-render.js",
    out: "src-ssr/middlewares/init-hybrid-render.js",
  },
  {
    src: "templates/middlewares/router-hybrid-render.js",
    out: "src-ssr/middlewares/router-hybrid-render.js",
  },
  { src: "templates/src-hr/config.js", out: "src-hr/config.js" },
  { src: "templates/src-hr/utils.js", out: "src-hr/utils.js" },
  { src: "templates/src-hr/ssg-routes.json", out: "src-hr/ssg-routes.json" },
  { src: "templates/src-hr/Render.js", out: "src-hr/Render.js" },
  {
    src: "templates/src-hr/hybrid-render-flag.d.ts",
    out: "src-hr/hybrid-render-flag.d.ts",
  },
];
