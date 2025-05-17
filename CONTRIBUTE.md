The project should set-up all of its inner links and bindings when you first install it.

Run the tests locally to ensure everything is properly configured.

```terminal
> git clone https://github.com/timjroberts/cucumber-js-tsflow.git
> cd cucumber-js-tsflow
> npm install
> npm test
```

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
