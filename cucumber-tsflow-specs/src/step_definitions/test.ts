import { equal } from "assert";
import { before, binding, given } from "cucumber-tsflow";

class Foo {
  public readonly actual = true;
}

// tslint:disable-next-line:max-classes-per-file
@binding([Foo])
export default class TestSteps {
  constructor(private foo: Foo) {}

  private actual = false;

  @before()
  public before() {
    this.actual = true;
  }

  @given("foo")
  public async GivenFoo(): Promise<void> {
    await equal(this.actual, true);
    await equal(this.foo.actual, true);
  }
}
