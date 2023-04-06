import { curCiv } from "../index.js";
// Surrounding civilisations
// efficiency: used to increase efficiency of defending enemy troops
const neighbours = [
    {
        name: "North", id: "north",
        get size() {
            //console.log("north size=" + curCiv.neighbours[0].size)
            return curCiv.neighbours[0].size;
        },
        set size(value) { curCiv.neighbours[0].size = value; }
    },
    {
        name: "Northeast", id: "northeast",
        get size() { return curCiv.neighbours[1].size; },
        set size(value) { curCiv.neighbours[1].size = value; }
    },
    {
        name: "East", id: "east",
        get size() { return curCiv.neighbours[2].size; },
        set size(value) { curCiv.neighbours[2].size = value; }
    },
    {
        name: "Southeast", id: "southeast",
        get size() { return curCiv.neighbours[3].size; },
        set size(value) { curCiv.neighbours[3].size = value; }
    },
    {
        name: "South", id: "south",
        get size() { return curCiv.neighbours[4].size; },
        set size(value) { curCiv.neighbours[4].size = value; }
    },
    {
        name: "Southwest", id: "southwest",
        get size() { return curCiv.neighbours[5].size; },
        set size(value) { curCiv.neighbours[5].size = value; }
    },
    {
        name: "West", id: "west",
        get size() { return curCiv.neighbours[6].size; },
        set size(value) { curCiv.neighbours[6].size = value; }
    },
    {
        name: "Northwest", id: "northwest",
        get size() { return curCiv.neighbours[7].size; },
        set size(value) { curCiv.neighbours[7].size = value; }
    }
];

export { neighbours };