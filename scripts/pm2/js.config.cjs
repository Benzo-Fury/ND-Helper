module.exports = {
  name: "nd-helper",
  script: "dist/index.js",
  interpreter: "bun",
  env: {
    PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`,
  }
};
