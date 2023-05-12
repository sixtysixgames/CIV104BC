
import { CivObj, civObjType, alignmentType, placeType, subTypes, copyProps } from "../index.js";

function Building(props) // props is an object containing the desired properties.
{
    if (!(this instanceof Building)) { return new Building(props); } // Prevent accidental namespace pollution
    CivObj.call(this, props);
    copyProps(this, props, null, true);
    // Occasional Properties: subType, efficiency, devotion
    return this;
}
// Common Properties: type="building",customQtyId
Building.prototype = new CivObj({
    constructor: Building,
    type: civObjType.building,
    salable: true,
    alignment: alignmentType.player,
    place: placeType.home,
    get vulnerable() { return this.subType != subTypes.altar; }, // Altars can't be sacked.
    set vulnerable(value) { return this.vulnerable; }, // Only here for JSLint.
    customQtyId: "buildingCustomQty",
    limit: 1,
    land: 1,
    get total() { return this.limit * this.owned; },
    set total(value) { return this.total; } // Only here for JSLint.
}, true);

export { Building };
