![Quasar Framework logo](https://gs-empire.com/cdn/thumb-hybrid-render-ext.jpg)

# Quasar Framework: Hybrid Rendering Extension

> Manage SSR, CSR, SSG, ISR usage on your pages, all with one extension using one codebase.

:warning: This extension is built on top of built-in SSR mode and has no effect unless used with SSR mode. [See first](https://quasar.dev/quasar-cli-vite/developing-ssr/preparation)

[Installation](#installation) | [Uninstallation](#uninstallation) | [Compatibility](#compatibility) | [Usage](#usage) | [Router API](#router-api) | [Render API](#render-api) | [Advanced](#advanced)

## Extension parts

Extension is composed of two main parts, "Router API and Render API". These together allows for a simple plug-and-play, all you need to do is defined route rules inside of config file (see configuration) and extension will take care of the rest.
Using both Router API and Render API will allow you to use CSR / SSG / ISR by defining just a single rule.

### Router API into

Allows for mapping of route properties to a given url pattern. At runtime Router API matches requested url with defined patterns and evaluates the best match, whose properties are then used by Render API.

### Render API into

Allows for using different rendering techniques based on input parameters given to it. At build time CSR entry file is generated and if applicable SSG pages are prerendered.
At runtime requested technique is used for rendering the page and result is given to the user. API allows for overriding defaults and extending rendering by own rendering techniques.

## Installation

:notebook: Same applies to **upgrade**.

:warning: Do not forget to add SSR mode first!

Run this command in Quasar project:

```bash
quasar mode add ssr
```

Run this command in Quasar project:

```bash
quasar ext add hybrid-render
```

You will be asked "Choose features you need:". Choose as appropriate for your needs, but **it's recommanded to use both Router API and Render API**.
If looking for an advanced usage, you may use just Router API or Render API based on your needs.

## Uninstallation

Run this command in Quasar project:

```bash
quasar ext remove hybrid-render
```

## Compatibility

This extension is compatible both with **webpack** and **vite** build of Quasar, extension auto adjusts based on engine used.
Extension was tested with following versions (but may work with others too):

| @quasar/app-vite | @quasar/app-webpack |
| ---------------- | ------------------- |
| ^1.3.0           | ^3.0.0              |

## Usage

If you followed the [Installation](#installation) guide, extension will automatically run every time you run your Quasar project **in a SSR mode**.

Run this command in Quasar project to run in DEV:

```bash
quasar dev -m ssr
```

Run this command in Quasar project to build for PROD:

```bash
quasar build -m ssr
```

**But of course you did not tell extension what to do**, when to use other rendering technique then SSR and when to preserve it. By default extension sits silent and so provides **no breaking changes to your app**.

### Basic usage

:warning: **Only applicable if using both Router API and Render API!**
Basic usage allows simple and fast usage of all build-in rendering methods (SSR, CSR, SSG, ISR). All one must know is Router API and it's options.

You may use rules described in [Router API](#router-api) to define what page/s use/s what rendering technique. Easiest way to accomplish so, is using **config file** exposed as (**hr-src/config.js**) in your project.

The example code that shows some basic mapping:

```javascript
const routeList = () => {
  return {
    "/": { type: "ssr" }, // index page will use SSR (not needed, ssr is default!)
    "/about": { type: "ssg" }, // about page will be prerendered at build
    "/admin**": { type: "csr" }, // the whole admin area will use CSR (SPA)
    "/admin/menu": { type: "ssg" }, // menu in admin area will use SSG (will override previous CSR rule as is more specific)
    "/product/*": { type: "isr", ttl: 30 * 60 }, // every product page will use ISR with expiration time of 30 minutes
    "/product/456": { type: "ssr" }, // product with id 456 will use SSR even though rest used ISR (is more specific)
  };
};
```

For more details on Router API, please see [Router API](#router-api). You will for example find out what \*\* and \* stands for and what has the matching priority.

## Router API

for **Router API** you may play with following (**hr-src/config.js**):

```javascript
const routeList = () => {
  return {};
};
```

### routeList

Function that returns mapping for **urlPattern to rules**.

The extepected syntax of object is:

```javascript
{
  // key: value,
  urlPattern: rule,
}
```

You may use following patterns to define the **urlPattern**:

```javascript
"/path"; // will match /path
"/path/*"; // will match anything one level deep from /path/ (eg. /path/a, /path/b, /path/ab)
"/path/**"; // will match anything starting with /path/ (eg. /path/a, /path/a/b, /path/a/b/c)
"/path**"; // will match anything starting with /path (eg. /patha, /patha/b, /path/a/b/c)
```

You may use following options to define route **rules**:

```javascript
{ type: "ssr" } // default, not needed
{ type: "csr" } // route will operate as SPA using CSR
{ type: "ssg" } // route will be prerendered (if allowed) and then reused
{ type: "isr", ttl: 20 } // route will be saved on first request and will expire in 20 secs of render
{ type: "isr", ttl: null } // route will be saved on first request and will never expire (default if no ttl provided)
```

HINT: in reality, use may define any properties, these will be mapped into the **req.hybridRender.route** for your own usage. But these mentioned are all that are understood by Render API.

### Matching priority

If there is multiple rules matching the url, then the most exact rule will take precedence. If multiple similar rules (with same priority is defined), then the last one defined is used.

| rule                  | priority | description                                |
| --------------------- | -------- | ------------------------------------------ |
| exact match           | Infinity | url is "/aa" and pattern is "/aa"          |
| match using only \*\* | 1        | url is "/aa/bb" and pattern is "/aa/\*\*"  |
| match using \*\*      | 2        | url is "/aa/bb" and pattern is "/aa/b\*\*" |
| match using only \*   | 3        | url is "/aa/bb" and pattern is "/aa/\*"    |
| match using \*        | 4        | url is "/aa/bb" and pattern is "/aa/b\*"   |

All matching rules are used to allow inheritance, **but pattern with higher priority is used (override principle is used)**.

## Render API

for **Render API** you may play with following (**hr-src/config.js**):

```javascript
const init = () => {
  return {};
};
const config = () => {
  return {};
};
```

### init

Function that returns object used to initialize Render API's configuration at runtime available and extendable in a middleware as **req.hybridRender** object.

```javascript
{
  custom: {}, // reserved for user custom usage
  config: {
    filename: String, // defaults to "index"
    extension: String, // defaults to ".html"
    autoAddExt: Boolean, // defaults to true (add extension to filename if doesnt have)
  },
  route: { // this is whats set by Router API if used
    type: String ["ssr", "csr", "ssg", "isr"], // defaults to "ssr" (choose rendering type)
    ?ttl: [Number, undefined, null], // some can have time-to-live in secs, or null/undefined for never expire (ISR only)
  },
  renderer: any Render compatible obj, // default not set (may set for custom rendering behaviour based on Renderer)
  matches: Route[], // internally filled by Router API (if used) with matched routes
  filepath: String, // a path to save/get page, defaults to pathname of requested url (better set at runtime if needed)
  filename: String, // a filename of page to save/get, defaults to index.html (better set at runtime if needed)
  ownUrl: String, // url path that should be requested and rendered, defaults to pathname of requested url (better set at runtime if needed)
}
```

### config

Function that returns object used as a main configuration of extension itself.

```javascript
{
    killSwitch: false, // set true to temporarly disable extension, app will act as standard SSR again
    srcDir: "hybrid_render", // project relative path to store extension files (prefixed by .quasar in DEV)
    SSG: {
      actAsSSR: process.env.PROD ? false : true, // SSG will act as SSR in DEV
      queueConcurrence: 2, // how many pages prerender at a time
      queueCooling: 600, // how many [ms] to wait between renders
    },
    ISR: {
      actAsSSR: false, // ISR will not act as SSR
    },
  }
```

## Advanced

### Using Render API programmatically

Whether you use Render API alone or with Router API, you may extend the route config (previously) initialized by [init](#init) object.
Config used for rendering current request is exposed as **req.hybridRender** and has stucture given by [init](#init).
You may dynamically set or modify any of these fields by using custom [SSR middleware](https://quasar.dev/quasar-cli-vite/developing-ssr/ssr-middleware) (must be used after init and before render).
It is recommanded to always alter the config object using it's **extendConfig** function:

```javascript
req.hybridRender.extendConfig({
  route: { ... },
  ...
});
```

### SSG while using Render API only

The only way to defined routes that will be prerendered at build time **while not using Router API** is using a JSON file (**hr-src/ssg-routes.json**). This file should include an array of paths that should be prerendered.
The paths defined in this file are joined with paths defined by Router API.

The example of such file would be (**hr-src/ssg-routes.json**):

```javascript
["/static-route", "/static-route-2"];
```

### Middleware order

:warning: If you define any of internal middlewares yourself, these will not be pushed to their regular space anymore (your order will be preserved).

:warning: And respectively, if you define any of internal middlewares yourself and these are not to be used (because you don't use the API or have killSwitch on). Then these are auto removed from the middlewares.

By default middlewares will take following places:

- init-hybrid-render: 1. place (before any other middlewares, index 0)
- router-hybrid-render: 2. place (right after "init-hybrid-render", index 1)
- hybrid-render: 3. place (right before "render" middleware or last if "render" not found, index -1 || -2)

If you know what you do, you may define the order yourself by simply using them as any other middleware inside of Quasar config file.

### Custom Renderer

There is a reason for exposing most of extension scripts to user, in order to allow easy extendability and understanding many files are stored in user project itself.
If you aint fully satisfied with how any of renderers work by default or just want to make your own renderer.
There is a way to do so, you may create new class, extend any of renderer classes found in (**hr-src/Render.js**), make requested changes and set it's instance to a **req.hybridRender.renderer**.

```javascript
// import Render.js

class CustomRender extends Render {
  // override any of methods
}

export default ssrMiddleware(({ app, resolve, render, serve }) => {
  app.get(resolve.urlPath("*"), async (req, res, next) => {
    // use custom render class
    req.hybridRender.renderer = new CustomRender();
    next();
  });
});
```

## Contribution

Is welcome :) Especially contribution to the parts of CSR and SSG (building the SPA entry and how to run SSG better). But if you have any other ideas, feel free to share them too!
**There are breaking changes expected at beginnings.**

## License

Copyright (c) 2024-present Jiří Žák

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

# Donate

If you appreciate the work that went into this App Extension, please consider [donating to Quasar](https://donate.quasar.dev).
