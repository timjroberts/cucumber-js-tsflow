"use strict";

/**
 * A base class for Bindings that require access to the 'World' object.
 *
 * @typeparam TWorld The 'World' object type.
 */
export abstract class WorldBinding<TWorld> {
    private _worldObj: TWorld = undefined;

    /**
     * Gets the current 'World' object.
     */
    protected get world(): TWorld {
        return <TWorld>this._worldObj;
    }
}
