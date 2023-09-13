Feature: Extracing context objects from World externally

    Scenario: Failing to retrieve state from a non-initialized World object
        Given a file named "features/a.feature" with:
            """feature
            Feature: some feature
              Scenario: scenario a
                Given a step
            """
        And a file named "support/state.ts" with:
            """ts
            export class State {
                public constructor() {
                  console.log('State has been initialized');
                }

                public value: string = "initial value";
            }
            """
        And a file named "step_definitions/a.ts" with:
            """ts
            import {State} from '../support/state';
            import {Before, Given} from '@cucumber/cucumber';
            import {getBindingFromWorld} from 'cucumber-tsflow';

            Before(function() {
              const state = getBindingFromWorld(this, State);

              console.log(`Cucumber-style before. State is "${state.value}"`);

              state.value = 'cucumber-style before';
            });

            Given('a step', function() {
              const state = getBindingFromWorld(this, State);

              console.log(`Cucumber-style step. State is "${state.value}"`);

              state.value = 'cucumber-style step';
            });
            """
        When I run cucumber-js
        Then it fails
        And the output contains text:
            """
            Before # step_definitions/a.ts:5
                   Error: Scenario context have not been initialized in the provided World object.
            """

    Scenario: Sharing a state between native Cucumber and Decorator-style steps
        Given a file named "features/a.feature" with:
            """feature
            Feature: some feature
              Scenario: scenario a
                Given a cucumber-style step is called
                And a decorator-style step is called
            """
        And a file named "support/state.ts" with:
            """ts
            export class State {
                public constructor() {
                  console.log('State has been initialized');
                }

                public value: string = "initial value";
            }
            """
        And a file named "step_definitions/a.ts" with:
            """ts
            import {State} from '../support/state';
            import {Before, Given} from '@cucumber/cucumber';
            import {ensureWorldIsInitialized,getBindingFromWorld} from 'cucumber-tsflow';

            ensureWorldIsInitialized();

            Before(function() {
              const state = getBindingFromWorld(this, State);

              console.log(`Cucumber-style before. State is "${state.value}"`);

              state.value = 'cucumber-style before';
            });

            Given('a cucumber-style step is called', function() {
              const state = getBindingFromWorld(this, State);

              console.log(`Cucumber-style step. State is "${state.value}"`);

              state.value = 'cucumber-style step';
            });
            """
        And a file named "step_definitions/b.ts" with:
            """ts
            import {State} from '../support/state';
            import {binding, before, given} from 'cucumber-tsflow';

            @binding([State])
            class Steps {
                public constructor(private readonly state: State) {}

                @before()
                public before() {
                    console.log(`Decorator-style before. State is "${this.state.value}"`);

                    this.state.value = 'decorator-style before';
                }

                @given('a decorator-style step is called')
                public step() {
                    console.log(`Decorator-style step. State is "${this.state.value}"`);

                    this.state.value = 'decorator-style step';
                }
            }

            export = Steps;
            """
        When I run cucumber-js
        Then it passes
        And the output contains text:
            """
            .State has been initialized
            Cucumber-style before. State is "initial value"
            .Decorator-style before. State is "cucumber-style before"
            .Cucumber-style step. State is "decorator-style before"
            .Decorator-style step. State is "cucumber-style step"
            """

    Scenario: Share state between underlying cucumber functionality and TSFlow functionality
        Given a file named "features/a.feature" with:
            """feature
            Feature: some feature
              Scenario: scenario before year 2k
                Given a step for 1999-03-04T21:43:54Z
              @y2k
              Scenario: scenario after year 2k
                Given a step for 2023-09-13T12:34:56.789Z
            """
        And a file named "support/state.ts" with:
            """ts
            export class State {
                public maxDate = new Date('2000-01-01');
            }
            """
        And a file named "step_definitions/a.ts" with:
            """ts
            import {State} from '../support/state';
            import {defineParameterType} from '@cucumber/cucumber';
            import {ensureWorldIsInitialized,getBindingFromWorld} from 'cucumber-tsflow';

            ensureWorldIsInitialized();

            defineParameterType({
              name: 'datetime',
              regexp: /[+-]?\d{4,}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?Z/,
              preferForRegexpMatch: true,
              useForSnippets: true,
              transformer: function (datetime): Date {
                const state = getBindingFromWorld(this, State);

                const date = new Date(datetime);

                console.log(`Parsing date up to ${state.maxDate.toISOString()}`);

                if (state.maxDate.valueOf() < date.valueOf()) {
                    throw new Error('Date after maximum date.');
                }

                return new Date(datetime)
              }
            });
            """
        And a file named "step_definitions/b.ts" with:
            """ts
            import {State} from '../support/state';
            import {binding, before, given} from 'cucumber-tsflow';

            @binding([State])
            class Steps {
                public constructor(private readonly state: State) {}

                @before({tag: '@y2k'})
                public before() {
                    this.state.maxDate = new Date('3000-01-01');
                }

                @given('a step for {datetime}')
                public step(datetime: Date) {
                    console.log(`Step received a ${datetime.constructor.name}: ${datetime.toISOString()}`);
                }
            }

            export = Steps;
            """
        When I run cucumber-js
        Then it passes
        And the output contains text:
            """
            .Parsing date up to 2000-01-01T00:00:00.000Z
            Step received a Date: 1999-03-04T21:43:54.000Z
            ....Parsing date up to 3000-01-01T00:00:00.000Z
            Step received a Date: 2023-09-13T12:34:56.789Z
            """
