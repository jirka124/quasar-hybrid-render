import { navigateTo, readRenderTime } from "../utils.js";

export default async ({ browser }) => {
  const status = { name: "ssr-serial" };
  let inStates = [];
  const states = [];

  const page = await browser.newPage();

  await navigateTo(page, `http://localhost:${5000}/ssr`);
  let renderISO1 = await readRenderTime(page);

  await navigateTo(page, `http://localhost:${5000}/ssr`);
  let renderISO2 = await readRenderTime(page);

  inStates = [new Date(renderISO1) < new Date(renderISO2)];
  states.push({
    states: inStates,
    state: inStates.every((s) => s),
    id: "1-2",
  });

  status.states = states;
  status.state = states.every((s) => s.state);

  await page.close();

  return status;
};
