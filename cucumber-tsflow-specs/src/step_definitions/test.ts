import { equal } from "assert";
import { before, binding, given } from "cucumber-tsflow";

@binding()
export default class TestSteps {
  private actual = false;

  @before()
  public before() {
    this.actual = true;
  }

  @given("foo")
  public GivenFoo(): void {
    return equal(this.actual, true);
  }
}
