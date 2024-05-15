module.exports.extensionAssets = [
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
  { src: "templates/src-hr/config.cjs", out: "src-hr/config.cjs" },
  { src: "templates/src-hr/runtime.cjs", out: "src-hr/runtime.cjs" },
  { src: "templates/src-hr/useSWRHint.js", out: "src-hr/useSWRHint.js" },
  { src: "templates/src-hr/utils.cjs", out: "src-hr/utils.cjs" },
  { src: "templates/src-hr/ssg-routes.json", out: "src-hr/ssg-routes.json" },
  { src: "templates/src-hr/Render.cjs", out: "src-hr/Render.cjs" },
  {
    src: "templates/src-hr/hybrid-render-flag.d.ts",
    out: "src-hr/hybrid-render-flag.d.ts",
  },
];
