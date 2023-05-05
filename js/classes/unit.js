"use strict";
import { CivObj, civObjType, speciesType, placeType, alignmentType, subTypes, copyProps, isValid, curCiv, civData } from "../index.js";

function Unit(props) // props is an object containing the desired properties.
{
    if (!(this instanceof Unit)) { return new Unit(props); } // Prevent accidental namespace pollution
    CivObj.call(this, props);
    copyProps(this, props, null, true);
    // Occasional Properties: singular, plural, subType, prereqs, require, effectText, alignment,
    // source, efficiency_base, efficiency, onWin, 
    // lootFatigue, lootStop, sackFatigue, sackStop, killFatigue, killStop, conquerFatigue, conquerStop
    // species, place, ill, defence
    return this;
}
// Common Properties: type="unit"
Unit.prototype = new CivObj({
    constructor: Unit,
    type: civObjType.unit,
    salable: true,
    get customQtyId() { return this.place + "CustomQty"; },
    set customQtyId(value) { return this.customQtyId; }, // Only here for JSLint.
    alignment: alignmentType.player, // Also: "enemy"
    species: speciesType.human, // Also:  "animal", "mechanical", "undead"
    place: placeType.home, // Also:  "party"
    combatType: "",  // Default noncombatant.  Also "infantry","cavalry","animal"
    defence: 0.05, // used by non-combat civilians when attacked.  see combat.doSlaughter()
    onWin: function () { return; }, // Do nothing.
    get vulnerable() {
        return ((this.place == placeType.home) && (this.alignment == alignmentType.player) && (this.subType == subTypes.normal));
    },
    set vulnerable(value) { return this.vulnerable; }, // Only here for JSLint.
    get isPopulation() {
        if (this.alignment != alignmentType.player) {
            return false;
        } else if (this.subType == subTypes.special || this.species == speciesType.mechanical) {
            return false;
        } else {
            //return (this.place == "home")
            return true;
        }
    },
    set isPopulation(v) { return this.isPopulation; },
    init: function (fullInit) {
        CivObj.prototype.init.call(this, fullInit);
        // Right now, only vulnerable human units can get sick.
        if (this.vulnerable && (this.species == speciesType.human)) {
            //this.illObj = { owned: 0 };
            this.data.ill = 0;
        }
        return true;
    },
    //xxx Right now, ill numbers are being stored as a separate structure inside curCiv.
    // It would probably be better to make it an actual 'ill' property of the Unit.
    // That will require migration code.
    //get illObj() { return curCiv[this.id + "Ill"]; },
    //set illObj(value) { curCiv[this.id + "Ill"] = value; },
    //get ill() { return isValid(this.illObj) ? this.illObj.owned : undefined; },
    //set ill(value) { if (isValid(this.illObj)) { this.illObj.owned = value; } },
    get ill() {
        if (isValid(this.data.ill) && typeof this.data.ill != "number") {
            console.warn("unit.ill get not a number");
            console.trace();
            this.data.ill = 0; // hack to fix NaN stored
        }
        return isValid(this.data.ill) ? this.data.ill : undefined;
    },
    set ill(value) {
        if (typeof value != "number") {
            console.warn("CivObj.ill set not a number");
            console.trace();
        }
        else {
            if (isValid(this.data.ill)) { this.data.ill = value; }
        }
    },
    get partyObj() { return civData[this.id + "Party"]; },
    set partyObj(value) { return this.partyObj; }, // Only here for JSLint.
    get party() { return isValid(this.partyObj) ? this.partyObj.owned : undefined; },
    set party(value) { if (isValid(this.partyObj)) { this.partyObj.owned = value; }
    },
    // Is this unit just some other sort of unit in a different place (but in the same limit pool)?
    isDest: function () {
        return (this.source !== undefined) && (civData[this.source].partyObj === this);
    },
    get limit() {
        return (this.isDest()) ? civData[this.source].limit : Object.getOwnPropertyDescriptor(CivObj.prototype, "limit").get.call(this);
    },
    set limit(value) { return this.limit; }, // Only here for JSLint.

    // The total quantity of this unit, regardless of status or place.
    get total() {
        return (this.isDest()) ? civData[this.source].total : (this.owned + (this.ill || 0) + (this.party || 0));
    },
    set total(value) { return this.total; } // Only here for JSLint.
}, true);

export { Unit };
