import { equal } from "assert";
import { after, before, binding, given, then, when } from "cucumber-tsflow";

class Foo {
  public readonly actual = true;
}

let afterBazCount = 0;

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

  @when("bar")
  public WhenBar(): void {
    equal(1 + 1, 2, "This is true");
  }

  @then("baz")
  public ThenBaz(): void {
    equal(false, false, "This is false");
  }

  @after("baz")
  public afterBazOnly() {
    ++afterBazCount;
    equal(afterBazCount, 1, "This should only ever be one");
  }
}
