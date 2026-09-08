The repository uses npm workspaces. Run installation commands from the repository root; npm links both packages and installs their dependencies using the root `package-lock.json`.

Run the tests locally to ensure everything is properly configured.

```terminal
> git clone https://github.com/timjroberts/cucumber-js-tsflow.git
> cd cucumber-js-tsflow
> npm ci
> npm test
```

When updating an existing checkout from the previous nested-install layout, remove `cucumber-tsflow/node_modules` and `cucumber-tsflow-specs/node_modules` once before running `npm ci`. Do not maintain separate lockfiles or manually link Cucumber in either package.

## Setting up Run/Debug in IDE

For IntelliJ, a run configuration is stored in `.run/cucumber-js.run.xml` to run/debug the tests.

For other IDE, using the following runtime config for node:

- working dir: `cucumber-tsflow-spec`
- node-parameters: `--require ts-node/register `
- js script to run: `node_modules/@cucumber/cucumber/bin/cucumber-js`
- application parameters: `features/**/*.feature --require "src/step_definitions/**/*.ts" `

An example command line runner:

```shell script
"C:\Program Files\nodejs\node.exe" --require ts-node/register C:\Users\wudon\repo\cucumber-js-tsflow\node_modules\@cucumber\cucumber\bin\cucumber-js features/**/*.feature --require src/step_definitions/**/*.ts
```
