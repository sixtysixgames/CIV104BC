"use strict";
import { CivObj, civObjType, subTypes, copyProps } from "../index.js";

function Upgrade(props) // props is an object containing the desired properties.
{
    if (!(this instanceof Upgrade)) { return new Upgrade(props); } // Prevent accidental namespace pollution
    CivObj.call(this, props);
    copyProps(this, props, null, true);
    // Occasional Properties: subType, efficiency, extraText, onGain
    if (this.subType == subTypes.prayer) { this.initOwned = undefined; } // Prayers don't get initial values.
    if (this.subType == subTypes.pantheon) { this.prestige = true; } // Pantheon upgrades are not lost on reset.
    return this;
}
// Common Properties: type="upgrade"
Upgrade.prototype = new CivObj({
    constructor: Upgrade,
    type: civObjType.upgrade,
    subType: subTypes.normal,
    initOwned: false,
    vulnerable: false,
    get limit() { return 1; }, // Can't re-buy these.
    set limit(value) { return this.limit; } // Only here for JSLint.
}, true);

export { Upgrade };
