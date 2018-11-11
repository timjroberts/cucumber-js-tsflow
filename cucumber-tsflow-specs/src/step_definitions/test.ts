import { binding, given, before } from "cucumber-tsflow";
import { equal } from "assert";

@binding()
export default class TestSteps {
    private actual = false;
    
    @before()
    public before() {
        this.actual = true
    }

    @given('foo')
    public GivenFoo(): void {
        return equal(this.actual, true);
    }
}
