# cucumber-tsflow

Provides 'specflow' like bindings for CucumberJS in TypeScript 1.7+.


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
import { binding, given, when then } from "cucumber-tsflow";

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

@given(/I perform a search using the value "([^"]*)"/, "tagName")
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

```javascript
import { binding, before, after } from "cucumber-tsflow";

@binding()
class MySteps {
    ...
    @before()
    public beforeAllScenarios(): void {
        ...
    }
    ...

    @before("requireTempDir")
    public async beforeAllScenariosRequiringTempDirectory(): Promise<void> {
        let tempDirInfo = await this.createTemporaryDirectory();

        ...
    }

    @after()
    public afterAllScenarios(): void {
        ...
    }

    @after("requireTmpDir")
    public afterAllScenarios(): void {
        ...
    }
}

export = MySteps;
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

