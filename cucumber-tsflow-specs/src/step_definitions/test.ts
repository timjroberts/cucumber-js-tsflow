import { binding, given } from "cucumber-tsflow";
import { equal } from "assert";

@binding()
export default class TestSteps {
    @given('foo')
    public GivenFoo(): void {
        return equal(true, true);
    }
}
