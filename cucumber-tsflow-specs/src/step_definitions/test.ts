import { equal } from "assert";
import { after, afterAll, before, beforeAll, binding, given, when } from "cucumber-tsflow";

class Foo {
  public readonly actual = true;
}

// tslint:disable-next-line:max-classes-per-file
@binding([Foo])
export default class TestSteps {
  constructor(private foo: Foo) {}

  private actual = false;

  @beforeAll()
  public beforeAll() {
    console.log("I should only run once, but I don't run at all");
  }

  @before()
  public before() {
    this.actual = true;
  }

  @given("foo")
  public async GivenFoo(): Promise<void> {
    await equal(this.actual, true);
    await equal(this.foo.actual, true);
  }

  @when("bar")
  public WhenBar(): void {
    equal(1+1, 2, "This is true");
  }

  @after()
  public after() {
    equal(true, true, "It's true, I ran");
  }

  @afterAll()
  public afterAll() {
    console.log("I should only run once, but I don't run at all");
  }
}
