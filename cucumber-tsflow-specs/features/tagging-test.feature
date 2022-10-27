@tags
Feature: Test Features with Tagging support.

@tag1
Scenario: Test step definitions without tags
  Because in 'basic-test.ts' step definition is not tagged,
  the step definition will be used here as well.

    Given some step to be executed
    When the condition is right
    Then we can see the result correctly

@tag2
Scenario: Test step definitions with tags

  Step definitions that are tagged will only be used steps that has the tags.
  One step can have multiple tags associated with it, for example, in this case, this
  scenario has tags [tags, tag2]. A step definition that has a tag matching any of them
  will be picked as candidate for execution.

    Given some step to be executed with tag
    And some step to be executed without a tag
    When the condition is right with tag
    Then we can see the result correctly with tag


