/**
 * Provides informatiion about the currently running scenario.
 */
export class ScenarioInformation {
    private _title: string;
    private _tags: string[];

    /**
     * Gets the scenario title.
     */
    public get title(): string {
        return this._title;
    }

    /**
     * Gets the tags that are attached to the current running scenario.
     *
     * @returns An array of strings.
     */
    public get tags(): string[] {
        return this._tags.slice();
    }
}
