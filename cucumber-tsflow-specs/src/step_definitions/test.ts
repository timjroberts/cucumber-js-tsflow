import { equal } from "assert";
import { before, beforeAll, binding, given } from "cucumber-tsflow";

class Foo {
  public readonly actual = true;
}

let beforeAllCalled = false;
// tslint:disable-next-line:max-classes-per-file
@binding([Foo])
export default class TestSteps {
  constructor(private foo: Foo) {}

  private actual = false;

  @before()
  public before() {
    this.actual = true;
  }

  @beforeAll()
  public static beforeAll() {
    beforeAllCalled = true;
  }

  @given("foo")
  public async GivenFoo(): Promise<void> {
    await equal(beforeAllCalled, true);
    await equal(this.actual, true);
    await equal(this.foo.actual, true);
  }
}
