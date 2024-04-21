export const isNotNullObject = (obj) => {
  return typeof obj === "object" && !Array.isArray(obj) && obj !== null;
};

// merges any number of objects into one, last one has precedence and first is used as target
export const deepMerge = (...objectArr) => {
  const target = objectArr.length > 0 ? objectArr[0] : {};

  for (let i = 1, obj = null; i < objectArr.length; i++) {
    obj = objectArr[i];

    for (const key in obj) {
      if (isNotNullObject(obj[key])) {
        if (isNotNullObject(target[key]))
          target[key] = deepMerge(target[key], obj[key]);
        else target[key] = obj[key];
      } else target[key] = obj[key];
    }
  }

  return target;
};

// joins current config with new config
export const extendConfig = (configObj, extendBy) => {
  deepMerge(configObj, extendBy);
};

// get pathname of provided url with stripped trailing slash
export const getNormPathname = (fromUrl) => {
  let url = new URL("http://none" + fromUrl);
  return url.pathname.endsWith("/") && url.pathname !== "/"
    ? url.pathname.slice(0, -1)
    : url.pathname;
};

// get default filename based on config
export const getDefaultFilename = ({
  filename = "index",
  extension = ".html",
}) => {
  return `${filename}${extension}`;
};

// add extension to filename if not there already
export const addExtension = ({
  filename = "index",
  config = { autoAddExt: true, extension: ".html" },
}) => {
  if (config.autoAddExt && !filename.endsWith(config.extension))
    return `${filename}${config.extension}`;
  return filename;
};
