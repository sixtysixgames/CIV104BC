import { civSizes, sysLog } from "../index.js";

// Declare variables here so they can be referenced later.  
let curCiv = {
    civName: "Tribe",
    rulerName: "Chief",

    zombie: { owned: 0 },
    grave: { owned: 0 },
    enemySlain: { owned: 0 },
    morale: {
        mod: 1.0,
        efficiency: 1.0
    },

    resourceClicks: 0, // For NeverClick
    attackCounter: 0, // How long since last attack?

    trader: {
        materialId: "",
        requested: 0,
        timer: 0, // How many seconds will the trader be around
        counter: 0, // How long since last trader?
        userTraded: false // did the user trade the requested material?
    },

    raid: {
        raiding: false, // Are we in a raid right now?
        victory: false, // Are we in a "raid succeeded" (Plunder-enabled) state right now?
        left: 0, // how many raids left
        invadeciv: null,
        epop: 0,  // Population of enemy we're raiding.
        plunderLoot: {}, // Loot we get if we win.
        last: "",
        targetMax: civSizes[0].id // Largest target allowed
    },

    curWonder: {
        name: "",
        stage: 0, // 0 = Not started, 1 = Building, 2 = Built, awaiting selection, 3 = Finished.
        progress: 0, // Percentage completed.
        rushed: false
    },
    wonders: [],  // Array of {name: name, resourceId: resourceId} for all wonders.

    // Known deities.  The 0th element is the current game's deity.
    // If the name is "", no deity has been created (can also check for worship upgrade)
    // If the name is populated but the domain is not, the domain has not been selected.
    deities: [{ name: "", domain: "", maxDev: 0 }],  // array of { name, domain, maxDev }

    loopCounter: 0,

    // start at north and move clockwise
    neighbours: [
        { size: civSizes[0].id },
        { size: civSizes[0].id },
        { size: civSizes[0].id },
        { size: civSizes[0].id },
        { size: civSizes[0].id },
        { size: civSizes[0].id },
        { size: civSizes[0].id },
        { size: civSizes[0].id }
    ]

    //xxx We're still accessing many of the properties put here by civData
    //elements without going through the civData accessors.  That should change.
};

function resetCurCiv() {
    sysLog("Initialising curCiv")
    curCiv.civName = null;
    curCiv.rulerName = null;
    curCiv.zombie = null;
    curCiv.grave = null;
    curCiv.enemySlain = null;
    curCiv.morale = null;
    curCiv.resourceClicks = null;
    curCiv.attackCounter = null;
    curCiv.trader = null;
    curCiv.raid = null;
    curCiv.curWonder = null;
    curCiv.wonders = [];
    curCiv.deities = [{ name: "", domain: "", maxDev: 0 }];
    curCiv.loopCounter = 0;
    curCiv.neighbours = [
        { size: civSizes[0].id },
        { size: civSizes[0].id },
        { size: civSizes[0].id },
        { size: civSizes[0].id },
        { size: civSizes[0].id },
        { size: civSizes[0].id },
        { size: civSizes[0].id },
        { size: civSizes[0].id }
    ];
}

export { curCiv, resetCurCiv };