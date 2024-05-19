import fs from "fs";

export const delay = (time = 0) => {
  return new Promise((res) => {
    setTimeout(() => res(), time || 0);
  });
};

export const fileStat = (filePath) => {
  let fileStats = null;
  try {
    fileStats = fs.statSync(filePath);
  } catch (e) {}
  return fileStats;
};

export const navigateTo = async (page, url) => {
  await page.goto(url, {
    waitUntil: ["load", "networkidle0"],
  });
};

export const readRenderTime = async (page) => {
  const renderElm = await page.waitForSelector("#render-elm");
  return await page.evaluate((el) => el.getAttribute("title"), renderElm);
};

export const readApiStatus = async (page) => {
  const apiElm = await page.waitForSelector("#api-res");
  return await page.evaluate((el) => el.textContent, apiElm);
};

export const waitForPageMount = async (page) => {
  return new Promise(async (res, rej) => {
    const interval = setInterval(async () => {
      const mountElm = await page.waitForSelector("#mlh-mount-state");
      let isMounted = await page.evaluate(
        (el) => el.getAttribute("title"),
        mountElm
      );
      isMounted = isMounted === "TRUE";

      if (isMounted) {
        clearInterval(interval);
        await delay(200);
        res();
      }
    }, 200);
  });
};

export const reInvalidateApi = async (page) => {
  const reinvApiElm = await page.waitForSelector("#reinv-api");
  if (reinvApiElm) {
    await waitForPageMount(page);
    const waitRes = page.waitForResponse(
      (res) => res.url() === "http://localhost:5000/api/toggle-api-1-state"
    );
    await reinvApiElm.click();
    await waitRes;
    await page.waitForNavigation({ waitUntil: ["load", "networkidle0"] });
  } else throw new Error("NO reinvalidation api button found!");
};

export const reInvalidatePage = async (page, path) => {
  const reinvPageElm = await page.waitForSelector("#reinv-page");
  if (reinvPageElm) {
    await waitForPageMount(page);
    const waitRes = page.waitForResponse(
      (res) => res.url() === `http://localhost:5000/api${path}`
    );
    await reinvPageElm.click();
    await waitRes;
    await page.waitForNavigation({ waitUntil: ["load", "networkidle0"] });
  } else throw new Error("NO reinvalidation page button found!");
};

export default {
  delay,
  navigateTo,
  readRenderTime,
  readApiStatus,
  reInvalidateApi,
  reInvalidatePage,
};
