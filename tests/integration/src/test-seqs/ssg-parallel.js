import { navigateTo, readRenderTime } from "../utils.js";

export default async ({ browser }) => {
  const status = { name: "ssg-parallel" };
  let inStates = [];
  const states = [];

  const page1 = await browser.newPage();
  const page2 = await browser.newPage();

  const p1 = navigateTo(page1, `http://localhost:${5000}/ssg`);
  const p2 = navigateTo(page2, `http://localhost:${5000}/ssg`);

  await Promise.all([p1, p2]);

  let renderISO1 = await readRenderTime(page1);
  let renderISO2 = await readRenderTime(page2);

  inStates = [Number(new Date(renderISO1)) === Number(new Date(renderISO2))];
  states.push({
    states: inStates,
    state: inStates.every((s) => s),
    id: "1-2",
  });

  status.states = states;
  status.state = states.every((s) => s.state);

  await page1.close();
  await page2.close();

  return status;
};
