import { navigateTo, readRenderTime } from "../utils.js";

export default async ({ browser }) => {
  const status = { name: "ssg-serial" };
  let inStates = [];
  const states = [];

  const page = await browser.newPage();

  await navigateTo(page, `http://localhost:${5000}/ssg`);
  let renderISO1 = await readRenderTime(page);

  await navigateTo(page, `http://localhost:${5000}/ssg`);
  let renderISO2 = await readRenderTime(page);

  inStates = [Number(new Date(renderISO1)) === Number(new Date(renderISO2))];
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
