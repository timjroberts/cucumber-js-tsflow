/* tslint:disable:max-classes-per-file */
import { ICreateAttachment, ICreateLog } from "@cucumber/cucumber/lib/runtime/attachment_manager";

export class WorldParameters<T = any> {
  public constructor(public readonly value: T) {}
}

export class CucumberLog {
  public constructor(private readonly target: ICreateLog) {}

  public log(text: string): void | Promise<void> {
    return this.target(text);
  }
}

export class CucumberAttachments {
  public constructor(private readonly target: ICreateAttachment) {}

  public attach(...args: Parameters<ICreateAttachment>): void | Promise<void> {
    return this.target(...args);
  }
}
