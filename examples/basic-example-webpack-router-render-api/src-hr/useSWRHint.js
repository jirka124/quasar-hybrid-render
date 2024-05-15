import { useSSRContext } from "vue";

export async function useSWRHint(name, ssrContext, func) {
  // skip swr hinting if not used in SSR build or if used on client
  if (process.env.MODE !== "ssr" || process.env.CLIENT) return func();

  // default ssrContext to vue composable (only applies to setup)
  const ssrCtx = ssrContext || useSSRContext();

  // make sure is called from swr context
  if (
    !ssrCtx.req ||
    !ssrCtx.req.hybridRender ||
    !ssrCtx.req.hybridRender.swrHintGroup
  )
    return func();

  const swrHintGroup = ssrCtx.req.hybridRender.swrHintGroup;
  const swrHints = swrHintGroup.hintGroup;

  let swrHint = swrHints.getHint(name);

  // reuse API results if present
  if (swrHint)
    return swrHint.setOrder(swrHintGroup.currInd++).setUsed(true)._result;

  // run requested api call
  const result = func();

  // compose & save swrHint of call
  swrHint = swrHints
    .createHint(name)
    .setOrder(swrHintGroup.currInd++)
    .setUsed(true)
    .setFunc(func)
    .setResult(result);

  // return result / promise of api call to client app
  return result;
}
