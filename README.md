![CI](https://github.com/timjroberts/cucumber-js-tsflow/workflows/CI/badge.svg)

# cucumber-tsflow

Provides 'specflow' like bindings for CucumberJS in TypeScript 1.7+.

### Quick Start

cucumber-tsflow uses TypeScript Decorators to create SpecFlow like bindings for TypeScript classes and methods that allow those classes and methods to be used in your CucumberJS support files. As such, cucumber-tsflow has a peer dependency on CucumberJS, and you still run your specifications using the cucumber command line tool.

##### Install cucumber and cucumber-tsflow

```bash
npm install cucumber cucumber-tsflow
```
###### Create .feature files to describe your specifications

By default, CucumberJS looks for .feature files in a folder called 'features', so create that folder and then create a new file called 'my_feature.feature':

```gherkin
# features/my_feature.feature

Feature: Example Feature
   This is an example feature

   Scenario: Adding two numbers
      Given I enter '2' and '8'
      Then I receive the result '10'
```
###### Create the Support Files to support the Feature

By default, CucumberJS looks for support files beneath the 'features' folder. You can override this on the cucumber command line by specifying the '-r' option. However, let's work with the default and create our code in the default location. We need to write step definitions to support the two steps that we created above.

Create a new 'ArithmeticSteps.ts' file:

```javascript
// features/ArithmeticSteps.ts

import { binding, given, then } from "cucumber-tsflow";

@binding()
class ArithmeticSteps {
    private computedResult: number;

    @given(/I enter '(\d*)' and '(\d*)'"/)
    public givenTwoNumbers(num1: string, num2: string): void {
        this.computedResult = parseInt(num1) + parseInt(num2);
    }

    @then(/I receive the result '(\d*)'/)
    public thenResultReceived(expectedResult: string): void {
        if (parseInt(expectedResult) !== this.computedResult) {
            throw new Error("Arithmetic Error");
        }
    }
}

export = ArithmeticSteps;
```
Note how the cucumber-tsflow Decorators are being used to bind the methods in the class. During runtime, these Decorators simply call the Cucumber code on your behalf in order to register callbacks with Given(), When(), Then(), etc. The callbacks that are being registered with Cucumber are wrappers around your bound class.

###### Compiling your TypeScript Support Code

You'll also need a `tsconfig.json` file to compile your code. You'll also need to ensure that the `"moduleResolution": "node"` compiler option is set in order to bring in the typings that are shipped with cucumber-tsflow.

Once compiled, running the cucumber command line should execute your features along with the support code that you've created in the class.

In this quick example test state is encapsulated directly in the class. As your test suite grows larger and step definitions get shared between multiple classes, you can begin using 'Context Injection' to share state between running step definitions (see below).

### Bindings

Bindings provide the automation that connects a specification step in a Gherkin feature file to some code that
executes for that step. When using Cucumber with TypeScript you can define this automation using a 'binding' class:

```javascript
import { binding } from "cucumber-tsflow";

@binding()
class MySteps {
    ...
}

export = MySteps;
```

*Note*: You must use the `export = <type>;` because Cucumber expects exports in this manner.

### Step Definitions

Step definitions can be bound to automation code in a 'binding' class by implementing a public function that is
bound with a 'given', 'when' or 'then' binding decorator:

```javascript
import { binding, given, when, then } from "cucumber-tsflow";

@binding()
class MySteps {
    ...
    @given(/I perform a search using the value "([^"]*)"/)
    public givenAValueBasedSearch(searchValue: string): void {
        ...
    }
    ...
}

export = MySteps;
```
The function follows the same requirements of functions you would normally supply to Cucumber which means that the
functions may be synchronous by returning nothing, use the callback, or return a `Promise<T>`. Additionally, the
function may also be `async` following the TypeScript async semantics.

Step definitions may also be scoped at a tag level by supplying an optional tag name when using the binding
decorators:

```javascript
@given(/I perform a search using the value "([^"]*)"/)
public givenAValueBasedSearch(searchValue: string): void {
    ...
    // The default step definition
    ...
}

@given(/I perform a search using the value "([^"]*)"/, "@tagName")
public givenAValueBasedSearch(searchValue: string): void {
    ...
    // The step definition that will execute if the feature or
    // scenario has the @tagName defined on it
    ...
}
```

#### Hooks

Hooks can be used to perform additional automation on specific events such as before or after scenario execution.
Hooks can be restricted to run for only features or scenarios with a specific tag:

```typescript
import { binding, before, after } from "cucumber-tsflow";

@binding()
class MySteps {
    ...
    @before()
    public beforeAllScenarios(): void {
        ...
    }
    ...

    @before("@requireTempDir")
    public async beforeAllScenariosRequiringTempDirectory(): Promise<void> {
        let tempDirInfo = await this.createTemporaryDirectory();

        ...
    }

    @after()
    public afterAllScenarios(): void {
        ...
    }

    @after("@requireTmpDir")
    public afterAllScenarios(): void {
        ...
    }
}

export = MySteps;
```

#### Timeout in step definition and hooks. 
In step definition and hooks, we can set timeout. For example, to set the timeout for a step to be 20000ms, we can do: 

```typescript

@given(/I perform a search using the value "([^"]*)"/, undefined, 20000)
public givenAValueBasedSearch(searchValue: string): void {
    ...
    // this step will time tou in 20000ms.
    ...
}

``` 

tsflow currently doesn't have a way to define global default step timeout, 
but it can be easily done through cucumber.js ```setDefaultTimeout``` function.

#### Passing WrapOptions
In step definition, we can passing additional wrapoptions to cucumber js. For example: 
```typescript

@given(/I perform a search using the value "([^"]*)"/, undefined, undefined, {retry: 2})
public givenAValueBasedSearch(searchValue: string): void {
    ...
    // this step will be retried by cucumber js    
    ...
}

``` 

### Sharing Data between Bindings

#### Context Injection

Like 'specflow', cucumber-tsflow supports a simple dependency injection framework that will instantitate and inject
class instances into 'binding' classes for each execuing scenario.

To use context injection:

* Create simple classes representing the shared data (they *must* have default constructors)
* Define a constructor on the 'binding' classes that will require the shared data that accepts the context objects
as parameters
* Update the `@binding()` decorator to indicate the types of context objects that are required by the 'binding'
class

```javascript
import { binding, before, after } from "cucumber-tsflow";
import { Workspace } from "./Workspace";

@binding([Workspace])
class MySteps {
    constructor(protected workspace: Workspace)
    { }

    @before("requireTempDir")
    public async beforeAllScenariosRequiringTempDirectory(): Promise<void> {
        let tempDirInfo = await this.createTemporaryDirectory();

        this.workspace.updateFolder(tempDirInfo);
    }
}

export = MySteps;
```
