import parseArgs from "minimist";

export default parseArgs(process.argv.slice(2), {
  default: { b: "vite", v: 1, t: "playground" },
});
