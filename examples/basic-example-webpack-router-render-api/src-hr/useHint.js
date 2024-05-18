/*
  THIS FILE IS AUTO-GENERATED by hybrid-render extension of Quasar.
  You should not temper with this file, unless really needed.
*/
import { useSSRContext } from "vue";

export async function useSWRHint(name, ssrContext, func, opts) {
  return useHint(name, ssrContext, func, { ...opts, onlySWR: true });
}

export async function useISRHint(name, ssrContext, func, opts) {
  return useHint(name, ssrContext, func, { ...opts, onlyISR: true });
}

export async function useHint(name, ssrContext, func, opts) {
  // skip api hinting if not used in SSR build or if used on client or skipped by skip condition
  if (process.env.MODE !== "ssr" || process.env.CLIENT || (opts && opts.skip))
    return func();

  // default ssrContext to vue composable (only applies to setup)
  const ssrCtx = ssrContext || useSSRContext();

  // make sure is called from context passing hints
  if (
    !ssrCtx.req ||
    !ssrCtx.req.hybridRender ||
    !ssrCtx.req.hybridRender.apiHintGroup
  )
    return func();

  const apiHintGroup = ssrCtx.req.hybridRender.apiHintGroup;
  const apiHints = apiHintGroup.hintGroup;

  // make sure to skip in case of mode missmatch
  if (opts.onlyISR && apiHints._MODE !== "ISR") return func();
  if (opts.onlySWR && apiHints._MODE !== "SWR") return func();

  let apiHint = apiHints.getHint(name);

  // reuse API results if present
  if (apiHint)
    return apiHint.setOrder(apiHintGroup.currInd++).setUsed(true)._result;

  // run requested api call
  const result = func();

  // compose & save apiHint of call
  apiHint = apiHints
    .createHint(name)
    .setOrder(apiHintGroup.currInd++)
    .setUsed(true)
    .setFunc(func)
    .setResult(result);

  // return result / promise of api call to client app
  return result;
}
