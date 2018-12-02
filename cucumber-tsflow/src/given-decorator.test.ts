import { Given } from "./given-decorator";

test("the given decorator adds static metadata to class constructor", () => {
  class TestClass {
    @Given("test step pattern")
    // tslint:disable-next-line:no-empty
    public testMethod() {}
  }

  expect((new TestClass() as any).__cucumber_flow__).toBe("test step pattern");
});
