import { useSSRContext } from "vue";

export async function useSWRHint(name, ssrContext, func) {
  // skip swr hinting if not used in SSR build or if used on client
  if (process.env.MODE !== "ssr" || process.env.CLIENT) {
    console.log("thats not ssr or client"); // TODO: delete after testing with SPA
    return func();
  }

  // default ssrContext to vue composable (only applies to setup)
  const ssrCtx = ssrContext || useSSRContext();
  const fullHint = ssrCtx.req.hybridRender.swrChecks;
  const swrHints = fullHint.hintObj;

  // reuse API results if present
  if (swrHints[name]) {
    swrHints[name].order = fullHint.currInd++;
    swrHints[name].used = true;
    return swrHints[name].result;
  }

  // run requested api call
  const result = func();

  // compose & save swrHint of call
  swrHints[name] = {
    order: fullHint.currInd++,
    used: true,
    func,
    result,
  };

  // return result / promise of api call to client app
  return result;
}
