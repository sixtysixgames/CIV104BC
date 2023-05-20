"use strict";
import { unitType, buildingType } from "../index.js";

//most important is first in list
// i.e. we need healers to heal the sick then farmers to feed everyone then clerics to bury the dead to stop the plage spreading
// then military to defend, then whatever
const PATIENT_LIST = [
    unitType.healer, unitType.farmer, unitType.meatFarmer, unitType.cropFarmer, unitType.herbGardener, unitType.cleric, unitType.soldier, unitType.cavalry, 
    unitType.forester, unitType.quarWorker, unitType.oreMiner,
    unitType.woodcutter, unitType.miner, unitType.tanner, unitType.blacksmith, unitType.limeBurner, unitType.charBurner,
    unitType.ironsmith, unitType.coppsmith, unitType.leadsmith, unitType.tinsmith, unitType.silvsmith, unitType.mercsmith, unitType.goldsmith,
    unitType.labourer, unitType.unemployed
];

// most useful first ie storage, then most useful work places.  Later ones will have fewer conquests
// used when conquering neighbouring nations.  See utilities/combat.js > invade()
const BUILDING_LIST = [
    buildingType.barn, buildingType.woodstock, buildingType.stonestock, buildingType.skinShed, buildingType.herbShed, buildingType.oreShed,
    buildingType.apothecary, buildingType.tannery, buildingType.smithy, buildingType.charKiln, buildingType.limeKiln,
    buildingType.temple, buildingType.tent, buildingType.hut, buildingType.cottage, buildingType.tenement, buildingType.barracks, buildingType.stable,
    buildingType.ironWorks, buildingType.coppWorks, buildingType.leadWorks, buildingType.tinWorks, buildingType.silvWorks, buildingType.mercWorks, buildingType.goldWorks,
    buildingType.meatFarm, buildingType.cropFarm, buildingType.treeFarm, buildingType.herbGarden, buildingType.quarry, buildingType.oreMine,
    buildingType.mansion, buildingType.palace
];
export { PATIENT_LIST, BUILDING_LIST };