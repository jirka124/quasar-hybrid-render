import {
  delay,
  navigateTo,
  readRenderTime,
  readApiStatus,
  reInvalidateApi,
  reInvalidatePage,
} from "../utils.js";

export default async ({ browser }) => {
  const status = { name: "swr-serial" };
  let inStates = [];
  const states = [];

  const page = await browser.newPage();

  // should render (no cached file)
  await navigateTo(page, `http://localhost:${5000}/swr`);
  let renderISO1 = await readRenderTime(page);
  let apiStatus1 = await readApiStatus(page);

  // should not render (ttl not expired && no api change) && should match previous
  await navigateTo(page, `http://localhost:${5000}/swr`);
  await navigateTo(page, `http://localhost:${5000}/swr`); // double reload to see, actual page
  let renderISO2 = await readRenderTime(page);
  let apiStatus2 = await readApiStatus(page);

  inStates = [
    Number(new Date(renderISO1)) === Number(new Date(renderISO2)),
    apiStatus1 === apiStatus2,
  ];
  states.push({
    states: inStates,
    state: inStates.every((s) => s),
    id: "1-2",
  });

  // should not render (ttl not expired && api change) && should match previous
  await reInvalidateApi(page); // will also reload page
  await navigateTo(page, `http://localhost:${5000}/swr`); // double reload to see, actual page
  let renderISO3 = await readRenderTime(page);
  let apiStatus3 = await readApiStatus(page);

  inStates = [
    Number(new Date(renderISO1)) === Number(new Date(renderISO3)),
    apiStatus1 === apiStatus3,
  ];
  states.push({
    states: inStates,
    state: inStates.every((s) => s),
    id: "1-3",
  });

  await delay(20000); // wait for ttl expire

  // should render (ttl expired && api change) && should match previous
  await navigateTo(page, `http://localhost:${5000}/swr`);
  let renderISO4 = await readRenderTime(page);
  let apiStatus4 = await readApiStatus(page);

  inStates = [
    Number(new Date(renderISO1)) === Number(new Date(renderISO4)),
    apiStatus1 === apiStatus4,
  ];
  states.push({
    states: inStates,
    state: inStates.every((s) => s),
    id: "1-4",
  });

  // should not render (ttl not expired && no api change) && should not match previous
  await navigateTo(page, `http://localhost:${5000}/swr`);
  let renderISO5 = await readRenderTime(page);
  let apiStatus5 = await readApiStatus(page);

  inStates = [
    Number(new Date(renderISO1)) < Number(new Date(renderISO5)),
    apiStatus1 !== apiStatus5,
  ];
  states.push({
    states: inStates,
    state: inStates.every((s) => s),
    id: "1-5",
  });

  await delay(20000); // wait for ttl expire

  // should not render, but should validate API and enlength ttl (ttl expired && no api change) && should match previous
  await navigateTo(page, `http://localhost:${5000}/swr`);
  await navigateTo(page, `http://localhost:${5000}/swr`); // double reload to see, actual page
  let renderISO6 = await readRenderTime(page);
  let apiStatus6 = await readApiStatus(page);

  inStates = [
    Number(new Date(renderISO5)) === Number(new Date(renderISO6)),
    apiStatus5 === apiStatus6,
  ];
  states.push({
    states: inStates,
    state: inStates.every((s) => s),
    id: "5-6",
  });

  // should not render (ttl not expired && api change) && should match previous
  await reInvalidateApi(page); // will also reload page
  await navigateTo(page, `http://localhost:${5000}/swr`); // double reload to see, actual page
  let renderISO7 = await readRenderTime(page);
  let apiStatus7 = await readApiStatus(page);

  inStates = [
    Number(new Date(renderISO5)) === Number(new Date(renderISO7)),
    apiStatus5 === apiStatus7,
  ];
  states.push({
    states: inStates,
    state: inStates.every((s) => s),
    id: "5-7",
  });

  // should render (no cached file) && should not match previous
  await reInvalidatePage(page, "/path-reinv-2"); // will also reload page
  let renderISO8 = await readRenderTime(page);
  let apiStatus8 = await readApiStatus(page);

  inStates = [
    Number(new Date(renderISO4)) < Number(new Date(renderISO8)),
    apiStatus5 !== apiStatus8,
  ];
  states.push({
    states: inStates,
    state: inStates.every((s) => s),
    id: "5-8",
  });

  status.states = states;
  status.state = states.every((s) => s.state);

  await page.close();

  return status;
};
