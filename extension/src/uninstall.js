import { extensionAssets } from "./private/static.js";

/**
 * Quasar App Extension uninstall script
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/uninstall-api
 */
export default async function (api, ctx) {
  // remove extension files
  extensionAssets.map((asset) => api.removePath(asset.out));
  api.removePath("src-hr");
}
