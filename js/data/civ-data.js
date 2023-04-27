
import {
    Achievement, CivObj, civObjType, civSizes, prettify, indexArrayByAttr, placeType, subTypes, setInitTradePrice,
    population, resourceData, lootable, basicResources, buildingData, sackable, invadeable, homeBuildings, powerData, upgradeData, normalUpgrades,
    unitData, killable, homeUnits, armyUnits, achData
} from "../index.js";
import { getAchievementData } from "./achievements.js";
import { getBuildingData } from "./buildings.js";
import { getResourceData } from "./resources.js";
import { getUnitData } from "./units.js";
import { getUpgradeData } from "./upgrades.js";

function getCivData() {
    //console.log("getCivData");
    // Initialize Data
    let civDatax = [];

    civDatax = civDatax.concat(getResourceData());
    civDatax = civDatax.concat(getBuildingData());
    civDatax = civDatax.concat(getUpgradeData());
    civDatax = civDatax.concat(getUnitData());
    civDatax = civDatax.concat(getAchievementData());

    civDatax = augmentCivData(civDatax);

    // Create 'civData.foo' entries as aliases for the civData element with 
    // id = "foo".  This makes it a lot easier to refer to the array elements in a readable fashion.
    indexArrayByAttr(civDatax, "id");

    // Initialize our data. 
    civDatax.forEach(function (elem) {
        if (elem instanceof CivObj) { elem.init(); }
    });

    return civDatax;
}

function augmentCivData(civDatax) {
    //console.log("augmentCivData=" + civDatax.length);

    // Add the civ size based achievements to the front of the data, so that they come first.
    for (let i = civSizes.length - 1; i > 0; --i) {
        civDatax.unshift(new Achievement({
            id: civSizes[i].id + "Ach",
            name: civSizes[i].name,
            test: function () { return (this.id == civSizes.getCivSize(population.living).id + "Ach");},
            effectText: "Reach a population size of " + prettify(civSizes[i].min_pop)
        }));
    }
    //xxx TODO: Add deity domain based achievements here too.
    return civDatax;
}

const civData = getCivData(); // Giant array of data, defined in "-data" js

function getWonderResources(civData) {
    // The resources that Wonders consume, and can give bonuses for.
    // note not all resources are used e.g. rare metals iron, copper etc
    return [
        civData.food,
        civData.wood,
        civData.stone,
        civData.skins,
        civData.herbs,
        civData.ore,
        civData.leather,
        civData.potions,
        civData.metal,
        civData.piety,
        civData.charcoal,
        civData.lime
    ];
}
// The resources that Wonders consume, and can give bonuses for.
const wonderResources = getWonderResources(civData);

function setIndexArrays(civData) {
    //console.log("setIndexArrays");
    civData.forEach(function (elem) {
        if (!(elem instanceof CivObj)) {
            console.error("Unknown type:", elem);
            return;
        }
        if (elem.type == civObjType.resource) {
            resourceData.push(elem);
            if (elem.vulnerable === true) {
                lootable.push(elem);
            }
            if (elem.subType == subTypes.basic) {
                basicResources.push(elem);
            }
        }
        if (elem.type == civObjType.building) {
            buildingData.push(elem);
            if (elem.vulnerable === true) {
                invadeable.push(elem); // to gain when invading nations
                // add to start so that dwellings get sacked last.  see getRandomSackableBuilding
                sackable.unshift(elem);
            }
            if (elem.subType == subTypes.normal || elem.subType == subTypes.land) { homeBuildings.push(elem); }
        }
        if (elem.subType == subTypes.prayer) {
            powerData.push(elem);
        } else if (elem.type == civObjType.upgrade) {
            upgradeData.push(elem);
            if (elem.subType == subTypes.upgrade) {
                //console.log("normalUpgrades.push: " + elem.id);
                normalUpgrades.push(elem);
            }
        }
        if (elem.type == civObjType.unit) {
            unitData.push(elem);
            if (elem.vulnerable === true) { killable.push(elem); }
            if (elem.place == placeType.home) { homeUnits.push(elem); }
            if (elem.place == placeType.party) { armyUnits.push(elem); }
        }
        if (elem.type == civObjType.achievement) {
            achData.push(elem);
        }
    });
}

// Caches the total number of each wonder, so that we don't have to recount repeatedly.
let wonderCount = {};

export {
    civData, wonderResources, setIndexArrays, wonderCount
};
