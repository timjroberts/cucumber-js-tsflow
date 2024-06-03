/* tslint:disable:max-classes-per-file */
import {
  ICreateAttachment,
  ICreateLog,
} from "@cucumber/cucumber/lib/runtime/attachment_manager/index";
import { Readable } from "stream";

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

  public attach(data: string, mediaType?: string): void;
  public attach(data: Buffer, mediaType: string): void;
  public attach(data: Readable, mediaType: string): Promise<void>;
  public attach(data: Readable, mediaType: string, callback: () => void): void;
  public attach(...args: any): void | Promise<void> {
    return this.target.apply(this, args);
  }
}
