import { before, binding, CucumberAttachments, CucumberLog, WorldParameters } from "cucumber-tsflow";
import expect from 'expect';

type WorldType = {
  foo: string,
}

@binding([CucumberLog, CucumberAttachments, WorldParameters])
export default class ProvidedContextSteps {
  public constructor(
    private readonly logger: CucumberLog,
    private readonly attachment: CucumberAttachments,
    private readonly world: WorldParameters<WorldType>,
  ) {}

  @before()
  public checkProvidedContexts() {
    this.logger.log('cucumber log');
    this.attachment.attach(Buffer.from('Hello Cucumber!'), 'text/plain');
    expect(this.world.value).toStrictEqual({foo: 'bar'});
  }
}

