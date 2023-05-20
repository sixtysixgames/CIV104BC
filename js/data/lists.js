import { unitType } from "../index.js";

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
export { PATIENT_LIST };