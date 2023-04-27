// These are not saved, but we need them up here for the asset data to init properly.
let population = {
    current: 0,
    living: 0,
    zombie: 0,
    limit: 0,
    healthy: 0,
    totalSick: 0,
    extra: 0
};

// Build a variety of additional indices so that we can iterate over specific
// subsets of our civ objects.
const resourceData = []; // All resources
const buildingData = []; // All buildings
const upgradeData = []; // All upgrades
const powerData = []; // All 'powers' //xxx This needs refinement.
const unitData = []; // All units
const achData = []; // All achievements
const sackable = []; // All buildings that can be destroyed
const invadeable = []; // All buildings that can possessed during a conquer
const lootable = []; // All resources that can be stolen
const killable = []; // All units that can be destroyed
const homeBuildings = []; // All buildings to be displayed in the home area
const homeUnits = []; // All units to be displayed in the home area
const armyUnits = []; // All units to be displayed in the army area
const basicResources = []; // All basic (click-to-get) resources
const normalUpgrades = []; // All upgrades to be listed in the normal upgrades area

export {
    population, resourceData, buildingData, upgradeData, powerData, unitData, achData, sackable, lootable,
    killable, homeBuildings, homeUnits, armyUnits, basicResources, normalUpgrades, invadeable
};
