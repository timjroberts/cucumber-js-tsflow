## Setting up Run/Debug in IDE

For IntelliJ, a run configuration is stored in ```.run/cucumber-js.run.xml``` to run/debug the tests.

For other IDE, using the following runtime config for node:
 
- working dir: ```cucumber-tsflow-spec```
- node-parameters: ```--require ts-node/register ```
- js script to run: ```node_modules/@cucumber/cucumber/bin/cucumber-js```
- application parameters: ```features/**/*.feature --require "src/step_definitions/**/*.ts" ```

An example command line runner:
```shell script
"C:\Program Files\nodejs\node.exe" --require ts-node/register C:\Users\wudon\repo\cucumber-js-tsflow\node_modules\@cucumber\cucumber\bin\cucumber-js features/**/*.feature --require src/step_definitions/**/*.ts
``` 

