//import { minify } from "@quasar/html-minifier-terser";
const absoluteUrlRE = /^(https?:\/\/|\/|data:)/i;
const ssrInterpolationsRE = /{{([\s\S]+?)}}/g;

const headStartRE = /(<head[^>]*>)/i;
const headEndRE = /(<\/head>)/i;
const bodyStartRE = /(<body[^>]*>)/i;

export const entryPointMarkup = "<!-- quasar:entry-point -->";
export const attachMarkup = '<div id="q-app"></div>';

function injectPublicPath(html, publicPath) {
  return html.replace(
    /(href|src)\s*=\s*(['"])(.+)(['"])/gi,
    (_, att, pre, val, post) =>
      absoluteUrlRE.test(val.trim()) === true
        ? `${att}=${pre}${val}${post}`
        : `${att}=${pre}${publicPath + val}${post}`
  );
}

function injectPwaTags(html, quasarConf) {
  const { publicPath } = quasarConf.build;
  const { pwaManifest } = quasarConf.htmlVariables;
  const { useCredentialsForManifestTag, injectPwaMetaTags, manifestFilename } =
    quasarConf.pwa;

  let headTags = `\n<link rel="manifest" href="${publicPath}${manifestFilename}"${
    useCredentialsForManifestTag === true
      ? ' crossorigin="use-credentials"'
      : ""
  }>`;

  if (injectPwaMetaTags === true) {
    headTags +=
      (pwaManifest.theme_color !== void 0
        ? `\n<meta name="theme-color" content="${pwaManifest.theme_color}">` +
          `<link rel="mask-icon" href="${publicPath}icons/safari-pinned-tab.svg" color="${pwaManifest.theme_color}">`
        : "") +
      '\n<meta name="mobile-web-app-capable" content="yes">' +
      '\n<meta name="apple-mobile-web-app-status-bar-style" content="default">' +
      (pwaManifest.name !== void 0
        ? `\n<meta name="apple-mobile-web-app-title" content="${pwaManifest.name}">`
        : "") +
      `\n<meta name="msapplication-TileImage" content="${publicPath}icons/ms-icon-144x144.png">` +
      '\n<meta name="msapplication-TileColor" content="#000000">' +
      `\n<link rel="apple-touch-icon" href="${publicPath}icons/apple-icon-120x120.png">` +
      `\n<link rel="apple-touch-icon" sizes="152x152" href="${publicPath}icons/apple-icon-152x152.png">` +
      `\n<link rel="apple-touch-icon" sizes="167x167" href="${publicPath}icons/apple-icon-167x167.png">` +
      `\n<link rel="apple-touch-icon" sizes="180x180" href="${publicPath}icons/apple-icon-180x180.png">`;
  } else if (typeof injectPwaMetaTags === "function") {
    headTags += injectPwaMetaTags({ publicPath, pwaManifest });
  }

  return html.replace(headStartRE, (_, tag) => `${tag}${headTags}`);
}

export async function transformHtml({ html, quasarConf, renderSsrPwaOffline }) {
  const { ctx } = quasarConf;

  // should be dev only
  if (quasarConf.metaConf.vueDevtools !== false) {
    const { host, port } = quasarConf.metaConf.vueDevtools;
    const nonce =
      ctx.mode.ssr === true
        ? "{{ ssrContext.nonce ? ' nonce=\"' + ssrContext.nonce + '\"' : '' }}"
        : "";

    const scripts =
      `<script${nonce}>window.__VUE_DEVTOOLS_HOST__='${host}';window.__VUE_DEVTOOLS_PORT__='${port}';</script>` +
      `\n<script src="http://${host}:${port}"></script>`;

    html = html.replace(headEndRE, (_, tag) => `${scripts}\n${tag}`);
  }

  if (ctx.mode.cordova) {
    html = html.replace(
      bodyStartRE,
      (_, tag) => `${tag}\n<script src="cordova.js"></script>`
    );
  } else if (ctx.mode.pwa) {
    html = injectPwaTags(html, quasarConf);
  }

  html = html.replace(
    entryPointMarkup,
    renderSsrPwaOffline !== true && ctx.mode.ssr
      ? '<div id="q-app">{{ ssrContext._meta.runtimePageContent }}</div>{{ ssrContext._meta.afterRuntimePageContent }}'
      : attachMarkup
  );

  if (quasarConf.build.publicPath) {
    html = injectPublicPath(html, quasarConf.build.publicPath);
  }

  if (quasarConf.build.minify) {
    const minifyOpts = { ...quasarConf.build.htmlMinifyOptions };

    if (ctx.mode.ssr) {
      minifyOpts.ignoreCustomFragments = [ssrInterpolationsRE];
    }

    // FIXME: not working
    // html = await minify(html, minifyOpts);
  }

  return html;
}
/*
// TODO: delete me
module.exports.injectWebpackHtml = function injectWebpackHtml (webpackChain, quasarConf, templateParam = quasarConf.htmlVariables) {
  const { appPaths } = quasarConf.ctx
  const renderSsrPwaOffline = quasarConf.ctx.mode.ssr && quasarConf.ctx.mode.pwa

  const filename = renderSsrPwaOffline === true
    ? quasarConf.ssr.pwaOfflineHtmlFilename
    : quasarConf.build.htmlFilename

  webpackChain.plugin('html-webpack')
    .use(HtmlWebpackPlugin, [ {
      filename,
      template: appPaths.resolve.app(quasarConf.sourceFiles.indexHtmlTemplate),
      minify: false, // important! we'll do it ourselves later in transformHtml()
      templateParameters: templateParam,
      chunksSortMode: 'none',
      publicPath: quasarConf.build.publicPath,
      inject: true,
      cache: true
    } ])

  webpackChain.plugin('html-addons')
    .use(HtmlTransformPlugin, [
      html => transformHtml({ html, quasarConf, renderSsrPwaOffline })
    ])
}
*/
