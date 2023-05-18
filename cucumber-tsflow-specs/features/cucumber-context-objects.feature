Feature: Cucumber context objects

    Scenario: Using the cucumber logger
        Given a file named "features/a.feature" with:
            """feature
            Feature: Feature
              Scenario: example
                Given a step
                And another step
            """
        And a file named "step_definitions/steps.ts" with:
            """ts
            import {binding, given, CucumberLog} from 'cucumber-tsflow';

            @binding([CucumberLog])
            class Steps {
                public constructor(private readonly logger: CucumberLog) {}

                @given("a step")
                public one() {
                    this.logger.log("logged value");
                }

                @given("another step")
                public noop() {}
            }

            export = Steps;
            """
        When I run cucumber-js
        Then it passes
        And scenario "example" step "Given a step" has the logs:
            | logged value |
        And scenario "example" step "And another step" has no attachments

    Scenario: Using the cucumber attachments
        Given a file named "features/a.feature" with:
            """feature
            Feature: Feature
              Scenario: example
                Given a step
                And another step
            """
        And a file named "step_definitions/steps.ts" with:
            """ts
            import {binding, given, CucumberAttachments} from 'cucumber-tsflow';

            @binding([CucumberAttachments])
            class Steps {
                public constructor(private readonly att: CucumberAttachments) {}

                @given("a step")
                public one() {
                    this.att.attach("my string", "text/plain+custom");
                }

                @given("another step")
                public noop() {}
            }

            export = Steps;
            """
        When I run cucumber-js
        Then it passes
        And scenario "example" step "Given a step" has the attachments:
            | DATA      | MEDIA TYPE        | MEDIA ENCODING |
            | my string | text/plain+custom | IDENTITY       |
        And scenario "example" step "And another step" has no attachments

    Scenario: Using the cucumber attachments in hooks
        Given a file named "features/a.feature" with:
            """feature
            Feature: Feature
              Scenario: example
                Given a step
            """
        And a file named "step_definitions/steps.ts" with:
            """ts
            import {binding, before, after, given, CucumberAttachments} from 'cucumber-tsflow';

            @binding([CucumberAttachments])
            class Steps {
                public constructor(private readonly att: CucumberAttachments) {}

                @before()
                public before() {
                    this.att.attach("my first string", "text/plain+custom");
                }

                @given("a step")
                public one() {}

                @after()
                public after() {
                    this.att.attach("my second string", "text/plain+custom");
                }
            }

            export = Steps;
            """
        When I run cucumber-js
        Then it passes
        And scenario "example" "Before" hook has the attachments:
            | DATA            | MEDIA TYPE        | MEDIA ENCODING |
            | my first string | text/plain+custom | IDENTITY       |
        And scenario "example" "After" hook has the attachments:
            | DATA             | MEDIA TYPE        | MEDIA ENCODING |
            | my second string | text/plain+custom | IDENTITY       |
        And scenario "example" step "Given a step" has no attachments

    Scenario: Using world parameters
        Given a file named "cucumber.js" with:
            """js
            const cucumberPkg = require("@cucumber/cucumber/package.json");

            module.exports = cucumberPkg.version.startsWith("7.")
              ? {
                default: [
                  "--world-parameters '{\"name\":\"Earth\"}'"
                ].join(" ")
              }
              : {
                default: {
                  worldParameters: {
                    name: 'Earth'
                  }
                }
              };
            """
        Given a file named "features/a.feature" with:
            """feature
            Feature: Feature
              Scenario: example
                Then the world name is "Earth"
            """
        And a file named "step_definitions/steps.ts" with:
            """ts
            import {binding, then, WorldParameters} from 'cucumber-tsflow';
            import * as assert from 'node:assert';

            @binding([WorldParameters])
            class Steps {
                public constructor(private readonly world: WorldParameters) {}

                @then("the world name is {string}")
                public checkWorldName(name: string) {
                    assert.deepStrictEqual(this.world.value, {name})
                }
            }

            export = Steps;
            """

        When I run cucumber-js
        Then it passes
