import { after, beforeAll, afterAll, before, binding, given, then, when } from "cucumber-tsflow";
import expect from "expect";

@binding()
export default class TestSteps {
  private beforeWithNoTagIsCalled = false;
  private beforeIsCalled = false;

  private givenIsCalled = false;
  private whenIsCalled = false;
  private thenIsCalled = false;

  private static beforeAllCalled = false;

  @beforeAll()
  public static beforeAll() {
    this.beforeAllCalled = true;
  }

  @afterAll()
  public static afterAll() {
    expect(this.beforeAllCalled).toBe(true);
    // tslint:disable-next-line:no-console
    console.log("afterAll hook is called.");
  }

  @before()
  public beforeWithNoTag() {
    this.beforeWithNoTagIsCalled = true;
  }

  @before("@basic")
  public before() {
    this.beforeIsCalled = true;
  }

  @after()
  public afterWithNoTag() {
    expect(this.beforeWithNoTagIsCalled).toBe(true);
    // tslint:disable-next-line:no-console
    console.log("after hook is called.");
  }

  @after("@basic")
  public after() {
    expect(this.beforeIsCalled).toBe(true);
    expect(this.whenIsCalled).toBe(true);
    expect(this.givenIsCalled).toBe(true);
    expect(this.thenIsCalled).toBe(true);
    // tslint:disable-next-line:no-console
    console.log("@basic after hook is called.");
  }

  @after("@tag1")
  public afterForTagging() {
    // this is not called by tagging feature.
    expect(this.beforeIsCalled).toBe(false);
    expect(this.beforeWithNoTagIsCalled).toBe(true);
    expect(this.whenIsCalled).toBe(true);
    expect(this.givenIsCalled).toBe(true);
    expect(this.thenIsCalled).toBe(true);
    // tslint:disable-next-line:no-console
    console.log("@tags1 after hook is called.");
  }

  @given(/^some step to be executed$/)
  public givenSomeStepTobeExecuted() {
    this.givenIsCalled = true;
  }

  @when(/^the condition is right$/)
  public whenTheConditionIsRight() {
    this.whenIsCalled = true;
  }

  @then(/^we can see the result correctly$/)
  public thenWeCanSeeTheResult() {
    this.thenIsCalled = true;
  }
}
