import { after, binding, given, then, when } from "cucumber-tsflow";
import * as expect from "expect";

@binding()
export default class TestSteps {
  private whenIsCalled = false;
  private givenIsCalled = false;
  private thenIsCalled = false;

  @given(/^some step to be executed with tag$/, "@tags2")
  public givenSomeStepTobeExecuted() {
    this.givenIsCalled = true;
  }

  @when(/^the condition is right with tag$/, "@tags2")
  public whenTheConditionIsRight() {
    this.whenIsCalled = true;
  }

  @then(/^we can see the result correctly with tag$/, "tags2")
  public thenWeCanSeeTheResult() {
    this.thenIsCalled = true;
  }

  @after("@tags2")
  public afterTag() {
    expect(this.whenIsCalled).toBe(true);
    expect(this.givenIsCalled).toBe(true);
    expect(this.thenIsCalled).toBe(true);
    // tslint:disable-next-line:no-console
    console.log("@tagging afterTag method is called");
  }
}
