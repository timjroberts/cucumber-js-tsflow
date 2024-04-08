const cucumberPkg = require("@cucumber/cucumber/package.json");

module.exports = cucumberPkg.version.startsWith("7.")
  ? {
    default: [
      "--publish-quiet",
      "--require-module ts-node/register",
      "--require cucumber-tsflow-specs/src/**/*.ts",
      "--tags 'not @newApis'",
      "--world-parameters '{\"foo\":\"bar\"}'"
    ].join(" ")
  }
  : {
    default: {
      requireModule: ["ts-node/register"],
      require: ["cucumber-tsflow-specs/src/**/*.ts"],
      tags: 'not @oldApis and not @esm',
      worldParameters: {
        foo: "bar"
      }
    },
    esm: {
      import: ["cucumber-tsflow-specs/src/**/*.ts"],
      tags: 'not @oldApis and @esm',
      worldParameters: {
        foo: "bar"
      }
    }
  };
