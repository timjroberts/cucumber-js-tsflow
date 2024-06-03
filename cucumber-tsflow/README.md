# cucumber-tsflow

![CI](https://github.com/timjroberts/cucumber-js-tsflow/workflows/CI/badge.svg)

Provides 'SpecFlow' like bindings for CucumberJS in TypeScript 1.7+.

## Table of content

See that menu icon to the left of "README.md"?

Did you know that every markdown file in GitHub with more than two headings
have that icon as a Table of Content linking to every heading?

## Quick Start

cucumber-tsflow uses TypeScript Decorators to create SpecFlow like bindings for
TypeScript classes and methods that allow those classes and methods to be used
in your CucumberJS support files. As such, cucumber-tsflow has a peer dependency
on CucumberJS, and you still run your specifications using the cucumber
command line tool.

### Install cucumber and cucumber-tsflow

```bash
npm install @cucumber/cucumber cucumber-tsflow
```

### Create .feature files to describe your specifications

By default, CucumberJS looks for .feature files in a folder called 'features',
so create that folder and then create a new file called `my_feature.feature`:

```gherkin
# features/my_feature.feature

Feature: Example Feature
    This is an example feature

    Scenario: Adding two numbers
        Given I enter '2' and '8'
        Then I receive the result '10'
```

### Create the Support Files to support the Feature

CucumberJS requires Support Files defining what each step in the Feature files mean.

By default, CucumberJS looks for Support Files beneath the 'features' folder.
We need to write step definitions to support the two steps that we created above.

Create a new `ArithmeticSteps.ts` file:

```ts
// features/ArithmeticSteps.ts

import { binding, given, then } from "cucumber-tsflow";

@binding()
class ArithmeticSteps {
  private computedResult: number;

  @given(/I enter '(\d*)' and '(\d*)'/)
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

Note how the cucumber-tsflow Decorators are being used to bind the methods in
the class. During runtime, these Decorators simply call the Cucumber code on
your behalf in order to register callbacks with Given(), When(), Then(), etc.

The callbacks that are being registered with Cucumber are wrappers around your
bound class. This allows you to maintain a state between each step on the same
class by using instance properties.

In this quick example, the entire test state is encapsulated directly in the class.
As your test suite grows larger and step definitions get shared between
multiple classes, you can use 'Context Injection' to share state between
running step definitions (see below).

### Compiling your TypeScript Support Code

To use `cucumber-tsflow` with TypeScript, you'll also need a `tsconfig.json` file
with these options:

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "experimentalDecorators": true
  }
}
```

> Hint: You can add that to `features/tsconfig.json` to have it applied only for
> your integration tests.

With the TS config in place, CucumberJS should automatically compile your code
before running it.

## Reference

### Bindings

Bindings provide the automation that connects a specification step in a Gherkin
feature file to some code that executes for that step.
When using Cucumber with TypeScript you can define this automation using the
`binding` decorator on top of a class:

```ts
import { binding } from "cucumber-tsflow";

@binding()
class MySteps {
  // ...
}

export = MySteps;
```

Through this reference, classes decorated with the `binding` decorator are
referred "binding classes".

*Note*: You must use the `export = <class>;` due to how Cucumber interprets
the exported items of a Support File.

### Step Definitions

Step definitions can be bound to automation code in a binding class by decorating
a public function with a 'given', 'when' or 'then' binding decorator:

```ts
import { binding, given, when, then } from "cucumber-tsflow";

@binding()
class MySteps {
  @given(/I perform a search using the value "([^"]*)"/)
  public givenAValueBasedSearch(searchValue: string): void {
    // ...
  }
}

export = MySteps;
```

The methods have the same requirements and guarantees of functions you would normally
supply to Cucumber, which means that the methods may be:

- Synchronous by returning `void`
- Asynchronous by receiving and using a callback as the last parameter\
  The callback has signature `() => void`
- Asynchronous by returning a `Promise<void>`

The step definition functions must always receive a pattern as the first argument,
which can be either a string or a regular expression.

Additionally, a step definition may receive additional options in the format:

```ts
@binding()
class MySteps {
  @given("pattern", {
    tag: 'not @expensive',
    timeout: 1000,
    wrapperOptions: {},
  })
  public givenAValueBasedSearch(searchValue: string): void {
    // ...
  }
}
```

For backward compatibility, the `tag` and `timeout` options can also be passed
as direct arguments:

```ts
@binding()
class MySteps {
  @given("pattern", 'not @expensive', 1000)
  public givenAValueBasedSearch(searchValue: string): void {
    // ...
  }
}
```

### Hooks

Hooks can be used to add logic that happens before or after each scenario execution.
They are configured in the same way as the [Step Definitions](#step-definitions).

```typescript
import { binding, before, beforeAll, after, afterAll } from "cucumber-tsflow";

@binding()
class MySteps {
  @beforeAll()
  public static beforeAllScenarios(): void {
    // ...
  }

  @afterAll()
  public static beforeAllScenarios(): void {
    // ...
  }

  @before()
  public beforeAllScenarios(): void {
    // ...
  }

  @after()
  public afterAllScenarios(): void {
    // ...
  }
}

export = MySteps;
```

Contrary to the Step Definitions, Hooks don't need a pattern since they don't
run for some particular step, but once for each scenario.

Hooks can receive aditional options just like the Step Definitions:

```ts
@binding()
class MySteps {
  // Runs before each scenarios with tag `@requireTempDir` with 2 seconds of timeout
  @before({ tag: "@requireTempDir", timeout: 2000 })
  public async beforeAllScenariosRequiringTempDirectory(): Promise<void> {
    let tempDirInfo = await this.createTemporaryDirectory();
    // ...
  }

  // Runs after each scenarios with tag `@requireTempDir` with 2 seconds of timeout
  @after({ tag: "@requireTempDir", timeout: 2000 })
  public async afterAllScenariosRequiringTempDirectory(): void {
    await this.deleteTemporaryDirectory();
    // ...
  }
}
```

For backward compatibility, the `tag` option can also be passes as a direct argument:

```ts
@binding()
class MySteps {
  @before('@local')
  public async runForLocalOnly(): Promise<void> {
  ...
  }
}
```

### Step and hook options

#### Tag filters

Both Step Definitions and Hooks can receive a `tag` option. This option defines
a filter such that the binding will only be considered for scenarios matching
the filter.

The syntax of the tag filter is
a ["Tag expression"](https://cucumber.io/docs/cucumber/api/?lang=javascript#tag-expressions)
specified by Cucumber.

**Note**: The tag might be set for the `Feature` or for the `Scenario`, and there
is no distinction between them. This is
called ["Tag Inheritance"](https://cucumber.io/docs/cucumber/api/?lang=javascript#tag-inheritance).

For backward compatibility, setting a tag to a single word is treated the same
as a filter for that word as a tag:

```ts
// This backward compatible format
@given({ tag: 'foo' })

// Is transformed into this
@given({ tag: '@foo' })
```

#### Timeout

Both Step Definition and Hooks can receive a `timeout` option. This option defines
the maximum runtime allowed for the binding before it is flagged as failed.

`cucumber-tsflow` currently doesn't have a way to define a global default step timeout,
but it can be easily done through CucumberJS' `setDefaultTimeout` function.

#### Passing WrapOptions

In step definition, we can passing additional wrapper options to CucumberJS.

For example:

```typescript
@given(/I perform a search using the value "([^"]*)"/, { wrapperOptions: { retry: 2 } })
public
givenAValueBasedSearch(searchValue
:
string
):
void {
  ...
}
```

The type of `wrapperOptions` is defined by the function given to `setDefinitionFunctionWrapper`.

**Note**: `wrapperOptions` and `setDefinitionFunctionWrapper` were deprecated in
[CucumberJS 7.3.1](https://github.com/cucumber/cucumber-js/blob/8900158748a3f36c4b2fa5d172fe27013b39ab17/CHANGELOG.md#731---2021-07-20)
and are kept here for backward compatibility only while this library supports
CucumberJS 7.

### Sharing Data between Bindings

#### Context Injection

Like 'SpecFlow', `cucumber-tsflow` supports a simple dependency injection
framework that will instantitate and inject class instances into binding classes
for each executing scenario.

To use context injection:

- Create simple classes representing the shared data and/or behavior.\
  These classes **must** have public constructors with no arguments (default constructors).
  Defining a class with no constructor at all also works.
- Define a constructor on the binding classes that receives an instance of
  the class defined above as an parameter.
- Update the `@binding()` decorator to indicate the types of context objects
  that are required by the binding class

```ts
// Workspace.ts

export class Workspace {
  public folder: string = "default folder";

  public updateFolder(folder: string) {
    this.folder = folder;
  }
}

// my-steps.ts
import { binding, before, after } from "cucumber-tsflow";
import { Workspace } from "./Workspace";

@binding([Workspace])
class MySteps {
  public constructor(protected workspace: Workspace) { }

  @before("requireTempDir")
  public async beforeAllScenariosRequiringTempDirectory(): Promise<void> {
    let tempDirInfo = await this.createTemporaryDirectory();

    this.workspace.updateFolder(tempDirInfo);
  }
}

export = MySteps;
```

#### Provided Context Types

This library provides 3 Context Types to interact with CucumberJS' World object.

- `WorldParameters`, which expose value passed to the `worldParameters` configuration
  or the `--world-parameters` CLI option.
- `CucumberLog`, which exposes the `log` method of the `World` object.
- `CucumberAttachments`, which exposes the `attach` method of the `World` object.
- `ScenarioInfo`, which exposes information about the running scenario and allows
  changing the behavior of steps and hooks based on tags easier.
