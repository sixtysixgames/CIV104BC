
import { CivObj, civObjType, copyProps } from "../index.js";

function Resource(props) // props is an object containing the desired properties.
{
    if (!(this instanceof Resource)) { return new Resource(props); } // Prevent accidental namespace pollution
    CivObj.call(this, props);
    copyProps(this, props, null, true);
    // Occasional Properties: increment, specialChance, net
    return this;
}
Resource.prototype = new CivObj({
    constructor: Resource,
    type: civObjType.resource,
    // 'net' accessor always exists, even if the underlying value is undefined for most resources.
    //get net() {
    //    if (typeof this.data.net != "number") {
    //        console.warn(this.id + ".net get not a number: " + this.data.net);
    //        //return 0;
    //        this.data.net = 0; // hack to fix NaN stored in .net
    //    }
    //    return this.data.net;
    //},
    //set net(value) {
    //    if (typeof value != "number") {
    //        console.warn(this.id + ".net set value not a number: " + value);
    //        //value = 0; // hack to fix NaN stored in .net
    //        //this.data.net = 0;
    //    }
    //    else {
    //        this.data.net = value;
    //    }
    //},
    nett: 0,
    get net() {
        if (typeof this.nett != "number") {
            console.warn("resource.js " + this.id + ".nett get not a number: " + this.nett);
            console.trace();
            this.nett = 0; // hack to fix NaN stored in .net
        }
        return this.nett;
    },
    set net(value) {
        if (typeof value != "number") {
            console.warn("resource.js " + this.id + ".net set value not a number: " + value);
            console.trace();
        }
        else {
            this.nett = value;
        }
    },
    increment: 0,
    specialChance: 0,
    specialMaterial: "",
    activity: "gathering",
    // for variable trading costs
    get tradeAmount() { return this.data.trdAmt; },
    set tradeAmount(value) { this.data.trdAmt = value; }
}, true);

export { Resource};