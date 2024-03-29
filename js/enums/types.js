"use strict";
/*
 * Constants - because we don't like hard-coded strings
 * do not use the defer attribute on the script tag in index.html
 * because these must exist before everything else
 */
// see -classes
const civObjType = {
    resource: "resource",
    building: "building",
    upgrade: "upgrade",
    unit: "unit",
    achievement: "achievement"
};

// used in civData
const resourceType = {
    food: "food",
    wood: "wood",
    stone: "stone",
    skins: "skins",
    herbs: "herbs",
    ore: "ore",
    leather: "leather",
    potions: "potions",
    metal: "metal",
    piety: "piety",
    coins: "coins",
    corpses: "corpses",
    devotion: "devotion",
    charcoal: "charcoal",
    iron: "iron",
    copper: "copper",
    lead: "lead",
    tin: "tin",
    silver: "silver",
    mercury: "mercury",
    gold: "gold",
    lime: "lime"
};
const buildingType = {
    freeLand: "freeLand",
    tent: "tent",
    hut: "hut",
    cottage: "cottage",
    house: "house",
    tenement: "tenement",
    mansion: "mansion",
    palace: "palace",
    barn: "barn",
    woodstock: "woodstock",
    stonestock: "stonestock",
    skinShed: "skinShed",
    herbShed: "herbShed",
    oreShed: "oreShed",
    meatFarm: "meatFarm",
    cropFarm: "cropFarm",
    treeFarm: "treeFarm",
    herbGarden: "herbGarden",
    quarry: "quarry",
    oreMine: "oreMine",
    tannery: "tannery",
    smithy: "smithy",
    limeKiln: "limeKiln",
    charKiln: "charKiln",
    ironWorks: "ironWorks",
    coppWorks: "coppWorks",
    leadWorks: "leadWorks",
    tinWorks: "tinWorks",
    silvWorks: "silvWorks",
    mercWorks: "mercWorks",
    goldWorks: "goldWorks",
    apothecary: "apothecary",
    temple: "temple",
    barracks: "barracks",
    stable: "stable",
    graveyard: "graveyard",
    mill: "mill",
    fortification: "fortification",
    battleAltar: "battleAltar",
    fieldsAltar: "fieldsAltar",
    underworldAltar: "underworldAltar",
    catAltar: "catAltar"
};
const unitType = {
    unemployed: "unemployed",
    farmer: "farmer",
    woodcutter: "woodcutter",
    miner: "miner",
    meatFarmer: "meatFarmer",
    cropFarmer: "cropFarmer",
    forester: "forester",
    herbGardener: "herbGardener",
    quarWorker: "quarWorker",
    oreMiner: "oreMiner",
    tanner: "tanner",
    blacksmith: "blacksmith",
    limeBurner: "limeBurner",
    charBurner: "charBurner",
    ironsmith: "ironsmith",
    coppsmith: "coppsmith",
    leadsmith: "leadsmith",
    tinsmith: "tinsmith",
    silvsmith: "silvsmith",
    mercsmith: "mercsmith",
    goldsmith: "goldsmith",
    healer: "healer",
    cleric: "cleric",
    labourer: "labourer",
    soldier: "soldier",
    cavalry: "cavalry",
    totalSick: "totalSick",
    cat: "cat",
    shade: "shade",
    wolf: "wolf",
    bandit: "bandit",
    barbarian: "barbarian",
    invader: "invader",
    esiege: "esiege",
    soldierParty: "soldierParty",
    cavalryParty: "cavalryParty",
    siege: "siege",
    esoldier: "esoldier",
    ecavalry: "ecavalry",
    efort: "efort"
};

// attackers enum
// need a corresponding unit in civData
// used in doMobs()
const mobTypeIds = {
    wolf: unitType.wolf,
    bandit: unitType.bandit,
    barbarian: unitType.barbarian,
    invader: unitType.invader
};
const subTypes = {
    normal: "normal",
    basic: "basic",
    special: "special",
    land: "land",
    altar: "altar",
    upgrade: "upgrade",
    deity: "deity",
    pantheon: "pantheon",
    conquest: "conquest",
    trade: "trade",
    prayer: "prayer",
    dwelling: "dwelling",
    storage: "storage"
};
const alignmentType = {
    player: "player",
    enemy: "enemy"
};
const speciesType = {
    human: "human",
    animal: "animal",
    mechanical: "mechanical",
    undead: "undead"
};
const placeType = {
    home: "home",
    party: "party"
};
const combatTypes = {
    infantry: "infantry",
    cavalry: "cavalry",
    animal: "animal"
};

const saveTypes = {
    auto: "auto",
    export: "export",
    manual: "manual"
};
const deityDomains = {
    underworld: "underworld",
    battle: "battle",
    fields: "fields",
    cats: "cats"
};
const deityTypes = {
    Battle: "Battle",
    Underworld: "Underworld",
    Fields: "Fields",
    Cats: "Cats"
};

export {
    civObjType, resourceType, buildingType, unitType, mobTypeIds, subTypes, alignmentType, speciesType, placeType, combatTypes, saveTypes,
    deityDomains, deityTypes
};
