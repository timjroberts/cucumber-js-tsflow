import { binding, given } from "cucumber-tsflow";

@binding()
export default class TestSteps {
    @given(/^foo$/)
    public GivenFoo(): void {
        console.log("Given fooaaa 111");
    }
}
